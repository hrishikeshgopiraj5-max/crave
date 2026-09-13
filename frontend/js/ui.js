/* ============================================================
   CRAVE × 24 ROOTS — shared UI helpers
   Toast, drawer, reveals, format helpers, header status.
   ============================================================ */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ---------- rupee formatting ---------- */
  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  /* ---------- scroll reveal ---------- */
  const revealObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
        { threshold: 0.12 }
      )
    : null;

  function bindReveals(root = document) {
    $$('.reveal', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('in');
    });
  }

  /* ---------- veg dot markup ---------- */
  function vegDot(veg, extraClass = '') {
    return `<span class="veg-dot ${veg ? '' : 'nonveg'} ${extraClass}" title="${veg ? 'Vegetarian' : 'Contains non-veg'}"></span>`;
  }

  function miniVeg(veg) {
    return `<span class="mini-veg ${veg ? '' : 'nonveg'}" title="${veg ? 'Vegetarian' : 'Contains non-veg'}"></span>`;
  }

  /* ---------- cart drawer ---------- */
  function openDrawer() {
    const drawer = $('#cartDrawer');
    const backdrop = $('#drawerBackdrop');
    if (!drawer) return;
    renderDrawer();
    drawer.hidden = false;
    backdrop.hidden = false;
  }

  function closeDrawer() {
    const drawer = $('#cartDrawer');
    const backdrop = $('#drawerBackdrop');
    if (!drawer) return;
    drawer.hidden = true;
    backdrop.hidden = true;
  }

  function renderDrawer() {
    const cart = window.CraveStore.getCart();
    const wrap = $('#drawerItems');
    const foot = $('#drawerFoot');
    if (!wrap) return;

    if (!cart.items.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="big">Your cart is empty</div>
          <p>Slow down, pick something from the menu.</p>
          <a href="#/menu" data-link class="btn btn-dark" style="margin-top:1rem">Browse menu</a>
        </div>`;
      foot.innerHTML = '';
      return;
    }

    wrap.innerHTML = cart.items
      .map(
        (i) => `
      <div class="cart-line">
        <img src="${i.image || ''}" alt="" onerror="this.style.display='none'" />
        <div class="cart-line-info">
          <div class="cart-line-name">${miniVeg(i.veg)} ${i.name}</div>
          <div class="cart-line-price">${fmtINR(i.price)} × ${i.qty} = <strong>${fmtINR(i.price * i.qty)}</strong></div>
        </div>
        <div class="qty-controls">
          <button data-drawer-dec="${i.slug}" aria-label="Decrease">−</button>
          <span>${i.qty}</span>
          <button data-drawer-inc="${i.slug}" aria-label="Increase">+</button>
        </div>
      </div>`
      )
      .join('');

    const subtotal = cart.items.reduce((n, i) => n + i.price * i.qty, 0);
    foot.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${fmtINR(subtotal)}</span></div>
      <div class="summary-row" style="font-size:0.8rem"><span>GST (5%) added at checkout</span></div>
      <a href="#/checkout" data-link class="btn btn-primary" style="width:100%">Checkout · ${fmtINR(subtotal)}</a>`;

    // drawer quantity buttons
    wrap.querySelectorAll('[data-drawer-inc]').forEach((b) =>
      b.addEventListener('click', () => {
        const item = window.CraveStore.getCart().items.find((i) => i.slug === b.dataset.drawerInc);
        if (item) window.CraveStore.setQty(item.slug, item.qty + 1);
      })
    );
    wrap.querySelectorAll('[data-drawer-dec]').forEach((b) =>
      b.addEventListener('click', () => {
        const item = window.CraveStore.getCart().items.find((i) => i.slug === b.dataset.drawerDec);
        if (item) window.CraveStore.setQty(item.slug, item.qty - 1);
      })
    );
  }

  /* ---------- header cart badge ---------- */
  function refreshCartBadge() {
    const badge = $('#cartCount');
    if (!badge) return;
    const n = window.CraveStore.count();
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  /* ---------- footer open/closed status ---------- */
  async function bindStatus() {
    const el = $('#footerStatus');
    if (!el) return;
    try {
      const { cafe } = await window.CraveAPI.getCafe();
      const s = cafe.status;
      el.textContent = s.open_now
        ? `Open now · till ${s.closes_at} IST`
        : `Closed · opens ${s.opens_at} IST`;
      el.classList.add(s.open_now ? 'open' : 'closed');
    } catch { el.textContent = ''; }
  }

  window.CraveUI = {
    $, $$, toast, fmtINR, bindReveals, vegDot, miniVeg,
    openDrawer, closeDrawer, renderDrawer, refreshCartBadge, bindStatus,
  };
})();
