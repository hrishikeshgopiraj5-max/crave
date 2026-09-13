# ============================================================
# CRAVE × 24 ROOTS — entry point
#   python backend/run.py   (or: flask --app backend.app run)
# ============================================================

import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("CRAVE_PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)
