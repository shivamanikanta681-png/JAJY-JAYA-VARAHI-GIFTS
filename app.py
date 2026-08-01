from flask import Flask, request, jsonify, render_template
import sqlite3
import os
import base64
import uuid

app = Flask(__name__)
DB_PATH = 'database.db'
ADMIN_PASSCODE = 'admin123'

# ─────────────────────────────────────────
# DATABASE SETUP
# ─────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Products table
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            pic TEXT,
            comment TEXT
        )
    ''')

    # Settings table
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    # Default settings
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('discount_rate', '0')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('discount_banner', '')")

    # Seed products if table is empty
    c.execute("SELECT COUNT(*) FROM products")
    count = c.fetchone()[0]
    if count == 0:
        seed_products = [
            ('toy-1', 'Glow-in-the-Dark Action Robot', 'toys', 499,
             'https://images.unsplash.com/photo-1531061836765-1590123a7b93?auto=format&fit=crop&q=80&w=400',
             'Interactive toy with movable joints and laser sound effects.'),
            ('kitchen-1', 'Non-stick Premium Pan Set', 'kitchenware', 1899,
             'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=400',
             '3-piece durable granite coated cookware with induction base.'),
            ('gift-1', 'Handcrafted Wooden Jewelry Box', 'return-gifts', 250,
             'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400',
             'Exquisite carving, ideal return gift for weddings and festivals.'),
            ('toy-2', 'Magnetic Building Blocks (72 Pcs)', 'toys', 999,
             'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=400',
             'Educational STEAM toy for kids aged 3 and above.'),
            ('kitchen-2', 'Glass Spice Jar Set (12 Jars)', 'kitchenware', 650,
             'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=400',
             'Aesthetic air-tight wooden lids with personalized labels.'),
            ('gift-2', 'Silver-plated Puja Thali', 'return-gifts', 380,
             'https://images.unsplash.com/photo-1609252918804-9544c771f28b?auto=format&fit=crop&q=80&w=400',
             'Intricate designs, includes tiny diya holder and agarbatti stand.'),
        ]
        c.executemany(
            "INSERT INTO products (id, name, category, price, pic, comment) VALUES (?, ?, ?, ?, ?, ?)",
            seed_products
        )

    conn.commit()
    conn.close()

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
    conn = get_db()
    products = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    return jsonify([dict(p) for p in products])


@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json()

    # Validate required fields
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    price = data.get('price')
    pic = data.get('pic', '')
    comment = data.get('comment', '')

    if not name or not category or price is None:
        return jsonify({'error': 'Missing required fields'}), 400

    product_id = f"prod-{uuid.uuid4().hex[:8]}"

    conn = get_db()
    conn.execute(
        "INSERT INTO products (id, name, category, price, pic, comment) VALUES (?, ?, ?, ?, ?, ?)",
        (product_id, name, category, float(price), pic, comment)
    )
    conn.commit()
    conn.close()

    return jsonify({
        'id': product_id, 'name': name, 'category': category,
        'price': float(price), 'pic': pic, 'comment': comment
    }), 201


@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db()
    result = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'success': True})


# ── Settings (Discounts) ────────────────
@app.route('/api/settings', methods=['GET'])
def get_settings():
    conn = get_db()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    return jsonify({r['key']: r['value'] for r in rows})


@app.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.get_json()
    conn = get_db()
    for key, value in data.items():
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, str(value))
        )
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    print("JAJY JAYA VARAHI Flask Server Running at http://localhost:5000")
    app.run(debug=True, port=5000)
