# ============================================================
# CRAVE × 24 ROOTS — menu endpoints
#   GET /api/menu                     → categories + items + cafe status
#   GET /api/menu/items/<slug>        → single item
# ============================================================

from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify

from ..db import query_db

bp = Blueprint("menu", __name__)

IST = timezone(timedelta(hours=5, minutes=30))


def ist_now() -> datetime:
    return datetime.now(IST)


def cafe_status(info: dict | None) -> dict:
    """Compute open/closed + minutes until next flip, from IST clock."""
    if not info:
        return {"open_now": False, "opens_at": None, "closes_at": None}

    now = ist_now()
    minutes_now = now.hour * 60 + now.minute

    def to_min(hhmm: str) -> int:
        h, m = hhmm.split(":")
        return int(h) * 60 + int(m)

    opens = to_min(info["opens_at"])
    closes = to_min(info["closes_at"])

    if opens <= closes:                       # same-day window
        open_now = opens <= minutes_now < closes
    else:                                     # overnight window
        open_now = minutes_now >= opens or minutes_now < closes

    if open_now:
        minutes_until_flip = (closes - minutes_now) % (24 * 60)
    else:
        minutes_until_flip = (opens - minutes_now) % (24 * 60)

    return {
        "open_now": open_now,
        "opens_at": info["opens_at"],
        "closes_at": info["closes_at"],
        "minutes_until_flip": minutes_until_flip,
        "ist_time": now.strftime("%H:%M"),
    }


def _item_public(row: dict) -> dict:
    return {
        "slug": row["slug"],
        "name": row["name"],
        "description": row["description"],
        "price": row["price"],
        "veg": bool(row["veg"]),
        "popular": bool(row["popular"]),
        "available": bool(row["available"]),
        "image": row["image_url"],
    }


@bp.get("")
def get_menu():
    info = query_db("SELECT * FROM cafe_info WHERE id = 1", one=True)
    cats = query_db("SELECT * FROM menu_categories ORDER BY sort_order")
    items = query_db("SELECT * FROM menu_items WHERE available = 1 ORDER BY sort_order")

    menu = []
    for c in cats:
        menu.append(
            {
                "slug": c["slug"],
                "name": c["name"],
                "blurb": c["blurb"],
                "items": [_item_public(i) for i in items if i["category_id"] == c["id"]],
            }
        )

    return jsonify(
        {
            "ok": True,
            "cafe": {k: info[k] for k in info if k not in ("id", "updated_at")} if info else None,
            "status": cafe_status(info),
            "categories": menu,
        }
    )


@bp.get("/items/<slug>")
def get_item(slug: str):
    row = query_db("SELECT * FROM menu_items WHERE slug = ? AND available = 1", (slug,), one=True)
    if not row:
        return jsonify({"ok": False, "error": "Item not found"}), 404
    return jsonify({"ok": True, "item": _item_public(row)})
