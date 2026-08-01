from flask import Flask, request, jsonify, render_template
import os
import uuid
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
ADMIN_PASSCODE = 'admin123'

# ─────────────────────────────────────────
# FIREBASE SETUP
# ─────────────────────────────────────────
KEY_PATH = os.path.join(os.path.dirname(__file__), 'firebase-key.json')
cred = credentials.Certificate(KEY_PATH)
firebase_admin.initialize_app(cred)

db = firestore.client()
products_ref = db.collection('products')
settings_ref = db.collection('settings').document('store')

def init_firebase_defaults():
    # Ensure settings document exists
    doc = settings_ref.get()
    if not doc.exists:
        settings_ref.set({
            'discount_rate': '0',
            'discount_banner': ''
        })

    # Seed products if empty
    docs = list(products_ref.limit(1).stream())
    if len(docs) == 0:
        seed_products = [
            {
                'id': 'toy-1',
                'name': 'Glow-in-the-Dark Action Robot',
                'category': 'toys',
                'price': 499.0,
                'pic': 'https://images.unsplash.com/photo-1531061836765-1590123a7b93?auto=format&fit=crop&q=80&w=400',
                'comment': 'Interactive toy with movable joints and laser sound effects.'
            },
            {
                'id': 'kitchen-1',
                'name': 'Non-stick Premium Pan Set',
                'category': 'kitchenware',
                'price': 1899.0,
                'pic': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400',
                'comment': '3-piece durable granite coated cookware with induction base.'
            },
            {
                'id': 'gift-1',
                'name': 'Handcrafted Wooden Jewelry Box',
                'category': 'return-gifts',
                'price': 250.0,
                'pic': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400',
                'comment': 'Exquisite carving, ideal return gift for weddings and festivals.'
            },
            {
                'id': 'toy-2',
                'name': 'Magnetic Building Blocks (72 Pcs)',
                'category': 'toys',
                'price': 999.0,
                'pic': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400',
                'comment': 'Educational STEAM toy for kids aged 3 and above.'
            },
            {
                'id': 'kitchen-2',
                'name': 'Glass Spice Jar Set (12 Jars)',
                'category': 'kitchenware',
                'price': 650.0,
                'pic': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=400',
                'comment': 'Aesthetic air-tight wooden lids with personalized labels.'
            },
            {
                'id': 'gift-2',
                'name': 'Silver-plated Puja Thali',
                'category': 'return-gifts',
                'price': 380.0,
                'pic': 'https://images.unsplash.com/photo-1609252918804-9544c771f28b?auto=format&fit=crop&q=80&w=400',
                'comment': 'Intricate designs, includes tiny diya holder and agarbatti stand.'
            }
        ]
        for p in seed_products:
            products_ref.document(p['id']).set(p)

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

# ── Admin Auth ──────────────────────────
@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.get_json()
    if data and data.get('passcode') == ADMIN_PASSCODE:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Invalid passcode'}), 401

# ── Products ────────────────────────────
@app.route('/api/products', methods=['GET'])
def get_products():
    docs = products_ref.stream()
    prods = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        prods.append(d)
    return jsonify(prods)

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()

    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    price = data.get('price')
    pic = data.get('pic', '')
    comment = data.get('comment', '')

    if not name or not category or price is None:
        return jsonify({'error': 'Missing required fields'}), 400

    product_id = f"prod-{uuid.uuid4().hex[:8]}"

    prod_data = {
        'id': product_id,
        'name': name,
        'category': category,
        'price': float(price),
        'pic': pic,
        'comment': comment
    }

    products_ref.document(product_id).set(prod_data)

    return jsonify(prod_data), 201

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    doc_ref = products_ref.document(product_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({'error': 'Product not found'}), 404

    doc_ref.delete()
    return jsonify({'success': True})

# ── Settings (Discounts) ────────────────
@app.route('/api/settings', methods=['GET'])
def get_settings():
    doc = settings_ref.get()
    if doc.exists:
        return jsonify(doc.to_dict())
    return jsonify({'discount_rate': '0', 'discount_banner': ''})

@app.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.get_json()
    settings_ref.set(data, merge=True)
    return jsonify({'success': True})

# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
if __name__ == '__main__':
    init_firebase_defaults()
    print("JAJY JAYA VARAHI Flask Server (Firebase Firestore) Running at http://localhost:5000")
    app.run(debug=True, port=5000)
