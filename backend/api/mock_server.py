from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load data
def load_json(filename):
    filepath = os.path.join('data', filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

customers = load_json('customers.json') or []
products = load_json('products.json') or []
inventory = load_json('inventory.json') or {}
promotions_data = load_json('promotions.json') or {}

# API Endpoints

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Mock API Server is running"})

# Customer APIs
@app.route('/api/customers/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    customer = next((c for c in customers if c['customer_id'] == customer_id), None)
    if customer:
        return jsonify(customer)
    return jsonify({"error": "Customer not found"}), 404

@app.route('/api/customers', methods=['GET'])
def get_all_customers():
    return jsonify(customers)

# Product APIs
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search', '').lower()
    
    filtered_products = products
    
    if category:
        filtered_products = [p for p in filtered_products if p['category'] == category]
    
    if search:
        filtered_products = [p for p in filtered_products 
                           if search in p['name'].lower() or search in p['description'].lower()]
    
    return jsonify(filtered_products)

@app.route('/api/products/<sku>', methods=['GET'])
def get_product(sku):
    product = next((p for p in products if p['sku'] == sku), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

# Inventory APIs
@app.route('/api/inventory/<sku>', methods=['GET'])
def get_inventory(sku):
    if sku in inventory:
        return jsonify(inventory[sku])
    return jsonify({"error": "Inventory not found"}), 404

@app.route('/api/inventory/check', methods=['POST'])
def check_inventory():
    data = request.json
    sku = data.get('sku')
    location = data.get('location')
    quantity = data.get('quantity', 1)
    
    if sku not in inventory:
        return jsonify({"available": False, "message": "Product not found"})
    
    inv = inventory[sku]
    
    # Check store stock
    if location and location in inv['store_stock']:
        available = inv['store_stock'][location] >= quantity
        return jsonify({
            "available": available,
            "quantity": inv['store_stock'][location],
            "location": location,
            "type": "store"
        })
    
    # Check warehouse stock
    total_warehouse = sum(inv['warehouse_stock'].values())
    available = total_warehouse >= quantity
    
    return jsonify({
        "available": available,
        "quantity": total_warehouse,
        "location": "warehouse",
        "type": "warehouse"
    })

# Payment APIs
@app.route('/api/payment/process', methods=['POST'])
def process_payment():
    data = request.json
    amount = data.get('amount')
    method = data.get('method')
    card_number = data.get('card_number', '')
    
    # Simulate payment processing
    # 10% chance of failure for testing
    if random.random() < 0.1:
        return jsonify({
            "success": False,
            "transaction_id": None,
            "message": "Payment declined. Please try another payment method.",
            "error_code": "DECLINED"
        }), 400
    
    # Successful payment
    transaction_id = f"TXN{random.randint(100000, 999999)}"
    return jsonify({
        "success": True,
        "transaction_id": transaction_id,
        "amount": amount,
        "method": method,
        "timestamp": datetime.now().isoformat(),
        "message": "Payment processed successfully"
    })

@app.route('/api/payment/retry', methods=['POST'])
def retry_payment():
    data = request.json
    # Retry has better success rate
    if random.random() < 0.05:
        return jsonify({
            "success": False,
            "message": "Payment retry failed"
        }), 400
    
    transaction_id = f"TXN{random.randint(100000, 999999)}"
    return jsonify({
        "success": True,
        "transaction_id": transaction_id,
        "message": "Payment retry successful"
    })

# Promotions APIs
@app.route('/api/promotions', methods=['GET'])
def get_promotions():
    return jsonify(promotions_data.get('promotions', []))

@app.route('/api/promotions/apply', methods=['POST'])
def apply_promotion():
    data = request.json
    promo_code = data.get('promo_code')
    cart_total = data.get('cart_total')
    categories = data.get('categories', [])
    
    # Find promotion
    promos = promotions_data.get('promotions', [])
    promo = next((p for p in promos if p['promo_id'] == promo_code and p['active']), None)
    
    if not promo:
        # Check coupons
        coupons = promotions_data.get('coupons', [])
        coupon = next((c for c in coupons if c['code'] == promo_code and c['active']), None)
        if coupon:
            promo = coupon
        else:
            return jsonify({"valid": False, "message": "Invalid promo code"}), 400
    
    # Validate
    if cart_total < promo.get('min_purchase', 0):
        return jsonify({
            "valid": False,
            "message": f"Minimum purchase of ₹{promo['min_purchase']} required"
        }), 400
    
    # Calculate discount
    if promo['type'] == 'percentage':
        discount = cart_total * (promo['value'] / 100)
    else:
        discount = promo['value']
    
    return jsonify({
        "valid": True,
        "promo_code": promo_code,
        "discount": discount,
        "description": promo['description']
    })

# Loyalty APIs
@app.route('/api/loyalty/<customer_id>', methods=['GET'])
def get_loyalty_points(customer_id):
    customer = next((c for c in customers if c['customer_id'] == customer_id), None)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    
    tier = customer.get('loyalty_tier', 'Bronze')
    points = customer.get('loyalty_points', 0)
    tier_info = promotions_data.get('loyalty_tiers', {}).get(tier, {})
    
    return jsonify({
        "customer_id": customer_id,
        "points": points,
        "tier": tier,
        "tier_benefits": tier_info
    })

@app.route('/api/loyalty/redeem', methods=['POST'])
def redeem_points():
    data = request.json
    customer_id = data.get('customer_id')
    points = data.get('points')
    
    customer = next((c for c in customers if c['customer_id'] == customer_id), None)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    
    available_points = customer.get('loyalty_points', 0)
    if points > available_points:
        return jsonify({
            "success": False,
            "message": "Insufficient loyalty points"
        }), 400
    
    # 1 point = ₹1 discount
    discount = points
    
    return jsonify({
        "success": True,
        "points_redeemed": points,
        "discount": discount,
        "remaining_points": available_points - points
    })

# Order/Fulfillment APIs
@app.route('/api/orders/create', methods=['POST'])
def create_order():
    data = request.json
    
    order_id = f"ORD{random.randint(100000, 999999)}"
    
    return jsonify({
        "success": True,
        "order_id": order_id,
        "order_details": data,
        "estimated_delivery": "3-5 business days",
        "tracking_number": f"TRK{random.randint(100000, 999999)}"
    })

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    return jsonify({
        "order_id": order_id,
        "status": "Processing",
        "estimated_delivery": "3-5 business days"
    })

# POS Integration (In-store)
@app.route('/api/pos/scan', methods=['POST'])
def pos_scan():
    data = request.json
    barcode = data.get('barcode')
    
    # Map barcode to SKU (simplified)
    sku = barcode
    product = next((p for p in products if p['sku'] == sku), None)
    
    if product:
        return jsonify({
            "success": True,
            "product": product
        })
    
    return jsonify({
        "success": False,
        "message": "Product not found"
    }), 404

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    print("🚀 Starting Mock API Server...")
    print(f"📍 Server running on port {port}")
    print("\nAvailable endpoints:")
    print("  - GET  /api/health")
    print("  - GET  /api/customers")
    print("  - GET  /api/products")
    print("  - GET  /api/inventory/<sku>")
    print("  - POST /api/payment/process")
    print("  - GET  /api/promotions")
    print("  - GET  /api/loyalty/<customer_id>")
    print("  - POST /api/orders/create")
    app.run(host='0.0.0.0', port=port, debug=False)
