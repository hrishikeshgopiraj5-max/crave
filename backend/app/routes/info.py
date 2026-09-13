# ============================================================
# CRAVE × 24 ROOTS — info endpoints
#   GET /api/cafe      → café profile + live status
#   GET /api/offers    → active promo codes
#   GET /api/reviews   → guest reviews (+ POST to add one)
# ============================================================

import time

from flask import Blueprint, jsonify, request

from ..db import query_db, execute_db
from .menu import cafe_status

bp = Blueprint("info", __name__)


@bp.get("/cafe")
def get_cafe():
    info = query_db("SELECT * FROM cafe_info WHERE id = 1", one=True)
    if not info:
        return jsonify({"ok": False, "error": "Cafe not configured"}), 500
    cafe = {k: info[k] for k in info if k not in ("id", "updated_at")}
    rating = query_db("SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews", one=True)
    cafe["rating"] = round(rating["avg"], 1) if rating["avg"] else None
    cafe["review_count"] = rating["count"]
    cafe["status"] = cafe_status(info)
    return jsonify({"ok": True, "cafe": cafe})


@bp.get("/offers")
def get_offers():
    rows = query_db("SELECT code, title, description, percent_off, min_order FROM offers WHERE active = 1")
    return jsonify({"ok": True, "offers": rows})


@bp.route("/reviews", methods=["GET", "POST"])
def reviews():
    if request.method == "GET":
        rows = query_db("SELECT name, rating, comment, created_at FROM reviews ORDER BY id DESC LIMIT 30")
        avg = query_db("SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews", one=True)
        return jsonify(
            {
                "ok": True,
                "average": round(avg["avg"], 1) if avg["avg"] else None,
                "count": avg["count"],
                "reviews": rows,
            }
        )

    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    rating = body.get("rating")
    comment = (body.get("comment") or "").strip()
    if not name or not comment:
        return jsonify({"ok": False, "error": "Name and comment are required"}), 400
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "Rating must be 1-5"}), 400
    if not 1 <= rating <= 5:
        return jsonify({"ok": False, "error": "Rating must be 1-5"}), 400

    execute_db(
        "INSERT INTO reviews (name, rating, comment, created_at) VALUES (?,?,?,?)",
        (name, rating, comment, time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())),
    )
    return jsonify({"ok": True, "message": "Thanks for the review!"}), 201
