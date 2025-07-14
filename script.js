// DOM Elements
const totalDisplay = document.getElementById("total-quantity-display");
const cartItems = {};
const orderModal = document.getElementById("order-modal");
const orderSummary = document.getElementById("order-summary");
const startNewOrderBtn = document.getElementById("start-new-order");
const confirmBtn = document.getElementById("confirm-order");

// Per-product setup
document.querySelectorAll(".product-item").forEach((product) => {
  const button = product.querySelector(".cart-button");
  const incrementBtn = product.querySelector(".incrementButton");
  const decrementBtn = product.querySelector(".decrementButton");
  const quantityDisplay = product.querySelector(".quantityValue");
  const cartText = product.querySelector(".cart-text");
  const quantityBox = product.querySelector(".quantityCount");

  product.dataset.quantity = 0;
  product.dataset.added = "false";

  button.addEventListener("click", (e) => {
    e.preventDefault();
    activateQuantityBox();
  });

  incrementBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    let quantity = parseInt(product.dataset.quantity);
    quantity++;
    product.dataset.quantity = quantity;
    quantityDisplay.textContent = quantity;

    const title = getTitle(product);
    const price = getPrice(product);
    const image = getImage(product);
    const flavour = getFlavour(product);

    cartItems[title] = { quantity, price, image, flavour };

    if (product.dataset.added === "false") {
      updateCart(product, quantity, price);
      product.dataset.added = "true";
    } else {
      updateCartQuantityUI(title, quantity, price);
    }

    updateTotalQuantityDisplay();
    updateGrandTotal();
    toggleEmptyCartMessage();
  });

  decrementBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    let quantity = parseInt(product.dataset.quantity);
    if (quantity > 0) {
      quantity--;
      product.dataset.quantity = quantity;
      quantityDisplay.textContent = quantity;

      const title = getTitle(product);
      const price = getPrice(product);

      if (quantity === 0) {
        removeCartItem(title);
        resetButtonState();
        delete cartItems[title];
        product.dataset.added = "false";
      } else {
        cartItems[title] = {
          quantity,
          price,
          image: getImage(product),
          flavour: getFlavour(product),
        };
        updateCartQuantityUI(title, quantity, price);
      }

      updateTotalQuantityDisplay();
      updateGrandTotal();
      toggleEmptyCartMessage();
    }
  });

  function activateQuantityBox() {
    cartText.style.display = "none";
    quantityBox.style.display = "inline-flex";
    button.classList.add("active");
  }

  function resetButtonState() {
    button.classList.remove("active", "reset-hover");
    cartText.style.display = "inline";
    quantityBox.style.display = "none";
    quantityDisplay.textContent = "0";
    product.dataset.quantity = 0;
    product.dataset.added = "false";
  }

  function getTitle(product) {
    return product.querySelector(".dessert-text").textContent.trim();
  }

  function getFlavour(product) {
    return product.querySelector(".dessert-flavour-text").textContent.trim();
  }

  function getPrice(product) {
    return parseFloat(
      product.querySelector(".dessert-price").textContent.replace("$", "")
    );
  }

  function getImage(product) {
    return product.querySelector(".product-images img").src;
  }

  function updateCartQuantityUI(title, qty, price) {
    const existing = document.querySelector(`[data-title="${title}"]`);
    if (existing) {
      existing.querySelector(".cart-quantity").textContent = `Quantity: ${qty}`;
      existing.querySelector(".cart-total").textContent = `Total: $${(qty * price).toFixed(2)}`;
    }
  }

  function updateCart(product, qty, price) {
    const cart = document.getElementById("cart-items");
    const imageSrc = getImage(product);
    const title = getTitle(product);
    const flavour = getFlavour(product);

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.setAttribute("data-title", title);

    cartItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${imageSrc}" style="width: 40px; height: auto; border-radius: 4px;" />
          <div>
            <p><strong>${title}</strong> - ${flavour}</p>
            <p>Price: $${price.toFixed(2)}</p>
            <p class="cart-quantity">Quantity: ${qty}</p>
            <p class="cart-total">Total: $${(qty * price).toFixed(2)}</p>
          </div>
        </div>
        <img src="./assets/images/icon-remove-item.svg" class="delete-btn" style="width: 20px; height: 20px; border: 1px solid hsl(14, 86%, 42%); border-radius: 50%; padding: 3px; cursor: pointer;" />
      </div> <hr>
    `;

    cart.appendChild(cartItem);

    const deleteBtn = cartItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      cart.removeChild(cartItem);
      delete cartItems[title];
      resetButtonState();
      product.dataset.added = "false";
      updateTotalQuantityDisplay();
      updateGrandTotal();
      toggleEmptyCartMessage();
    });
  }

  function removeCartItem(title) {
    const cartItem = document.querySelector(`[data-title="${title}"]`);
    if (cartItem) {
      cartItem.remove();
    }
  }
});

// Global reusable functions
function updateTotalQuantityDisplay() {
  let totalQty = 0;
  for (let item of Object.values(cartItems)) {
    totalQty += item.quantity;
  }
  totalDisplay.textContent = totalQty;
}

function updateGrandTotal() {
  let total = 0;
  for (let item of Object.values(cartItems)) {
    total += item.quantity * item.price;
  }

  let totalElement = document.getElementById("grand-total");
  if (!totalElement) {
    totalElement = document.createElement("div");
    totalElement.id = "grand-total";
    totalElement.style.marginTop = "20px";
    totalElement.style.fontWeight = "bold";
    document.getElementById("cart").appendChild(totalElement);
  }

  totalElement.innerHTML = `
  <span>Total:</span>
  <span>$${total.toFixed(2)}</span>
`;

}

function toggleEmptyCartMessage() {
  const emptyCartMessage = document.querySelector(".empty-design");
  if (Object.keys(cartItems).length === 0) {
    emptyCartMessage.style.display = "flex";
  } else {
    emptyCartMessage.style.display = "none";
  }
}

// Modal logic
confirmBtn.addEventListener("click", () => {
  orderSummary.innerHTML = "";

  if (Object.keys(cartItems).length === 0) {
    orderSummary.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    for (let [title, item] of Object.entries(cartItems)) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginBottom = "15px";
      row.innerHTML = `
        <img src="${item.image}" style="width: 40px; height: auto; border-radius: 4px; margin-right: 10px;" />
        <div>
          <p><strong>${title}</strong> - ${item.flavour}</p>
          <p>Qty: ${item.quantity} | Total: $${(item.quantity * item.price).toFixed(2)}</p>
        </div>
      `;
      orderSummary.appendChild(row);
    }
  }

  orderModal.style.display = "flex";
});

startNewOrderBtn.addEventListener("click", () => {
  // Remove all cart items
  document.querySelectorAll(".cart-item").forEach(item => item.remove());

  // Clear cartItems
  for (let title in cartItems) {
    delete cartItems[title];
  }

  // Reset UI state for all products
  document.querySelectorAll(".product-item").forEach(product => {
    const button = product.querySelector(".cart-button");
    const cartText = product.querySelector(".cart-text");
    const quantityBox = product.querySelector(".quantityCount");
    const quantityDisplay = product.querySelector(".quantityValue");

    product.dataset.quantity = 0;
    product.dataset.added = "false";
    button.classList.remove("active", "reset-hover");
    cartText.style.display = "inline";
    quantityBox.style.display = "none";
    quantityDisplay.textContent = "0";
  });

  updateTotalQuantityDisplay();
  updateGrandTotal();
  toggleEmptyCartMessage();
  orderModal.style.display = "none";
});
