-- ============================================================
-- CRAVE × 24 ROOTS — database schema (SQLite)
-- Applied by backend/app/db.py on first boot (and via
-- `python backend/scripts/migrate.py`).
-- ============================================================

CREATE TABLE IF NOT EXISTS cafe_info (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    name          TEXT NOT NULL,
    tagline       TEXT,
    description   TEXT,
    story         TEXT,
    address       TEXT,
    area          TEXT,
    city          TEXT,
    instagram     TEXT,
    maps_url      TEXT,
    cost_for_two  INTEGER,
    price_tier    TEXT,
    opens_at      TEXT,           -- 'HH:MM' IST
    closes_at     TEXT,           -- 'HH:MM' IST
    hero_image    TEXT,
    updated_at    TEXT
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    blurb       TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    price       INTEGER NOT NULL,          -- rupees
    veg         INTEGER NOT NULL DEFAULT 1,
    popular     INTEGER NOT NULL DEFAULT 0,
    available   INTEGER NOT NULL DEFAULT 1,
    image_url   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS offers (
    code        TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    percent_off INTEGER NOT NULL,
    min_order   INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no          TEXT NOT NULL UNIQUE,
    customer_name     TEXT NOT NULL,
    phone             TEXT NOT NULL,
    order_type        TEXT NOT NULL DEFAULT 'dine-in',   -- dine-in | takeaway
    notes             TEXT,
    promo_code        TEXT,
    subtotal          INTEGER NOT NULL,
    discount          INTEGER NOT NULL DEFAULT 0,
    gst               INTEGER NOT NULL DEFAULT 0,
    total             INTEGER NOT NULL,
    status            TEXT NOT NULL DEFAULT 'placed',
    created_at        TEXT NOT NULL,
    status_updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_slug  TEXT NOT NULL,
    name       TEXT NOT NULL,
    price      INTEGER NOT NULL,      -- unit price captured at order time
    qty        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    date        TEXT NOT NULL,          -- YYYY-MM-DD
    time        TEXT NOT NULL,          -- HH:MM
    party_size  INTEGER NOT NULL,
    notes       TEXT,
    status      TEXT NOT NULL DEFAULT 'confirmed',
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone   ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_order_items    ON order_items(order_id);
