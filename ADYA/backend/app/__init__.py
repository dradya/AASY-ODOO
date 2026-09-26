from flask import Flask
from flask_cors import CORS


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    CORS(app, resources={r"/api/*": {"origins": "*"}})  # TODO: restrict origins in prod

    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.receipts import receipts_bp
    from app.routes.deliveries import deliveries_bp
    from app.routes.transfers import transfers_bp
    from app.routes.adjustments import adjustments_bp
    from app.routes.warehouses import warehouses_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(receipts_bp, url_prefix="/api/receipts")
    app.register_blueprint(deliveries_bp, url_prefix="/api/deliveries")
    app.register_blueprint(transfers_bp, url_prefix="/api/transfers")
    app.register_blueprint(adjustments_bp, url_prefix="/api/adjustments")
    app.register_blueprint(warehouses_bp, url_prefix="/api/warehouses")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
