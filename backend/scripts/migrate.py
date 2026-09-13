# ============================================================
# CRAVE × 24 ROOTS — database migration script
#   python backend/scripts/migrate.py            apply schema
#   python backend/scripts/migrate.py --reset    drop + recreate
# ============================================================

import os
import sqlite3
import sys

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCHEMA = os.path.join(BASE, "database", "schema.sql")
DB_PATH = os.path.join(BASE, "database", "crave.db")


def main():
    if "--reset" in sys.argv and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"[migrate] removed {DB_PATH}")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA, "r", encoding="utf-8") as fh:
        conn.executescript(fh.read())
    conn.commit()
    conn.close()
    print(f"[migrate] schema applied → {DB_PATH}")


if __name__ == "__main__":
    main()
