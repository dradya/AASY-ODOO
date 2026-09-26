"""
Sign-up, login, and OTP password reset are performed by the frontend
directly against Supabase Auth (see frontend/src/lib/supabaseClient.ts).
This blueprint only exposes an endpoint to confirm the token is valid
and fetch/create the app-side profile if you add a `profiles` table.
"""
from flask import Blueprint, jsonify, request
from app.utils.auth_middleware import require_auth

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/me")
@require_auth
def me():
    return jsonify({"user_id": request.user_id, "email": request.user_email})
