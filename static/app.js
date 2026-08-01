// ==========================================================
// JAJY JAYA VARAHI TOYS, KITCHEN WARE & RETURN GIFTS
// Flask Backend Edition — All data via REST API
// ==========================================================

let products = [];
let cart = [];
let isAdmin = false;
let discountRate = 0;
let discountBannerMsg = '';

// DOM Elements
const bodyEl = document.body;
const enterWorldBtn = document.getElementById('enter-world-btn');
const portalScreen = document.getElementById('portal-screen');
const productsContainer = document.getElementById('products-container');
const cartDrawer = document.getElementById('cart-drawer');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartBadge = document.querySelector('.cart-badge');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDiscountRow = document.getElementById('discount-summary-row');
const cartDiscountVal = document.getElementById('cart-discount');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');

// Discount Promo
const discountPromoBanner = document.getElementById('discount-promo-banner');
const discountBannerText = document.getElementById('discount-banner-text');

// Admin Elements
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminDrawer = document.getElementById('admin-drawer');
const adminCloseBtn = document.getElementById('admin-close-btn');
const adminAuthSection = document.getElementById('admin-auth-section');
const adminControlsSection = document.getElementById('admin-controls-section');
const submitAuthBtn = document.getElementById('submit-auth-btn');
const adminPasscode = document.getElementById('admin-passcode');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
const adminTabContents = document.querySelectorAll('.admin-tab-content');

// Forms & Inputs
const addProductForm = document.getElementById('add-product-form');
const newProdName = document.getElementById('new-prod-name');
const newProdCategory = document.getElementById('new-prod-category');
const newProdPrice = document.getElementById('new-prod-price');
const newProdPic = document.getElementById('new-prod-pic');
const newProdFile = document.getElementById('new-prod-file');
const newProdComment = document.getElementById('new-prod-comment');
const storeDiscountRate = document.getElementById('store-discount-rate');
const discountRateVal = document.getElementById('discount-rate-val');
const storeDiscountBanner = document.getElementById('store-discount-banner');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// Modal
const productModal = document.getElementById('product-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBodyContent = document.getElementById('modal-body-content');

// ==========================================
// 1. Liquid Physics & Viscous Blob Canvas
// ==========================================
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const mouse = { x: width / 2, y: height / 2, radius: 180 };

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class LiquidBlob {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 40 + 20;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.hueOffset = Math.random() * 20;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -50 || this.x > width + 50) this.vx *= -1;
            if (this.y < -50 || this.y > height + 50) this.vy *= -1;

            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            const style = getComputedStyle(document.documentElement);
            const hue = parseFloat(style.getPropertyValue('--hue-primary')) || 38;
            
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `hsla(${hue + this.hueOffset}, 90%, 60%, 0.15)`);
            grad.addColorStop(0.6, `hsla(${hue + this.hueOffset}, 80%, 50%, 0.05)`);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function populate() {
        particlesArray = [];
        const count = Math.floor((width * height) / 25000) + 12;
        for (let i = 0; i < count; i++) particlesArray.push(new LiquidBlob());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    populate();
    animate();
}

// ==========================================
// 2. Flask API Helpers
// ==========================================
async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function apiDelete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
}

// ==========================================
// 3. Load Products & Settings from Flask
// ==========================================
async function loadStoreData() {
    try {
        // Load products
        products = await apiGet('/api/products');

        // Load settings
        const settings = await apiGet('/api/settings');
        discountRate = parseInt(settings.discount_rate || 0);
        discountBannerMsg = settings.discount_banner || '';

        // Sync UI
        if (storeDiscountRate) storeDiscountRate.value = discountRate;
        if (discountRateVal) discountRateVal.textContent = `${discountRate}% OFF`;
        if (storeDiscountBanner) storeDiscountBanner.value = discountBannerMsg;

        updatePromoBanner();
        renderCatalog();
    } catch (err) {
        console.error('Failed to load store data:', err);
    }
}

function updatePromoBanner() {
    if (discountRate > 0) {
        discountPromoBanner.style.display = 'block';
        discountBannerText.textContent = discountBannerMsg ||
            `🔥 TODAY SPECIAL OFFER: ${discountRate}% DISCOUNT ON ALL ITEMS! 🔥`;
    } else {
        discountPromoBanner.style.display = 'none';
    }
}

// ==========================================
// 4. Render Storefront Products
// ==========================================
function renderCatalog(filteredCategory = 'all', searchQuery = '') {
    productsContainer.innerHTML = '';

    let displayList = products;
    if (filteredCategory !== 'all') {
        displayList = displayList.filter(p => p.category === filteredCategory);
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        displayList = displayList.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.comment && p.comment.toLowerCase().includes(q))
        );
    }

    if (displayList.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-cart-message" style="grid-column: 1 / -1">
                <i class="fa-solid fa-boxes-packing"></i>
                <p>No products found.</p>
            </div>`;
        return;
    }

    displayList.forEach(prod => {
        const hasDiscount = discountRate > 0;
        const originalPrice = prod.price;
        const currentPrice = hasDiscount
            ? Math.round(originalPrice * (1 - discountRate / 100))
            : originalPrice;

        const card = document.createElement('div');
        card.className = 'glass-card product-card';
        card.setAttribute('data-id', prod.id);

        card.innerHTML = `
            ${isAdmin ? `<div class="delete-product-overlay" data-id="${prod.id}" title="Remove Item"><i class="fa-solid fa-trash"></i></div>` : ''}
            <div class="product-image-container">
                ${prod.pic
                    ? `<img src="${prod.pic}" alt="${prod.name}" onerror="this.style.display='none'">`
                    : `<i class="fa-solid fa-box-open product-image-placeholder"></i>`}
            </div>
            <span class="product-tag">${prod.category.replace('-', ' ')}</span>
            <h3>${prod.name}</h3>
            <p class="product-desc">${prod.comment || 'Premium selected item.'}</p>
            <div class="product-footer">
                <div class="price-wrapper">
                    ${hasDiscount ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                    <span class="product-price">₹${currentPrice}</span>
                </div>
                <button class="btn btn-primary btn-add-cart" data-id="${prod.id}">
                    <i class="fa-solid fa-cart-plus"></i> Add
                </button>
            </div>`;

        // 3D tilt
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rX = ((y - rect.height / 2) / rect.height) * 10;
            const rY = ((rect.width / 2 - x) / rect.width) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });

        // Click → detail modal
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-cart') || e.target.closest('.delete-product-overlay')) return;
            openProductDetailModal(prod);
        });

        productsContainer.appendChild(card);
    });

    // Add to cart
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            const item = products.find(p => p.id === id);
            if (item) addToCart(item);
        });
    });

    // Admin delete
    if (isAdmin) {
        document.querySelectorAll('.delete-product-overlay').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (!confirm('Remove this product from the store?')) return;
                try {
                    await apiDelete(`/api/products/${id}`);
                    products = products.filter(p => p.id !== id);
                    renderCatalog(getActiveCategory(), searchInput.value);
                } catch (err) {
                    alert('Failed to delete product.');
                }
            });
        });
    }
}

function getActiveCategory() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
}

// ==========================================
// 5. Cart Management
// ==========================================
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    cartDrawer.classList.add('open');
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalQty;

    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your basket is empty.</p>
            </div>`;
    } else {
        cart.forEach(item => {
            const finalPrice = discountRate > 0
                ? Math.round(item.price * (1 - discountRate / 100))
                : item.price;
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name} (x${item.qty})</div>
                    <div class="cart-item-price">₹${finalPrice * item.qty}</div>
                </div>
                <button class="close-btn remove-cart-item" data-id="${item.id}">
                    <i class="fa-solid fa-trash-can" style="font-size:1rem;"></i>
                </button>`;
            cartItemsContainer.appendChild(row);
        });

        document.querySelectorAll('.remove-cart-item').forEach(btn => {
            btn.addEventListener('click', () => {
                cart = cart.filter(item => item.id !== btn.getAttribute('data-id'));
                updateCartUI();
            });
        });
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const savings = discountRate > 0 ? Math.round(subtotal * (discountRate / 100)) : 0;
    const total = subtotal - savings;

    cartSubtotal.textContent = `₹${subtotal}`;
    if (savings > 0) {
        cartDiscountRow.style.display = 'flex';
        cartDiscountVal.textContent = `-₹${savings}`;
    } else {
        cartDiscountRow.style.display = 'none';
    }
    cartTotal.textContent = `₹${total}`;
}

// ==========================================
// 6. Product Detail Modal
// ==========================================
function openProductDetailModal(prod) {
    const originalPrice = prod.price;
    const finalPrice = discountRate > 0
        ? Math.round(originalPrice * (1 - discountRate / 100))
        : originalPrice;

    modalBodyContent.innerHTML = `
        <div class="modal-visuals">
            ${prod.pic
                ? `<img src="${prod.pic}" alt="${prod.name}">`
                : `<i class="fa-solid fa-box-open product-image-placeholder"></i>`}
        </div>
        <div class="modal-details">
            <span class="product-tag">${prod.category.replace('-', ' ')}</span>
            <h2 class="modal-title">${prod.name}</h2>
            <div class="modal-price">
                ${discountRate > 0 ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:1rem;margin-right:0.5rem;">₹${originalPrice}</span>` : ''}
                ₹${finalPrice}
            </div>
            <p class="modal-desc">${prod.comment || 'No additional details provided.'}</p>
            <button class="btn btn-primary" id="modal-add-cart-btn" style="margin-top:1rem;">
                <i class="fa-solid fa-cart-shopping"></i> Add to Basket
            </button>
        </div>`;

    document.getElementById('modal-add-cart-btn').addEventListener('click', () => {
        addToCart(prod);
        productModal.classList.remove('open');
    });

    productModal.classList.add('open');
}

// ==========================================
// 7. Admin Console
// ==========================================
function setupAdminConsole() {
    // Auth submit
    submitAuthBtn.addEventListener('click', async () => {
        const code = adminPasscode.value;
        try {
            const result = await apiPost('/api/auth', { passcode: code });
            if (result.success) {
                isAdmin = true;
                adminAuthSection.style.display = 'none';
                adminControlsSection.style.display = 'block';
                adminPasscode.value = '';
                renderCatalog(getActiveCategory(), searchInput.value);
            } else {
                alert('❌ Incorrect access code. Try again.');
            }
        } catch {
            alert('❌ Authentication failed.');
        }
    });

    // Logout
    adminLogoutBtn.addEventListener('click', () => {
        isAdmin = false;
        adminControlsSection.style.display = 'none';
        adminAuthSection.style.display = 'block';
        renderCatalog(getActiveCategory(), searchInput.value);
    });

    // Tab switching
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // File upload → base64
    let uploadedImageBase64 = '';
    newProdFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageBase64 = event.target.result;
                newProdPic.value = '';
            };
            reader.readAsDataURL(file);
        }
    });

    // Add product to Flask API
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newProdName.value.trim();
        const category = newProdCategory.value;
        const price = parseFloat(newProdPrice.value);
        const comment = newProdComment.value.trim();
        let picUrl = newProdPic.value.trim() || uploadedImageBase64;

        if (!name || !price) {
            alert('Please fill in the required fields.');
            return;
        }

        try {
            const newProd = await apiPost('/api/products', {
                name, category, price, pic: picUrl, comment
            });
            products.push(newProd);
            renderCatalog(getActiveCategory(), searchInput.value);

            // Reset form
            newProdName.value = '';
            newProdPrice.value = '';
            newProdPic.value = '';
            newProdFile.value = '';
            newProdComment.value = '';
            uploadedImageBase64 = '';

            alert('✅ Product added to the storefront!');
        } catch {
            alert('❌ Failed to add product.');
        }
    });

    // Discount slider preview
    storeDiscountRate.addEventListener('input', () => {
        discountRateVal.textContent = `${storeDiscountRate.value}% OFF`;
    });

    // Save settings to Flask API
    saveSettingsBtn.addEventListener('click', async () => {
        discountRate = parseInt(storeDiscountRate.value);
        discountBannerMsg = storeDiscountBanner.value.trim();

        try {
            await apiPost('/api/settings', {
                discount_rate: discountRate,
                discount_banner: discountBannerMsg
            });
            updatePromoBanner();
            renderCatalog(getActiveCategory(), searchInput.value);
            updateCartUI();
            alert('✅ Store settings saved!');
        } catch {
            alert('❌ Failed to save settings.');
        }
    });
}

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    initParticles();

    // Portal entry
    enterWorldBtn.addEventListener('click', () => {
        bodyEl.classList.remove('portal-active');
        setTimeout(() => { portalScreen.style.display = 'none'; }, 1200);
    });

    // Category filters with Generative UI Adaptation
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            if (category === 'all') {
                document.body.removeAttribute('data-theme');
            } else {
                document.body.setAttribute('data-theme', category);
            }
            renderCatalog(category, searchInput.value);
        });
    });

    // Live search
    searchInput.addEventListener('input', (e) => {
        renderCatalog(getActiveCategory(), e.target.value);
    });

    // Cart open/close
    cartToggleBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
    cartCloseBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

    // Admin drawer open/close
    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        adminDrawer.classList.add('open');
    });
    adminCloseBtn.addEventListener('click', () => adminDrawer.classList.remove('open'));

    // Modal close
    modalCloseBtn.addEventListener('click', () => productModal.classList.remove('open'));
    modalOverlay.addEventListener('click', () => productModal.classList.remove('open'));

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) { alert('Basket is empty.'); return; }
        alert('📦 ORDER PLACED!\nThank you for shopping with Jajy Jaya Varahi.');
        cart = [];
        updateCartUI();
        cartDrawer.classList.remove('open');
    });

    // Admin console setup
    setupAdminConsole();

    // Load data from Flask server
    await loadStoreData();
});
