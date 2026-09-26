"""
Verifies the Supabase JWT sent by the frontend as `Authorization: Bearer <token>`.

Usage:
    @products_bp.get("/")
    @require_auth
    def list_products():
        user_id = request.user_id   # set by this decorator
        ...
"""
from functools import wraps
from flask import request, jsonify
import jwt

from app.config import Config


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing bearer token"}), 401

        token = header.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token,
                Config.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except jwt.PyJWTError as exc:
            return jsonify({"error": f"Invalid token: {exc}"}), 401

        request.user_id = payload.get("sub")
        request.user_email = payload.get("email")
        return fn(*args, **kwargs)

    return wrapper
