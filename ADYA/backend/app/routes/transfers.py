from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.utils.validators import require_fields
from app.supabase.client import get_client
from app.services import transfer_service

transfers_bp = Blueprint("transfers", __name__)


@transfers_bp.get("/")
@require_auth
def list_transfers():
    client = get_client()
    return jsonify(client.table("transfers").select("*").execute().data)


@transfers_bp.post("/")
@require_auth
def create_transfer():
    payload = request.get_json(force=True)
    error = require_fields(payload, ["source_location_id", "dest_location_id", "lines"])
    if error:
        return jsonify({"error": error}), 400
    if payload["source_location_id"] == payload["dest_location_id"]:
        return jsonify({"error": "source and destination locations must differ"}), 400

    transfer = transfer_service.create_transfer(
        source_location_id=payload["source_location_id"],
        dest_location_id=payload["dest_location_id"],
        lines=payload["lines"],
        user_id=request.user_id,
    )
    return jsonify(transfer), 201


@transfers_bp.post("/<transfer_id>/validate")
@require_auth
def validate_transfer(transfer_id):
    try:
        transfer = transfer_service.validate_transfer(transfer_id, user_id=request.user_id)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(transfer)
