from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.utils.validators import require_fields
from app.supabase.client import get_client

warehouses_bp = Blueprint("warehouses", __name__)


@warehouses_bp.get("/")
@require_auth
def list_warehouses():
    client = get_client()
    return jsonify(client.table("warehouses").select("*, locations(*)").execute().data)


@warehouses_bp.post("/")
@require_auth
def create_warehouse():
    payload = request.get_json(force=True)
    error = require_fields(payload, ["name", "code"])
    if error:
        return jsonify({"error": error}), 400

    client = get_client()
    warehouse = client.table("warehouses").insert({"name": payload["name"], "code": payload["code"]}).execute().data[0]

    # Every warehouse gets a default location automatically
    client.table("locations").insert(
        {"warehouse_id": warehouse["id"], "name": f"{payload['name']} - Default", "is_default": True}
    ).execute()

    return jsonify(warehouse), 201


@warehouses_bp.post("/<warehouse_id>/locations")
@require_auth
def create_location(warehouse_id):
    payload = request.get_json(force=True)
    error = require_fields(payload, ["name"])
    if error:
        return jsonify({"error": error}), 400

    client = get_client()
    location = (
        client.table("locations")
        .insert({"warehouse_id": warehouse_id, "name": payload["name"]})
        .execute()
        .data[0]
    )
    return jsonify(location), 201
