"""
Stock Adjustments reconcile the system's recorded quantity with a
physical count. The delta (counted - system) is posted to the ledger
as a single `adjustment` movement per line.
"""
from app.supabase.client import get_client
from app.services.inventory_service import post_movements, MovementLine, get_on_hand


def create_adjustment(reason: str, lines: list[dict], user_id: str) -> dict:
    """
    `lines` = [{product_id, location_id, counted_quantity}, ...]
    system_quantity is snapshotted here so the delta is stable even if
    other movements happen before this adjustment is validated.
    """
    client = get_client()
    reference = f"ADJ-{_next_seq(client):05d}"

    adjustment = (
        client.table("adjustments")
        .insert({"reference": reference, "reason": reason, "status": "draft", "created_by": user_id})
        .execute()
        .data[0]
    )

    line_rows = []
    for line in lines:
        system_qty = get_on_hand(line["product_id"], line["location_id"])
        line_rows.append(
            {
                "adjustment_id": adjustment["id"],
                "product_id": line["product_id"],
                "location_id": line["location_id"],
                "counted_quantity": line["counted_quantity"],
                "system_quantity": system_qty,
            }
        )
    client.table("adjustment_lines").insert(line_rows).execute()

    return adjustment


def validate_adjustment(adjustment_id: str, user_id: str) -> dict:
    client = get_client()
    lines = client.table("adjustment_lines").select("*").eq("adjustment_id", adjustment_id).execute().data

    movements = [
        MovementLine(
            product_id=line["product_id"],
            location_id=line["location_id"],
            quantity=line["counted_quantity"] - line["system_quantity"],  # signed delta
            movement_type="adjustment",
        )
        for line in lines
        if line["counted_quantity"] != line["system_quantity"]
    ]
    if movements:
        post_movements(movements, source_document_type="adjustment", source_document_id=adjustment_id, user_id=user_id)

    return (
        client.table("adjustments")
        .update({"status": "done", "validated_at": "now()"})
        .eq("id", adjustment_id)
        .execute()
        .data[0]
    )


def _next_seq(client) -> int:
    return (client.table("adjustments").select("id", count="exact").execute().count or 0) + 1
