"""
Backend Main Server
Combines Data API and Sales Agent API
"""
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from flask_cors import CORS, cross_origin
import sys
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import API server
from api.mock_server import api_bp
from werkzeug.middleware.dispatcher import DispatcherMiddleware

# Import Sales Agent routes
from agents.sales_agent import SalesAgent
from session_manager import SessionManager

app = Flask(__name__)
# Enable CORS for all domains on all routes (Fixes Vercel/Render communication)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register the Data API Blueprint
# This makes the mock server routes available on the main app
app.register_blueprint(api_bp)

# Initialize Session Manager (Supports SQLite for local, Postgres for Render)
session_manager = SessionManager()

@app.errorhandler(Exception)
def handle_exception(e):
    # pass through HTTP errors
    if isinstance(e, HTTPException):
        return e
    # now you're handling non-HTTP exceptions only
    return jsonify(error=str(e), success=False), 500

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Backend server is running"})

# Sales Agent Routes
@app.route('/api/start_session', methods=['POST'])
def start_session():
    data = request.json
    customer_id = data.get('customer_id', 'CUST001')
    channel = data.get('channel', 'web')
    
    # Use a stable UUID per session to support channel switching
    session_id = str(uuid.uuid4())
    
    # Use localhost for internal API calls to avoid external network roundtrips and deadlocks
    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    
    sales_agent = SalesAgent(api_base_url=host_url)
    greeting = sales_agent.start_session(customer_id, channel)
    
    # Save session state to DB
    session_manager.save_session(
        session_id, 
        customer_id, 
        channel, 
        sales_agent.get_state()
    )
    
    return jsonify({
        "success": True,
        "session_id": session_id,
        "message": greeting['message']
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')
    
    # Load session state
    state = session_manager.load_session(session_id)
    if not state:
        return jsonify({
            "success": False,
            "error": "Session not found"
        }), 404
    # Rehydrate agent
    # Use localhost for internal API calls
    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)
    
    try:
        response = sales_agent.handle_conversation(user_message)
    except Exception as e:
        print(f"Error in handle_conversation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    response = sales_agent.handle_conversation(user_message)
    
    # Save updated state
    session_manager.save_session(
        session_id, 
        sales_agent.current_session.get('customer_id'), 
        sales_agent.current_session.get('channel'), 
        sales_agent.get_state()
    )
    
    return jsonify(response)

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    session_id = data.get('session_id')
    sku = data.get('sku')
    quantity = int(data.get('quantity', 1))

    # Load session state
    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404
    if not sku:
        return jsonify({"success": False, "error": "Missing SKU"}), 400

    # Rehydrate agent
    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    result = sales_agent.add_item_to_cart(sku, quantity)
    
    # Save updated state
    session_manager.save_session(
        session_id, 
        sales_agent.current_session.get('customer_id'), 
        sales_agent.current_session.get('channel'), 
        sales_agent.get_state()
    )
    
@app.route('/api/cart', methods=['GET'])
def get_cart():
    session_id = request.args.get('session_id')
    
    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404

    # Rehydrate agent
    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)
    
    cart = sales_agent.current_session.get('cart', [])ion.get('cart', [])
    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404

    # Rehydrate agent
    host_url = request.host_url.rstrip('/')
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)
    
    cart = sales_agent.current_session.get('cart', [])

    subtotal = sum((item.get('price', 0) * item.get('quantity', 1)) for item in cart)
    # Delivery rule: free over 1000 else 50
    delivery = 0 if subtotal > 1000 else (0 if subtotal == 0 else 50)

    ctx = sales_agent.current_session.setdefault('cart_context', {})
    redeemed_discount = ctx.get('redeemed_discount', 0)
    promo_discount = ctx.get('promo_discount', 0)
    total = max(0, subtotal - promo_discount - redeemed_discount + delivery)

    return jsonify({
        "success": True,
        "cart": cart,
        "summary": {
            "subtotal": subtotal,
            "promo_discount": promo_discount,
            "redeemed_discount": redeemed_discount,
            "delivery": delivery,
            "total": total
        }
    if not promo_code:
        return jsonify({"success": False, "error": "Missing promo code"}), 400

    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    cart = sales_agent.current_session.get('cart', [])
    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404
    if not promo_code:
        return jsonify({"success": False, "error": "Missing promo code"}), 400

    host_url = request.host_url.rstrip('/')
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    cart = sales_agent.current_session.get('cart', [])
    subtotal = sum((item.get('price', 0) * item.get('quantity', 1)) for item in cart)

    task = {
        "customer_id": sales_agent.current_session.get('customer_id'),
        "cart_total": subtotal,
        "cart_items": cart,
        "promo_code": promo_code
    }
    result = sales_agent.loyalty_agent.execute(task)

    if result.get('success') and result.get('discounts'):
        # Store applied discount in session context for UI summary
        discount_total = result.get('total_savings', 0)
        ctx = sales_agent.current_session.setdefault('cart_context', {})
        ctx['promo_code'] = promo_code
        ctx['promo_discount'] = discount_total

        # Recompute delivery and total
        delivery = 0 if subtotal > 1000 else (0 if subtotal == 0 else 50)
        total = max(0, subtotal - discount_total - ctx.get('redeemed_discount', 0) + delivery)
        
        # Save state
        session_manager.save_session(
            session_id, 
            sales_agent.current_session.get('customer_id'), 
            sales_agent.current_session.get('channel'), 
            sales_agent.get_state()
        )

        return jsonify({
            "success": True,
            "message": f"Promo {promo_code} applied",
            "discount": discount_total,
            "summary": {"subtotal": subtotal, "delivery": delivery, "total": total}
        })
    if points <= 0:
        return jsonify({"success": False, "error": "Invalid points"}), 400

    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    customer_id = sales_agent.current_session.get('customer_id')

    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404
    if points <= 0:
        return jsonify({"success": False, "error": "Invalid points"}), 400

    host_url = request.host_url.rstrip('/')
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    customer_id = sales_agent.current_session.get('customer_id')

    redeem_result = sales_agent.loyalty_agent.redeem_points(customer_id, points)
    if not redeem_result.get('success'):
        return jsonify({"success": False, "error": redeem_result.get('error', 'Redeem failed')}), 400

    # Persist redeemed discount in session context
    ctx = sales_agent.current_session.setdefault('cart_context', {})
    ctx['redeemed_points'] = points
    ctx['redeemed_discount'] = redeem_result.get('discount', 0)
    
    # Save state
    session_manager.save_session(
        session_id, 
        sales_agent.current_session.get('customer_id'), 
        sales_agent.current_session.get('channel'), 
        sales_agent.get_state()
    )

    # Return updated cart summary
    cart = sales_agent.current_session.get('cart', [])
    subtotal = sum((item.get('price', 0) * item.get('quantity', 1)) for item in cart)
    delivery = 0 if subtotal > 1000 else (0 if subtotal == 0 else 50)
    total = max(0, subtotal - ctx.get('promo_discount', 0) - ctx.get('redeemed_discount', 0) + delivery)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404

    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)

    result = sales_agent._handle_checkout()])
def checkout():
    data = request.json
    session_id = data.get('session_id')
    
    state = session_manager.load_session(session_id)
    if not session_id or not state:
        return jsonify({"success": False, "error": "Session not found"}), 404

    if not state:
        return jsonify({
            "success": False,
            "error": "Session not found"
        }), 404
    
    port = os.environ.get('PORT', 5000)
    host_url = f"http://127.0.0.1:{port}"
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)
    
    response = sales_agent.switch_channel(new_channel)
    new_channel = data.get('new_channel')
    
    state = session_manager.load_session(session_id)
    if not state:
        return jsonify({
            "success": False,
            "error": "Session not found"
        }), 404
    
    host_url = request.host_url.rstrip('/')
    sales_agent = SalesAgent(api_base_url=host_url)
    sales_agent.load_state(state)
    
    response = sales_agent.switch_channel(new_channel)
    
    # Save state
    session_manager.save_session(
        session_id, 
        sales_agent.current_session.get('customer_id'), 
        sales_agent.current_session.get('channel'), 
        sales_agent.get_state()
    )
    
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Backend Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)

