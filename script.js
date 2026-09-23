let products = [
  { id: 1, name: "เสื้อยืด",     icon: "👕", price: 299, stock: 10 },
  { id: 2, name: "กางเกงยีนส์",  icon: "👖", price: 599, stock: 8 },
  { id: 3, name: "รองเท้าผ้าใบ", icon: "👟", price: 899, stock: 5 },
  { id: 4, name: "กระเป๋า",      icon: "👜", price: 499, stock: 12 },
  { id: 5, name: "หูฟัง",        icon: "🎧", price: 799, stock: 7 },
];

let cart = [];

const productGrid   = document.getElementById("productGrid");
const searchInput   = document.getElementById("searchInput");
const resultCount   = document.getElementById("resultCount");

const cartPanel     = document.getElementById("cartPanel");
const overlay       = document.getElementById("overlay");
const openCartBtn   = document.getElementById("openCartBtn");
const closeCartBtn  = document.getElementById("closeCartBtn");
const cartItemsEl   = document.getElementById("cartItems");
const emptyCartMsg  = document.getElementById("emptyCartMsg");
const cartTotalEl   = document.getElementById("cartTotal");
const cartCountEl   = document.getElementById("cartCount");
const checkoutBtn   = document.getElementById("checkoutBtn");

const checkoutOverlay  = document.getElementById("checkoutOverlay");
const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
const payTotalEl       = document.getElementById("payTotal");
const confirmPayBtn    = document.getElementById("confirmPayBtn");

const successOverlay = document.getElementById("successOverlay");
const successDetail  = document.getElementById("successDetail");
const backToShopBtn  = document.getElementById("backToShopBtn");

const toastEl = document.getElementById("toast");

function formatBaht(amount) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " บาท";
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function renderProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));

  resultCount.textContent = keyword
    ? `พบ ${filtered.length} รายการ สำหรับ "${searchInput.value}"`
    : `ทั้งหมด ${products.length} รายการ`;

  productGrid.innerHTML = "";

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p class="empty-msg">ไม่พบสินค้าที่ค้นหา</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    const outOfStock = p.stock <= 0;

    card.innerHTML = `
      <div class="product-thumb">${p.icon}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-meta">
        <span class="${p.stock <= 3 ? "stock-low" : ""}">สต็อก: ${p.stock}</span>
      </div>
      <div class="product-price">${formatBaht(p.price)}</div>
      <div class="qty-row">
        <button type="button" class="qty-minus" ${outOfStock ? "disabled" : ""} aria-label="ลดจำนวน">−</button>
        <input type="number" class="qty-input" value="1" min="1" max="${Math.max(p.stock, 1)}" ${outOfStock ? "disabled" : ""} aria-label="จำนวน">
        <button type="button" class="qty-plus" ${outOfStock ? "disabled" : ""} aria-label="เพิ่มจำนวน">+</button>
      </div>
      <button type="button" class="add-btn" ${outOfStock ? "disabled" : ""}>
        ${outOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
      </button>
    `;

    const qtyInput = card.querySelector(".qty-input");
    card.querySelector(".qty-minus").addEventListener("click", () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1") - 1);
    });
    card.querySelector(".qty-plus").addEventListener("click", () => {
      qtyInput.value = Math.min(p.stock, parseInt(qtyInput.value || "1") + 1);
    });
    card.querySelector(".add-btn").addEventListener("click", () => {
      const qty = Math.max(1, parseInt(qtyInput.value || "1"));
      addToCart(p.id, qty);
    });

    productGrid.appendChild(card);
  });
}

function addToCart(productId, quantity) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (quantity <= 0) { showToast("จำนวนสินค้าต้องมากกว่า 0"); return; }
  if (quantity > product.stock) { showToast("สินค้าในสต็อกไม่เพียงพอ"); return; }

  const existing = cart.find(c => c.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, quantity });

  product.stock -= quantity;

  showToast(`เพิ่ม ${product.name} จำนวน ${quantity} ชิ้น ลงในตะกร้าแล้ว!`);
  renderProducts();
  renderCart();
}

function removeFromCart(productId) {
  const item = cart.find(c => c.productId === productId);
  if (!item) return;

  const product = products.find(p => p.id === productId);
  if (product) product.stock += item.quantity;

  cart = cart.filter(c => c.productId !== productId);
  renderProducts();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.appendChild(emptyCartMsg);
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-sub">${item.quantity} x ${formatBaht(product.price)}</div>
          <button type="button" class="cart-item-remove">นำออก</button>
        </div>
        <div style="text-align:right; font-weight:600;">${formatBaht(product.price * item.quantity)}</div>
      `;
      row.querySelector(".cart-item-remove").addEventListener("click", () => removeFromCart(product.id));
      cartItemsEl.appendChild(row);
    });
  }

  const total = cartTotal();
  cartTotalEl.textContent = formatBaht(total);
  cartCountEl.textContent = cart.reduce((n, c) => n + c.quantity, 0);
}

function openCart() { cartPanel.classList.add("open"); overlay.classList.add("show"); }
function closeCart() { cartPanel.classList.remove("open"); overlay.classList.remove("show"); }

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) { showToast("ไม่สามารถชำระเงินได้ เพราะตะกร้าว่าง"); return; }
  payTotalEl.textContent = formatBaht(cartTotal());
  checkoutOverlay.classList.add("show");
});

closeCheckoutBtn.addEventListener("click", () => checkoutOverlay.classList.remove("show"));

confirmPayBtn.addEventListener("click", () => {
  const method = document.querySelector('input[name="payMethod"]:checked').value;
  const total = cartTotal();

  successDetail.textContent = `ยอดชำระ ${formatBaht(total)} ผ่านช่องทาง "${method}"`;

  cart = [];
  renderCart();
  renderProducts();

  checkoutOverlay.classList.remove("show");
  closeCart();
  successOverlay.classList.add("show");
});

backToShopBtn.addEventListener("click", () => successOverlay.classList.remove("show"));

searchInput.addEventListener("input", renderProducts);

renderProducts();
renderCart();
