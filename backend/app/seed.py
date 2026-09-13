# ============================================================
# CRAVE × 24 ROOTS — idempotent database seed
# Real café data for 24 Roots (Kokapet) + a full slow-bar menu.
# Re-running is safe: inserts only when tables are empty.
# ============================================================

from .db import query_db, execute_db

import os
import time

U = lambda pid, w=900: f"https://images.unsplash.com/photo-{pid}?w={w}&h={int(w*0.66)}&fit=crop&auto=format"

CAFE = {
    "name": "24 Roots",
    "tagline": "Hyderabad's underground slow bar — coffee down to the root.",
    "description": (
        "Tucked beneath street level near Ocean Park, Kokapet, 24 Roots is a "
        "nature-inspired underground café built around one idea: slow down. "
        "Small-batch espresso, cold brews on tap, ceremonial matcha and an "
        "all-day kitchen of global comfort food — served in earthy, plant-filled "
        "cornrows of calm."
    ),
    "story": (
        "Opened in 2026, 24 Roots began as a roastery hobby between friends who "
        "chased the perfect cup across India's specialty coffee belt. The name "
        "honours the 24 hours a coffee cherry takes to rest after picking — and "
        "the roots that hold every story in the soil. Step underground and the "
        "city goes quiet: warm wood, hanging greens, vinyl on the speakers and "
        "the low hum of the grinder."
    ),
    "address": "Sy.No 166/3, Ground Floor, 8-26/1, near Ocean Park, Kokapet, Hyderabad, Telangana 500075",
    "area": "Kokapet",
    "city": "Hyderabad",
    "instagram": "https://www.instagram.com/the24roots/",
    "maps_url": "https://www.google.com/maps/search/?api=1&query=24+Roots+Cafe+Kokapet+Hyderabad",
    "cost_for_two": 1200,
    "price_tier": "₹₹₹",
    "opens_at": "12:00",
    "closes_at": "23:00",
    "hero_image": U("1447933601403-0c6688de566e", 1600),
}

CATEGORIES = [
    ("slow-bar", "Slow Bar", "Signature pours, cold brews & matcha — made slow, served cold.", 1),
    ("espresso", "Espresso Bar", "Small-batch classics pulled on our house blend.", 2),
    ("all-day", "All-Day Kitchen", "Global comfort plates from open to close.", 3),
    ("desserts", "Desserts", "House-made sweet finishes.", 4),
]

# (slug, cat, name, desc, price, veg, popular, image_pid)
ITEMS = [
    # ----- Slow Bar -----
    ("24r-coldbrew-tonic", "slow-bar", "Roots Cold Brew Tonic", "18-hour cold brew, tonic, orange peel, rosemary.", 320, 1, 1, "1517705008123-6cc13ab78ae1"),
    ("24r-matcha-cloud", "slow-bar", "Matcha Cloud", "Ceremonial matcha whipped with oat milk and sea salt foam.", 340, 1, 1, "1515823064-d0ed9954143f"),
    ("24r-berry-kombucha", "slow-bar", "Berry Sparkler Kombucha", "House-fermented kombucha, mixed berries, basil seeds.", 280, 1, 0, "1497534547324-0ebb3f052e29"),
    ("24r-watermelon-cooler", "slow-bar", "Watermelon Basil Cooler", "Cold-pressed watermelon, basil, lime, a hint of black salt.", 260, 1, 0, "1615219759449-68b2cb1a4a03"),
    ("24r-pulled-coffee-soda", "slow-bar", "Espresso Tonic Spritz", "Double shot, artisan tonic, dehydrated citrus wheel.", 300, 1, 0, "1587080413959-06b859fb107d"),
    # ----- Espresso Bar -----
    ("24r-signature-latte", "espresso", "24 Roots Signature Latte", "Double shot, silky steamed milk, house cacao dust.", 260, 1, 1, "1561047029-3000c68339ca"),
    ("24r-cortado", "espresso", "Cortado", "Equal parts espresso and warm milk, served in glass.", 220, 1, 0, "1461023058943-07fcbe16d735"),
    ("24r-flat-white", "espresso", "Flat White", "Ristretto shots under velvet micro-foam.", 240, 1, 0, "1534778101976-62847782c213"),
    ("24r-v60-pour", "espresso", "V60 Pour-Over", "Single-origin, brewed to order. Ask for today's roast.", 290, 1, 1, "1544787219-7f47ccb76574"),
    ("24r-cappuccino", "espresso", "Cappuccino", "Classic ratio, cocoa-dusted, extra smooth.", 230, 1, 0, "1572442388796-11668a67e53d"),
    ("24r-hot-chocolate", "espresso", "Thick Hot Chocolate", "Belgian couverture melted into steamed milk.", 250, 1, 0, "1542990253-a781e04c0082"),
    ("24r-filter-kaapi", "espresso", "South-Indian Filter Kaapi", "Chicory blend, frothed in a dabara-tumbler.", 180, 1, 1, "1511920170033-f8396924c348"),
    # ----- All-Day Kitchen -----
    ("24r-truffle-mushroom-toast", "all-day", "Truffle Mushroom Toast", "Sourdough, wild mushrooms, truffle oil, parmesan snow.", 380, 1, 1, "1603505090741-9ddcf5d0c318"),
    ("24r-chilli-cheese-toast", "all-day", "Chilli Cheese Toast", "Three cheeses, roasted chillies, toasted sourdough.", 320, 1, 0, "1504753793650-d4a2b783c15e"),
    ("24r-peri-peri-fries", "all-day", "Peri-Peri Shoestring Fries", "Double-fried, house peri-peri dust, garlic aioli.", 240, 1, 1, "1573080496219-bb080dd4f877"),
    ("24r-mushroom-galouti", "all-day", "Mushroom Galouti Sliders", "Two mini buns, galouti-spiced mushroom patties, mint aioli.", 420, 1, 0, "1553979459-2229ca95b805"),
    ("24r-chicken-bao", "all-day", "Steamy Chicken Baos", "Fluffy baos, soy-garlic glaze, pickled cucumber.", 380, 0, 1, "1496116218417-1a781b1c416c"),
    ("24r Alfredo-pasta", "all-day", "Truffle Alfredo Pasta", "Slow-reduced cream, parmesan, cracked pepper, herbs.", 460, 1, 0, "1621996346565-e3dbc646d9a9"),
    ("24r-buddha-bowl", "all-day", "Harvest Buddha Bowl", "Quinoa, roasted pumpkin, hummus, tahini drizzle.", 420, 1, 0, "1512621776951-a57141f2eefd"),
    ("24r-nachos", "all-day", "Loaded Nachos", "Cheese sauce, salsa fresca, jalapeños, sour cream.", 360, 1, 0, "1513456852971-30c0b8199d4d"),
    # ----- Desserts -----
    ("24r-basque-cheesecake", "desserts", "Burnt Basque Cheesecake", "Caramelised top, molten centre, sea salt.", 320, 1, 1, "1533134242493-ad2d21b3f04a"),
    ("24r-tiramisu-jar", "desserts", "Espresso Tiramisu Jar", "Layers of savoiardi, mascarpone, our espresso.", 340, 1, 1, "1571877227200-a0d98ea607e9"),
    ("24r-brownie", "desserts", "Fudge Brownie with Kaapi Cream", "Warm brownie, filter-kaapi anglaise.", 280, 1, 0, "1606313564200-e75d5e30476c"),
]

OFFERS = [
    ("ROOTS15", "15% off your first order", "Welcome to the underground. Valid on all orders above ₹499.", 15, 499),
    ("SLOWMORN", "Slow mornings: 10% off", "Take it slow — 10% off any order above ₹299.", 10, 299),
    ("CAFECLUB", "₹100 off for two", "Bring a friend. Flat ₹100 off orders above ₹999.", 0, 999),  # percent 0 => flat handled below
]


def ensure_seed() -> None:
    if query_db("SELECT id FROM cafe_info WHERE id = 1", one=True):
        return

    t = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())

    execute_db(
        """INSERT INTO cafe_info
           (id, name, tagline, description, story, address, area, city, instagram,
            maps_url, cost_for_two, price_tier, opens_at, closes_at, hero_image, updated_at)
           VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            CAFE["name"], CAFE["tagline"], CAFE["description"], CAFE["story"],
            CAFE["address"], CAFE["area"], CAFE["city"], CAFE["instagram"],
            CAFE["maps_url"], CAFE["cost_for_two"], CAFE["price_tier"],
            CAFE["opens_at"], CAFE["closes_at"], CAFE["hero_image"], t,
        ),
    )

    cat_ids = {}
    for slug, name, blurb, order in CATEGORIES:
        cat_ids[slug] = execute_db(
            "INSERT INTO menu_categories (slug, name, blurb, sort_order) VALUES (?,?,?,?)",
            (slug, name, blurb, order),
        )

    for i, (slug, cat, name, desc, price, veg, popular, pid) in enumerate(ITEMS):
        execute_db(
            """INSERT INTO menu_items
               (slug, category_id, name, description, price, veg, popular, available, image_url, sort_order)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (slug, cat_ids[cat], name, desc, price, veg, popular, 1, U(pid), i),
        )

    for code, title, desc, percent, min_order in OFFERS:
        execute_db(
            "INSERT INTO offers (code, title, description, percent_off, min_order, active) VALUES (?,?,?,?,?,1)",
            (code, title, desc, percent, min_order),
        )

    SEED_REVIEWS = [
        ("Ananya R.", 5, "The underground vibe is unreal. Cold brew tonic is the best I've had in Hyderabad."),
        ("Farhan M.", 5, "Finally a slow bar in Kokapet. The V60 and basque cheesecake combo is elite."),
        ("Priya S.", 4, "Beautiful, plant-filled space. Service is relaxed — fitting, since everything is slow-crafted."),
        ("Aditya K.", 5, "Matcha cloud lives up to the hype. Great playlist, great coffee, zero complaints."),
    ]
    for name, rating, comment in SEED_REVIEWS:
        execute_db(
            "INSERT INTO reviews (name, rating, comment, created_at) VALUES (?,?,?,?)",
            (name, rating, comment, t),
        )

    print("[seed] 24 Roots data loaded")


def flat_discount_for(code: str):
    """Returns (percent, flat) for a promo code, or None."""
    flat_map = {"CAFECLUB": 100}
    rows = query_db("SELECT percent_off, min_order FROM offers WHERE code = ? AND active = 1", (code,), one=True)
    if not rows:
        return None
    return (rows["percent_off"], flat_map.get(code, 0), rows["min_order"])
