from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth
from app.services import adjustment_service
from app.supabase.client import get_client

adjustments_bp = Blueprint("adjustments", __name__)


@adjustments_bp.get("/")
@require_auth
def list_adjustments():
    client = get_client()
    return jsonify(client.table("adjustments").select("*").execute().data)


@adjustments_bp.post("/")
@require_auth
def create_adjustment():
    payload = request.get_json(force=True)
    if not payload.get("lines"):
        return jsonify({"error": "'lines' is required"}), 400

    adjustment = adjustment_service.create_adjustment(
        reason=payload.get("reason"),
        lines=payload["lines"],
        user_id=request.user_id,
    )
    return jsonify(adjustment), 201


@adjustments_bp.post("/<adjustment_id>/validate")
@require_auth
def validate_adjustment(adjustment_id):
    adjustment = adjustment_service.validate_adjustment(adjustment_id, user_id=request.user_id)
    return jsonify(adjustment)
