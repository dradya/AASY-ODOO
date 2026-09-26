# =========================================================================
# config.py - Central Configuration & Supabase Client Factory
# =========================================================================
# This file does TWO things:
#   1. Reads your secret keys from the .env file so they stay out of code.
#   2. Provides helper functions to create Supabase client instances.
#
# WHY separate this? So every route file can just do:
#     from config import get_supabase_client
# instead of repeating the setup logic everywhere.
# =========================================================================

import os
from dotenv import load_dotenv          # Reads .env file into environment variables
from supabase import create_client, Client  # Official Supabase Python SDK

# -- Load the .env file ---------------------------------------------------
# This reads flask-api/.env and makes every KEY=VALUE pair available
# via os.getenv("KEY"). Must be called before reading any env vars.
load_dotenv()


# =========================================================================
# Config Class - stores all configuration values in one place
# =========================================================================
class Config:
    """
    All app settings, loaded from environment variables.
    If a variable isn't set in .env, the fallback default is used.
    """

    # -- Flask settings ----------------------------------------------------
    # SECRET_KEY: Flask uses this to cryptographically sign session cookies.
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-fallback-key")

    # DEBUG: When True, Flask auto-reloads on code changes & shows detailed errors.
    #        Set to False in production!
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")

    # PORT: Which port the Flask server listens on.
    PORT = int(os.getenv("FLASK_PORT", 5000))

    # -- Supabase settings -------------------------------------------------
    # SUPABASE_URL: Your project's unique URL (looks like https://xxxx.supabase.co)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")

    # SUPABASE_KEY: The "anon" / "public" key. Safe to use in backend code.
    # This key respects Row Level Security (RLS) policies you set on your tables.
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

    # SUPABASE_SERVICE_KEY: The "service_role" key. This BYPASSES all RLS policies.
    # Only use this for admin operations. NEVER send this to the frontend!
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")


# =========================================================================
# Supabase Client Factory Functions
# =========================================================================

def get_supabase_client() -> Client:
    """
    Creates a Supabase client using the PUBLIC (anon) key.

    Use this for MOST operations:
      - User signup / login
      - Reading/writing data (respects RLS policies)
      - Anything a logged-in user should be able to do

    Returns:
        Client: A configured Supabase client instance.

    Raises:
        ValueError: If SUPABASE_URL or SUPABASE_KEY are not set in .env.
    """
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_KEY

    # Guard: make sure the user actually filled in their .env file
    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_KEY are not set! "
            "Open flask-api/.env and paste your keys from the Supabase dashboard."
        )

    return create_client(url, key)


def get_supabase_admin() -> Client:
    """
    Creates a Supabase client using the SERVICE ROLE key.

    Use this ONLY for admin-level operations that need to bypass RLS:
      - Deleting any user's data
      - Bulk inserts/updates
      - Background jobs

    WARNING: This client ignores all Row Level Security policies!

    Returns:
        Client: A configured Supabase admin client instance.

    Raises:
        ValueError: If SUPABASE_URL or SUPABASE_SERVICE_KEY are not set in .env.
    """
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_SERVICE_KEY

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY are not set! "
            "Open flask-api/.env and paste your keys from the Supabase dashboard."
        )

    return create_client(url, key)
