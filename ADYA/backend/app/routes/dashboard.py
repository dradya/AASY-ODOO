from flask import Blueprint, jsonify
from app.utils.auth_middleware import require_auth
from app.supabase.client import get_client
from app.services.inventory_service import get_low_stock

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/kpis")
@require_auth
def kpis():
    client = get_client()

    total_products = client.table("products").select("id", count="exact").eq("is_active", True).execute().count
    low_stock = get_low_stock()
    pending_receipts = (
        client.table("receipts").select("id", count="exact").in_("status", ["draft", "waiting", "ready"]).execute().count
    )
    pending_deliveries = (
        client.table("delivery_orders")
        .select("id", count="exact")
        .in_("status", ["draft", "waiting", "ready"])
        .execute()
        .count
    )
    scheduled_transfers = (
        client.table("transfers").select("id", count="exact").in_("status", ["draft", "waiting", "ready"]).execute().count
    )

    return jsonify(
        {
            "total_products": total_products,
            "low_stock_count": len(low_stock),
            "out_of_stock_count": len([p for p in low_stock if p["on_hand"] <= 0]),
            "pending_receipts": pending_receipts,
            "pending_deliveries": pending_deliveries,
            "scheduled_transfers": scheduled_transfers,
        }
    )


@dashboard_bp.get("/move-history")
@require_auth
def move_history():
    """Backs the Move History page — the full stock_movements ledger, newest first."""
    client = get_client()
    result = (
        client.table("stock_movements")
        .select("*, products(sku, name), locations(name)")
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    return jsonify(result.data)
