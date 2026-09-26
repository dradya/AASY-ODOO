from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.utils.validators import require_fields
from app.supabase.client import get_client

products_bp = Blueprint("products", __name__)


@products_bp.get("/")
@require_auth
def list_products():
    """Supports ?category_id=&search=&low_stock=true query params."""
    client = get_client()
    query = client.table("products").select("*")

    category_id = request.args.get("category_id")
    if category_id:
        query = query.eq("category_id", category_id)

    search = request.args.get("search")
    if search:
        query = query.ilike("name", f"%{search}%")

    result = query.execute()
    return jsonify(result.data)


@products_bp.post("/")
@require_auth
def create_product():
    payload = request.get_json(force=True)
    error = require_fields(payload, ["sku", "name", "unit_of_measure"])
    if error:
        return jsonify({"error": error}), 400

    client = get_client()
    result = client.table("products").insert(payload).execute()
    return jsonify(result.data[0]), 201


@products_bp.get("/<product_id>")
@require_auth
def get_product(product_id):
    client = get_client()
    result = client.table("products").select("*").eq("id", product_id).single().execute()
    return jsonify(result.data)


@products_bp.put("/<product_id>")
@require_auth
def update_product(product_id):
    payload = request.get_json(force=True)
    client = get_client()
    result = client.table("products").update(payload).eq("id", product_id).execute()
    return jsonify(result.data[0])


@products_bp.get("/<product_id>/availability")
@require_auth
def product_availability(product_id):
    """Per-location stock breakdown for one product."""
    client = get_client()
    result = (
        client.table("inventory_balances")
        .select("location_id, quantity, locations(name, warehouse_id)")
        .eq("product_id", product_id)
        .execute()
    )
    return jsonify(result.data)
