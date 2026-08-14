// ==========================================================
// JAJY JAYA VARAHI TOYS, KITCHEN WARE & RETURN GIFTS
// Firebase Firestore Real-Time Bookings & Store Manager
// ==========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
    getFirestore, collection, doc, addDoc, getDoc, getDocs, 
    onSnapshot, updateDoc, serverTimestamp, query, where, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKRtiu8nlPrRcqb3uimngw3FRSe0wnEtM",
  authDomain: "varahi-store.firebaseapp.com",
  projectId: "varahi-store",
  storageBucket: "varahi-store.firebasestorage.app",
  messagingSenderId: "714898781731",
  appId: "1:714898781731:web:71bb955317f9e234ce6396",
  measurementId: "G-NZXWGGMHHD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Seed Default Products if Firestore is empty
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

// App Global State
let products = [];
let cart = [];
let isAdmin = false;
let discountRate = 0;
let discountBannerMsg = '';
let currentUserId = null;
let lastCreatedBookingData = null;

// Real-Time Listeners Unsubscribe Handlers
let myBookingsUnsub = null;
let ownerBookingsUnsub = null;

// DOM Elements
const bodyEl = document.body;
const enterWorldBtn = document.getElementById('enter-world-btn');
const portalScreen = document.getElementById('portal-screen');
const productsContainer = document.getElementById('products-container');

// Cart Elements
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

// Discount Promo Banner
const discountPromoBanner = document.getElementById('discount-promo-banner');
const discountBannerText = document.getElementById('discount-banner-text');

// My Bookings Drawer Elements
const myBookingsBtn = document.getElementById('my-bookings-btn');
const myBookingsDrawer = document.getElementById('my-bookings-drawer');
const myBookingsCloseBtn = document.getElementById('my-bookings-close-btn');
const myBookingsListContainer = document.getElementById('my-bookings-list-container');

// Checkout Details Form Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const checkoutModalCloseBtn = document.getElementById('checkout-modal-close-btn');
const checkoutDetailsForm = document.getElementById('checkout-details-form');
const checkoutModalTotal = document.getElementById('checkout-modal-total');
const confirmBookingBtn = document.getElementById('confirm-booking-btn');

// Booking Success Popup Modal Elements
const bookingSuccessModal = document.getElementById('booking-success-modal');
const successOverlay = document.getElementById('success-overlay');
const successBookingId = document.getElementById('success-booking-id');
const successViewBookingBtn = document.getElementById('success-view-booking-btn');
const successMyBookingsBtn = document.getElementById('success-my-bookings-btn');
const successContinueBtn = document.getElementById('success-continue-btn');

// Booking Details View Modal Elements
const bookingDetailsModal = document.getElementById('booking-details-modal');
const bookingDetailsOverlay = document.getElementById('booking-details-overlay');
const bookingDetailsCloseBtn = document.getElementById('booking-details-close-btn');
const bookingDetailsContent = document.getElementById('booking-details-content');

// Admin Console Elements
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
const ownerBookingsListContainer = document.getElementById('owner-bookings-list-container');

// Admin Forms
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

// Product Detail Modal
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
// 2. Firebase Customer Auth & Initialization
// ==========================================
async function initCustomerAuth() {
    let savedUid = localStorage.getItem('jajy_cust_uid');
    if (!savedUid) {
        savedUid = 'cust_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('jajy_cust_uid', savedUid);
    }
    currentUserId = savedUid;

    try {
        await signInAnonymously(auth);
    } catch (e) {
        console.log("Anonymous Auth status:", e.message);
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            localStorage.setItem('jajy_cust_uid', user.uid);
        }
        listenToMyBookings();
    });
}

// ==========================================
// 3. Load Store Products & Settings from Firestore
// ==========================================
async function loadStoreData() {
    try {
        // Load products
        const productsSnap = await getDocs(collection(db, "products"));
        if (!productsSnap.empty) {
            products = [];
            productsSnap.forEach(docSnap => {
                products.push({ id: docSnap.id, ...docSnap.data() });
            });
        } else {
            // Seed defaults into Firestore
            products = [...DEFAULT_PRODUCTS];
            for (const p of DEFAULT_PRODUCTS) {
                await addDoc(collection(db, "products"), p);
            }
        }
    } catch (err) {
        console.log("Firestore products fallback to local:", err);
        const localProds = localStorage.getItem('jajy_products');
        products = localProds ? JSON.parse(localProds) : [...DEFAULT_PRODUCTS];
    }

    try {
        const settingsSnap = await getDoc(doc(db, "settings", "store"));
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            discountRate = parseInt(data.discount_rate || 0);
            discountBannerMsg = data.discount_banner || '';
        }
    } catch (err) {
        discountRate = parseInt(localStorage.getItem('jajy_discount_rate') || 0);
        discountBannerMsg = localStorage.getItem('jajy_discount_banner') || '';
    }

    if (storeDiscountRate) storeDiscountRate.value = discountRate;
    if (discountRateVal) discountRateVal.textContent = `${discountRate}% OFF`;
    if (storeDiscountBanner) storeDiscountBanner.value = discountBannerMsg;

    updatePromoBanner();
    renderCatalog();
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
// 4. Render Products Catalogue
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

    // Admin delete product
    if (isAdmin) {
        document.querySelectorAll('.delete-product-overlay').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (!confirm('Remove this product from the store?')) return;
                
                try {
                    await fetch(`/api/products/${id}`, { method: 'DELETE' });
                } catch (err) {
                    console.log('Using Firestore / local delete');
                }
                
                products = products.filter(p => p.id !== id);
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
// 7. CHECKOUT & FIRESTORE BOOKINGS CREATION
// ==========================================
function setupCheckoutFlow() {
    // Cart "Place Order" button opens Checkout Customer Details Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Basket is empty.');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const savings = discountRate > 0 ? Math.round(subtotal * (discountRate / 100)) : 0;
        const total = subtotal - savings;

        checkoutModalTotal.textContent = `₹${total}`;
        checkoutModal.classList.add('open');
    });

    checkoutModalCloseBtn.addEventListener('click', () => checkoutModal.classList.remove('open'));
    checkoutOverlay.addEventListener('click', () => checkoutModal.classList.remove('open'));

    // Checkout Details Form Submission
    checkoutDetailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const email = document.getElementById('cust-email').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const city = document.getElementById('cust-city').value.trim();
        const state = document.getElementById('cust-state').value.trim();
        const pincode = document.getElementById('cust-pincode').value.trim();

        if (!name || !phone || !address || !city || !state || !pincode) {
            alert('Please complete all required fields (*).');
            return;
        }

        // Prevent Duplicate Bookings - Disable Button
        confirmBookingBtn.disabled = true;
        confirmBookingBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Booking...';

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const discount = discountRate > 0 ? Math.round(subtotal * (discountRate / 100)) : 0;
        const totalAmount = subtotal - discount;

        // Generate customer-friendly Booking ID (e.g. JV-20260814-AB12)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const formattedBookingId = `JV-${dateStr}-${randomCode}`;

        // Create Item Snapshots
        const itemsSnapshot = cart.map(item => {
            const finalPrice = discountRate > 0 ? Math.round(item.price * (1 - discountRate / 100)) : item.price;
            return {
                productId: item.id,
                name: item.name,
                price: finalPrice,
                quantity: item.qty,
                image: item.pic || ''
            };
        });

        const bookingData = {
            bookingId: formattedBookingId,
            userId: currentUserId || 'guest',
            customer: {
                name,
                phone,
                email: email || '',
                address,
                city,
                state,
                pincode
            },
            items: itemsSnapshot,
            subtotal,
            discount,
            totalAmount,
            status: "Booked",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            // Write Booking Document to Firestore `bookings` Collection
            const docRef = await addDoc(collection(db, "bookings"), bookingData);
            lastCreatedBookingData = { id: docRef.id, ...bookingData, createdAt: new Date() };

            // SUCCESS FLOW
            cart = [];
            updateCartUI();
            checkoutModal.classList.remove('open');
            cartDrawer.classList.remove('open');

            // Reset Checkout Form
            checkoutDetailsForm.reset();

            // Display Success Popup with Booking ID
            successBookingId.textContent = formattedBookingId;
            bookingSuccessModal.classList.add('open');

        } catch (err) {
            console.error("Firestore booking write error:", err);
            alert("Unable to complete booking. Please try again.");
        } finally {
            // Re-enable button
            confirmBookingBtn.disabled = false;
            confirmBookingBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm & Book Order';
        }
    });

    // Success Popup Actions
    successViewBookingBtn.addEventListener('click', () => {
        bookingSuccessModal.classList.remove('open');
        if (lastCreatedBookingData) {
            openBookingDetailsModal(lastCreatedBookingData);
        }
    });

    successMyBookingsBtn.addEventListener('click', () => {
        bookingSuccessModal.classList.remove('open');
        myBookingsDrawer.classList.add('open');
    });

    successContinueBtn.addEventListener('click', () => {
        bookingSuccessModal.classList.remove('open');
    });

    successOverlay.addEventListener('click', () => {
        bookingSuccessModal.classList.remove('open');
    });
}

// ==========================================
// 8. REAL-TIME "MY BOOKINGS" CUSTOMER LISTENER
// ==========================================
function listenToMyBookings() {
    if (!currentUserId) return;

    if (myBookingsUnsub) myBookingsUnsub();

    myBookingsListContainer.innerHTML = `
        <div class="empty-cart-message">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading your bookings...</p>
        </div>`;

    const q = query(
        collection(db, "bookings"),
        where("userId", "==", currentUserId)
    );

    myBookingsUnsub = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            myBookingsListContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No bookings yet.</p>
                    <button class="btn btn-primary" id="start-shopping-btn" style="margin-top: 1rem;">
                        Start Shopping
                    </button>
                </div>`;
            const startShopBtn = document.getElementById('start-shopping-btn');
            if (startShopBtn) {
                startShopBtn.addEventListener('click', () => {
                    myBookingsDrawer.classList.remove('open');
                });
            }
            return;
        }

        const userBookings = [];
        snapshot.forEach(docSnap => {
            userBookings.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Client-side sort by createdAt desc
        userBookings.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
            return timeB - timeA;
        });

        renderMyBookingsList(userBookings);
    }, (error) => {
        console.error("My Bookings listener error:", error);
        myBookingsListContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ff3232;"></i>
                <p>Unable to load your bookings. Please try again.</p>
            </div>`;
    });
}

function renderMyBookingsList(bookingsList) {
    myBookingsListContainer.innerHTML = '';
    bookingsList.forEach(b => {
        const dateFormatted = b.createdAt?.toDate 
            ? b.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recent');

        const itemsSummaryText = b.items.map(i => `${i.name} × ${i.quantity}`).join(', ');
        const statusClass = `status-${(b.status || 'booked').toLowerCase()}`;

        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div class="booking-card-header">
                <div>
                    <div class="booking-ref-id">${b.bookingId || 'JV-BOOKING'}</div>
                    <div class="booking-date-text">Date: ${dateFormatted}</div>
                </div>
                <span class="status-badge ${statusClass}">${b.status || 'Booked'}</span>
            </div>
            <div class="booking-items-summary">
                <strong>Items:</strong> ${itemsSummaryText}
            </div>
            <div class="booking-card-footer">
                <div>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Total Amount:</span>
                    <div class="booking-total-price">₹${b.totalAmount}</div>
                </div>
                <button class="btn btn-secondary btn-view-booking-details" data-id="${b.id}">
                    <i class="fa-solid fa-circle-info"></i> View Details
                </button>
            </div>
        `;

        card.querySelector('.btn-view-booking-details').addEventListener('click', () => {
            openBookingDetailsModal(b);
        });

        myBookingsListContainer.appendChild(card);
    });
}

// ==========================================
// 9. BOOKING DETAILS MODAL
// ==========================================
function openBookingDetailsModal(b) {
    const dateFormatted = b.createdAt?.toDate 
        ? b.createdAt.toDate().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : (b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Recent');

    const statusClass = `status-${(b.status || 'booked').toLowerCase()}`;

    let itemsHtml = '';
    b.items.forEach(item => {
        itemsHtml += `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
                <div style="width: 55px; height: 55px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-box" style="color:var(--text-muted); font-size:1.4rem;"></i>`}
                </div>
                <div style="flex-grow: 1;">
                    <div style="font-weight: 700; color: #fff;">${item.name}</div>
                    <div style="font-size: 0.88rem; color: var(--text-muted);">₹${item.price} × ${item.quantity}</div>
                </div>
                <div style="font-weight: 800; color: var(--primary); font-family: var(--font-sans);">
                    ₹${item.price * item.quantity}
                </div>
            </div>
        `;
    });

    bookingDetailsContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
                <h2 style="font-family: var(--font-display); color: var(--primary); font-size: 1.6rem; margin-top: 2px;">${b.bookingId}</h2>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Booked on: ${dateFormatted}</div>
            </div>
            <span class="status-badge ${statusClass}" style="font-size: 0.9rem; padding: 0.4rem 1rem;">${b.status}</span>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-boxes-packing" style="color: var(--primary);"></i> Booked Items
            </h4>
            ${itemsHtml}
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 1.2rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
            <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> Customer & Delivery Information
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.92rem; color: var(--text-main);">
                <div><strong>Customer Name:</strong> ${b.customer.name}</div>
                <div><strong>Phone Number:</strong> ${b.customer.phone}</div>
                ${b.customer.email ? `<div><strong>Email:</strong> ${b.customer.email}</div>` : ''}
                <div><strong>City / State:</strong> ${b.customer.city}, ${b.customer.state}</div>
                <div><strong>Pincode:</strong> ${b.customer.pincode}</div>
            </div>
            <div style="margin-top: 0.8rem; font-size: 0.92rem;">
                <strong>Full Address:</strong> ${b.customer.address}
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.4rem; background: rgba(255,179,0,0.05); padding: 1.2rem; border-radius: 8px; border: 1px dashed var(--primary);">
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-muted);">
                <span>Subtotal:</span>
                <span>₹${b.subtotal}</span>
            </div>
            ${b.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--secondary);">
                <span>Discount Applied:</span>
                <span>-₹${b.discount}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.6rem; margin-top: 0.4rem;">
                <span>Total Amount:</span>
                <span style="color: var(--primary);">₹${b.totalAmount}</span>
            </div>
        </div>
    `;

    bookingDetailsModal.classList.add('open');
}

// ==========================================
// 10. REAL-TIME OWNER CONSOLE BOOKINGS LISTENER & STATUS UPDATES
// ==========================================
function listenToOwnerBookings() {
    if (ownerBookingsUnsub) ownerBookingsUnsub();

    ownerBookingsListContainer.innerHTML = `
        <div class="empty-cart-message">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading customer bookings...</p>
        </div>`;

    const q = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
    );

    ownerBookingsUnsub = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            ownerBookingsListContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No customer bookings recorded yet.</p>
                </div>`;
            const countBadge = document.getElementById('owner-booking-count');
            if (countBadge) countBadge.textContent = '0';
            return;
        }

        const allBookings = [];
        snapshot.forEach(docSnap => {
            allBookings.push({ id: docSnap.id, ...docSnap.data() });
        });

        const countBadge = document.getElementById('owner-booking-count');
        if (countBadge) countBadge.textContent = allBookings.length;

        renderOwnerBookingsList(allBookings);
    }, (error) => {
        console.error("Owner Bookings listener error:", error);
        ownerBookingsListContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ff3232;"></i>
                <p>Unable to load customer bookings.</p>
            </div>`;
    });
}

function renderOwnerBookingsList(allBookings) {
    ownerBookingsListContainer.innerHTML = '';

    allBookings.forEach(b => {
        const dateFormatted = b.createdAt?.toDate 
            ? b.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Recent';

        const itemsSummaryText = b.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

        const card = document.createElement('div');
        card.className = 'booking-card';
        card.style.marginBottom = '1.2rem';
        card.innerHTML = `
            <div class="booking-card-header">
                <div>
                    <div class="booking-ref-id">${b.bookingId}</div>
                    <div class="booking-date-text">Customer: <strong>${b.customer.name}</strong> (${b.customer.phone}) | ${dateFormatted}</div>
                </div>
                <select class="owner-status-select" data-id="${b.id}">
                    <option value="Booked" ${b.status === 'Booked' ? 'selected' : ''}>Booked</option>
                    <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Packed" ${b.status === 'Packed' ? 'selected' : ''}>Packed</option>
                    <option value="Shipped" ${b.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${b.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="booking-items-summary">
                <strong>Items:</strong> ${itemsSummaryText}
            </div>
            <div class="booking-card-footer">
                <div class="booking-total-price">₹${b.totalAmount}</div>
                <button class="btn btn-secondary btn-owner-view-details" data-id="${b.id}">
                    <i class="fa-solid fa-eye"></i> View Full Details
                </button>
            </div>
        `;

        // Owner Status Update Dropdown Listener
        const selectEl = card.querySelector('.owner-status-select');
        selectEl.addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            try {
                await updateDoc(doc(db, "bookings", b.id), {
                    status: newStatus,
                    updatedAt: serverTimestamp()
                });
                console.log(`Booking ${b.bookingId} status updated to ${newStatus}`);
            } catch (err) {
                console.error("Status update error:", err);
                alert("Failed to update status.");
            }
        });

        card.querySelector('.btn-owner-view-details').addEventListener('click', () => {
            openBookingDetailsModal(b);
        });

        ownerBookingsListContainer.appendChild(card);
    });
}

// ==========================================
// 11. ADMIN CONSOLE & TAB SWITCHING
// ==========================================
function setupAdminConsole() {
    const handleAuth = async () => {
        const code = adminPasscode.value.trim().toLowerCase();
        
        if (code === 'admin123' || code === 'admin' || code === '1234') {
            isAdmin = true;
            adminAuthSection.style.display = 'none';
            adminControlsSection.style.display = 'block';
            adminPasscode.value = '';
            renderCatalog(getActiveCategory(), searchInput.value);
            listenToOwnerBookings();
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
                listenToOwnerBookings();
            } else {
                alert('❌ Incorrect access code.');
            }
        } catch {
            alert('❌ Incorrect access code.');
        }
    };

    submitAuthBtn.addEventListener('click', handleAuth);
    adminPasscode.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleAuth();
    });

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

    // Add Product
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
            name, category, price, pic: picUrl, comment
        };

        try {
            const docRef = await addDoc(collection(db, "products"), newProd);
            newProd.id = docRef.id;
        } catch (err) {
            newProd.id = `prod-${Date.now()}`;
        }

        products.push(newProd);
        renderCatalog(getActiveCategory(), searchInput.value);

        newProdName.value = '';
        newProdPrice.value = '';
        newProdPic.value = '';
        newProdFile.value = '';
        newProdComment.value = '';
        uploadedImageBase64 = '';

        alert('✅ Product launched to storefront!');
    });

    // Discount slider
    storeDiscountRate.addEventListener('input', () => {
        discountRateVal.textContent = `${storeDiscountRate.value}% OFF`;
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', async () => {
        discountRate = parseInt(storeDiscountRate.value);
        discountBannerMsg = storeDiscountBanner.value.trim();

        try {
            await updateDoc(doc(db, "settings", "store"), {
                discount_rate: discountRate,
                discount_banner: discountBannerMsg
            });
        } catch (err) {
            console.log("Local settings fallback");
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
// INITIALIZE APPLICATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    initParticles();

    // Portal entrance
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

    // Drawers triggers
    cartToggleBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
    cartCloseBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

    myBookingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        myBookingsDrawer.classList.add('open');
    });
    myBookingsCloseBtn.addEventListener('click', () => myBookingsDrawer.classList.remove('open'));

    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        adminDrawer.classList.add('open');
    });
    adminCloseBtn.addEventListener('click', () => adminDrawer.classList.remove('open'));

    // Modals Close triggers
    modalCloseBtn.addEventListener('click', () => productModal.classList.remove('open'));
    modalOverlay.addEventListener('click', () => productModal.classList.remove('open'));

    bookingDetailsCloseBtn.addEventListener('click', () => bookingDetailsModal.classList.remove('open'));
    bookingDetailsOverlay.addEventListener('click', () => bookingDetailsModal.classList.remove('open'));

    // Setup Admin Console & Checkout Flow
    setupAdminConsole();
    setupCheckoutFlow();

    // Initialize Auth & Load Store Data
    await initCustomerAuth();
    await loadStoreData();
});
