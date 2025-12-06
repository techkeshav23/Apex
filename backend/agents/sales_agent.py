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
            resp = requests.get(f"{self.api_base_url}/api/products/{sku}")
            if resp.status_code != 200:
                return {"success": False, "message": "Product not found"}
            product = resp.json()
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

    def get_state(self):
        """Return the current session state"""
        return self.current_session
    
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
        """Analyze user intent from input"""
        user_input_lower = user_input.lower()
        
        # Product discovery keywords
        if any(word in user_input_lower for word in ['show', 'looking for', 'need', 'want', 'recommend', 'suggest']):
            return "product_discovery"
        
        # Add to cart keywords
        if any(word in user_input_lower for word in ['add', 'buy', 'purchase', 'take', 'cart']):
            return "add_to_cart"
        
        # Checkout keywords
        if any(word in user_input_lower for word in ['checkout', 'pay', 'complete', 'order', 'buy now']):
            return "checkout"
        
        # Offer keywords
        if any(word in user_input_lower for word in ['offer', 'discount', 'promo', 'coupon', 'deal']):
            return "apply_offer"
        
        # Post-purchase keywords
        if any(word in user_input_lower for word in ['return', 'exchange', 'track', 'feedback']):
            return "post_purchase"
        
        return "general"
    
    def _handle_product_discovery(self, user_input: str) -> Dict[str, Any]:
        """Handle product discovery and recommendations"""
        self.log("Initiating product discovery...")
        
        # Extract context from user input
        context = user_input
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
            self.current_session['stage'] = 'browsing'
            self.current_session['recommendations'] = recommendations['recommendations']
            
            # Create response message
            message = recommendations['personalized_message'] + "\n\n"
            message += "Here are my top recommendations:\n\n"
            
            for i, product in enumerate(recommendations['recommendations'][:3], 1):
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
            resp = requests.get(f"{self.api_base_url}/api/products")
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
            return {
                "success": False,
                "message": "I couldn't find that product. Could you describe what you're looking for?"
            }
        
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
                # For now, we'll just use the fallback if the API call fails
                # to prevent the entire session start from failing
                try:
                    response = requests.get(f"{self.api_base_url}/api/customers/{customer_id}", timeout=2)
                    if response.status_code == 200:
                        customer = response.json()
                        greeting_text = gemini_assistant.generate_personalized_greeting(
                            customer, 
                            self.current_session.get('channel', 'web')
                        )
                        return {
                            "success": True,
                            "message": greeting_text + "\n\nI can help you:\n✨ Find the perfect products\n📦 Check availability\n🎁 Apply best offers\n🚚 Complete your purchase\n\nWhat are you looking for today?"
                        }
                except requests.exceptions.RequestException:
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
        return self.current_session

    def log(self, message: str):
        """Log agent activity"""
        print(f"[{self.name}] {message}")
