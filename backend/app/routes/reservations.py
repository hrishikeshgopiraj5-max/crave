# ============================================================
# CRAVE × 24 ROOTS — reservation endpoints
#   POST /api/reservations        → book a table
#   GET  /api/reservations/<code> → look up a booking
# ============================================================

import re
import time
import uuid
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

from ..db import query_db, execute_db
from .menu import cafe_status, ist_now

bp = Blueprint("reservations", __name__)


@bp.post("")
def create_reservation():
    body = request.get_json(silent=True) or {}

    name = (body.get("name") or "").strip()
    phone = (body.get("phone") or "").strip()
    date = (body.get("date") or "").strip()
    time_s = (body.get("time") or "").strip()
    party = body.get("party_size")
    notes = (body.get("notes") or "").strip() or None

    if not name or len(name) < 2:
        return jsonify({"ok": False, "error": "Please provide your name"}), 400
    if not re.fullmatch(r"[0-9+\-\s]{8,15}", phone):
        return jsonify({"ok": False, "error": "Please provide a valid phone number"}), 400

    try:
        dt = datetime.strptime(f"{date} {time_s}", "%Y-%m-%d %H:%M")
    except ValueError:
        return jsonify({"ok": False, "error": "Invalid date or time"}), 400

    try:
        party = int(party)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "Invalid party size"}), 400
    if not 1 <= party <= 12:
        return jsonify({"ok": False, "error": "Party size must be between 1 and 12"}), 400

    # must be within opening hours (12:00–23:00 IST) and in the future
    info = query_db("SELECT opens_at, closes_at FROM cafe_info WHERE id = 1", one=True)
    minutes = dt.hour * 60 + dt.minute
    if info:
        def to_min(hhmm):
            h, m = hhmm.split(":")
            return int(h) * 60 + int(m)
        if not (to_min(info["opens_at"]) <= minutes < to_min(info["closes_at"]) - 30):
            return jsonify({"ok": False, "error": "Please pick a time between 12:00 PM and 10:30 PM"}), 400

    if dt < datetime.now() - timedelta(minutes=5):
        return jsonify({"ok": False, "error": "Reservation time is in the past"}), 400

    code = "RSV-" + uuid.uuid4().hex[:6].upper()
    created = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    execute_db(
        """INSERT INTO reservations (code, name, phone, date, time, party_size, notes, status, created_at)
           VALUES (?,?,?,?,?,?,?, 'confirmed', ?)""",
        (code, name, phone, date, time_s, party, notes, created),
    )

    return (
        jsonify(
            {
                "ok": True,
                "reservation": {
                    "code": code,
                    "name": name,
                    "date": date,
                    "time": time_s,
                    "party_size": party,
                    "notes": notes,
                    "status": "confirmed",
                },
            }
        ),
        201,
    )


@bp.get("/<code>")
def get_reservation(code: str):
    row = query_db("SELECT * FROM reservations WHERE code = ?", (code,), one=True)
    if not row:
        return jsonify({"ok": False, "error": "Reservation not found"}), 404
    return jsonify(
        {
            "ok": True,
            "reservation": {
                "code": row["code"],
                "name": row["name"],
                "date": row["date"],
                "time": row["time"],
                "party_size": row["party_size"],
                "notes": row["notes"],
                "status": row["status"],
            },
        }
    )
