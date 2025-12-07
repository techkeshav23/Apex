"""
Gemini AI Integration for Enhanced Conversational Responses
"""
import os
from typing import Dict, Any, Optional

# Load environment variables from .env file manually
def load_env_file():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env_file()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  Google Generative AI not installed. Install with: pip install google-generativeai")

class GeminiAssistant:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        
        if GEMINI_AVAILABLE and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                print("✅ Gemini AI initialized successfully")
            except Exception as e:
                print(f"⚠️  Gemini initialization failed: {str(e)}")
        else:
            print("ℹ️  Gemini AI not configured. Using rule-based responses.")
    
    def is_available(self) -> bool:
        """Check if Gemini is available and configured"""
        return self.model is not None
    
    def enhance_product_description(self, product: Dict[str, Any]) -> str:
        """Generate engaging product description using Gemini"""
        if not self.is_available():
            return product.get('description', '')
        
        try:
            prompt = f"""You are a fashion retail expert. Create a compelling, concise product description (2-3 sentences) for:

Product: {product.get('name')}
Category: {product.get('category')}
Price: ₹{product.get('price')}
Material: {product.get('attributes', {}).get('material', 'N/A')}
Occasion: {product.get('attributes', {}).get('occasion', 'N/A')}

Make it appealing and highlight key selling points."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini API error: {str(e)}")
            return product.get('description', '')
    
    def generate_personalized_greeting(self, customer: Dict[str, Any], channel: str) -> str:
        """Generate personalized greeting based on customer profile"""
        if not self.is_available():
            return self._fallback_greeting(customer, channel)
        
        try:
            prompt = f"""You are a friendly AI sales assistant. Create a warm, personalized greeting (1-2 sentences) for:

Customer: {customer.get('name', 'Customer')}
Loyalty Tier: {customer.get('loyalty_tier', 'Bronze')}
Points: {customer.get('loyalty_points', 0)}
Channel: {channel}
Recent Purchases: {', '.join([p['category'] for p in customer.get('purchase_history', [])[:2]])}

Be friendly, acknowledge their loyalty tier, and make them feel valued. Keep it conversational and not too salesy."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini API error: {str(e)}")
            return self._fallback_greeting(customer, channel)
    
    def generate_recommendation_message(self, customer: Dict[str, Any], products: list) -> str:
        """Generate natural recommendation message"""
        if not self.is_available() or not products:
            return self._fallback_recommendation(products)
        
        try:
            product_names = [p['name'] for p in products[:3]]
            preferences = customer.get('preferences', {})
            
            prompt = f"""You are a helpful sales assistant. Create a friendly, natural message (2-3 sentences) recommending products:

Customer preferences: {preferences.get('favorite_colors', [])}, Budget: {preferences.get('budget_range', 'flexible')}
Recommended products: {', '.join(product_names)}

Make it sound like a friend giving advice, not a salesperson. Be enthusiastic but genuine."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini API error: {str(e)}")
            return self._fallback_recommendation(products)
    
    def handle_customer_query(self, query: str, context: Dict[str, Any]) -> Optional[str]:
        """Handle open-ended customer queries using Gemini"""
        if not self.is_available():
            return None
        
        try:
            prompt = f"""You are a helpful retail sales assistant. The customer asked: "{query}"

Context:
- Store: Fashion retail (ethnic, western, formal wear, accessories)
- Services: Product recommendations, inventory checks, order tracking, returns/exchanges
- Available: Multi-channel shopping (web, mobile, in-store)

Provide a helpful, friendly response (2-3 sentences). If it's a product question, suggest they can get recommendations. If it's about orders, mention tracking. Keep it concise and actionable."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini API error: {str(e)}")
            return None
    
    def generate_upsell_message(self, cart_items: list, complementary_items: list) -> str:
        """Generate natural upsell/cross-sell message"""
        if not self.is_available() or not complementary_items:
            return self._fallback_upsell(complementary_items)
        
        try:
            cart_products = [item['name'] for item in cart_items]
            comp_products = [item['name'] for item in complementary_items[:2]]
            
            prompt = f"""You are a fashion stylist helping a customer. They have in cart: {', '.join(cart_products)}

Suggest these complementary items naturally: {', '.join(comp_products)}

Create a friendly suggestion (1-2 sentences) that sounds like styling advice, not a sales pitch. Use phrases like "would pair well with" or "to complete the look"."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Gemini API error: {str(e)}")
            return self._fallback_upsell(complementary_items)
    
    def _fallback_greeting(self, customer: Dict[str, Any], channel: str) -> str:
        """Fallback greeting when Gemini is not available"""
        name = customer.get('name', 'there').split()[0]
        tier = customer.get('loyalty_tier', 'valued')
        return f"Welcome back, {name}! As our {tier} member, you have {customer.get('loyalty_points', 0)} points. How can I help you today?"
    
    def _fallback_recommendation(self, products: list) -> str:
        """Fallback recommendation message"""
        if not products:
            return "Let me help you find something perfect for you!"
        return f"I think you'll love this {products[0]['name']}. It's one of our bestsellers!"
    
    def _fallback_upsell(self, complementary_items: list) -> str:
        """Fallback upsell message"""
        if not complementary_items:
            return ""
        return f"These {complementary_items[0]['name']} would pair perfectly with your selection!"

# Global instance
gemini_assistant = GeminiAssistant()
