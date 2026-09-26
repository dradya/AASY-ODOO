# =========================================================================
# routes/data.py - User Data CRUD Routes (Profiles stored in Supabase)
# =========================================================================
# This file handles STORING and RETRIEVING user-submitted data.
#
# WHAT THIS DOES:
#   - Users can create a profile with their name, phone, company, etc.
#   - Each user can only see/edit THEIR OWN profile (enforced by Supabase RLS)
#   - All endpoints require the user to be logged in (Bearer token)
#
# HOW DATA FLOWS:
#   1. User logs in via /api/auth/login -> gets access_token
#   2. User sends requests with that token -> this file validates it
#   3. We pass the token to Supabase -> Supabase checks RLS policies
#   4. Supabase only returns/modifies data the user is allowed to access
#
# BEFORE USING THESE ROUTES:
#   You must create the "user_profiles" table in Supabase!
#   See the SQL at the bottom of this file.
# =========================================================================

from flask import Blueprint, request, jsonify
from config import get_supabase_client
from functools import wraps  # Used for our @require_auth decorator

# -- Create the Blueprint ---------------------------------------------------
# All routes here will be prefixed with /api/data/...
data_bp = Blueprint("data", __name__, url_prefix="/api/data")

# -- Table name constant ----------------------------------------------------
# Change this if you name your Supabase table differently
TABLE_NAME = "user_profiles"


# =========================================================================
# DECORATOR: @require_auth - Protects routes that need a logged-in user
# =========================================================================
def require_auth(f):
    """
    A decorator that checks for a valid Bearer token before running the route.

    HOW TO USE:
        @data_bp.route("/some-route")
        @require_auth
        def some_route():
            # request.user is now available! (set by this decorator)
            user_id = request.user.id
            ...

    WHAT IT DOES:
        1. Reads the Authorization header
        2. Extracts the Bearer token
        3. Sends the token to Supabase to verify it
        4. If valid   -> attaches user info to request.user and continues
        5. If invalid -> returns 401 Unauthorized immediately

    WHY a decorator? So we don't copy-paste this token-checking code
    into every single route function. DRY = Don't Repeat Yourself!
    """
    @wraps(f)  # Preserves the original function's name and docstring
    def decorated_function(*args, **kwargs):
        # -- Extract token from header ----------------------------------------
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "error": "Missing or invalid Authorization header. "
                         "Expected format: Authorization: Bearer <your_token>"
            }), 401

        token = auth_header.split("Bearer ")[1].strip()

        if not token:
            return jsonify({"error": "Token is empty"}), 401

        # -- Validate token with Supabase -------------------------------------
        try:
            supabase = get_supabase_client()
            result = supabase.auth.get_user(token)

            # Attach user info and token to the request object so the
            # actual route function can access them easily.
            request.user = result.user          # User object (id, email, etc.)
            request.access_token = token        # The raw JWT token string

        except Exception:
            return jsonify({
                "error": "Invalid or expired token. Please log in again."
            }), 401

        # Token is valid -> proceed to the actual route function
        return f(*args, **kwargs)

    return decorated_function


# =========================================================================
# POST /api/data/profile - Create or update the user's profile
# =========================================================================
@data_bp.route("/profile", methods=["POST"])
@require_auth  # <-- This ensures only logged-in users can access this route
def create_profile():
    """
    Creates a new profile for the logged-in user, or updates it if one
    already exists (this is called an "upsert").

    The frontend sends:
        POST /api/data/profile
        Authorization: Bearer <access_token>
        Content-Type: application/json
        Body: {
            "full_name": "Yash",
            "phone": "+91-1234567890",
            "company": "StockSense",
            "role": "Developer"
        }

    All fields are optional. Send only what you have.
    """

    # -- Step 1: Parse the incoming JSON --------------------------------------
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    # -- Step 2: Build the profile data ---------------------------------------
    # request.user was set by the @require_auth decorator above
    user_id = request.user.id

    profile_data = {
        "user_id": user_id,                       # Links this profile to the auth user
        "full_name": data.get("full_name", ""),   # User's display name
        "phone": data.get("phone", ""),           # Phone number
        "company": data.get("company", ""),       # Company or organization
        "role": data.get("role", ""),             # Job title or role
    }

    # -- Step 3: Upsert (insert or update) into Supabase ---------------------
    try:
        supabase = get_supabase_client()

        # IMPORTANT: Pass the user's JWT token to PostgREST.
        # This tells Supabase "this request is coming from user X" so the
        # Row Level Security policies can verify auth.uid() = user_id.
        # Without this line, RLS would BLOCK the request!
        supabase.postgrest.auth(request.access_token)

        # upsert() = INSERT if the row doesn't exist, UPDATE if it does.
        # on_conflict="user_id" means: if a row with this user_id already
        # exists, update it instead of creating a duplicate.
        result = (
            supabase.table(TABLE_NAME)
            .upsert(profile_data, on_conflict="user_id")
            .execute()
        )

        return jsonify({
            "message": "Profile saved successfully!",
            "profile": result.data[0] if result.data else profile_data,
        }), 201  # 201 = Created

    except Exception as e:
        return jsonify({"error": f"Failed to save profile: {str(e)}"}), 500


# =========================================================================
# GET /api/data/profile - Retrieve the user's profile
# =========================================================================
@data_bp.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    """
    Fetches the logged-in user's profile from Supabase.

    The frontend sends:
        GET /api/data/profile
        Authorization: Bearer <access_token>

    Returns the profile data, or 404 if no profile exists yet.
    """

    user_id = request.user.id  # Set by @require_auth

    try:
        supabase = get_supabase_client()

        # Pass the token so RLS can verify this user owns the data
        supabase.postgrest.auth(request.access_token)

        # This is equivalent to:
        #   SELECT * FROM user_profiles WHERE user_id = '<user_id>'
        result = (
            supabase.table(TABLE_NAME)
            .select("*")              # Get all columns
            .eq("user_id", user_id)   # WHERE user_id = ...
            .execute()
        )

        # Check if any rows were returned
        if not result.data:
            return jsonify({
                "error": "No profile found. Create one first via POST /api/data/profile"
            }), 404

        return jsonify({
            "profile": result.data[0],  # Return the first (and only) match
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500


# =========================================================================
# PUT /api/data/profile - Update specific fields of the user's profile
# =========================================================================
@data_bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    """
    Updates specific fields of the logged-in user's profile.
    Only the fields you send will be updated; other fields stay the same.

    The frontend sends:
        PUT /api/data/profile
        Authorization: Bearer <access_token>
        Content-Type: application/json
        Body: { "full_name": "New Name", "company": "New Corp" }
    """

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    user_id = request.user.id

    # -- Only allow updating these specific fields ----------------------------
    # This is a SECURITY measure. It prevents users from changing fields
    # they shouldn't be able to (like user_id or created_at).
    allowed_fields = {"full_name", "phone", "company", "role"}
    update_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields  # Only keep fields in our allowed list
    }

    if not update_data:
        return jsonify({
            "error": f"No valid fields to update. Allowed fields: {', '.join(sorted(allowed_fields))}"
        }), 400

    try:
        supabase = get_supabase_client()
        supabase.postgrest.auth(request.access_token)

        # This is equivalent to:
        #   UPDATE user_profiles SET <fields> WHERE user_id = '<user_id>'
        result = (
            supabase.table(TABLE_NAME)
            .update(update_data)
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "error": "Profile not found. Create one first via POST /api/data/profile"
            }), 404

        return jsonify({
            "message": "Profile updated successfully!",
            "profile": result.data[0],
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500


# =========================================================================
# DELETE /api/data/profile - Delete the user's profile
# =========================================================================
@data_bp.route("/profile", methods=["DELETE"])
@require_auth
def delete_profile():
    """
    Permanently deletes the logged-in user's profile.

    The frontend sends:
        DELETE /api/data/profile
        Authorization: Bearer <access_token>

    WARNING: This cannot be undone!
    """

    user_id = request.user.id

    try:
        supabase = get_supabase_client()
        supabase.postgrest.auth(request.access_token)

        # This is equivalent to:
        #   DELETE FROM user_profiles WHERE user_id = '<user_id>'
        supabase.table(TABLE_NAME).delete().eq("user_id", user_id).execute()

        return jsonify({"message": "Profile deleted successfully."}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to delete profile: {str(e)}"}), 500


# =========================================================================
# SQL TO CREATE THE TABLE IN SUPABASE
# =========================================================================
# Run this SQL in your Supabase Dashboard -> SQL Editor -> New Query:
#
# -- 1. Create the table
# CREATE TABLE user_profiles (
#     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
#     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
#     full_name TEXT,
#     phone TEXT,
#     company TEXT,
#     role TEXT,
#     created_at TIMESTAMPTZ DEFAULT now(),
#     updated_at TIMESTAMPTZ DEFAULT now()
# );
#
# -- 2. Add a unique constraint so each user has only one profile
# ALTER TABLE user_profiles
#     ADD CONSTRAINT unique_user_id UNIQUE (user_id);
#
# -- 3. Enable Row Level Security (RLS)
# -- RLS ensures users can ONLY access their own rows, not anyone else's
# ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
#
# -- 4. Create policies (the "rules" for who can do what)
# CREATE POLICY "Users can view own profile"
#     ON user_profiles FOR SELECT
#     USING (auth.uid() = user_id);
#
# CREATE POLICY "Users can insert own profile"
#     ON user_profiles FOR INSERT
#     WITH CHECK (auth.uid() = user_id);
#
# CREATE POLICY "Users can update own profile"
#     ON user_profiles FOR UPDATE
#     USING (auth.uid() = user_id);
#
# CREATE POLICY "Users can delete own profile"
#     ON user_profiles FOR DELETE
#     USING (auth.uid() = user_id);
# =========================================================================
