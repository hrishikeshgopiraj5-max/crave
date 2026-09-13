# Crave × 24 Roots — Backend

Flask (Python) API serving the 24 Roots café website. SQLite storage, zero external services.

## Modules

| Path                    | Purpose |
|-------------------------|---------|
| `run.py`                | Entry point. Reads `CRAVE_PORT` (default 5000). |
| `app/__init__.py`       | App factory: registers blueprints, CORS, static frontend serving, SPA fallback, JSON error handlers. |
| `app/db.py`             | SQLite connection per-request (`g`), schema bootstrap from `database/schema.sql`, `query_db` / `execute_db` helpers. |
| `app/seed.py`           | Idempotent seed: café profile (real 24 Roots data), 4 menu categories, 23 items, 3 offers, 4 reviews. |
| `app/routes/menu.py`    | Menu endpoints + the IST open/closed calculator (`cafe_status`) shared by other routes. |
| `app/routes/orders.py`  | Order placement with server-side pricing, promo validation, 5% GST, and a time-based kitchen simulation (`placed → preparing → ready → completed`). |
| `app/routes/reservations.py` | Table bookings: party size 1–12, future times only, inside 12:00–22:30 window, `RSV-` codes. |
| `app/routes/info.py`    | Café profile, offers, reviews (GET + POST). |
| `scripts/migrate.py`    | Standalone schema runner (`--reset` to wipe). |

## Design notes

- **Server-side pricing** — item prices are looked up from the DB at order time; the client's numbers are ignored.
- **Kitchen simulation** — order status advances by elapsed minutes (placed → 2 min → preparing → 10 min → ready → 45+30 min → completed), computed on read so it works across restarts.
- **IST everywhere** — open/closed status and reservation checks use Asia/Kolkata time (UTC+5:30), stored timestamps are UTC.
- **Same-origin** — Flask serves the `frontend/` folder, so no CORS setup is needed in development. CORS is open for split deployments.
