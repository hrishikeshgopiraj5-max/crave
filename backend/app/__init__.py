# ============================================================
# CRAVE × 24 ROOTS — Flask application factory
# ============================================================

import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .db import init_db, query_db
from .seed import ensure_seed

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
DATABASE_DIR = os.path.join(PROJECT_ROOT, "database")

TEMPLATE_REPLIES = {
    "timing": "We're open 12:00 PM – 11:00 PM, every day of the week.",
    "location": "You'll find us at Sy.No 166/3, Ground Floor, near Ocean Park, Kokapet, Hyderabad 500075 — the underground slow-bar just off the main road.",
    "menu": "Our slow bar pours cold brews, matchas and signature espresso drinks, plus an all-day kitchen. Tap the Menu page for the full list with prices.",
    "reservation": "Reservations are open! Use the Reserve page to pick your date, time and party size — we'll keep a table ready.",
    "wifi": "Yes — free high-speed WiFi throughout the space, plus plenty of sockets for laptops.",
    "default": "Hi! I'm the 24 Roots assistant. I can help with our menu, timings, reservations, offers, or tracking your order. What would you like to know?",
}


def _keyword_reply(message: str) -> str:
    text = message.lower()
    if any(k in text for k in ("time", "timing", "open", "close", "hour")):
        return TEMPLATE_REPLIES["timing"]
    if any(k in text for k in ("where", "location", "address", "reach", "direction")):
        return TEMPLATE_REPLIES["location"]
    if any(k in text for k in ("menu", "food", "eat", "dish", "price", "coffee")):
        return TEMPLATE_REPLIES["menu"]
    if any(k in text for k in ("reserv", "table", "book")):
        return TEMPLATE_REPLIES["reservation"]
    if "wifi" in text:
        return TEMPLATE_REPLIES["wifi"]
    return TEMPLATE_REPLIES["default"]


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config["JSON_SORT_KEYS"] = False
    app.config["DATABASE_PATH"] = os.path.join(DATABASE_DIR, "crave.db")

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    init_db(os.path.join(DATABASE_DIR, "crave.db"))
    with app.app_context():
        ensure_seed()

    # ----- API -----
    from .routes.menu import bp as menu_bp
    from .routes.orders import bp as orders_bp
    from .routes.reservations import bp as reservations_bp
    from .routes.info import bp as info_bp

    app.register_blueprint(menu_bp, url_prefix="/api/menu")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(reservations_bp, url_prefix="/api/reservations")
    app.register_blueprint(info_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        cafes = query_db("SELECT name FROM cafe_info WHERE id = 1")
        return jsonify({"ok": True, "service": "crave-24roots", "cafe": cafes[0]["name"] if cafes else None})

    # ----- Static frontend -----
    @app.get("/")
    def index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/<path:filename>")
    def static_files(filename):
        resp = send_from_directory(FRONTEND_DIR, filename)
        return resp

    # SPA fallback: any unknown non-API path serves the app shell
    @app.errorhandler(404)
    def spa_fallback(_e):
        from flask import request

        if request.path.startswith("/api/"):
            return jsonify({"ok": False, "error": "Not found"}), 404
        return send_from_directory(FRONTEND_DIR, "index.html")

    # ----- JSON error handlers -----
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"ok": False, "error": getattr(e, "description", "Bad request")}), 400

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"ok": False, "error": "Internal server error"}), 500

    return app
