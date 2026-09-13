# ============================================================
# CRAVE × 24 ROOTS — order endpoints
#   POST /api/orders            → place order {items:[{slug,qty}], customer_name, phone, order_type, promo_code, notes}
#   GET  /api/orders/<order_no> → order + live kitchen status
#   GET  /api/orders?phone=...  → order history for a phone number
# ============================================================

import calendar
import re
import time
from datetime import timedelta

from flask import Blueprint, jsonify, request

from ..db import query_db, execute_db
from ..seed import flat_discount_for
from .menu import ist_now

bp = Blueprint("orders", __name__)

GST_RATE = 0.05
KITCHEN_STAGES = ["placed", "preparing", "ready", "completed"]
STAGE_MINUTES = {"placed": 2, "preparing": 10, "ready": 45}


def _advance_status(order: dict) -> dict:
    """Kitchen simulation: move the order forward based on elapsed time."""
    try:
        placed = calendar.timegm(time.strptime(order["created_at"], "%Y-%m-%dT%H:%M:%S"))
    except (ValueError, TypeError):
        return order

    elapsed_min = (time.time() - placed) / 60
    stage = "placed"
    for s in KITCHEN_STAGES[:-1]:
        if elapsed_min >= STAGE_MINUTES.get(s, 0):
            stage = s
    if order["status"] != "completed" and elapsed_min >= STAGE_MINUTES["ready"] + 30:
        stage = "completed"

    if stage != order["status"]:
        execute_db(
            "UPDATE orders SET status = ?, status_updated_at = ? WHERE id = ?",
            (stage, time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()), order["id"]),
        )
        order["status"] = stage
    return order


def _order_public(o: dict, include_items: bool = True) -> dict:
    data = {
        "order_no": o["order_no"],
        "customer_name": o["customer_name"],
        "phone": o["phone"],
        "order_type": o["order_type"],
        "notes": o["notes"],
        "promo_code": o["promo_code"],
        "subtotal": o["subtotal"],
        "discount": o["discount"],
        "gst": o["gst"],
        "total": o["total"],
        "status": o["status"],
        "created_at": o["created_at"],
        "stage_index": KITCHEN_STAGES.index(o["status"]) if o["status"] in KITCHEN_STAGES else 0,
        "stages": KITCHEN_STAGES,
    }
    if include_items:
        data["items"] = query_db(
            "SELECT item_slug AS slug, name, price, qty FROM order_items WHERE order_id = ?",
            (o["id"],),
        )
    return data


@bp.post("")
def place_order():
    body = request.get_json(silent=True) or {}

    name = (body.get("customer_name") or "").strip()
    phone = (body.get("phone") or "").strip()
    order_type = body.get("order_type") or "dine-in"
    promo = (body.get("promo_code") or "").strip().upper() or None
    notes = (body.get("notes") or "").strip() or None
    raw_items = body.get("items") or []

    if not name or len(name) < 2:
        return jsonify({"ok": False, "error": "Please provide your name"}), 400
    if not re.fullmatch(r"[0-9+\-\s]{8,15}", phone):
        return jsonify({"ok": False, "error": "Please provide a valid phone number"}), 400
    if order_type not in ("dine-in", "takeaway"):
        return jsonify({"ok": False, "error": "order_type must be dine-in or takeaway"}), 400
    if not raw_items or not isinstance(raw_items, list):
        return jsonify({"ok": False, "error": "Cart is empty"}), 400

    # Resolve items against the menu (never trust client prices)
    line_items, subtotal = [], 0
    for raw in raw_items:
        slug = (raw.get("slug") or "").strip()
        qty = max(1, min(20, int(raw.get("qty") or 1)))
        item = query_db("SELECT * FROM menu_items WHERE slug = ? AND available = 1", (slug,), one=True)
        if not item:
            return jsonify({"ok": False, "error": f"Unknown item: {slug}"}), 400
        line_items.append({"slug": item["slug"], "name": item["name"], "price": item["price"], "qty": qty})
        subtotal += item["price"] * qty

    # Promo
    discount, applied_promo = 0, None
    if promo:
        promo_data = flat_discount_for(promo)
        if promo_data is None:
            return jsonify({"ok": False, "error": f"Promo code {promo} is not valid"}), 400
        percent, flat, min_order = promo_data
        if subtotal < min_order:
            return jsonify({"ok": False, "error": f"{promo} needs a minimum order of ₹{min_order}"}), 400
        if percent:
            discount = round(subtotal * percent / 100)
        discount += flat
        discount = min(discount, subtotal)
        applied_promo = promo

    gst = round((subtotal - discount) * GST_RATE)
    total = subtotal - discount + gst
    order_no = "CRV-" + str(int(time.time() * 1000))[-6:]

    now = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    order_id = execute_db(
        """INSERT INTO orders
           (order_no, customer_name, phone, order_type, notes, promo_code,
            subtotal, discount, gst, total, status, created_at, status_updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?, 'placed', ?, ?)""",
        (order_no, name, phone, order_type, notes, applied_promo,
         subtotal, discount, gst, total, now, now),
    )
    for li in line_items:
        execute_db(
            "INSERT INTO order_items (order_id, item_slug, name, price, qty) VALUES (?,?,?,?,?)",
            (order_id, li["slug"], li["name"], li["price"], li["qty"]),
        )

    order = query_db("SELECT * FROM orders WHERE id = ?", (order_id,), one=True)
    return jsonify({"ok": True, "order": _order_public(order)}), 201


@bp.get("/<order_no>")
def get_order(order_no: str):
    order = query_db("SELECT * FROM orders WHERE order_no = ?", (order_no,), one=True)
    if not order:
        return jsonify({"ok": False, "error": "Order not found"}), 404
    order = _advance_status(order)
    return jsonify({"ok": True, "order": _order_public(order)})


@bp.get("")
def list_orders():
    phone = (request.args.get("phone") or "").strip()
    if not phone:
        return jsonify({"ok": False, "error": "phone query parameter required"}), 400
    rows = query_db(
        "SELECT * FROM orders WHERE phone = ? ORDER BY id DESC LIMIT 20", (phone,)
    )
    rows = [_advance_status(r) for r in rows]
    return jsonify({"ok": True, "orders": [_order_public(r) for r in rows]})
