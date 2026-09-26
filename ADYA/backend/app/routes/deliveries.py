from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.utils.validators import require_fields, validate_lines
from app.supabase.client import get_client
from app.services import delivery_service

deliveries_bp = Blueprint("deliveries", __name__)


@deliveries_bp.get("/")
@require_auth
def list_deliveries():
    client = get_client()
    query = client.table("delivery_orders").select("*")
    status = request.args.get("status")
    if status:
        query = query.eq("status", status)
    return jsonify(query.execute().data)


@deliveries_bp.post("/")
@require_auth
def create_delivery():
    payload = request.get_json(force=True)
    error = require_fields(payload, ["warehouse_id"]) or validate_lines(payload.get("lines", []))
    if error:
        return jsonify({"error": error}), 400

    delivery = delivery_service.create_delivery(
        warehouse_id=payload["warehouse_id"],
        customer_name=payload.get("customer_name"),
        lines=payload["lines"],
        user_id=request.user_id,
    )
    return jsonify(delivery), 201


@deliveries_bp.post("/<delivery_id>/validate")
@require_auth
def validate_delivery(delivery_id):
    try:
        delivery = delivery_service.validate_delivery(delivery_id, user_id=request.user_id)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(delivery)
