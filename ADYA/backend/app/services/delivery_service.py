"""
Delivery Orders = outgoing stock to a customer.
Draft -> Waiting (pick) -> Ready (pack) -> Done (validated, stock decreases) -> (or Canceled)
"""
from app.supabase.client import get_client
from app.services.inventory_service import post_movements, MovementLine, get_on_hand


def create_delivery(warehouse_id: str, customer_name: str, lines: list[dict], user_id: str) -> dict:
    client = get_client()
    reference = f"DEL-{_next_seq(client, 'delivery_orders'):05d}"

    delivery = (
        client.table("delivery_orders")
        .insert(
            {
                "reference": reference,
                "warehouse_id": warehouse_id,
                "customer_name": customer_name,
                "status": "draft",
                "created_by": user_id,
            }
        )
        .execute()
        .data[0]
    )

    line_rows = [{**line, "delivery_order_id": delivery["id"]} for line in lines]
    client.table("delivery_lines").insert(line_rows).execute()

    return delivery


def validate_delivery(delivery_id: str, user_id: str) -> dict:
    """Checks availability, then posts stock OUT for each line and marks the order done."""
    client = get_client()
    lines = client.table("delivery_lines").select("*").eq("delivery_order_id", delivery_id).execute().data

    for line in lines:
        on_hand = get_on_hand(line["product_id"], line["location_id"])
        if on_hand < line["quantity"]:
            raise ValueError(
                f"Insufficient stock for product {line['product_id']} at location "
                f"{line['location_id']}: have {on_hand}, need {line['quantity']}"
            )

    movements = [
        MovementLine(
            product_id=line["product_id"],
            location_id=line["location_id"],
            quantity=-line["quantity"],      # negative: stock decreases
            movement_type="delivery",
        )
        for line in lines
    ]
    post_movements(movements, source_document_type="delivery", source_document_id=delivery_id, user_id=user_id)

    return (
        client.table("delivery_orders")
        .update({"status": "done", "validated_at": "now()"})
        .eq("id", delivery_id)
        .execute()
        .data[0]
    )


def _next_seq(client, table: str) -> int:
    return (client.table(table).select("id", count="exact").execute().count or 0) + 1
