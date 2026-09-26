from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.utils.validators import require_fields, validate_lines
from app.supabase.client import get_client
from app.services import receipt_service

receipts_bp = Blueprint("receipts", __name__)


@receipts_bp.get("/")
@require_auth
def list_receipts():
    client = get_client()
    query = client.table("receipts").select("*")
    status = request.args.get("status")
    if status:
        query = query.eq("status", status)
    return jsonify(query.execute().data)


@receipts_bp.post("/")
@require_auth
def create_receipt():
    payload = request.get_json(force=True)
    error = require_fields(payload, ["warehouse_id"]) or validate_lines(payload.get("lines", []))
    if error:
        return jsonify({"error": error}), 400

    receipt = receipt_service.create_receipt(
        warehouse_id=payload["warehouse_id"],
        supplier_name=payload.get("supplier_name"),
        lines=payload["lines"],
        user_id=request.user_id,
    )
    return jsonify(receipt), 201


@receipts_bp.post("/<receipt_id>/validate")
@require_auth
def validate_receipt(receipt_id):
    try:
        receipt = receipt_service.validate_receipt(receipt_id, user_id=request.user_id)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(receipt)
