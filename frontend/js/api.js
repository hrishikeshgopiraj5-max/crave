/* ============================================================
   CRAVE × 24 ROOTS — API client
   Same-origin by default (Flask serves both). Override with
   window.__CRAVE_API__ for split deployments.
   ============================================================ */

const API_BASE = window.__CRAVE_API__ || `${location.origin}/api`;

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the café server. Is the backend running?');
  }

  let body = null;
  try { body = await res.json(); } catch { /* non-JSON */ }

  if (!res.ok || (body && body.ok === false)) {
    const msg = (body && body.error) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

window.CraveAPI = {
  health:      () => request('/health'),
  getCafe:     () => request('/cafe'),
  getMenu:     () => request('/menu'),
  getItem:     (slug) => request(`/menu/items/${encodeURIComponent(slug)}`),
  getOffers:   () => request('/offers'),
  getReviews:  () => request('/reviews'),
  addReview:   (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  placeOrder:  (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder:    (orderNo) => request(`/orders/${encodeURIComponent(orderNo)}`),
  getOrders:   (phone) => request(`/orders?phone=${encodeURIComponent(phone)}`),
  reserve:     (payload) => request('/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  getReservation: (code) => request(`/reservations/${encodeURIComponent(code)}`),
};
