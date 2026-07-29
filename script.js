// ---------------------------------------------
// Sedan Collection - Catalog + Shopping Cart
// Portfolio project by Frank Gaibor
// ---------------------------------------------

const CART_KEY = 'sedan_collection_cart';

// A minimalist sedan silhouette, reused for every card (illustration, not a
// real manufacturer photo — avoids any copyright issue while keeping a
// consistent, elegant visual identity).
const CAR_SILHOUETTE = `
<svg viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 70 Q20 45 55 40 L85 25 Q110 15 140 25 L175 40 Q210 45 220 70
           Q225 78 215 80 L200 80 Q198 68 185 68 Q172 68 170 80 L75 80
           Q73 68 60 68 Q47 68 45 80 L25 80 Q13 78 15 70 Z"
        fill="none" stroke="#1a1a1a" stroke-width="2.2" />
  <circle cx="60" cy="80" r="10" fill="none" stroke="#1a1a1a" stroke-width="2.2" />
  <circle cx="185" cy="80" r="10" fill="none" stroke="#1a1a1a" stroke-width="2.2" />
  <path d="M88 27 L100 45 L150 45 L162 27" fill="none" stroke="#1a1a1a" stroke-width="1.6" opacity="0.55" />
</svg>
`;

const cars = [
  { id: 'ford-fusion', brand: 'Ford', model: 'Fusion', year: 2022, price: 28500 },
  { id: 'ford-mondeo', brand: 'Ford', model: 'Mondeo', year: 2023, price: 31200 },
  { id: 'lexus-es', brand: 'Lexus', model: 'ES', year: 2024, price: 44900 },
  { id: 'lexus-is', brand: 'Lexus', model: 'IS', year: 2022, price: 41300 },
  { id: 'bmw-3series', brand: 'BMW', model: '3 Series', year: 2023, price: 47800 },
  { id: 'bmw-5series', brand: 'BMW', model: '5 Series', year: 2025, price: 62400 },
  { id: 'mb-cclass', brand: 'Mercedes-Benz', model: 'C-Class', year: 2022, price: 46500 },
  { id: 'mb-eclass', brand: 'Mercedes-Benz', model: 'E-Class', year: 2024, price: 61900 },
  { id: 'volvo-s60', brand: 'Volvo', model: 'S60', year: 2023, price: 42100 },
  { id: 'volvo-s90', brand: 'Volvo', model: 'S90', year: 2025, price: 54700 },
  { id: 'alfa-giulia-ti', brand: 'Alfa Romeo', model: 'Giulia Ti', year: 2022, price: 45300 },
  { id: 'alfa-giulia-veloce', brand: 'Alfa Romeo', model: 'Giulia Veloce', year: 2024, price: 52600 },
];

let cart = loadCart();

const catalogEl = document.getElementById('catalog');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartClear = document.getElementById('cartClear');
const overlay = document.getElementById('overlay');

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `$${value.toLocaleString('en-US')}`;
}

// ---------- Render catalog ----------
function renderCatalog() {
  catalogEl.innerHTML = cars
    .map(
      (car) => `
    <article class="card">
      <div class="card__media">${CAR_SILHOUETTE}</div>
      <div class="card__body">
        <span class="card__brand">${car.brand}</span>
        <h3 class="card__model">${car.model}</h3>
        <span class="card__year">${car.year} Model Year</span>
        <div class="card__footer">
          <span class="card__price">${formatPrice(car.price)}</span>
          <button class="btn btn--add" data-add="${car.id}">Add to selection</button>
        </div>
      </div>
    </article>
  `
    )
    .join('');

  catalogEl.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add));
  });
}

// ---------- Cart logic ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  openCart();
}

function increment(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}

function decrement(id) {
  if (!cart[id]) return;
  cart[id] -= 1;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);
  const totalCount = entries.reduce((sum, [, qty]) => sum + qty, 0);
  cartCountEl.textContent = totalCount;

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart__empty">Your selection is empty.</p>`;
    cartTotalEl.textContent = formatPrice(0);
    return;
  }

  let total = 0;

  cartItemsEl.innerHTML = entries
    .map(([id, qty]) => {
      const car = cars.find((c) => c.id === id);
      const subtotal = car.price * qty;
      total += subtotal;

      return `
      <div class="cart-item">
        <div class="cart-item__info">
          <div class="cart-item__name">${car.brand} ${car.model}</div>
          <div class="cart-item__price">${formatPrice(car.price)} × ${qty} = ${formatPrice(subtotal)}</div>
        </div>
        <div class="cart-item__controls">
          <button class="qty-btn" data-decrement="${id}">−</button>
          <span>${qty}</span>
          <button class="qty-btn" data-increment="${id}">+</button>
          <button class="cart-item__remove" data-remove="${id}">Remove</button>
        </div>
      </div>
    `;
    })
    .join('');

  cartTotalEl.textContent = formatPrice(total);

  cartItemsEl.querySelectorAll('[data-increment]').forEach((btn) => {
    btn.addEventListener('click', () => increment(btn.dataset.increment));
  });
  cartItemsEl.querySelectorAll('[data-decrement]').forEach((btn) => {
    btn.addEventListener('click', () => decrement(btn.dataset.decrement));
  });
  cartItemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeItem(btn.dataset.remove));
  });
}

// ---------- Cart panel open/close ----------
function openCart() {
  cartPanel.classList.add('is-open');
  overlay.classList.add('is-visible');
}

function closeCart() {
  cartPanel.classList.remove('is-open');
  overlay.classList.remove('is-visible');
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
cartClear.addEventListener('click', clearCart);

// ---------- Featured carousel ----------
const featuredIds = ['bmw-5series', 'mb-eclass', 'volvo-s90', 'alfa-giulia-veloce', 'lexus-es'];
const featuredCars = featuredIds.map((id) => cars.find((c) => c.id === id));

let carouselIndex = 0;
let carouselTimer = null;

const carouselSlide = document.getElementById('carouselSlide');
const carouselDots = document.getElementById('carouselDots');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');

function renderCarousel() {
  const car = featuredCars[carouselIndex];

  carouselSlide.innerHTML = `
    <div class="carousel__media">${CAR_SILHOUETTE}</div>
    <div class="carousel__info">
      <span class="carousel__tag">Featured</span>
      <span class="card__brand">${car.brand}</span>
      <h3 class="carousel__title">${car.model}</h3>
      <span class="carousel__year">${car.year} Model Year</span>
      <span class="carousel__price">${formatPrice(car.price)}</span>
      <button class="btn btn--add" data-add="${car.id}">Add to selection</button>
    </div>
  `;

  carouselSlide.querySelector('[data-add]').addEventListener('click', (e) => {
    addToCart(e.target.dataset.add);
  });

  carouselDots.innerHTML = featuredCars
    .map(
      (_, i) =>
        `<button class="carousel__dot ${i === carouselIndex ? 'is-active' : ''}" data-dot="${i}"></button>`
    )
    .join('');

  carouselDots.querySelectorAll('[data-dot]').forEach((dot) => {
    dot.addEventListener('click', () => {
      carouselIndex = parseInt(dot.dataset.dot, 10);
      renderCarousel();
      resetCarouselTimer();
    });
  });
}

function nextSlide() {
  carouselIndex = (carouselIndex + 1) % featuredCars.length;
  renderCarousel();
}

function prevSlide() {
  carouselIndex = (carouselIndex - 1 + featuredCars.length) % featuredCars.length;
  renderCarousel();
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 4500);
}

carouselNext.addEventListener('click', () => {
  nextSlide();
  resetCarouselTimer();
});

carouselPrev.addEventListener('click', () => {
  prevSlide();
  resetCarouselTimer();
});

// ---------- Init ----------
renderCatalog();
renderCart();
renderCarousel();
resetCarouselTimer();
