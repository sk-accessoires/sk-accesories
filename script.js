const CONFIG = {
  whatsappPhone: "REMPLACER_PAR_NUMERO_WHATSAPP",
  instagramUrl: "",
  facebookUrl: "https://www.facebook.com/p/SK-Accessoires-61594316282441/",
};

const products = window.SK_CATALOG.filter((product) => product.collection);
const catalogById = new Map(window.SK_CATALOG.map((product) => [product.id, product]));
const CART_STORAGE_KEY = "sk-accessoires-cart";

let activeProduct = products[0];
let cart = loadCart();

const productGrid = document.querySelector("[data-products]");
const productModal = document.querySelector("[data-product-modal]");
const cartModal = document.querySelector("[data-cart-modal]");
const galleryMain = document.querySelector("[data-gallery-main]");
const galleryThumbs = document.querySelector("[data-gallery-thumbs]");
const toast = document.querySelector("[data-toast]");
const checkoutForm = document.querySelector("[data-checkout-form]");

function formatPrice(product) {
  return product.priceLabel || `${product.price} DT`;
}

function formatAmount(amount) {
  return `${amount} DT`;
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => catalogById.has(item.id) && Number.isInteger(item.quantity) && item.quantity > 0)
      .map((item) => ({ id: item.id, quantity: Math.min(item.quantity, 20) }));
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartDetails() {
  return cart.map((item) => {
    const product = catalogById.get(item.id);
    return { ...item, product, subtotal: product.price * item.quantity };
  });
}

function getCartTotal() {
  return getCartDetails().reduce((sum, item) => sum + item.subtotal, 0);
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card section-reveal">
        <div class="product-media">
          <img src="${product.mainImage}" alt="${product.alt}" loading="lazy" />
        </div>
        <div class="product-body">
          <div class="product-title-row">
            <h3>${product.name}</h3>
            <span class="price">${formatPrice(product)}</span>
          </div>
          <p class="material-line">${product.material}</p>
          <p>${product.description}</p>
          <div class="product-actions">
            <button class="button ghost" type="button" data-view-product="${product.id}">Voir le produit</button>
            <button class="button primary" type="button" data-add-product="${product.id}">Ajouter au panier</button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function openShell(shell) {
  shell.classList.add("is-open");
  shell.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeShell(shell) {
  shell.classList.remove("is-open");
  shell.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".modal-shell.is-open")) {
    document.body.classList.remove("modal-open");
  }
}

function setGalleryImage(src, alt) {
  galleryMain.style.opacity = "0";
  setTimeout(() => {
    galleryMain.src = src;
    galleryMain.alt = alt;
    galleryMain.style.opacity = "1";
  }, 120);
}

function openProduct(productId) {
  const product = catalogById.get(productId);
  if (!product) return;
  activeProduct = product;
  document.querySelector("[data-modal-name]").textContent = product.name;
  document.querySelector("[data-modal-price]").textContent = formatPrice(product);
  document.querySelector("[data-modal-material]").textContent = product.material;
  document.querySelector("[data-modal-description]").textContent = product.description;
  galleryMain.src = product.mainImage;
  galleryMain.alt = product.alt;
  galleryThumbs.innerHTML = product.images
    .map(
      (image, index) => `
        <button type="button" class="${index === 0 ? "is-active" : ""}" data-gallery-image="${image}" aria-label="Voir la photo ${index + 1}">
          <img src="${image}" alt="${product.alt}" />
        </button>
      `,
    )
    .join("");
  openShell(productModal);
}

function addToCart(productId) {
  const product = catalogById.get(productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, 20);
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} a été ajouté au panier.`);
}

function updateCartItem(productId, action) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;
  if (action === "increase") item.quantity = Math.min(item.quantity + 1, 20);
  if (action === "decrease") item.quantity -= 1;
  if (action === "remove" || item.quantity < 1) {
    cart = cart.filter((entry) => entry.id !== productId);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const details = getCartDetails();
  const itemCount = details.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = itemCount;
  });

  const itemsContainer = document.querySelector("[data-cart-items]");
  const emptyMessage = document.querySelector("[data-cart-empty]");
  const cartFooter = document.querySelector("[data-cart-footer]");
  emptyMessage.hidden = details.length > 0;
  cartFooter.hidden = details.length === 0;
  document.querySelector("[data-cart-total]").textContent = formatAmount(getCartTotal());

  itemsContainer.innerHTML = details
    .map(
      ({ product, quantity, subtotal }) => `
        <article class="cart-item">
          <img src="${product.mainImage}" alt="${product.alt}" />
          <div class="cart-item-copy">
            <div class="cart-item-heading">
              <h3>${product.name}</h3>
              <strong>${formatPrice(product)}</strong>
            </div>
            <div class="cart-item-controls">
              <div class="quantity-control" aria-label="Quantité pour ${product.name}">
                <button type="button" data-cart-action="decrease" data-cart-id="${product.id}" aria-label="Diminuer la quantité">−</button>
                <span>${quantity}</span>
                <button type="button" data-cart-action="increase" data-cart-id="${product.id}" aria-label="Augmenter la quantité">+</button>
              </div>
              <span class="item-subtotal">Sous-total : ${formatAmount(subtotal)}</span>
              <button class="remove-item" type="button" data-cart-action="remove" data-cart-id="${product.id}">Retirer</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const details = getCartDetails();
  document.querySelector("[data-checkout-summary]").innerHTML = details
    .map(
      ({ product, quantity, subtotal }) => `
        <div class="summary-row">
          <div><strong>${product.name}</strong><span>${formatPrice(product)} × ${quantity}</span></div>
          <strong>${formatAmount(subtotal)}</strong>
        </div>
      `,
    )
    .join("");
  document.querySelector("[data-checkout-total]").textContent = formatAmount(getCartTotal());
}

function showCartPanel(panelName = "cart") {
  const panels = {
    cart: document.querySelector("[data-cart-panel]"),
    checkout: document.querySelector("[data-checkout-panel]"),
    success: document.querySelector("[data-success-panel]"),
  };
  Object.entries(panels).forEach(([name, panel]) => {
    panel.hidden = name !== panelName;
  });
  document.querySelector("[data-order-error]").hidden = true;
}

function openCart() {
  renderCart();
  showCartPanel("cart");
  openShell(cartModal);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 3800);
}

async function submitOrder(event) {
  event.preventDefault();
  if (cart.length === 0) {
    showCartPanel("cart");
    return;
  }

  const formData = new FormData(checkoutForm);
  const button = document.querySelector("[data-confirm-order]");
  const errorMessage = document.querySelector("[data-order-error]");
  errorMessage.hidden = true;
  button.disabled = true;
  button.textContent = "Envoi en cours...";

  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          message: formData.get("message"),
        },
        items: cart.map(({ id, quantity }) => ({ id, quantity })),
      }),
    });
    if (!response.ok) throw new Error("Order request failed");

    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();
    showCartPanel("success");
  } catch {
    errorMessage.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Confirmer la commande";
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view-product]");
    if (viewButton) {
      openProduct(viewButton.dataset.viewProduct);
      return;
    }

    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      addToCart(addButton.dataset.addProduct);
      return;
    }

    const cartAction = event.target.closest("[data-cart-action]");
    if (cartAction) {
      updateCartItem(cartAction.dataset.cartId, cartAction.dataset.cartAction);
      return;
    }

    const thumb = event.target.closest("[data-gallery-image]");
    if (thumb) {
      galleryThumbs.querySelectorAll("button").forEach((button) => button.classList.remove("is-active"));
      thumb.classList.add("is-active");
      setGalleryImage(thumb.dataset.galleryImage, activeProduct.alt);
      return;
    }

    if (event.target.closest("[data-open-cart]")) {
      openCart();
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeShell(productModal);
      return;
    }

    if (event.target.closest("[data-close-cart]")) {
      closeShell(cartModal);
      return;
    }

    if (event.target.closest("[data-modal-add]")) {
      addToCart(activeProduct.id);
      closeShell(productModal);
      openCart();
      return;
    }

    if (event.target.closest("[data-start-checkout]")) {
      if (cart.length > 0) showCartPanel("checkout");
      return;
    }

    if (event.target.closest("[data-back-cart]")) {
      showCartPanel("cart");
      return;
    }

    const social = event.target.closest("[data-social]");
    if (social) handleSocialClick(event, social.dataset.social);
  });

  checkoutForm.addEventListener("submit", submitOrder);

  document.querySelector("[data-menu-toggle]").addEventListener("click", () => {
    const nav = document.querySelector("[data-nav]");
    const button = document.querySelector("[data-menu-toggle]");
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector("[data-nav]").classList.remove("is-open");
      document.querySelector("[data-menu-toggle]").setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeShell(productModal);
      closeShell(cartModal);
    }
  });
}

function handleSocialClick(event, type) {
  const urls = {
    instagram: CONFIG.instagramUrl,
    facebook: CONFIG.facebookUrl,
    whatsapp:
      CONFIG.whatsappPhone && CONFIG.whatsappPhone !== "REMPLACER_PAR_NUMERO_WHATSAPP"
        ? `https://wa.me/${CONFIG.whatsappPhone}`
        : "",
  };
  if (!urls[type]) {
    event.preventDefault();
    showToast("Ce lien sera ajouté dès que le compte officiel sera disponible.");
    return;
  }
  event.currentTarget.href = urls[type];
}

function observeReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".section-reveal").forEach((element) => observer.observe(element));
}

renderProducts();
renderCart();
bindEvents();
observeReveals();
