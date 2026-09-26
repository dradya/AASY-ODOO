# =========================================================================
# app.py - Main Entry Point for the StockSense Flask API
# =========================================================================
# This is the file you run to start the backend server:
#     py app.py
#
# WHAT THIS FILE DOES:
#   1. Creates the Flask application using the "app factory" pattern
#   2. Configures CORS so your React frontend can talk to this backend
#   3. Registers all route blueprints (auth routes, data routes)
#   4. Adds a health check endpoint for quick testing
#   5. Starts the development server
#
# ARCHITECTURE OVERVIEW:
#
#   React Frontend (localhost:5173)
#         |
#         |  HTTP requests (JSON)
#         v
#   Flask Backend (localhost:5000)    <-- YOU ARE HERE
#         |
#         |  Supabase Python SDK
#         v
#   Supabase (your-project.supabase.co)
#         |
#         |-- Auth (signup, login, JWT tokens)
#         +-- Database (PostgreSQL tables)
#
# =========================================================================

from flask import Flask, jsonify
from flask_cors import CORS       # Handles Cross-Origin Resource Sharing
from config import Config          # Our settings from config.py


def create_app() -> Flask:
    """
    Application Factory - creates and configures the Flask app.

    WHY use a factory function instead of a global app = Flask(__name__)?
      - Testability: You can create separate app instances for testing
      - Flexibility: Different configs for dev/staging/production
      - Clean imports: No circular import issues

    Returns:
        Flask: A fully configured Flask application instance.
    """

    # -- Create the Flask app -------------------------------------------------
    # __name__ tells Flask where to find templates, static files, etc.
    app = Flask(__name__)

    # Load our configuration (secret key, debug mode, etc.)
    app.config.from_object(Config)

    # =====================================================================
    # CORS Configuration
    # =====================================================================
    # PROBLEM: Browsers block requests from one origin (localhost:5173)
    #          to a different origin (localhost:5000) by default.
    #          This is the browser's "Same-Origin Policy".
    #
    # SOLUTION: CORS headers tell the browser "it's OK, I trust this origin".
    #
    # We only allow our React frontend origins. In production, replace
    # these with your actual domain (e.g., https://stocksense.app).
    CORS(app, resources={
        r"/api/*": {                          # Apply CORS to all /api/ routes
            "origins": [
                "http://localhost:5173",       # Vite dev server (default port)
                "http://localhost:3000",       # Alternative dev port
                "http://127.0.0.1:5173",      # Same as above but with IP
                "http://127.0.0.1:3000",
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,     # Allow cookies/auth headers
        }
    })

    # =====================================================================
    # Register Route Blueprints
    # =====================================================================
    # Blueprints are imported here (not at the top of the file) to avoid
    # circular imports. Each blueprint adds its own routes to the app.

    from routes.auth import auth_bp   # /api/auth/signup, /login, /me, /logout, /refresh
    from routes.data import data_bp   # /api/data/profile (CRUD)

    app.register_blueprint(auth_bp)
    app.register_blueprint(data_bp)

    # =====================================================================
    # Health Check Endpoint
    # =====================================================================
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """
        Simple endpoint to verify the API is running.

        Test it:  curl http://localhost:5000/api/health
        Returns:  { "status": "ok", "message": "StockSense API is running!" }

        This is useful for:
            - Quick manual testing ("is my server up?")
            - Frontend connection checks on app startup
            - Load balancer health probes in production
        """
        return jsonify({
            "status": "ok",
            "message": "StockSense API is running!",
        }), 200

    # =====================================================================
    # Root Endpoint - API Documentation / Index
    # =====================================================================
    @app.route("/", methods=["GET"])
    def index():
        """
        Lists all available API endpoints.
        Visit http://localhost:5000/ in your browser to see this.
        """
        return jsonify({
            "app": "StockSense API",
            "version": "1.0.0",
            "endpoints": {
                "health":         "GET    /api/health",
                "signup":         "POST   /api/auth/signup",
                "login":          "POST   /api/auth/login",
                "me":             "GET    /api/auth/me",
                "logout":         "POST   /api/auth/logout",
                "refresh_token":  "POST   /api/auth/refresh",
                "create_profile": "POST   /api/data/profile",
                "get_profile":    "GET    /api/data/profile",
                "update_profile": "PUT    /api/data/profile",
                "delete_profile": "DELETE /api/data/profile",
            }
        })

    # =====================================================================
    # Global Error Handlers
    # =====================================================================
    # These catch errors that aren't handled by individual routes
    # and return JSON instead of HTML error pages.

    @app.errorhandler(404)
    def not_found(error):
        """Return JSON instead of HTML for 404 errors."""
        return jsonify({
            "error": "Endpoint not found. Visit / to see available endpoints."
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        """Return JSON when the wrong HTTP method is used."""
        return jsonify({
            "error": "Method not allowed. Check the endpoint documentation."
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        """Return JSON instead of HTML for 500 errors."""
        return jsonify({
            "error": "Internal server error. Check the Flask console for details."
        }), 500

    return app


# =========================================================================
# START THE SERVER
# =========================================================================
# This block only runs when you execute the file directly:
#     py app.py
#
# It does NOT run when the file is imported (e.g., during testing).
# =========================================================================
if __name__ == "__main__":
    app = create_app()

    # Print a helpful startup banner
    print("")
    print("=" * 60)
    print("  StockSense Flask API")
    print("=" * 60)
    print(f"  Server:    http://localhost:{Config.PORT}")
    print(f"  Health:    http://localhost:{Config.PORT}/api/health")
    print(f"  API docs:  http://localhost:{Config.PORT}/")
    print(f"  Debug:     {Config.DEBUG}")
    print("")
    print("  Make sure your Supabase keys are set in flask-api/.env")
    print("=" * 60)
    print("")

    # Start the Flask development server
    app.run(
        host="0.0.0.0",          # Listen on all network interfaces
        port=Config.PORT,         # Default: 5000
        debug=Config.DEBUG,       # Auto-reload on code changes when True
    )
