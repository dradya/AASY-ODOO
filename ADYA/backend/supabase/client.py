"""
Thin wrapper around the Supabase Python client.

Use `get_client()` for service-role access (bypasses RLS — only call
from trusted backend services, never expose this key to the frontend).
"""
from functools import lru_cache
from supabase import create_client, Client
from app.config import Config


@lru_cache
def get_client() -> Client:
    if not Config.SUPABASE_URL or not Config.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured")
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
