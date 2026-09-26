# =========================================================================
# routes/auth.py - Authentication Routes (Signup, Login, Logout, Me)
# =========================================================================
# This file handles everything related to USER IDENTITY:
#   - Creating new accounts (signup)
#   - Logging in (returns JWT tokens)
#   - Checking who is currently logged in (me)
#   - Logging out (invalidates the session)
#   - Refreshing expired tokens
#
# HOW IT WORKS:
#   Supabase has a built-in auth system. When a user signs up, Supabase
#   stores their email + hashed password in its internal auth.users table.
#   When they log in, Supabase returns a JWT access_token. The frontend
#   stores this token and sends it with every subsequent request as:
#       Authorization: Bearer <access_token>
#
# FLOW:
#   Frontend -> POST /api/auth/signup  -> Supabase creates user
#   Frontend -> POST /api/auth/login   -> Supabase returns tokens
#   Frontend -> GET  /api/auth/me      -> Backend validates token, returns user
#   Frontend -> POST /api/auth/logout  -> Supabase invalidates session
#   Frontend -> POST /api/auth/refresh -> Get new token without re-login
# =========================================================================

from flask import Blueprint, request, jsonify
from config import get_supabase_client

# Try importing the specific Supabase auth error class.
# This lets us catch auth-specific errors (wrong password, user exists, etc.)
# separately from generic Python errors.
try:
    from gotrue.errors import AuthApiError
except ImportError:
    # Fallback if the import path changes in future SDK versions
    AuthApiError = Exception

# -- Create a Flask Blueprint -----------------------------------------------
# A Blueprint is like a mini-app. It groups related routes together.
# url_prefix="/api/auth" means all routes here start with /api/auth/...
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# =========================================================================
# HELPER: Extract Bearer Token from the Authorization header
# =========================================================================
def _get_token_from_header():
    """
    Reads the Authorization header and extracts the Bearer token.

    Expected header format:
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV...

    Returns:
        str: The token string, or None if the header is missing/malformed.
    """
    auth_header = request.headers.get("Authorization", "")

    # Check that it starts with "Bearer " (note the space after Bearer)
    if not auth_header.startswith("Bearer "):
        return None

    # Split on "Bearer " and take the second part (the actual token)
    return auth_header.split("Bearer ")[1].strip()


# =========================================================================
# HELPER: Build a consistent error response
# =========================================================================
def _error_response(message, status_code=400):
    """
    Returns a JSON error response in a consistent format.
    Every error from this API looks like: {"error": "some message"}
    This makes it easy for the frontend to always check response.error.
    """
    return jsonify({"error": message}), status_code


# =========================================================================
# HELPER: Build a consistent user data dict
# =========================================================================
def _format_user(user):
    """
    Takes a Supabase user object and returns only the fields we want
    to send to the frontend. This avoids leaking internal Supabase fields.
    """
    return {
        "id": user.id,
        "email": user.email,
        "created_at": str(user.created_at) if user.created_at else None,
    }


# =========================================================================
# POST /api/auth/signup - Register a new user
# =========================================================================
@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Creates a new user account in Supabase.

    The frontend sends:
        POST /api/auth/signup
        Content-Type: application/json
        Body: { "email": "user@example.com", "password": "securepass123" }

    On success  -> returns the new user info (201 Created)
    On failure  -> returns an error message (400 Bad Request)
    """

    # -- Step 1: Parse the JSON body ------------------------------------------
    # silent=True means: if the body isn't valid JSON, return None instead of
    # throwing an error. We handle it ourselves with a nicer message.
    data = request.get_json(silent=True)
    if not data:
        return _error_response("Request body must be valid JSON", 400)

    # -- Step 2: Extract and validate fields ----------------------------------
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email:
        return _error_response("Email is required", 400)
    if not password:
        return _error_response("Password is required", 400)
    if len(password) < 6:
        return _error_response("Password must be at least 6 characters", 400)

    # Basic email format check (Supabase also validates, this is a first gate)
    if "@" not in email or "." not in email:
        return _error_response("Please provide a valid email address", 400)

    # -- Step 3: Call Supabase Auth to create the user ------------------------
    try:
        supabase = get_supabase_client()

        # sign_up() creates the user in Supabase's auth.users table.
        # If email confirmation is enabled in your Supabase project settings,
        # the user will need to click a link in their email before they can log in.
        result = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })

        user = result.user

        return jsonify({
            "message": "Signup successful! Check your email to confirm your account.",
            "user": _format_user(user),
        }), 201  # 201 = Created

    except AuthApiError as e:
        # Supabase-specific errors like "User already registered"
        return _error_response(str(e), 400)
    except ValueError as e:
        # Missing .env keys (our config.py raises this)
        return _error_response(str(e), 500)
    except Exception as e:
        # Catch-all for unexpected errors
        return _error_response(f"Signup failed: {str(e)}", 500)


# =========================================================================
# POST /api/auth/login - Sign in and get access tokens
# =========================================================================
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates a user and returns JWT tokens.

    The frontend sends:
        POST /api/auth/login
        Content-Type: application/json
        Body: { "email": "user@example.com", "password": "securepass123" }

    On success, returns user info + session with these important tokens:
        - access_token:  Short-lived (~1 hour). Send with every API request.
        - refresh_token: Long-lived. Use to get a new access_token silently.
        - expires_at:    When the access_token expires (Unix timestamp).

    The frontend should store access_token and include it in all future
    requests as the header:  Authorization: Bearer <access_token>
    """

    # -- Step 1: Parse the JSON body ------------------------------------------
    data = request.get_json(silent=True)
    if not data:
        return _error_response("Request body must be valid JSON", 400)

    # -- Step 2: Extract and validate fields ----------------------------------
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email:
        return _error_response("Email is required", 400)
    if not password:
        return _error_response("Password is required", 400)

    # -- Step 3: Call Supabase Auth to verify credentials ---------------------
    try:
        supabase = get_supabase_client()

        # sign_in_with_password() checks the email + password combo.
        # If valid, Supabase returns a session object with JWT tokens.
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        session = result.session  # Contains the JWT tokens
        user = result.user        # Contains user info

        return jsonify({
            "message": "Login successful!",
            "user": _format_user(user),
            "session": {
                # access_token: Short-lived JWT (~1 hour).
                # Send this with every request as: Authorization: Bearer <token>
                "access_token": session.access_token,

                # refresh_token: Long-lived token. Use POST /api/auth/refresh
                # to get a new access_token when the current one expires.
                "refresh_token": session.refresh_token,

                # expires_at: Unix timestamp of when the access_token expires.
                # The frontend can check this to refresh proactively.
                "expires_at": session.expires_at,
            }
        }), 200

    except AuthApiError as e:
        # Wrong email/password -> 401 Unauthorized
        return _error_response(str(e), 401)
    except ValueError as e:
        return _error_response(str(e), 500)
    except Exception as e:
        return _error_response(f"Login failed: {str(e)}", 500)


# =========================================================================
# GET /api/auth/me - Get the currently logged-in user's info
# =========================================================================
@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """
    Returns info about the currently authenticated user.

    The frontend sends:
        GET /api/auth/me
        Authorization: Bearer <access_token>

    This is useful for:
        - Checking if the user is still logged in when the page loads
        - Displaying the user's email in the navbar
        - Verifying the token hasn't expired
    """

    # -- Step 1: Extract the token from the header ----------------------------
    token = _get_token_from_header()
    if not token:
        return _error_response(
            "Missing or invalid Authorization header. "
            "Expected format: Authorization: Bearer <your_token>",
            401
        )

    # -- Step 2: Ask Supabase to validate the token --------------------------
    try:
        supabase = get_supabase_client()

        # get_user() sends the token to Supabase, which verifies:
        #   1. Is the token properly signed? (not tampered with)
        #   2. Has it expired? (past the expires_at timestamp)
        #   3. Does the user still exist? (not deleted)
        result = supabase.auth.get_user(token)
        user = result.user

        return jsonify({
            "user": _format_user(user),
        }), 200

    except AuthApiError as e:
        return _error_response(str(e), 401)
    except Exception as e:
        return _error_response(f"Failed to get user: {str(e)}", 500)


# =========================================================================
# POST /api/auth/logout - Sign out and invalidate the session
# =========================================================================
@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Signs out the current user by invalidating their session on Supabase.

    The frontend sends:
        POST /api/auth/logout
        Authorization: Bearer <access_token>

    After this call:
        - The access_token will no longer work on the server
        - The frontend should also delete the token from localStorage/state
    """

    # -- Step 1: Extract the token --------------------------------------------
    token = _get_token_from_header()
    if not token:
        return _error_response("Missing or invalid Authorization header.", 401)

    # -- Step 2: Tell Supabase to invalidate this session --------------------
    try:
        supabase = get_supabase_client()

        # We "set" the session on the client so Supabase knows which
        # session to invalidate when we call sign_out().
        supabase.auth.set_session(token, "")
        supabase.auth.sign_out()

        return jsonify({"message": "Logged out successfully!"}), 200

    except Exception as e:
        return _error_response(f"Logout failed: {str(e)}", 500)


# =========================================================================
# POST /api/auth/refresh - Get a new access token using the refresh token
# =========================================================================
@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """
    Uses a refresh_token to get a new access_token without re-entering
    the password. This lets users stay logged in silently.

    The frontend sends:
        POST /api/auth/refresh
        Content-Type: application/json
        Body: { "refresh_token": "your-refresh-token-here" }

    When to use this:
        - When the access_token expires (typically after ~1 hour)
        - The frontend can call this automatically in the background
        - No user interaction needed!
    """

    data = request.get_json(silent=True)
    if not data:
        return _error_response("Request body must be valid JSON", 400)

    refresh = data.get("refresh_token", "")
    if not refresh:
        return _error_response("refresh_token is required", 400)

    try:
        supabase = get_supabase_client()

        # refresh_session() exchanges the old refresh_token for brand new tokens
        result = supabase.auth.refresh_session(refresh)
        session = result.session

        return jsonify({
            "message": "Token refreshed!",
            "session": {
                "access_token": session.access_token,
                "refresh_token": session.refresh_token,
                "expires_at": session.expires_at,
            }
        }), 200

    except AuthApiError as e:
        return _error_response(str(e), 401)
    except Exception as e:
        return _error_response(f"Token refresh failed: {str(e)}", 500)
