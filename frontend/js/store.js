/* ============================================================
   CRAVE × 24 ROOTS — cart store (localStorage-backed)
   ============================================================ */

(function () {
  const KEY = 'crave_cart_v1';
  const listeners = [];

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object' && Array.isArray(raw.items)) return raw;
    } catch { /* corrupted storage */ }
    return { items: [] };
  }

  function save(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* storage full */ }
    listeners.forEach((fn) => fn(cart));
  }

  const Store = {
    getCart: load,

    onChange(fn) { listeners.push(fn); },

    addItem(item, qty = 1) {
      const cart = load();
      const existing = cart.items.find((i) => i.slug === item.slug);
      if (existing) existing.qty = Math.min(20, existing.qty + qty);
      else cart.items.push({ slug: item.slug, name: item.name, price: item.price, image: item.image, veg: item.veg, qty });
      save(cart);
    },

    setQty(slug, qty) {
      const cart = load();
      const item = cart.items.find((i) => i.slug === slug);
      if (!item) return;
      item.qty = Math.max(0, Math.min(20, qty));
      if (item.qty === 0) cart.items = cart.items.filter((i) => i.slug !== slug);
      save(cart);
    },

    removeItem(slug) {
      const cart = load();
      cart.items = cart.items.filter((i) => i.slug !== slug);
      save(cart);
    },

    clear() { save({ items: [] }); },

    count() { return load().items.reduce((n, i) => n + i.qty, 0); },

    subtotal() { return load().items.reduce((n, i) => n + i.qty * i.price, 0); },
  };

  window.CraveStore = Store;
})();
