// صيدليتي — منطق التطبيق (Client-side only)

/* ---------- State ---------- */
const STORAGE_CART = "pharmacy_cart";
const STORAGE_ORDERS = "pharmacy_orders";

let cart = loadJSON(STORAGE_CART, {});        // { productId: qty }
let orders = loadJSON(STORAGE_ORDERS, []);    // [order]
let activeCategory = "all";
let searchTerm = "";

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const money = (n) => n.toFixed(2) + " ر.س";

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === Number(id));
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(id);
    return p ? sum + p.price * qty : sum;
  }, 0);
}

let toastTimer;
function showToast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

/* ---------- Navigation (SPA) ---------- */
function navigate(page) {
  $$(".page").forEach((p) => p.classList.remove("active"));
  const target = $("#page-" + page);
  if (target) target.classList.add("active");
  $("#mainNav").classList.remove("open");
  window.scrollTo({ top: 0 });

  if (page === "cart") renderCart();
  if (page === "checkout") {
    if (cartCount() === 0) {
      navigate("cart");
      return;
    }
    $("#checkoutTotal").textContent = money(cartTotal());
  }
  if (page === "orders") renderOrders();
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if (link) {
    e.preventDefault();
    navigate(link.dataset.page);
  }
});

/* ---------- Rendering: categories & products ---------- */
function categoryCardHTML(cat) {
  return `
    <div class="category-card" data-cat="${cat.id}">
      <span class="cat-icon">${cat.icon}</span>
      <h3>${cat.name}</h3>
    </div>`;
}

function productCardHTML(p) {
  return `
    <div class="product-card">
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-body">
        <span class="product-cat">${CATEGORY_NAME[p.category]}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <span class="product-price">${money(p.price)}</span>
        <button class="add-btn" data-add="${p.id}">أضف للسلة 🛒</button>
      </div>
    </div>`;
}

function renderCatalog() {
  const list = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchText =
      !searchTerm ||
      p.name.includes(searchTerm) ||
      p.desc.includes(searchTerm) ||
      CATEGORY_NAME[p.category].includes(searchTerm);
    return matchCat && matchText;
  });
  $("#catalogProducts").innerHTML = list.map(productCardHTML).join("");
  $("#catalogEmpty").hidden = list.length > 0;
}

function renderChips() {
  const chips = [{ id: "all", name: "الكل" }, ...CATEGORIES];
  $("#categoryChips").innerHTML = chips
    .map((c) => `<button class="chip ${c.id === activeCategory ? "active" : ""}" data-chip="${c.id}">${c.name}</button>`)
    .join("");
}

function renderHome() {
  $("#homeCategories").innerHTML = CATEGORIES.map(categoryCardHTML).join("");
  const popular = [...PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 4);
  $("#homePopular").innerHTML = popular.map(productCardHTML).join("");
}

/* ---------- Cart ---------- */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveJSON(STORAGE_CART, cart);
  updateBadge();
  showToast("تمت الإضافة إلى السلة ✓");
}

function setQty(id, qty) {
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveJSON(STORAGE_CART, cart);
  updateBadge();
  renderCart();
}

function updateBadge() {
  const badge = $("#cartBadge");
  const count = cartCount();
  badge.textContent = count;
  badge.hidden = count === 0;
}

function renderCart() {
  const wrap = $("#cartItems");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    wrap.innerHTML = `<p class="empty-msg">سلتك فارغة 🛒<br>أضف بعض الأدوية للبدء!</p>`;
    $("#cartSummary").innerHTML = "";
    $("#cartActions").hidden = true;
    return;
  }

  wrap.innerHTML = entries.map(([id, qty]) => {
    const p = getProduct(id);
    return `
      <div class="cart-item">
        <div class="cart-emoji">${p.emoji}</div>
        <div class="cart-info">
          <h4>${p.name}</h4>
          <span class="unit-price">${money(p.price)} للوحدة</span>
        </div>
        <div class="qty-control">
          <button data-qty="+" data-id="${id}" aria-label="زيادة">+</button>
          <span>${qty}</span>
          <button data-qty="-" data-id="${id}" aria-label="إنقاص">−</button>
        </div>
        <span class="cart-total-price">${money(p.price * qty)}</span>
        <button class="remove-btn" data-remove="${id}" aria-label="حذف">🗑</button>
      </div>`;
  }).join("");

  const total = cartTotal();
  $("#cartSummary").innerHTML = `
    <div class="row"><span>عدد الأصناف:</span><span>${entries.length}</span></div>
    <div class="row"><span>عدد القطع:</span><span>${cartCount()}</span></div>
    <div class="row grand"><span>الإجمالي:</span><span>${money(total)}</span></div>`;
  $("#cartActions").hidden = false;
}

/* ---------- Checkout & Orders ---------- */
function placeOrder(data) {
  const order = {
    id: "ORD-" + Date.now().toString().slice(-8),
    date: new Date().toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }),
    customer: data,
    items: Object.entries(cart).map(([id, qty]) => {
      const p = getProduct(id);
      return { name: p.name, emoji: p.emoji, qty, price: p.price };
    }),
    total: cartTotal(),
    status: "قيد التجهيز",
  };
  orders.unshift(order);
  saveJSON(STORAGE_ORDERS, orders);
  cart = {};
  saveJSON(STORAGE_CART, cart);
  updateBadge();
  return order;
}

function renderOrders() {
  const list = $("#ordersList");
  const empty = $("#ordersEmpty");
  if (orders.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.innerHTML = orders.map((o) => `
    <div class="order-card">
      <div class="order-head">
        <strong>${o.id}</strong>
        <span class="order-status">${o.status}</span>
      </div>
      <p class="order-meta">${o.date} — ${o.customer.name} — ${o.customer.address}</p>
      <p class="order-items">${o.items.map((i) => `${i.emoji} ${i.name} ×${i.qty}`).join(" • ")}</p>
      <p class="order-total">الإجمالي: ${money(o.total)}</p>
    </div>`).join("");
}

/* ---------- Events ---------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) return addToCart(add.dataset.add);

  const qty = e.target.closest("[data-qty]");
  if (qty) {
    const id = qty.dataset.id;
    return setQty(id, (cart[id] || 0) + (qty.dataset.qty === "+" ? 1 : -1));
  }

  const rm = e.target.closest("[data-remove]");
  if (rm) return setQty(rm.dataset.remove, 0);

  const catCard = e.target.closest(".category-card");
  if (catCard) {
    activeCategory = catCard.dataset.cat;
    searchTerm = "";
    $("#catalogSearch").value = "";
    renderChips();
    renderCatalog();
    navigate("catalog");
  }

  const chip = e.target.closest("[data-chip]");
  if (chip) {
    activeCategory = chip.dataset.chip;
    renderChips();
    renderCatalog();
  }
});

// بحث
$("#homeSearchBtn").addEventListener("click", () => {
  searchTerm = $("#homeSearch").value.trim();
  activeCategory = "all";
  $("#catalogSearch").value = searchTerm;
  renderChips();
  renderCatalog();
  navigate("catalog");
});
$("#homeSearch").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("#homeSearchBtn").click();
});
$("#catalogSearch").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  renderCatalog();
});

// السلة
$("#cartBtn").addEventListener("click", () => navigate("cart"));
$("#clearCartBtn").addEventListener("click", () => {
  cart = {};
  saveJSON(STORAGE_CART, cart);
  updateBadge();
  renderCart();
});
$("#checkoutBtn").addEventListener("click", () => navigate("checkout"));

// الدفع
$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = {
    name: $("#fullName"),
    phone: $("#phone"),
    address: $("#address"),
  };
  let valid = true;
  for (const [key, input] of Object.entries(fields)) {
    const err = input.closest(".form-group").querySelector(".field-error");
    const ok = input.value.trim().length >= 3 && (key !== "phone" || /^[0-9+\\s]{9,15}$/.test(input.value.trim()));
    input.classList.toggle("invalid", !ok);
    if (err) err.classList.toggle("show", !ok);
    if (!ok) valid = false;
  }
  if (!valid) return;

  const order = placeOrder({
    name: fields.name.value.trim(),
    phone: fields.phone.value.trim(),
    address: fields.address.value.trim(),
    notes: $("#notes").value.trim(),
  });
  $("#checkoutForm").reset();
  $("#confirmDetails").textContent =
    `رقم طلبك ${order.id} — الإجمالي ${money(order.total)}. سنتواصل معك على ${order.customer.phone} لتأكيد التوصيل.`;
  navigate("confirm");
});

// إزالة رسائل الخطأ عند الكتابة
["fullName", "phone", "address"].forEach((id) => {
  $("#" + id).addEventListener("input", (e) => {
    e.target.classList.remove("invalid");
    const err = e.target.closest(".form-group").querySelector(".field-error");
    if (err) err.classList.remove("show");
  });
});

// قائمة الجوال
$("#menuToggle").addEventListener("click", () => {
  $("#mainNav").classList.toggle("open");
});

/* ---------- Init ---------- */
renderHome();
renderChips();
renderCatalog();
updateBadge();
navigate("home");
