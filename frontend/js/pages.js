/* ============================================================
   CRAVE × 24 ROOTS — page renderers (hash-routed)
   Each function returns HTML; main.js binds events after mount.
   ============================================================ */

(function () {
  const UI = window.CraveUI;
  const { fmtINR, vegDot, miniVeg } = UI;

  /* ---------- shared fragments ---------- */
  function skeletonGrid(n = 6) {
    return `<div class="dish-grid">${'<div class="skeleton" style="height:280px"></div>'.repeat(n)}</div>`;
  }

  function dishCard(item) {
    return `
      <article class="dish-card reveal">
        <div class="dish-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.opacity='0.2'" />
          ${item.popular ? '<span class="badge-popular">Popular</span>' : ''}
          ${vegDot(item.veg)}
        </div>
        <div class="dish-body">
          <h3 class="dish-name">${item.name}</h3>
          <p class="dish-desc">${item.description || ''}</p>
          <div class="dish-foot">
            <span class="dish-price">${fmtINR(item.price)}</span>
            <button class="add-btn" data-add="${item.slug}" data-name="${item.name}" data-price="${item.price}" data-img="${encodeURIComponent(item.image || '')}" data-veg="${item.veg ? 1 : 0}">+ Add</button>
          </div>
        </div>
      </article>`;
  }

  function stars(r) {
    const full = Math.round(r || 0);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  /* ================= HOME ================= */
  async function home(root) {
    root.innerHTML = `
      <section class="hero">
        <div class="hero-bg"><img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&h=1000&fit=crop&auto=format" alt="" /></div>
        <div class="hero-content">
          <span class="hero-kicker"><span class="dot" id="heroDot"></span><span id="heroStatus">Checking hours…</span></span>
          <h1 class="hero-title">Slow coffee,<br /><em>rooted deep.</em></h1>
          <p class="hero-sub">24 Roots is Hyderabad's underground slow bar in Kokapet — small-batch espresso, 18-hour cold brews, ceremonial matcha and an all-day kitchen, beneath the city's noise.</p>
          <div class="hero-cta">
            <a href="#/menu" data-link class="btn btn-primary">Explore the menu</a>
            <a href="#/reserve" data-link class="btn btn-ghost">Reserve a table</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container split">
          <div class="split-media reveal">
            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=1100&fit=crop&auto=format" alt="Inside 24 Roots" loading="lazy" />
            <div class="float-card">
              <span class="num">4.8★</span>
              <span class="lbl">Guest rating<br />underground &amp; growing</span>
            </div>
          </div>
          <div class="reveal">
            <div class="eyebrow-dark">The story</div>
            <h2>An underground slow bar, built around calm</h2>
            <p>Tucked beneath street level near Ocean Park, 24 Roots trades the rush for ritual. Warm wood, hanging greens, vinyl on the speakers — and the low hum of the grinder.</p>
            <p>The name honours the 24 hours a coffee cherry rests after picking. Everything here follows that pace: slow-fermented, slow-poured, slow-served.</p>
            <ul class="feature-list">
              <li><span class="tick">✓</span> 18-hour cold brew on tap, brewed in-house</li>
              <li><span class="tick">✓</span> Ceremonial-grade matcha, whisked to order</li>
              <li><span class="tick">✓</span> All-day kitchen — from truffle toast to baos</li>
              <li><span class="tick">✓</span> Free WiFi, laptops welcome till evening</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="section menu-preview">
        <div class="container">
          <div class="section-head">
            <div class="eyebrow">From the slow bar</div>
            <h2>Guest favourites</h2>
            <p>The pours and plates our regulars come back for.</p>
          </div>
          <div id="homePopular">${skeletonGrid(3)}</div>
          <div style="text-align:center; margin-top:2.4rem">
            <a href="#/menu" data-link class="btn btn-dark">See the full menu →</a>
          </div>
        </div>
      </section>

      <section class="section offers-strip">
        <div class="container">
          <div class="section-head">
            <div class="eyebrow" style="color:var(--latte)">Offers</div>
            <h2>Slow deals for fast friends</h2>
          </div>
          <div class="offer-cards" id="homeOffers">
            <div class="skeleton" style="height:150px"></div>
            <div class="skeleton" style="height:150px"></div>
            <div class="skeleton" style="height:150px"></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container visit-grid">
          <div class="visit-card reveal">
            <h3>🕐 Hours</h3>
            <p>Every day<br /><strong>12:00 PM – 11:00 PM</strong><br />Kitchen closes 10:30 PM</p>
          </div>
          <div class="visit-card reveal">
            <h3>📍 Find us</h3>
            <p>Sy.No 166/3, Ground Floor<br />near Ocean Park, Kokapet<br />Hyderabad 500075</p>
            <a href="https://www.google.com/maps/search/?api=1&query=24+Roots+Cafe+Kokapet+Hyderabad" target="_blank" rel="noopener" style="color:var(--caramel-700); font-weight:600">Open in Google Maps ↗</a>
          </div>
          <div class="visit-card reveal">
            <h3>💛 Good to know</h3>
            <p>₹1,200 for two · Pure-veg options galore<br />Free WiFi · Card & UPI accepted<br />@the24roots on Instagram</p>
          </div>
        </div>
      </section>

      <section class="section menu-preview">
        <div class="container">
          <div class="section-head">
            <div class="eyebrow">Guest book</div>
            <h2>What people whisper upstairs</h2>
          </div>
          <div class="review-grid" id="homeReviews">
            <div class="skeleton" style="height:170px"></div>
            <div class="skeleton" style="height:170px"></div>
            <div class="skeleton" style="height:170px"></div>
          </div>
        </div>
      </section>`;

    // live data
    const { cafe } = await window.CraveAPI.getCafe();
    const s = cafe.status;
    const dot = document.getElementById('heroDot');
    const st = document.getElementById('heroStatus');
    if (dot && st) {
      dot.classList.toggle('closed', !s.open_now);
      st.textContent = s.open_now ? `Open now — pouring till ${s.closes_at.replace(':', '')} hrs` : `Closed now — opens ${s.opens_at} hrs`;
    }

    const menu = await window.CraveAPI.getMenu();
    const popular = menu.categories.flatMap((c) => c.items).filter((i) => i.popular).slice(0, 3);
    document.getElementById('homePopular').innerHTML = popular.map(dishCard).join('');

    const { offers } = await window.CraveAPI.getOffers();
    document.getElementById('homeOffers').innerHTML = offers
      .map(
        (o) => `
        <div class="offer-card reveal">
          <span class="code">${o.code}</span>
          <h3>${o.title}</h3>
          <p>${o.description}</p>
        </div>`
      )
      .join('');

    const rev = await window.CraveAPI.getReviews();
    document.getElementById('homeReviews').innerHTML = rev.reviews
      .slice(0, 3)
      .map(
        (r) => `
        <div class="review-card reveal">
          <div class="review-stars">${stars(r.rating)}</div>
          <p class="review-text">"${r.comment}"</p>
          <div class="review-name">— ${r.name}</div>
        </div>`
      )
      .join('');

    UI.bindReveals(root);
    bindAddButtons(root);
  }

  /* ================= MENU ================= */
  async function menuPage(root) {
    root.innerHTML = `
      <section class="page-hero">
        <div class="container">
          <h1>The Menu</h1>
          <p>Slow bar, espresso bar and an all-day kitchen — everything made to order.</p>
        </div>
      </section>
      <section class="section">
        <div class="container menu-layout">
          <nav class="menu-nav" id="menuNav" aria-label="Menu sections"></nav>
          <div id="menuBody">
            <div class="skeleton" style="height:420px"></div>
          </div>
        </div>
      </section>`;

    const data = await window.CraveAPI.getMenu();
    const nav = document.getElementById('menuNav');
    const body = document.getElementById('menuBody');

    nav.innerHTML = data.categories
      .map((c) => `<a href="#cat-${c.slug}">${c.name}</a>`)
      .join('');

    body.innerHTML = data.categories
      .map(
        (c) => `
        <section class="menu-category" id="cat-${c.slug}">
          <h2>${c.name}</h2>
          <p class="cat-blurb">${c.blurb}</p>
          <div class="menu-items">
            ${c.items
              .map(
                (i) => `
              <div class="menu-item-row reveal">
                <img class="menu-item-img" src="${i.image}" alt="${i.name}" loading="lazy" onerror="this.style.display='none'" />
                <div class="menu-item-info">
                  <div class="menu-item-name">${miniVeg(i.veg)} ${i.name} ${i.popular ? '<span class="badge-popular" style="position:static">Popular</span>' : ''}</div>
                  <p class="menu-item-desc">${i.description || ''}</p>
                  <div class="menu-item-foot">
                    <span class="menu-item-price">${fmtINR(i.price)}</span>
                    <button class="add-btn" data-add="${i.slug}" data-name="${i.name}" data-price="${i.price}" data-img="${encodeURIComponent(i.image || '')}" data-veg="${i.veg ? 1 : 0}">+ Add</button>
                  </div>
                </div>
              </div>`
              )
              .join('')}
          </div>
        </section>`
      )
      .join('');

    // section highlighting
    const links = [...nav.querySelectorAll('a')];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    data.categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.slug}`);
      if (el) observer.observe(el);
    });

    UI.bindReveals(body);
    bindAddButtons(body);
  }

  /* ================= GALLERY ================= */
  async function gallery(root) {
    const SHOTS = [
      { pid: '1554118811-1e0d58224f24', cap: 'The underground dining room' },
      { pid: '1447933601403-0c6688de566e', cap: 'Slow bar, first light' },
      { pid: '1511920170033-f8396924c348', cap: 'Filter kaapi, dabara style' },
      { pid: '1515823064-d0ed9954143f', cap: 'Matcha cloud in the making' },
      { pid: '1603505090741-9ddcf5d0c318', cap: 'Truffle mushroom toast' },
      { pid: '1533134242493-ad2d21b3f04a', cap: 'Burnt basque cheesecake' },
      { pid: '1496116218417-1a781b1c416c', cap: 'Steamy chicken baos' },
      { pid: '1571877227200-a0d98ea607e9', cap: 'Espresso tiramisu jar' },
      { pid: '1573080496219-bb080dd4f877', cap: 'Peri-peri shoestring fries' },
    ];
    root.innerHTML = `
      <section class="page-hero">
        <div class="container"><h1>Gallery</h1><p>A look underground — the space, the pours, the plates.</p></div>
      </section>
      <section class="section">
        <div class="container">
          <div class="gallery-grid">
            ${SHOTS.map(
              (s) => `
              <figure class="gallery-item reveal">
                <img src="https://images.unsplash.com/photo-${s.pid}?w=800&fit=crop&auto=format" alt="${s.cap}" loading="lazy" />
                <figcaption style="position:absolute;left:0;right:0;bottom:0;padding:0.7rem 0.9rem;background:linear-gradient(transparent,rgba(29,19,12,0.85));color:#f7f1e6;font-size:0.8rem">${s.cap}</figcaption>
              </figure>`
            ).join('')}
          </div>
          <p style="text-align:center; margin-top:2rem; color:rgba(42,27,18,0.5); font-size:0.85rem">
            Follow <a href="https://www.instagram.com/the24roots/" target="_blank" rel="noopener" style="color:var(--caramel-700); font-weight:600">@the24roots</a> for daily pours.
          </p>
        </div>
      </section>`;
    UI.bindReveals(root);
  }

  /* ================= VISIT ================= */
  async function visit(root) {
    const { cafe } = await window.CraveAPI.getCafe();
    const rev = await window.CraveAPI.getReviews();
    root.innerHTML = `
      <section class="page-hero">
        <div class="container"><h1>Visit us</h1><p>Underground, unhurried, and easy to find — right near Ocean Park, Kokapet.</p></div>
      </section>
      <section class="section">
        <div class="container">
          <div class="visit-grid">
            <div class="visit-card reveal">
              <h3>📍 Address</h3>
              <p>${cafe.address}</p>
              <a href="${cafe.maps_url}" target="_blank" rel="noopener" style="color:var(--caramel-700); font-weight:600">Directions ↗</a>
            </div>
            <div class="visit-card reveal">
              <h3>🕐 Hours</h3>
              <p>Monday – Sunday<br /><strong>12:00 PM – 11:00 PM</strong></p>
              <p style="margin-top:0.4rem">${cafe.status.open_now ? '✅ Open right now' : '🌙 Closed right now'}</p>
            </div>
            <div class="visit-card reveal">
              <h3>⭐ ${rev.average || '—'} · ${rev.count} reviews</h3>
              <p>Rated by guests who found us underground.</p>
            </div>
          </div>

          <div class="section-head" style="margin-top:4rem">
            <div class="eyebrow">Say hello</div>
            <h2>Reserve a table</h2>
            <p>Walk-ins always welcome — but a table waiting feels better.</p>
          </div>
          <div id="reserveSlot"></div>
          ${reserveForm()}
        </div>
      </section>`;
    UI.bindReveals(root);
    bindReserveForm(root);
  }

  function reserveForm() {
    const today = new Date().toISOString().slice(0, 10);
    return `
      <form class="form-card" id="reserveForm" data-no-route>
        <div class="form-grid">
          <div class="form-row">
            <div class="field"><label for="rName">Your name</label><input id="rName" required minlength="2" placeholder="Aarav" /></div>
            <div class="field"><label for="rPhone">Phone</label><input id="rPhone" required type="tel" placeholder="98765 43210" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="rDate">Date</label><input id="rDate" type="date" required min="${today}" value="${today}" /></div>
            <div class="field"><label for="rTime">Time</label>
              <select id="rTime" required>
                ${['12:30', '13:00', '13:30', '14:00', '16:00', '16:30', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
                  .map((t) => `<option value="${t}">${t}</option>`)
                  .join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field"><label for="rParty">Guests</label>
              <select id="rParty">${[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => `<option value="${n}" ${n === 2 ? 'selected' : ''}>${n}</option>`).join('')}</select>
            </div>
            <div class="field"><label for="rNotes">Notes (optional)</label><input id="rNotes" placeholder="Birthday, window seat…" /></div>
          </div>
          <div id="reserveMsg"></div>
          <button class="btn btn-primary" type="submit">Confirm reservation</button>
        </div>
      </form>`;
  }

  function bindReserveForm(root) {
    const form = root.querySelector('#reserveForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector('#reserveMsg');
      msg.innerHTML = '';
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Reserving…';
      try {
        const { reservation } = await window.CraveAPI.reserve({
          name: form.querySelector('#rName').value.trim(),
          phone: form.querySelector('#rPhone').value.trim(),
          date: form.querySelector('#rDate').value,
          time: form.querySelector('#rTime').value,
          party_size: form.querySelector('#rParty').value,
          notes: form.querySelector('#rNotes').value.trim(),
        });
        msg.innerHTML = `<div class="form-success">Table confirmed! Your code is <strong>${reservation.code}</strong> — see you on ${reservation.date} at ${reservation.time}.</div>`;
        form.reset();
      } catch (err) {
        msg.innerHTML = `<div class="form-error">${err.message}</div>`;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Confirm reservation';
      }
    });
  }

  /* ================= CHECKOUT ================= */
  function checkout(root) {
    const cart = window.CraveStore.getCart();
    root.innerHTML = `
      <section class="page-hero"><div class="container"><h1>Checkout</h1><p>Dine-in or takeaway — your order goes straight to the bar.</p></div></section>
      <section class="section">
        <div class="container checkout-layout">
          <div>
            <div id="cartLines">${cartLinesHTML(cart)}</div>
            <form class="form-card" id="checkoutForm" style="margin-top:1.6rem">
              <div class="form-grid">
                <div class="form-row">
                  <div class="field"><label for="cName">Name</label><input id="cName" required minlength="2" placeholder="Your name" /></div>
                  <div class="field"><label for="cPhone">Phone</label><input id="cPhone" required type="tel" placeholder="98765 43210" /></div>
                </div>
                <div class="field"><label>Order type</label>
                  <div style="display:flex; gap:1.4rem; padding:0.3rem 0.2rem">
                    <label style="display:flex; gap:0.4rem; align-items:center; font-weight:500"><input type="radio" name="otype" value="dine-in" checked /> Dine-in</label>
                    <label style="display:flex; gap:0.4rem; align-items:center; font-weight:500"><input type="radio" name="otype" value="takeaway" /> Takeaway</label>
                  </div>
                </div>
                <div class="field"><label for="cNotes">Notes for the bar (optional)</label><input id="cNotes" placeholder="Less sweet, extra strong…" /></div>
              </div>
            </form>
          </div>
          <aside class="summary-card" id="summaryCard">${summaryHTML(window.CraveStore.subtotal(), 0)}</aside>
        </div>
      </section>`;

    bindPromo(root);
    bindCheckoutSubmit(root);
    bindCartLineControls(root);
  }

  function cartLinesHTML(cart) {
    if (!cart.items.length) {
      return `<div class="empty-state"><div class="big">Nothing here yet</div><p>Add something delicious from the menu.</p><a href="#/menu" data-link class="btn btn-dark" style="margin-top:1rem">Browse menu</a></div>`;
    }
    return `<div class="cart-lines">${cart.items
      .map(
        (i) => `
        <div class="cart-line">
          <img src="${i.image || ''}" alt="" onerror="this.style.display='none'" />
          <div class="cart-line-info">
            <div class="cart-line-name">${miniVeg(i.veg)} ${i.name}</div>
            <div class="cart-line-price">${fmtINR(i.price)} each</div>
          </div>
          <div class="qty-controls">
            <button data-line-dec="${i.slug}" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button data-line-inc="${i.slug}" aria-label="Increase">+</button>
          </div>
          <div style="width:76px; text-align:right; font-weight:700">${fmtINR(i.price * i.qty)}</div>
          <button class="cart-line-remove" data-line-remove="${i.slug}">✕</button>
        </div>`
      )
      .join('')}</div>`;
  }

  function summaryHTML(subtotal, discount, discountMsg) {
    const gst = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + gst;
    return `
      <h3 style="font-family:var(--font-display); margin-bottom:0.8rem">Order summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>${fmtINR(subtotal)}</span></div>
      <div class="summary-row"><span>Discount ${discountMsg ? `(${discountMsg})` : ''}</span><span>${discount ? '−' + fmtINR(discount) : fmtINR(0)}</span></div>
      <div class="summary-row"><span>GST (5%)</span><span>${fmtINR(gst)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${fmtINR(total)}</span></div>
      <div class="promo-row">
        <input id="promoInput" placeholder="Promo code" aria-label="Promo code" />
        <button class="btn btn-outline" id="promoApply" type="button">Apply</button>
      </div>
      <div class="promo-msg" id="promoMsg"></div>
      <button class="btn btn-primary" id="placeOrderBtn" style="width:100%; margin-top:0.4rem">Place order · ${fmtINR(total)}</button>
      <p style="font-size:0.78rem; color:rgba(42,27,18,0.5); text-align:center; margin-top:0.7rem">Pay at the counter or by UPI link on confirmation.</p>`;
  }

  function bindPromo(root) {
    const apply = root.querySelector('#promoApply');
    const input = root.querySelector('#promoInput');
    const msg = root.querySelector('#promoMsg');
    if (!apply) return;
    apply.addEventListener('click', async () => {
      const code = (input.value || '').trim().toUpperCase();
      if (!code) return;
      const subtotal = window.CraveStore.subtotal();
      msg.className = 'promo-msg';
      msg.textContent = 'Checking…';
      try {
        const { offers } = await window.CraveAPI.getOffers();
        const offer = offers.find((o) => o.code === code);
        if (!offer) {
          msg.classList.add('err');
          msg.textContent = `“${code}” isn't a valid code.`;
          return;
        }
        if (subtotal < offer.min_order) {
          msg.classList.add('err');
          msg.textContent = `${code} needs a minimum order of ${fmtINR(offer.min_order)}.`;
          return;
        }
        // CAFECLUB is flat ₹100 (percent 0)
        const discount = offer.percent_off > 0 ? Math.round(subtotal * offer.percent_off / 100) : 100;
        root.querySelector('#summaryCard').innerHTML = summaryHTML(subtotal, discount, code);
        root.querySelector('#summaryCard').dataset.discount = discount;
        root.querySelector('#summaryCard').dataset.promo = code;
        bindPromo(root);
        bindCheckoutSubmit(root);
        const newMsg = root.querySelector('#promoMsg');
        newMsg.className = 'promo-msg ok';
        newMsg.textContent = `${code} applied — you save ${fmtINR(discount)}!`;
      } catch (err) {
        msg.classList.add('err');
        msg.textContent = err.message;
      }
    });
  }

  function bindCartLineControls(root) {
    root.querySelectorAll('[data-line-inc]').forEach((b) =>
      b.addEventListener('click', () => {
        const item = window.CraveStore.getCart().items.find((i) => i.slug === b.dataset.lineInc);
        if (item) { window.CraveStore.setQty(item.slug, item.qty + 1); refreshCheckout(root); }
      })
    );
    root.querySelectorAll('[data-line-dec]').forEach((b) =>
      b.addEventListener('click', () => {
        const item = window.CraveStore.getCart().items.find((i) => i.slug === b.dataset.lineDec);
        if (item) { window.CraveStore.setQty(item.slug, item.qty - 1); refreshCheckout(root); }
      })
    );
    root.querySelectorAll('[data-line-remove]').forEach((b) =>
      b.addEventListener('click', () => {
        window.CraveStore.removeItem(b.dataset.lineRemove);
        refreshCheckout(root);
      })
    );
  }

  function refreshCheckout(root) {
    const lines = root.querySelector('#cartLines');
    const summary = root.querySelector('#summaryCard');
    const savedPromo = summary ? summary.dataset.promo : null;
    const savedDiscount = summary ? Number(summary.dataset.discount || 0) : 0;
    lines.innerHTML = cartLinesHTML(window.CraveStore.getCart());
    summary.innerHTML = summaryHTML(window.CraveStore.subtotal(), savedDiscount, savedPromo);
    summary.dataset.discount = savedDiscount;
    summary.dataset.promo = savedPromo || '';
    bindCartLineControls(root);
    bindPromo(root);
    bindCheckoutSubmit(root);
    UI.refreshCartBadge();
  }

  function bindCheckoutSubmit(root) {
    const btn = root.querySelector('#placeOrderBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const name = root.querySelector('#cName').value.trim();
      const phone = root.querySelector('#cPhone').value.trim();
      const notes = root.querySelector('#cNotes').value.trim();
      const otype = root.querySelector('input[name=otype]:checked').value;
      const summary = root.querySelector('#summaryCard');
      const promo = summary.dataset.promo || null;
      const cart = window.CraveStore.getCart();

      if (!cart.items.length) { UI.toast('Your cart is empty'); return; }
      if (!name || !phone) { UI.toast('Please add your name and phone'); return; }

      btn.disabled = true;
      btn.textContent = 'Sending to the bar…';
      try {
        const { order } = await window.CraveAPI.placeOrder({
          customer_name: name,
          phone,
          order_type: otype,
          notes: notes || null,
          promo_code: promo,
          items: cart.items.map((i) => ({ slug: i.slug, qty: i.qty })),
        });
        window.CraveStore.clear();
        UI.refreshCartBadge();
        location.hash = `#/order/${order.order_no}`;
      } catch (err) {
        UI.toast(err.message);
        btn.disabled = false;
        btn.textContent = 'Try again';
      }
    });
  }

  /* ================= ORDER TRACKING ================= */
  async function track(root, orderNo) {
    root.innerHTML = `
      <section class="page-hero"><div class="container"><h1>Order ${orderNo}</h1><p>Straight from the bar to you.</p></div></section>
      <section class="section"><div class="container" id="trackBody" style="max-width:720px">
        <div class="skeleton" style="height:260px"></div>
      </div></section>`;

    async function load() {
      let order;
      try {
        ({ order } = await window.CraveAPI.getOrder(orderNo));
      } catch (err) {
        document.getElementById('trackBody').innerHTML = `<div class="empty-state"><div class="big">Order not found</div><p>${err.message}</p></div>`;
        return false;
      }
      const STAGE_ICONS = { placed: '📝', preparing: '☕', ready: '🔔', completed: '✅' };
      const STAGE_LABELS = { placed: 'Placed', preparing: 'Preparing', ready: 'Ready', completed: 'Completed' };
      document.getElementById('trackBody').innerHTML = `
        <div class="form-card">
          <div class="track-stages">
            ${order.stages
              .map((s, idx) => {
                const state = idx < order.stage_index ? 'done' : idx === order.stage_index ? 'current' : '';
                return `<div class="track-stage ${state}"><div class="track-dot">${STAGE_ICONS[s]}</div><div class="track-label">${STAGE_LABELS[s]}</div></div>`;
              })
              .join('')}
          </div>
          <div style="margin:1.6rem 0; padding:1rem; background:var(--cream); border-radius:12px; font-size:0.92rem">
            ${order.items.map((i) => `<div style="display:flex; justify-content:space-between; padding:0.15rem 0"><span>${i.qty} × ${i.name}</span><span>${fmtINR(i.price * i.qty)}</span></div>`).join('')}
          </div>
          <div class="summary-row"><span>Discount</span><span>${order.discount ? '−' + fmtINR(order.discount) : '—'}</span></div>
          <div class="summary-row"><span>GST</span><span>${fmtINR(order.gst)}</span></div>
          <div class="summary-row total"><span>Paid / payable</span><span>${fmtINR(order.total)}</span></div>
          <p style="text-align:center; margin-top:1.2rem; font-size:0.85rem; color:rgba(42,27,18,0.55)">
            ${order.order_type === 'dine-in' ? '🍽 Dine-in · we will bring it to your table' : '🥡 Takeaway · collect at the bar'}
            ${order.status === 'ready' ? ' — your order is ready!' : order.status === 'completed' ? ' — enjoy!' : ''}
          </p>
          <div style="text-align:center; margin-top:1.4rem">
            <a href="#/menu" data-link class="btn btn-dark">Order something else</a>
          </div>
        </div>`;
      return order.status !== 'completed';
    }

    let active = await load();
    while (active) {
      await new Promise((r) => setTimeout(r, 5000));
      if (location.hash !== `#/order/${orderNo}`) return;
      active = await load();
    }
  }

  /* ================= TRACK (lookup) ================= */
  function trackLookup(root) {
    root.innerHTML = `
      <section class="page-hero"><div class="container"><h1>Track your order</h1><p>Enter the order number from your confirmation (looks like CRV-123456).</p></div></section>
      <section class="section"><div class="container">
        <form class="form-card" id="trackForm">
          <div class="form-grid">
            <div class="field"><label for="tNo">Order number</label><input id="tNo" required placeholder="CRV-123456" style="text-transform:uppercase" /></div>
            <button class="btn btn-primary" type="submit">Find my order</button>
          </div>
        </form>
      </div></section>`;
    root.querySelector('#trackForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const no = root.querySelector('#tNo').value.trim().toUpperCase();
      if (no) location.hash = `#/order/${encodeURIComponent(no)}`;
    });
  }

  /* ---------- shared add-to-cart binder ---------- */
  function bindAddButtons(root) {
    root.querySelectorAll('[data-add]').forEach((btn) =>
      btn.addEventListener('click', () => {
        window.CraveStore.addItem(
          {
            slug: btn.dataset.add,
            name: btn.dataset.name,
            price: Number(btn.dataset.price),
            image: decodeURIComponent(btn.dataset.img || ''),
            veg: btn.dataset.veg === '1',
          },
          1
        );
        UI.toast(`${btn.dataset.name} added to cart`);
        UI.refreshCartBadge();
      })
    );
  }

  window.CravePages = { home, menuPage, gallery, visit, checkout, track, trackLookup, dishCard, bindAddButtons, bindReserveForm, reserveForm };
})();
