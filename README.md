# Crave × 24 Roots

> Hyderabad's underground slow bar — coffee down to the root.

A complete, working website for **24 Roots** (Kokapet, Hyderabad), presented by Crave.
**Python (Flask) backend + plain JavaScript frontend. No TypeScript, no build step, no 3D.**

---

## ✨ Features

- **Home** — live open/closed status (computed from real IST hours), story, guest favourites, offers, reviews
- **Menu** — 4 categories, 23 items with prices, veg/non-veg markers, add-to-cart from anywhere
- **Order flow** — cart drawer → checkout with promo codes (ROOTS15 / SLOWMORN / CAFECLUB) → live kitchen tracking (placed → preparing → ready → completed)
- **Reservations** — validated against opening hours, confirmation codes (RSV-XXXXXX), lookup by code
- **Gallery & Visit** — photo wall, address with Google Maps directions, reviews
- **Order lookup by phone** — `GET /api/orders?phone=...`

---

## 📁 Project Structure

```
crave/
├── frontend/                        # Static frontend (served by Flask, deployable to Vercel)
│   ├── index.html                   # App shell: header, footer, cart drawer
│   ├── css/styles.css               # Design system (espresso/caramel/cream)
│   ├── js/
│   │   ├── api.js                   # API client (window.CraveAPI)
│   │   ├── store.js                 # Cart store with localStorage (window.CraveStore)
│   │   ├── ui.js                    # Toast, drawer, reveals, formatters (window.CraveUI)
│   │   ├── pages.js                 # Page renderers (window.CravePages)
│   │   └── main.js                  # Hash router + boot
│   └── assets/
│       ├── crave-mark.svg           # Crave × 24 Roots logo
│       └── favicon.svg
│
├── backend/                         # Flask API (Python)
│   ├── run.py                       # Entry point (port 5000)
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py              # App factory: blueprints, static serving, SPA fallback
│   │   ├── db.py                    # SQLite helpers + schema bootstrap
│   │   ├── seed.py                  # Idempotent seed: café info, menu, offers, reviews
│   │   └── routes/
│   │       ├── menu.py              # GET /api/menu, /api/menu/items/<slug> (+ open/closed logic)
│   │       ├── orders.py            # POST/GET /api/orders (GST, promos, kitchen simulation)
│   │       ├── reservations.py      # POST/GET /api/reservations (hours-validated)
│   │       └── info.py              # GET /api/cafe, /api/offers, GET/POST /api/reviews
│   └── scripts/
│       └── migrate.py               # python backend/scripts/migrate.py [--reset]
│
├── database/
│   ├── schema.sql                   # Tables: cafe_info, menu_*, orders, reservations, reviews
│   └── crave.db                     # Created automatically on first boot
│
├── package.json                     # Convenience scripts (python)
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
python -m pip install -r backend/requirements.txt

# 2. Run the server  (frontend + API on one port)
python backend/run.py

# 3. Open http://localhost:5000
```

The database (`database/crave.db`) is created and seeded automatically on first boot.

Useful scripts:

```bash
npm run setup      # pip install
npm run migrate    # apply schema manually
python backend/scripts/migrate.py --reset   # drop & recreate the database
```

Set `CRAVE_PORT` to change the port (default 5000).

---

## 📡 API Endpoints

| Endpoint                        | Method   | Description                                   | Auth |
|---------------------------------|----------|-----------------------------------------------|------|
| `/api/health`                   | GET      | Service health + café name                    | No   |
| `/api/cafe`                     | GET      | Café profile, rating, live open/closed status | No   |
| `/api/menu`                     | GET      | Categories + items + status                   | No   |
| `/api/menu/items/<slug>`        | GET      | Single item                                   | No   |
| `/api/offers`                   | GET      | Active promo codes with minimums              | No   |
| `/api/reviews`                  | GET/POST | List / add guest reviews                      | No   |
| `/api/orders`                   | POST     | Place order (server-side pricing + promos)    | No   |
| `/api/orders/<order_no>`        | GET      | Order + live kitchen status                   | No   |
| `/api/orders?phone=`            | GET      | Order history by phone                        | No   |
| `/api/reservations`             | POST     | Book a table (validated against hours)        | No   |
| `/api/reservations/<code>`      | GET      | Look up a booking                             | No   |

### Example — place an order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Hrishikesh",
    "phone": "9876543210",
    "order_type": "takeaway",
    "promo_code": "ROOTS15",
    "items": [
      {"slug": "24r-coldbrew-tonic", "qty": 2},
      {"slug": "24r-basque-cheesecake", "qty": 1}
    ]
  }'
```

Prices are always resolved server-side from the menu — the client never sets them.

---

## 🎟 Promo Codes

| Code        | Benefit            | Minimum order |
|-------------|--------------------|---------------|
| `ROOTS15`   | 15% off            | ₹499          |
| `SLOWMORN`  | 10% off            | ₹299          |
| `CAFECLUB`  | Flat ₹100 off      | ₹999          |

---

## 🌐 Deployment (like pulse.ai)

**Backend** — Render / Railway / any Python host:

- Build: `pip install -r backend/requirements.txt`
- Start: `python backend/run.py` (set `CRAVE_PORT=$PORT` if the host assigns one)

**Frontend** — Vercel / Netlify static:

- Root directory: `frontend`
- Build command: *(none — static)*
- Then point the frontend at the API by adding this to `frontend/index.html` before the scripts:

```html
<script>window.__CRAVE_API__ = 'https://your-api-host.example.com/api';</script>
```

CORS is already open for `/api/*`.

---

## 📄 License

© 2026 Crave × 24 Roots. All rights reserved.
