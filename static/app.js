// ==========================================================
// JAJY JAYA VARAHI TOYS, KITCHEN WARE & RETURN GIFTS
// Hybrid Store Manager (Flask REST API + Vercel / LocalStorage Fallback)
// ==========================================================

const DEFAULT_PRODUCTS = [
    {
        id: 'toy-1',
        name: 'Glow-in-the-Dark Action Robot',
        category: 'toys',
        price: 499,
        pic: 'https://images.unsplash.com/photo-1531061836765-1590123a7b93?auto=format&fit=crop&q=80&w=400',
        comment: 'Interactive toy with movable joints and laser sound effects.'
    },
    {
        id: 'kitchen-1',
        name: 'Non-stick Premium Pan Set',
        category: 'kitchenware',
        price: 1899,
        pic: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400',
        comment: '3-piece durable granite coated cookware with induction base.'
    },
    {
        id: 'gift-1',
        name: 'Handcrafted Wooden Jewelry Box',
        category: 'return-gifts',
        price: 250,
        pic: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400',
        comment: 'Exquisite carving, ideal return gift for weddings and festivals.'
    },
    {
        id: 'toy-2',
        name: 'Magnetic Building Blocks (72 Pcs)',
        category: 'toys',
        price: 999,
        pic: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400',
        comment: 'Educational STEAM toy for kids aged 3 and above.'
    },
    {
        id: 'kitchen-2',
        name: 'Glass Spice Jar Set (12 Jars)',
        category: 'kitchenware',
        price: 650,
        pic: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=400',
        comment: 'Aesthetic air-tight wooden lids with personalized labels.'
    },
    {
        id: 'gift-2',
        name: 'Silver-plated Puja Thali',
        category: 'return-gifts',
        price: 380,
        pic: 'https://images.unsplash.com/photo-1609252918804-9544c771f28b?auto=format&fit=crop&q=80&w=400',
        comment: 'Intricate designs, includes tiny diya holder and agarbatti stand.'
    }
];

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
// 1. Particle Canvas System
// ==========================================
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const mouse = { x: null, y: null, radius: 100 };

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.3 - 0.15;
            this.speedY = Math.random() * 0.3 - 0.15;
            this.color = Math.random() > 0.6 ? 'rgba(255, 179, 0, 0.4)' : 'rgba(255, 85, 0, 0.3)';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > width) this.speedX *= -1;
            if (this.y < 0 || this.y > height) this.speedY *= -1;
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    let f = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * f * 1.2;
                    this.y -= (dy / dist) * f * 1.2;
                }
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function populate() {
        particlesArray = [];
        const count = Math.floor((width * height) / 12000);
        for (let i = 0; i < count; i++) particlesArray.push(new Particle());
    }
    function animate() {
        ctx.fillStyle = 'rgba(9, 9, 14, 0.15)';
        ctx.fillRect(0, 0, width, height);
        particlesArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    populate();
    animate();
}

// ==========================================
// 2. Load Products & Settings (Flask API + LocalStorage Fallback)
// ==========================================
async function loadStoreData() {
    try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('API route not available');
        products = await res.json();

        const sRes = await fetch('/api/settings');
        if (sRes.ok) {
            const settings = await sRes.json();
            discountRate = parseInt(settings.discount_rate || 0);
            discountBannerMsg = settings.discount_banner || '';
        }
    } catch (err) {
        // Fallback for Vercel / Static mode
        const localProds = localStorage.getItem('jajy_products');
        if (localProds) {
            products = JSON.parse(localProds);
        } else {
            products = [...DEFAULT_PRODUCTS];
            localStorage.setItem('jajy_products', JSON.stringify(products));
        }

        const storedRate = localStorage.getItem('jajy_discount_rate');
        discountRate = storedRate ? parseInt(storedRate) : 0;
        discountBannerMsg = localStorage.getItem('jajy_discount_banner') || '';
    }

    if (storeDiscountRate) storeDiscountRate.value = discountRate;
    if (discountRateVal) discountRateVal.textContent = `${discountRate}% OFF`;
    if (storeDiscountBanner) storeDiscountBanner.value = discountBannerMsg;

    updatePromoBanner();
    renderCatalog();
}

function saveLocalProducts() {
    localStorage.setItem('jajy_products', JSON.stringify(products));
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
// 3. Render Storefront Products
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
                    ? `<img src="${prod.pic}" alt="${prod.name}" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-box-open product-image-placeholder\\'></i>'">`
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
                    await fetch(`/api/products/${id}`, { method: 'DELETE' });
                } catch (err) {
                    console.log('Using local delete fallback');
                }
                
                products = products.filter(p => p.id !== id);
                saveLocalProducts();
                renderCatalog(getActiveCategory(), searchInput.value);
            });
        });
    }
}

function getActiveCategory() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
}

// ==========================================
// 4. Cart Management
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
// 5. Product Detail Modal
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
// 6. Admin Console
// ==========================================
function setupAdminConsole() {
    // Auth submit
    const handleAuth = async () => {
        const code = adminPasscode.value.trim().toLowerCase();
        
        // Direct Passcode Check (Case insensitive: admin123, admin, 1234)
        if (code === 'admin123' || code === 'admin' || code === '1234') {
            isAdmin = true;
            adminAuthSection.style.display = 'none';
            adminControlsSection.style.display = 'block';
            adminPasscode.value = '';
            renderCatalog(getActiveCategory(), searchInput.value);
            return;
        }

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: code })
            });
            const result = await res.json();
            if (result && result.success) {
                isAdmin = true;
                adminAuthSection.style.display = 'none';
                adminControlsSection.style.display = 'block';
                adminPasscode.value = '';
                renderCatalog(getActiveCategory(), searchInput.value);
            } else {
                alert('❌ Incorrect access code. Passcode is: admin123');
            }
        } catch {
            alert('❌ Incorrect access code. Passcode is: admin123');
        }
    };

    submitAuthBtn.addEventListener('click', handleAuth);
    adminPasscode.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleAuth();
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

    // Add product
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

        const newProd = {
            id: `prod-${Date.now()}`,
            name, category, price, pic: picUrl, comment
        };

        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProd)
            });
        } catch (err) {
            console.log('Using local add product fallback');
        }

        products.push(newProd);
        saveLocalProducts();
        renderCatalog(getActiveCategory(), searchInput.value);

        // Reset form
        newProdName.value = '';
        newProdPrice.value = '';
        newProdPic.value = '';
        newProdFile.value = '';
        newProdComment.value = '';
        uploadedImageBase64 = '';

        alert('✅ Product added to the storefront!');
    });

    // Discount slider preview
    storeDiscountRate.addEventListener('input', () => {
        discountRateVal.textContent = `${storeDiscountRate.value}% OFF`;
    });

    // Save settings
    saveSettingsBtn.addEventListener('click', async () => {
        discountRate = parseInt(storeDiscountRate.value);
        discountBannerMsg = storeDiscountBanner.value.trim();

        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discount_rate: discountRate,
                    discount_banner: discountBannerMsg
                })
            });
        } catch (err) {
            console.log('Using local settings save fallback');
        }

        localStorage.setItem('jajy_discount_rate', discountRate);
        localStorage.setItem('jajy_discount_banner', discountBannerMsg);

        updatePromoBanner();
        renderCatalog(getActiveCategory(), searchInput.value);
        updateCartUI();
        alert('✅ Store settings saved!');
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

    // Category filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCatalog(btn.getAttribute('data-category'), searchInput.value);
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

    // Load store data
    await loadStoreData();
});
