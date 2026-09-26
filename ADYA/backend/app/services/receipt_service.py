"""
Receipts = incoming stock from a supplier.
Draft -> Waiting -> Ready -> Done (validated, stock increases) -> (or Canceled)
"""
from app.supabase.client import get_client
from app.services.inventory_service import post_movements, MovementLine


def create_receipt(warehouse_id: str, supplier_name: str, lines: list[dict], user_id: str) -> dict:
    client = get_client()
    reference = _next_reference("receipts", "RCPT")

    receipt = (
        client.table("receipts")
        .insert(
            {
                "reference": reference,
                "warehouse_id": warehouse_id,
                "supplier_name": supplier_name,
                "status": "draft",
                "created_by": user_id,
            }
        )
        .execute()
        .data[0]
    )

    line_rows = [{**line, "receipt_id": receipt["id"]} for line in lines]
    client.table("receipt_lines").insert(line_rows).execute()

    return receipt


def validate_receipt(receipt_id: str, user_id: str) -> dict:
    """Marks the receipt done and posts stock IN for each line."""
    client = get_client()
    lines = client.table("receipt_lines").select("*").eq("receipt_id", receipt_id).execute().data

    movements = [
        MovementLine(
            product_id=line["product_id"],
            location_id=line["location_id"],
            quantity=line["quantity"],       # positive: stock increases
            movement_type="receipt",
        )
        for line in lines
    ]
    post_movements(movements, source_document_type="receipt", source_document_id=receipt_id, user_id=user_id)

    return (
        client.table("receipts")
        .update({"status": "done", "validated_at": "now()"})
        .eq("id", receipt_id)
        .execute()
        .data[0]
    )


def _next_reference(table: str, prefix: str) -> str:
    """Naive incrementing reference generator — replace with a DB sequence for concurrency safety."""
    client = get_client()
    count = client.table(table).select("id", count="exact").execute().count or 0
    return f"{prefix}-{count + 1:05d}"
