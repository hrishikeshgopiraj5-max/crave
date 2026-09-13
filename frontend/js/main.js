/* ============================================================
   CRAVE × 24 ROOTS — router & boot
   Hash-based routes: #/ #/menu #/gallery #/visit #/checkout
                      #/order/:no  +  #/track (lookup form)
   ============================================================ */

(function () {
  const app = document.getElementById('app');

  const routes = {
    '/':        (root) => window.CravePages.home(root),
    '/menu':    (root) => window.CravePages.menuPage(root),
    '/gallery': (root) => window.CravePages.gallery(root),
    '/visit':   (root) => window.CravePages.visit(root),
    '/checkout':(root) => window.CravePages.checkout(root),
    '/track':   (root) => window.CravePages.trackLookup(root),
  };

  async function render() {
    const hash = location.hash.replace(/^#/, '') || '/';
    window.CraveUI.closeDrawer();

    // order route: /order/CRV-123456
    const orderMatch = hash.match(/^\/order\/([\w-]+)$/);
    if (orderMatch) {
      setActiveNav('');
      await window.CravePages.track(app, orderMatch[1]);
      return;
    }

    const route = routes[hash.split('?')[0]];
    setActiveNav(hash);

    if (!route) {
      app.innerHTML = `
        <section class="page-hero"><div class="container"><h1>Lost underground?</h1><p>That page doesn't exist — but coffee does.</p></div></section>
        <section class="section"><div class="container" style="text-align:center">
          <a href="#/" data-link class="btn btn-primary">Back to home</a>
        </div></section>`;
      return;
    }

    app.innerHTML = '<div style="min-height:60vh"></div>';
    try {
      await route(app);
      window.scrollTo({ top: 0 });
    } catch (err) {
      app.innerHTML = `
        <section class="section"><div class="container empty-state">
          <div class="big">Something went wrong</div>
          <p>${err.message}</p>
          <a href="#/" data-link class="btn btn-dark" style="margin-top:1rem">Back to home</a>
        </div></section>`;
    }
  }

  function setActiveNav(hash) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const target = a.getAttribute('href').replace(/^#/, '') || '/';
      a.classList.toggle('active', target === hash || (target === '/' && hash === '/'));
    });
  }

  /* ---------- global listeners ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (location.hash === href) render();
      else location.hash = href;
    }
  });

  // mobile nav
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  navToggle.addEventListener('click', () => { mobileNav.hidden = !mobileNav.hidden; });
  mobileNav.addEventListener('click', (e) => { if (e.target.closest('a')) mobileNav.hidden = true; });

  // cart drawer
  document.getElementById('cartBtn').addEventListener('click', (e) => {
    e.preventDefault();
    window.CraveUI.openDrawer();
  });
  document.getElementById('drawerClose').addEventListener('click', () => window.CraveUI.closeDrawer());
  document.getElementById('drawerBackdrop').addEventListener('click', () => window.CraveUI.closeDrawer());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.CraveUI.closeDrawer(); });

  // header scroll shadow
  window.addEventListener('scroll', () => {
    document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 8);
  });

  // boot
  window.CraveStore.onChange(() => window.CraveUI.refreshCartBadge());
  window.CraveUI.refreshCartBadge();
  window.CraveUI.bindStatus();
  window.addEventListener('hashchange', render);
  render();
})();
