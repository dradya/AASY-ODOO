"""
inventory_service.py

Single choke point for every stock-affecting write. Every document
type (Receipt, Delivery, Transfer, Adjustment) calls into this module
so that the ledger (stock_movements) and the materialized balances
(inventory_balances) never drift apart.

NOTE: This is a stub showing the intended shape of the transaction.
Wire it up to Supabase's Postgres via `postgrest`/`rpc` or a direct
psycopg2/asyncpg connection using Config.DATABASE_URL — a single
Postgres function (see below) is the recommended approach so the
read-modify-write on inventory_balances is done with row locking
instead of two round-trips from Python.
"""
from dataclasses import dataclass
from app.supabase.client import get_client


@dataclass
class MovementLine:
    product_id: str
    location_id: str
    quantity: float          # signed: positive = stock in, negative = stock out
    movement_type: str       # receipt | delivery | transfer_in | transfer_out | adjustment


def post_movements(
    lines: list[MovementLine],
    source_document_type: str,
    source_document_id: str,
    user_id: str,
) -> None:
    """
    Writes one stock_movements row per line and upserts the matching
    inventory_balances row, in a single DB transaction.

    Recommended implementation: call a Postgres function via
    `supabase.rpc("post_stock_movements", {...})` so the balance
    update happens with `SELECT ... FOR UPDATE` semantics and can
    never race with a concurrent validation of another document
    touching the same product/location.
    """
    client = get_client()

    movement_rows = [
        {
            "product_id": line.product_id,
            "location_id": line.location_id,
            "quantity": line.quantity,
            "movement_type": line.movement_type,
            "source_document_type": source_document_type,
            "source_document_id": source_document_id,
            "created_by": user_id,
        }
        for line in lines
    ]

    # TODO: replace with a single `client.rpc("post_stock_movements", {"rows": movement_rows})`
    # transactional call once the Postgres function is written. Doing it as two
    # separate calls (as below) is NOT safe under concurrent access.
    client.table("stock_movements").insert(movement_rows).execute()

    for line in lines:
        current = (
            client.table("inventory_balances")
            .select("quantity")
            .eq("product_id", line.product_id)
            .eq("location_id", line.location_id)
            .maybe_single()
            .execute()
        )
        existing_qty = current.data["quantity"] if current.data else 0
        client.table("inventory_balances").upsert(
            {
                "product_id": line.product_id,
                "location_id": line.location_id,
                "quantity": existing_qty + line.quantity,
            }
        ).execute()


def get_low_stock(threshold_only: bool = True) -> list[dict]:
    """Reads from the `v_low_stock` view defined in schema.sql."""
    client = get_client()
    query = client.table("v_low_stock").select("*")
    result = query.execute()
    return result.data or []


def get_on_hand(product_id: str, location_id: str | None = None) -> float:
    client = get_client()
    query = client.table("inventory_balances").select("quantity").eq("product_id", product_id)
    if location_id:
        query = query.eq("location_id", location_id)
    result = query.execute()
    return sum(row["quantity"] for row in (result.data or []))
