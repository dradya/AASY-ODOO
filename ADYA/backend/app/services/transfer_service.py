"""
Internal Transfers move stock between two locations (which may be in
different warehouses). Total company-wide stock is unchanged; only
the location changes. Each line posts a transfer_out at the source
and a transfer_in at the destination so the ledger stays a full audit
trail of where every unit has been.
"""
from app.supabase.client import get_client
from app.services.inventory_service import post_movements, MovementLine, get_on_hand


def create_transfer(source_location_id: str, dest_location_id: str, lines: list[dict], user_id: str) -> dict:
    client = get_client()
    reference = f"TRF-{_next_seq(client):05d}"

    transfer = (
        client.table("transfers")
        .insert(
            {
                "reference": reference,
                "source_location_id": source_location_id,
                "dest_location_id": dest_location_id,
                "status": "draft",
                "created_by": user_id,
            }
        )
        .execute()
        .data[0]
    )

    line_rows = [{"transfer_id": transfer["id"], "product_id": l["product_id"], "quantity": l["quantity"]} for l in lines]
    client.table("transfer_lines").insert(line_rows).execute()

    return transfer


def validate_transfer(transfer_id: str, user_id: str) -> dict:
    client = get_client()
    transfer = client.table("transfers").select("*").eq("id", transfer_id).single().execute().data
    lines = client.table("transfer_lines").select("*").eq("transfer_id", transfer_id).execute().data

    movements: list[MovementLine] = []
    for line in lines:
        on_hand = get_on_hand(line["product_id"], transfer["source_location_id"])
        if on_hand < line["quantity"]:
            raise ValueError(f"Insufficient stock for product {line['product_id']} at source location")

        movements.append(MovementLine(
            product_id=line["product_id"],
            location_id=transfer["source_location_id"],
            quantity=-line["quantity"],
            movement_type="transfer_out",
        ))
        movements.append(MovementLine(
            product_id=line["product_id"],
            location_id=transfer["dest_location_id"],
            quantity=line["quantity"],
            movement_type="transfer_in",
        ))

    post_movements(movements, source_document_type="transfer", source_document_id=transfer_id, user_id=user_id)

    return (
        client.table("transfers")
        .update({"status": "done", "validated_at": "now()"})
        .eq("id", transfer_id)
        .execute()
        .data[0]
    )


def _next_seq(client) -> int:
    return (client.table("transfers").select("id", count="exact").execute().count or 0) + 1
