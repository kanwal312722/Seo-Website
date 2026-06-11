/* ============================================================
   MARU FRUITS — script.js
   ============================================================ */

'use strict';

/* ── Cart State ── */
let cart = JSON.parse(localStorage.getItem('maruCart')) || [];

/* ============================================================
   HELPERS
   ============================================================ */
function saveCart() {
  localStorage.setItem('maruCart', JSON.stringify(cart));
}

function totalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function totalPrice() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatPrice(n) {
  return 'Rs. ' + n.toLocaleString();
}

/* ── Toast notifications ── */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ============================================================
   NAVBAR — hamburger + active link
   ============================================================ */
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMobile.classList.toggle('open');
    });
  }

  // Highlight active page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   CART — render
   ============================================================ */
function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const totalEl  = document.getElementById('cartTotal');
  const countEls = document.querySelectorAll('.cart-count');

  // Update counter badges
  countEls.forEach(el => {
    const n = totalItems();
    el.textContent = n;
    el.style.display = n === 0 ? 'none' : 'flex';
  });

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="empty-icon">🛒</span>
        <p>Your cart is empty.</p>
        <a href="products.html" class="btn btn-green btn-sm" onclick="closeCart()">Browse Fruits</a>
      </div>`;
    if (totalEl) totalEl.textContent = 'Rs. 0';
    updateOrderSummary();
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}">`
          : `<span>${item.emoji || '🍎'}</span>`}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)} / kg</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = formatPrice(totalPrice());
  updateOrderSummary();
}

function updateOrderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  if (!summaryItems) return;

  if (cart.length === 0) {
    summaryItems.innerHTML = '<div class="summary-empty">No items in cart yet.</div>';
    if (summaryTotal) summaryTotal.textContent = 'Rs. 0';
    return;
  }

  summaryItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span class="summary-item-name">${item.name} × ${item.qty}kg</span>
      <span class="summary-item-price">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');
  if (summaryTotal) summaryTotal.textContent = formatPrice(totalPrice());
}

/* ============================================================
   CART — actions
   ============================================================ */
function addToCart(id, name, price, emoji = '🍎', img = '') {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, emoji, img, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
  showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  showToast('Item removed from cart.', 'error');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Clear all items from cart?')) return;
  cart = [];
  saveCart();
  renderCart();
  showToast('Cart cleared.', 'error');
}

/* ── Drawer open / close ── */
function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   PRODUCT FILTER (products.html)
   ============================================================ */
function initProductFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.fruit-card[data-category]');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        card.parentElement.style.display =
          (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
      });
    });
  });
}

/* ============================================================
   ORDER FORM VALIDATION (order.html)
   ============================================================ */
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  // Populate fruit select with cart items
  const fruitSelect = document.getElementById('fruitSelection');
  if (fruitSelect && cart.length > 0) {
    fruitSelect.innerHTML = '<option value="">-- Select a fruit --</option>' +
      cart.map(i => `<option value="${i.id}">${i.name} (${formatPrice(i.price)}/kg)</option>`).join('');
  }

  form.addEventListener('submit', handleOrderSubmit);

  // Live validation
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur',  () => validateField(field));
  });
}

function validateField(field) {
  const group = field.closest('.form-group');
  if (!group) return true;
  const errEl = group.querySelector('.error-msg');
  let valid = true;
  let msg   = '';

  field.classList.remove('error');
  if (errEl) errEl.classList.remove('show');

  const val = field.value.trim();

  if (field.required && !val) {
    valid = false;
    msg   = 'This field is required.';
  } else if (val) {
    if (field.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
        msg   = 'Enter a valid email address.';
      }
    } else if (field.id === 'phone') {
      if (!/^(\+92|0)?3[0-9]{9}$/.test(val.replace(/[\s\-()]/g, ''))) {
        valid = false;
        msg   = 'Enter a valid Pakistani phone number (e.g. 03001234567).';
      }
    } else if (field.id === 'quantity') {
      const n = Number(val);
      if (!Number.isInteger(n) || n < 1 || n > 50) {
        valid = false;
        msg   = 'Quantity must be between 1 and 50 kg.';
      }
    } else if (field.id === 'fullName') {
      if (val.length < 3) {
        valid = false;
        msg   = 'Name must be at least 3 characters.';
      } else if (!/^[a-zA-Z\s]+$/.test(val)) {
        valid = false;
        msg   = 'Name should contain only letters and spaces.';
      }
    } else if (field.id === 'address') {
      if (val.length < 10) {
        valid = false;
        msg   = 'Please enter your full address (at least 10 characters).';
      }
    }
  }

  if (!valid) {
    field.classList.add('error');
    if (errEl) {
      errEl.textContent = '⚠ ' + msg;
      errEl.classList.add('show');
    }
  }
  return valid;
}

function handleOrderSubmit(e) {
  e.preventDefault();
  const form   = e.target;
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allValid = true;

  fields.forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  if (!allValid) {
    showToast('Please fix the errors above before submitting.', 'error');
    // Scroll to first error
    const firstError = form.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Simulate order submission
  const btn = form.querySelector('.submit-btn');
  btn.disabled = true;
  btn.textContent = 'Placing Order...';

  setTimeout(() => {
    form.style.display = 'none';
    const success = document.getElementById('orderSuccess');
    if (success) success.classList.add('show');
    const nameVal = document.getElementById('fullName')?.value.trim();
    const nameDisplay = document.getElementById('successName');
    if (nameDisplay && nameVal) nameDisplay.textContent = nameVal;
    cart = [];
    saveCart();
    renderCart();
  }, 1200);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  renderCart();
  initProductFilter();
  initOrderForm();

  // Cart button (navbar desktop)
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  // Cart button (mobile nav)
  document.getElementById('cartBtnMobile')?.addEventListener('click', () => { closeCart(); openCart(); });
  // Overlay + close button
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
});
