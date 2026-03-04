// Cart Logic
let cart = {};

function changeQty(id, delta) {
    const input = document.getElementById('qty-' + id);
    let current = parseInt(input.value) || 1;
    current += delta;
    if (current < 1) current = 1;
    if (current > 50) current = 50; // max limit
    input.value = current;
}

function addToCart(id, name, price) {
    const input = document.getElementById('qty-' + id);
    const qty = parseInt(input.value) || 1;

    if (cart[id]) {
        cart[id].qty += qty;
    } else {
        cart[id] = { name: name, price: price, qty: qty };
    }

    updateCartUI();

    // Visual feedback
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    btn.style.backgroundColor = '#25D366';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
    }, 1000);

    // Reset qty display to 1 after adding to cart
    input.value = 1;
}

function updateCartUI() {
    let totalItems = 0;
    let itemsPrice = 0;
    for (let id in cart) {
        totalItems += cart[id].qty;
        itemsPrice += cart[id].qty * cart[id].price;
    }

    let deliveryCharge = 0;
    if (itemsPrice > 0 && itemsPrice < 1000) {
        deliveryCharge = 150;
    }

    let grandTotal = itemsPrice + deliveryCharge;

    const cartFloat = document.getElementById('cart-floating-bar');
    if (totalItems > 0) {
        cartFloat.style.display = 'flex';
        document.getElementById('cart-count').innerText = totalItems + (totalItems === 1 ? ' Item' : ' Items');

        let totalText = 'Rs. ' + itemsPrice;
        document.getElementById('cart-total').innerText = totalText;

        // Update Drawer
        renderCartItems();
        document.getElementById('drawer-subtotal').innerText = 'Rs. ' + itemsPrice;
        document.getElementById('drawer-delivery').innerText = 'Rs. ' + deliveryCharge;
        document.getElementById('drawer-total').innerText = 'Rs. ' + grandTotal;
    } else {
        cartFloat.style.display = 'none';
        closeCart();
    }
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    drawer.classList.remove('active');
    overlay.classList.remove('active');
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    let html = '';

    if (Object.keys(cart).length === 0) {
        html = '<p class="empty-cart-msg">Your cart is empty.</p>';
    } else {
        for (let id in cart) {
            let item = cart[id];
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <p class="cart-item-price">Rs. ${item.price} x ${item.qty} = Rs. ${item.price * item.qty}</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="qty-mini-bar">
                            <button class="qty-mini-btn" onclick="updateItemQty('${id}', -1)">-</button>
                            <input type="text" class="qty-mini-input" value="${item.qty}" readonly>
                            <button class="qty-mini-btn" onclick="updateItemQty('${id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${id}')" title="Remove Item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }
    container.innerHTML = html;
}

function updateItemQty(id, delta) {
    if (cart[id]) {
        cart[id].qty += delta;
        if (cart[id].qty < 1) {
            removeFromCart(id);
        } else if (cart[id].qty > 50) {
            cart[id].qty = 50;
        }
        updateCartUI();
    }
}

function removeFromCart(id) {
    if (cart[id]) {
        delete cart[id];
        updateCartUI();
    }
}

function checkoutWhatsApp() {
    let itemsPrice = 0;
    for (let id in cart) {
        itemsPrice += cart[id].price * cart[id].qty;
    }
    if (itemsPrice < 350 && itemsPrice > 0) {
        alert("Minimum order amount must be Rs. 350 to checkout. Please add more items to your cart!");
        return;
    }

    if (itemsPrice === 0) {
        alert("Your cart is empty!");
        return;
    }

    let message = "Hello Wadiya Khaba! I would like to place an order:\n\n";
    let totalPrice = 0;
    for (let id in cart) {
        let item = cart[id];
        let itemTotal = item.price * item.qty;
        totalPrice += itemTotal;
        message += `- ${item.qty}x ${item.name} (Rs. ${itemTotal})\n`;
    }

    let deliveryCharge = 0;
    if (totalPrice < 1000) {
        deliveryCharge = 150;
        message += `\nDelivery Charge: Rs. 150`;
    } else {
        message += `\nDelivery Charge: Free`;
    }
    let grandTotal = totalPrice + deliveryCharge;

    message += `\n*Grand Total: Rs. ${grandTotal}*\n\nPlease confirm my order.`;

    const encodedMsg = encodeURIComponent(message);
    const waLink = `https://wa.me/923701431247?text=${encodedMsg}`;
    window.open(waLink, '_blank');
}

// Search Logic: Real-time filtering
function searchMenu() {
    let filter = document.getElementById('menu-search').value.toLowerCase();
    let cards = document.querySelectorAll('.menu-item-card');
    let anyFound = false;

    cards.forEach(card => {
        let name = card.querySelector('h4').innerText.toLowerCase();
        if (name.includes(filter)) {
            card.style.display = "";
            anyFound = true;
        } else {
            card.style.display = "none";
        }
    });

    // Handle No Results Message
    let noResultDiv = document.getElementById('no-result-msg');
    if (!anyFound && filter !== "") {
        if (!noResultDiv) {
            noResultDiv = document.createElement('div');
            noResultDiv.id = 'no-result-msg';
            noResultDiv.className = 'no-result-msg';
            document.querySelector('#menu .container').appendChild(noResultDiv);
        }
        noResultDiv.style.display = 'block';
        noResultDiv.innerHTML = `
            <i class="fa-solid fa-face-frown-open"></i>
            <p>No products found for "<strong>${filter}</strong>"</p>
            <button class="btn-primary mt-4 notify-btn" onclick="notifyShopAction('${filter}')">Notify Shop to Add This!</button>
            <p id="notify-status" class="mt-2 text-muted" style="font-size: 0.9rem; display: none;"></p>
        `;
    } else if (noResultDiv) {
        noResultDiv.style.display = 'none';
    }
}

// On Enter / Form Submit Handler
function handleSearchSubmit() {
    let filter = document.getElementById('menu-search').value.toLowerCase();
    if (!filter) return;

    let anyFound = false;
    let cards = document.querySelectorAll('.menu-item-card');
    cards.forEach(card => {
        let name = card.querySelector('h4').innerText.toLowerCase();
        if (name.includes(filter)) {
            anyFound = true;
        }
    });

    if (!anyFound) {
        notifyShopAction(filter);
    } else {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }
}

// Background Email Notification via Web3Forms
async function notifyShopAction(query) {
    let notifyBtn = document.querySelector('.notify-btn');
    let statusText = document.getElementById('notify-status');

    if (notifyBtn) {
        notifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        notifyBtn.style.pointerEvents = 'none';
        notifyBtn.style.opacity = '0.7';
    }
    if (statusText) {
        statusText.style.display = 'block';
        statusText.innerText = "Please wait while we notify the shop...";
    }

    try {
        // Web3Forms works better with FormData objects in some setups
        const formData = new FormData();
        formData.append("access_key", "82b5298f-194f-4758-8423-8c64155af158");
        formData.append("subject", `New Request for Missing Menu Item: ${query}`);
        formData.append("from_name", "Wadiya Khaba Website (Customer Request)");
        formData.append("message", `A customer searched for an item on the website that is currently not on the menu.\n\nRequested Item: ${query}\nTime: ${new Date().toLocaleString()}`);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.status === 200) {
            // Success UI Update
            if (notifyBtn) {
                notifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Shop Notified Successfully!';
                notifyBtn.style.backgroundColor = '#25D366'; // Green success color
                notifyBtn.style.opacity = '1';
            }
            if (statusText) {
                statusText.innerText = "The owner will review your request soon. Thank you!";
                statusText.style.color = "#25D366";
            }
            showToast(`Request sent to shop! We will try to add "${query}" soon.`);
        } else {
            // Handle API Error
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Error sending notification:", error);

        // Error UI Update
        if (notifyBtn) {
            notifyBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error Sending Request';
            notifyBtn.style.backgroundColor = '#E74C3C'; // Red error color
            notifyBtn.style.opacity = '1';
            // Re-enable button so they can try again
            setTimeout(() => {
                notifyBtn.innerHTML = 'Try Again';
                notifyBtn.style.backgroundColor = 'var(--primary)';
                notifyBtn.style.pointerEvents = 'auto';
            }, 3000);
        }
        if (statusText) {
            statusText.innerText = "Failed to send notification. Please try again later.";
            statusText.style.color = "#E74C3C";
        }
        showToast(`There was an error communicating with the shop.`);
    }
}

// Animated Toast Utility
function showToast(message) {
    let toast = document.createElement("div");
    toast.className = "toast-message";
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 50);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
