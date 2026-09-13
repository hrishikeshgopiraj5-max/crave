# ============================================================
# CRAVE × 24 ROOTS — SQLite access helpers
# Applies database/schema.sql on first boot; small helpers
# (query_db / execute_db) used by all blueprints.
# ============================================================

import os
import sqlite3

from flask import current_app, g

SCHEMA_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "database", "schema.sql")
)


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE_PATH"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(db_path: str) -> None:
    """Create the database file and apply the schema if needed."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    fresh = not os.path.exists(db_path)
    conn = sqlite3.connect(db_path)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as fh:
        conn.executescript(fh.read())
    conn.commit()
    conn.close()
    if fresh:
        print(f"[db] created {db_path}")


def query_db(sql: str, args: tuple = (), one: bool = False):
    cur = get_db().execute(sql, args)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    return (rows[0] if rows else None) if one else rows


def execute_db(sql: str, args: tuple = ()) -> int:
    db = get_db()
    cur = db.execute(sql, args)
    db.commit()
    lastrowid = cur.lastrowid
    cur.close()
    return lastrowid
