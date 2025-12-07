"""
Sales Agent - Main orchestrator that manages conversation and coordinates worker agents
"""
from typing import Dict, Any, List
import json
import sys
import os
import requests

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.recommendation_agent import RecommendationAgent
from agents.inventory_agent import InventoryAgent
from agents.payment_agent import PaymentAgent
from agents.loyalty_agent import LoyaltyAgent
from agents.fulfillment_agent import FulfillmentAgent
from agents.post_purchase_agent import PostPurchaseAgent

try:
    from src.gemini_helper import gemini_assistant
    GEMINI_ENABLED = True
except ImportError:
    GEMINI_ENABLED = False
    print("⚠️  Gemini helper not available. Using rule-based responses.")

class SalesAgent:
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        self.api_base_url = api_base_url
        self.name = "SalesAgent"
        
        # Initialize worker agents
        self.recommendation_agent = RecommendationAgent(api_base_url)
        self.inventory_agent = InventoryAgent(api_base_url)
        self.payment_agent = PaymentAgent(api_base_url)
        self.loyalty_agent = LoyaltyAgent(api_base_url)
        self.fulfillment_agent = FulfillmentAgent(api_base_url)
        self.post_purchase_agent = PostPurchaseAgent(api_base_url)
        
        # Session state
        self.current_session = {}
        self.conversation_history = []
    
    def start_session(self, customer_id: str, channel: str = "web"):
        """Start a new sales session"""
        self.current_session = {
            "customer_id": customer_id,
            "channel": channel,
            "cart": [],
            "stage": "greeting",
            "context": {}
        }
        self.conversation_history = []
        
        greeting = self._generate_greeting(customer_id)
        self.log(f"Session started for {customer_id} on {channel}")
        
        return greeting

    def add_item_to_cart(self, sku: str, quantity: int = 1) -> Dict[str, Any]:
        """Add a specific SKU to the agent-managed cart with basic stock check."""
        # Fetch product details from data API
        try:
            resp = requests.get(f"{self.api_base_url}/api/products/{sku}", timeout=5)
            if resp.status_code != 200:
                return {"success": False, "message": "Product not found"}
            product = resp.json()
        except requests.exceptions.Timeout:
            return {"success": False, "message": "Request timeout - please try again"}
        except Exception as e:
            return {"success": False, "message": f"Failed to fetch product: {str(e)}"}

        # Simple inventory check via InventoryAgent
        inv_task = {"sku": sku, "quantity": quantity}
        inv_result = self.inventory_agent.execute(inv_task)
        if not inv_result.get("success") or inv_result.get("availability", {}).get("status") != "available":
            return {
                "success": False,
                "message": f"Sorry, {product.get('name', 'item')} is currently out of stock."
            }

        # Append to session cart (store minimal necessary fields)
        cart_item = product.copy()
        cart_item["quantity"] = quantity
        self.current_session.setdefault("cart", []).append(cart_item)

        cart_total = sum(p.get('price', 0) * p.get('quantity', 1) for p in self.current_session["cart"])

        return {
            "success": True,
            "message": f"Added {product.get('name')} to your cart.",
            "cart": self.current_session["cart"],
            "cart_total": cart_total
        }
    
    def switch_channel(self, new_channel: str, context: Dict = None):
        """Switch conversation channel while maintaining context"""
        old_channel = self.current_session.get('channel')
        self.current_session['channel'] = new_channel
        
        if context:
            self.current_session['context'].update(context)
        
        message = f"Continuing our conversation on {new_channel}. "
        
        # Context-aware message
        if self.current_session.get('cart'):
            message += f"I see you have {len(self.current_session['cart'])} items in your cart. "
        
        self.log(f"Channel switched from {old_channel} to {new_channel}")
        
        return {
            "message": message + "How can I help you?",
            "session": self.current_session
        }

    def load_state(self, state: Dict[str, Any]):
        """Load session state"""
        if isinstance(state, str):
            try:
                self.current_session = json.loads(state)
            except:
                self.current_session = {}
        else:
            self.current_session = state or {}
        
        # Restore conversation history from session
        self.conversation_history = self.current_session.get('conversation_history', [])
    
    def handle_conversation(self, user_input: str) -> Dict[str, Any]:
        """Handle user conversation and orchestrate appropriate agents"""
        self.conversation_history.append({"role": "user", "message": user_input})
        
        # Analyze intent
        intent = self._analyze_intent(user_input)
        
        response = {}
        
        if intent == "product_discovery":
            response = self._handle_product_discovery(user_input)
        elif intent == "add_to_cart":
            response = self._handle_add_to_cart(user_input)
        elif intent == "checkout":
            response = self._handle_checkout()
        elif intent == "apply_offer":
            response = self._handle_apply_offer(user_input)
        elif intent == "post_purchase":
            response = self._handle_post_purchase(user_input)
        else:
            response = self._handle_general_query(user_input)
        
        self.conversation_history.append({"role": "agent", "message": response.get('message')})
        
        return response
    
    def _analyze_intent(self, user_input: str) -> str:
        """Analyze user intent from input using Gemini or rules"""
        
        # 1. Try Gemini for advanced intent classification
        if GEMINI_ENABLED and gemini_assistant.is_available():
            try:
                prompt = f"""Classify the user's intent into exactly one of these categories:
- product_discovery: User wants to find, see, search, or buy products (e.g., "show me shirts", "I need a dress", "buy shoes", "do you have...").
- add_to_cart: User wants to add a specific item to cart (e.g., "add this", "add to cart", "I'll take it", "buy this one").
- checkout: User wants to pay or finish shopping (e.g., "checkout", "pay now", "bill please").
- apply_offer: User wants to use a coupon or check offers (e.g., "apply SAVE10", "any discounts?", "use promo code").
- post_purchase: User asks about past orders, returns, tracking, or shipping status (e.g., "where is my order?", "return this", "track package").
- general: Greetings, small talk, or unclear requests.

User Input: "{user_input}"

Return ONLY the category name."""
                
                response = gemini_assistant.model.generate_content(prompt)
                intent = response.text.strip().lower()
                
                valid_intents = ["product_discovery", "add_to_cart", "checkout", "apply_offer", "post_purchase", "general"]
                if intent in valid_intents:
                    self.log(f"🧠 Gemini classified intent: {intent}")
                    return intent
            except Exception as e:
                self.log(f"⚠️ Gemini intent classification failed: {e}")

        # 2. Fallback to Rule-based (Improved)
        user_input_lower = user_input.lower()
        
        # Post-purchase (Specific keywords that shouldn't be confused with checkout)
        if any(word in user_input_lower for word in ['return', 'exchange', 'track', 'shipment', 'delivery status', 'where is my order']):
            return "post_purchase"
            
        # Checkout
        if any(word in user_input_lower for word in ['checkout', 'pay', 'complete order', 'bill']):
            return "checkout"
            
        # Add to cart
        if any(word in user_input_lower for word in ['add to cart', 'add this', 'buy this', 'take it']):
            return "add_to_cart"
            
        # Offers
        if any(word in user_input_lower for word in ['offer', 'discount', 'promo', 'coupon', 'code']):
            return "apply_offer"
            
        # Product Discovery (Broadest category)
        discovery_keywords = ['show', 'looking for', 'need', 'want', 'recommend', 'suggest', 'find', 'buy', 'get', 'search', 'have']
        if any(word in user_input_lower for word in discovery_keywords) or any(cat in user_input_lower for cat in ['shirt', 'pant', 'dress', 'shoe', 'watch']):
            return "product_discovery"
            
        return "general"
    
    def _handle_product_discovery(self, user_input: str) -> Dict[str, Any]:
        """Handle product discovery and recommendations"""
        self.log("Initiating product discovery...")
        
        # Extract context from user input AND previous conversation
        # Include last few messages for context
        context = user_input
        if len(self.conversation_history) > 1:
            # Get last 2-3 user messages for context
            recent_messages = [msg['message'] for msg in self.conversation_history[-6:] if msg['role'] == 'user']
            if recent_messages:
                context = " ".join(recent_messages[-3:])  # Last 3 user messages
                self.log(f"📝 Using conversation context: {context}")
        
        occasion = ""
        budget = None
        
        if "party" in user_input.lower() or "wedding" in user_input.lower():
            occasion = "party"
        elif "office" in user_input.lower() or "formal" in user_input.lower():
            occasion = "formal"
        
        # Call recommendation agent
        task = {
            "customer_id": self.current_session.get('customer_id'),
            "context": context,
            "occasion": occasion,
            "budget": budget
        }
        
        recommendations = self.recommendation_agent.execute(task)
        
        if recommendations.get('success'):
            # Filter out-of-stock items using InventoryAgent
            available_recs = []
            for prod in recommendations['recommendations']:
                # Quick inventory check
                inv_task = {"sku": prod['sku'], "quantity": 1}
                inv_result = self.inventory_agent.execute(inv_task)
                
                # If available or check failed (assume available on fail to not block), keep it
                if not inv_result.get('success') or inv_result.get('availability', {}).get('status') == 'available':
                    available_recs.append(prod)
            
            recommendations['recommendations'] = available_recs
            
            if not available_recs:
                 return {
                    "success": False,
                    "message": "I found some items matching your request, but unfortunately they are all out of stock right now. Can I help you find something else?"
                }

            self.current_session['stage'] = 'browsing'
            self.current_session['recommendations'] = recommendations['recommendations']
            
            # Log the order of recommendations
            self.log(f"🎯 Final recommendation order in SalesAgent:")
            for i, prod in enumerate(recommendations['recommendations'][:5], 1):
                self.log(f"  {i}. {prod['name']}")
            
            # Use Gemini to create natural response if available
            message = ""
            if GEMINI_ENABLED and gemini_assistant.is_available():
                try:
                    # Create context-aware prompt
                    num_products = len(recommendations['recommendations'])
                    product_list = "\n".join([
                        f"{i+1}. {p['name']} - ₹{p['price']} (was ₹{p['mrp']}, {p['discount']}% off) - {p.get('description', '')[:80]}..."
                        for i, p in enumerate(recommendations['recommendations'][:min(3, num_products)])
                    ])
                    
                    gemini_prompt = f"""You are a friendly shopping assistant. The customer asked: "{user_input}"

You found {num_products} products for them:
{product_list}

Create a natural, conversational response that:
1. Acknowledges their request naturally (in Hindi-English mix if appropriate)
2. Shows the products in a friendly way
3. Keeps it brief and helpful

Format the response like:
"[Your friendly message acknowledging their request]

Here are my top recommendations:

1. **[Product Name]** - ₹[Price] (was ₹[MRP], [Discount]% off)
   [Description]

[Repeat for each product]"

Make it sound natural and helpful, not robotic!"""
                    
                    response = gemini_assistant.model.generate_content(gemini_prompt)
                    message = response.text.strip()
                    self.log(f"🤖 Using Gemini-generated response")
                except Exception as e:
                    self.log(f"⚠️ Gemini response generation failed: {e}")
            
            # Fallback to template if Gemini unavailable or failed
            if not message:
                message = recommendations['personalized_message'] + "\n\n"
                message += "Here are my top recommendations:\n\n"
                
                num_to_show = min(3, len(recommendations['recommendations']))
                for i, product in enumerate(recommendations['recommendations'][:num_to_show], 1):
                    message += f"{i}. **{product['name']}** - ₹{product['price']} (was ₹{product['mrp']}, {product['discount']}% off)\n"
                    message += f"   {product['description']}\n"
            
            if recommendations.get('complementary_items'):
                message += "\n💡 **You might also like:** "
                comp_names = [item['name'] for item in recommendations['complementary_items'][:2]]
                message += ", ".join(comp_names)
            
            return {
                "success": True,
                "message": message,
                "recommendations": recommendations['recommendations'],
                "action": "browse_products"
            }
        else:
            return {
                "success": False,
                "message": "I'm having trouble finding recommendations. Could you tell me more about what you're looking for?"
            }
    
    def _handle_add_to_cart(self, user_input: str) -> Dict[str, Any]:
        """Handle adding items to cart"""
        user_input_lower = user_input.lower()
        
        # First, try to get recommendations based on user input if not already available
        if not self.current_session.get('recommendations'):
            # Get recommendations based on user input
            rec_task = {
                "customer_id": self.current_session.get('customer_id'),
                "context": user_input,
                "occasion": "",
                "budget": None
            }
            rec_result = self.recommendation_agent.execute(rec_task)
            if rec_result.get('success'):
                self.current_session['recommendations'] = rec_result['recommendations']
            else:
                return {
                    "success": False,
                    "message": "I couldn't find any products matching your request. Could you be more specific?"
                }
        
        # Search for matching product in recommendations based on keywords
        product = None
        recommendations = self.current_session.get('recommendations', [])
        
        # Extract keywords from user input with more context
        keywords = []
        product_type = None
        
        # Detect specific product types with better matching
        if 'saree' in user_input_lower or 'sari' in user_input_lower:
            keywords.append('saree')
            product_type = 'saree'
        if 'shirt' in user_input_lower and 't-shirt' not in user_input_lower:
            keywords.append('shirt')
            product_type = 'shirt'
        if 't-shirt' in user_input_lower or 'tshirt' in user_input_lower or 'polo' in user_input_lower:
            keywords.extend(['t-shirt', 'polo', 'tee'])
            product_type = 't-shirt'
        if 'anarkali' in user_input_lower:
            keywords.append('anarkali')
            product_type = 'anarkali'
        if 'kurta' in user_input_lower:
            keywords.append('kurta')
            product_type = 'kurta'
        if 'dress' in user_input_lower:
            keywords.append('dress')
            product_type = 'dress'
        if 'jeans' in user_input_lower:
            keywords.append('jeans')
            product_type = 'jeans'
        if 'lehenga' in user_input_lower:
            keywords.append('lehenga')
            product_type = 'lehenga'
        if 'suit' in user_input_lower and 'anarkali' not in user_input_lower:
            keywords.append('suit')
            product_type = 'suit'
        if 'blazer' in user_input_lower:
            keywords.append('blazer')
            product_type = 'blazer'
        if 'trouser' in user_input_lower or 'pant' in user_input_lower:
            keywords.extend(['trouser', 'pant', 'chino'])
            product_type = 'trouser'
        if 'watch' in user_input_lower:
            keywords.append('watch')
            product_type = 'watch'
        if 'shoe' in user_input_lower or 'shoes' in user_input_lower:
            keywords.extend(['shoe', 'shoes'])
            product_type = 'shoe'
        if 'bag' in user_input_lower or 'handbag' in user_input_lower:
            keywords.extend(['bag', 'handbag'])
            product_type = 'bag'
        if 'accessory' in user_input_lower or 'accessories' in user_input_lower:
            keywords.extend(['accessory', 'accessories'])
            product_type = 'accessory'
        
        # Check for gender/age modifiers
        is_girl = 'girl' in user_input_lower or 'girls' in user_input_lower
        is_boy = 'boy' in user_input_lower or 'boys' in user_input_lower
        is_kid = 'kid' in user_input_lower or 'kids' in user_input_lower or 'child' in user_input_lower
        is_men = 'men' in user_input_lower or "men's" in user_input_lower or 'man' in user_input_lower
        is_women = 'women' in user_input_lower or "women's" in user_input_lower or 'woman' in user_input_lower
        
        # Color keywords
        colors = ['blue', 'red', 'green', 'black', 'white', 'pink', 'yellow', 'purple', 'orange', 'silk']
        for color in colors:
            if color in user_input_lower:
                keywords.append(color)
        
        # Strategy: Search all products first for better matching
        all_products = []
        try:
            resp = requests.get(f"{self.api_base_url}/api/products", timeout=5)
            if resp.status_code == 200:
                all_products = resp.json()
        except Exception as e:
            self.log(f"Error fetching products: {e}")
        
        # Search function with better logic
        def find_best_match(products_list):
            best_match = None
            best_score = 0
            
            for p in products_list:
                p_name_lower = p['name'].lower()
                p_category_lower = p.get('category', '').lower()
                score = 0
                
                # Primary keyword matching (product type)
                if product_type:
                    if product_type == 'shirt' and 'shirt' in p_name_lower and 't-shirt' not in p_name_lower:
                        score += 100
                    elif product_type == 't-shirt' and ('t-shirt' in p_name_lower or 'polo' in p_name_lower):
                        score += 100
                    elif product_type == 'saree' and 'saree' in p_name_lower:
                        score += 100
                    elif product_type == 'dress' and 'dress' in p_name_lower:
                        score += 100
                    elif product_type in p_name_lower:
                        score += 100
                
                # Gender/category matching
                if is_men and ("men's" in p_category_lower or 'men' in p_category_lower):
                    score += 50
                elif is_women and ("women's" in p_category_lower or 'women' in p_category_lower):
                    score += 50
                elif (is_girl or is_kid) and ('kids' in p_category_lower or 'children' in p_category_lower or 'girl' in p_category_lower):
                    score += 50
                elif (is_boy or is_kid) and ('kids' in p_category_lower or 'children' in p_category_lower or 'boy' in p_category_lower):
                    score += 50
                
                # Additional keyword matching
                for keyword in keywords:
                    if keyword in p_name_lower or keyword in p_category_lower:
                        score += 10
                
                if score > best_score:
                    best_score = score
                    best_match = p
            
            return best_match if best_score >= 10 else None
        
        # Try to find match in all products first
        if keywords:
            product = find_best_match(all_products)
        
        # If no match in all products, try recommendations
        if not product and recommendations:
            product = find_best_match(recommendations)
        
        # Last resort fallback - but give preference to matching category
        if not product and all_products:
            # For kids products that don't exist, suggest alternatives
            if is_girl or is_boy or is_kid:
                # Look for women's or men's dress/clothing as alternative
                for p in all_products:
                    if product_type and product_type in p['name'].lower():
                        product = p
                        break
            
            # Otherwise use first product from all products
            if not product:
                product = all_products[0]
        
        if not product:
            # Fallback: trigger product discovery instead
            self.log("No product match found, falling back to product discovery")
            return self._handle_product_discovery(user_input)
        
        # Check inventory
        inventory_task = {
            "sku": product['sku'],
            "quantity": 1,
            "customer_location": self.current_session.get('context', {}).get('location')
        }
        
        inventory_result = self.inventory_agent.execute(inventory_task)
        
        if inventory_result['success'] and inventory_result['availability']['status'] == 'available':
            # Add to cart
            self.current_session['cart'].append(product)
            self.current_session['stage'] = 'cart'
            
            options = inventory_result['availability']['options']
            
            message = f"Great choice! I've added **{product['name']}** to your cart.\n\n"
            message += "**Availability Options:**\n"
            
            for opt in options[:2]:
                message += f"✓ {opt['message']}\n"
            
            message += f"\n**Cart Total:** ₹{sum(p['price'] for p in self.current_session['cart'])}\n"
            message += "\nWould you like to:\n1. Continue shopping\n2. Proceed to checkout\n3. Apply promo code"
            
            return {
                "success": True,
                "message": message,
                "cart": self.current_session['cart'],
                "inventory": inventory_result
            }
        else:
            return {
                "success": False,
                "message": f"Sorry, **{product['name']}** is currently out of stock. Would you like to see similar products?"
            }
    
    def _handle_checkout(self) -> Dict[str, Any]:
        """Handle checkout process"""
        if not self.current_session.get('cart'):
            return {
                "success": False,
                "message": "Your cart is empty. Let me help you find something!"
            }
        
        cart_total = sum(p['price'] for p in self.current_session['cart'])
        
        # Apply loyalty and offers
        loyalty_task = {
            "customer_id": self.current_session['customer_id'],
            "cart_total": cart_total,
            "cart_items": self.current_session['cart']
        }
        
        loyalty_result = self.loyalty_agent.execute(loyalty_task)
        
        final_total = loyalty_result.get('final_total', cart_total)
        savings = loyalty_result.get('total_savings', 0)
        
        # Process payment
        payment_task = {
            "amount": final_total,
            "method": "card"
        }
        
        payment_result = self.payment_agent.execute(payment_task)
        
        if payment_result['success']:
            # Create order
            fulfillment_task = {
                "customer_id": self.current_session['customer_id'],
                "cart_items": self.current_session['cart'],
                "fulfillment_type": "ship_to_home"
            }
            
            fulfillment_result = self.fulfillment_agent.execute(fulfillment_task)
            
            if fulfillment_result['success']:
                message = f"🎉 **Order Confirmed!**\n\n"
                message += f"**Order ID:** {fulfillment_result['order_id']}\n"
                message += f"**Transaction ID:** {payment_result['transaction_id']}\n\n"
                message += f"**Order Summary:**\n"
                message += f"- Subtotal: ₹{cart_total}\n"
                
                if savings > 0:
                    message += f"- Savings: -₹{savings} 🎁\n"
                
                message += f"- **Total Paid:** ₹{final_total}\n\n"
                
                if loyalty_result.get('points_to_earn'):
                    message += f"✨ You've earned {loyalty_result['points_to_earn']} loyalty points!\n\n"
                
                message += f"**Delivery:** {fulfillment_result['estimated_delivery']}\n"
                message += f"**Tracking:** {fulfillment_result['tracking_number']}\n\n"
                message += "Thank you for shopping with us! 🛍️"
                
                # Reset cart
                self.current_session['cart'] = []
                self.current_session['stage'] = 'completed'
                
                return {
                    "success": True,
                    "message": message,
                    "order": fulfillment_result,
                    "payment": payment_result
                }
        else:
            # Payment failed - handle retry
            message = f"⚠️ Payment failed: {payment_result.get('error')}\n\n"
            message += "Would you like to:\n1. Try another payment method\n2. Retry payment"
            
            return {
                "success": False,
                "message": message,
                "payment_error": payment_result
            }
    
    def _handle_apply_offer(self, user_input: str) -> Dict[str, Any]:
        """Handle promo code application"""
        # Extract promo code (simplified)
        promo_code = user_input.split()[-1].upper()
        
        cart_total = sum(p['price'] for p in self.current_session.get('cart', []))
        
        loyalty_task = {
            "customer_id": self.current_session['customer_id'],
            "cart_total": cart_total,
            "cart_items": self.current_session.get('cart', []),
            "promo_code": promo_code
        }
        
        result = self.loyalty_agent.execute(loyalty_task)
        
        if result['success'] and result.get('discounts'):
            message = f"✅ Promo code **{promo_code}** applied!\n\n"
            message += f"You saved ₹{result['total_savings']}! 🎉\n"
            message += f"New total: ₹{result['final_total']}"
            
            return {
                "success": True,
                "message": message,
                "discount": result
            }
        else:
            return {
                "success": False,
                "message": "Invalid promo code. Would you like to see available offers?"
            }
    
    def _handle_post_purchase(self, user_input: str) -> Dict[str, Any]:
        """Handle post-purchase support"""
        # Determine request type
        if "return" in user_input.lower():
            request_type = "return"
        elif "exchange" in user_input.lower():
            request_type = "exchange"
        elif "track" in user_input.lower():
            request_type = "track_shipment"
        else:
            request_type = "feedback"
        
        task = {
            "request_type": request_type,
            "order_id": "ORD123456"  # Would be extracted from context
        }
        
        result = self.post_purchase_agent.execute(task)
        
        return {
            "success": True,
            "message": json.dumps(result, indent=2),
            "support": result
        }
    
    def _handle_general_query(self, user_input: str) -> Dict[str, Any]:
        """Handle general queries"""
        # Try Gemini for natural responses
        if GEMINI_ENABLED and gemini_assistant.is_available():
            response_text = gemini_assistant.handle_customer_query(
                user_input, 
                self.current_session.get('context', {})
            )
            if response_text:
                return {
                    "success": True,
                    "message": response_text
                }
        
        # Fallback response
        return {
            "success": True,
            "message": "I'm here to help! You can:\n• Browse products\n• Get recommendations\n• Check out your cart\n• Apply promo codes\n• Track orders\n\nWhat would you like to do?"
        }
    
    def _generate_greeting(self, customer_id: str) -> Dict[str, Any]:
        """Generate personalized greeting"""
        # Try to get customer data for personalized greeting
        if GEMINI_ENABLED and gemini_assistant.is_available():
            try:
                # Use internal API call if possible, or skip if connection fails
                try:
                    response = requests.get(f"{self.api_base_url}/api/customers/{customer_id}", timeout=3)
                    if response.status_code == 200:
                        customer = response.json()
                        
                        # Also fetch loyalty info explicitly if not in customer object
                        if 'loyalty_points' not in customer:
                            try:
                                loyalty_resp = requests.get(f"{self.api_base_url}/api/loyalty/{customer_id}", timeout=2)
                                if loyalty_resp.status_code == 200:
                                    loyalty_data = loyalty_resp.json()
                                    customer['loyalty_points'] = loyalty_data.get('points', 0)
                                    customer['loyalty_tier'] = loyalty_data.get('tier', 'Bronze')
                            except:
                                pass

                        greeting_text = gemini_assistant.generate_personalized_greeting(
                            customer, 
                            self.current_session.get('channel', 'web')
                        )
                        return {
                            "success": True,
                            "message": greeting_text + "\n\nI can help you:\n✨ Find the perfect products\n📦 Check availability\n🎁 Apply best offers\n🚚 Complete your purchase\n\nWhat are you looking for today?"
                        }
                except (requests.exceptions.RequestException, requests.exceptions.Timeout):
                    pass # Fallback silently
            except Exception as e:
                self.log(f"Could not fetch customer data: {str(e)}")
        
        # Fallback greeting
        return {
            "success": True,
            "message": f"👋 Hello! Welcome to our store! I'm your personal shopping assistant.\n\nI can help you:\n✨ Find the perfect products\n📦 Check availability\n🎁 Apply best offers\n🚚 Complete your purchase\n\nWhat are you looking for today?"
        }
    
    def get_state(self):
        """Return the current session state"""
        # Include conversation history in the session state
        self.current_session['conversation_history'] = self.conversation_history
        return self.current_session

    def log(self, message: str):
        """Log agent activity"""
        print(f"[{self.name}] {message}")
