"""
Recommendation Agent - Analyzes customer profile and suggests products
"""
from typing import Dict, Any, List
import requests
import sys
import os
from agents.base_agent import BaseAgent

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from src.gemini_helper import gemini_assistant
    GEMINI_ENABLED = True
except ImportError:
    GEMINI_ENABLED = False

class RecommendationAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "RecommendationAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate product recommendations based on customer profile
        
        Args:
            task: {
                "customer_id": str,
                "context": str (optional),
                "occasion": str (optional),
                "budget": int (optional)
            }
        """
        self.log("Analyzing customer profile for recommendations...")
        
        customer_id = task.get('customer_id')
        context = task.get('context', '')
        occasion = task.get('occasion', '')
        budget = task.get('budget')
        
        # Get customer profile
        try:
            customer_response = requests.get(
                f"{self.api_base_url}/api/customers/{customer_id}"
            )
            customer = customer_response.json()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch customer data: {str(e)}"
            }
        
        # Get all products
        try:
            products_response = requests.get(f"{self.api_base_url}/api/products")
            all_products = products_response.json()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch products: {str(e)}"
            }
        
        # Recommendation logic
        recommendations = self._generate_recommendations(
            customer, all_products, context, occasion, budget
        )
        
        # Add complementary items
        complementary = self._suggest_complementary_items(recommendations, all_products)
        
        self.log(f"Generated {len(recommendations)} recommendations")
        
        return {
            "success": True,
            "recommendations": recommendations,
            "complementary_items": complementary,
            "personalized_message": self._create_personalized_message(customer, recommendations)
        }
    
    def _generate_recommendations(self, customer, all_products, context, occasion, budget):
        """Generate personalized recommendations"""
        recommendations = []
        
        # Get customer preferences
        browsing_history = customer.get('browsing_history', [])
        purchase_history = customer.get('purchase_history', [])
        preferences = customer.get('preferences', {})
        favorite_colors = preferences.get('favorite_colors', [])
        budget_range = preferences.get('budget_range', '0-999999')
        
        # Parse budget
        if not budget:
            min_budget, max_budget = map(int, budget_range.split('-'))
        else:
            min_budget, max_budget = 0, budget
        
        # Score products
        scored_products = []
        for product in all_products:
            score = 0
            
            # Category match with browsing history
            if product['category'] in browsing_history:
                score += 30
            
            # Category match with purchase history
            past_categories = [p['category'] for p in purchase_history]
            if product['category'] in past_categories:
                score += 20
            
            # Color preference
            product_colors = product.get('attributes', {}).get('color', [])
            if any(color in favorite_colors for color in product_colors):
                score += 15
            
            # Budget match
            if min_budget <= product['price'] <= max_budget:
                score += 25
            
            # Occasion match
            if occasion:
                product_occasion = product.get('attributes', {}).get('occasion', '')
                if occasion.lower() in product_occasion.lower():
                    score += 20
            
            # High rating
            if product.get('rating', 0) >= 4.5:
                score += 10
            
            # Discount
            if product.get('discount', 0) >= 30:
                score += 5
            
            scored_products.append({
                "product": product,
                "score": score
            })
        
        # Sort by score and get top recommendations
        scored_products.sort(key=lambda x: x['score'], reverse=True)
        recommendations = [item['product'] for item in scored_products[:5]]
        
        return recommendations
    
    def _suggest_complementary_items(self, recommendations, all_products):
        """Suggest items that go well with recommendations"""
        complementary = []
        
        if not recommendations:
            return complementary
        
        main_product = recommendations[0]
        main_category = main_product['category']
        
        # Define complementary pairs
        complementary_map = {
            "Women's Ethnic": ["Accessories", "Footwear"],
            "Women's Western": ["Accessories", "Footwear"],
            "Men's Formal": ["Accessories", "Footwear"],
            "Men's Casual": ["Accessories", "Footwear"],
            "Men's Ethnic": ["Accessories", "Footwear"]
        }
        
        if main_category in complementary_map:
            complementary_categories = complementary_map[main_category]
            
            for product in all_products:
                if product['category'] in complementary_categories:
                    complementary.append(product)
                    if len(complementary) >= 3:
                        break
        
        return complementary
    
    def _create_personalized_message(self, customer, recommendations):
        """Create a personalized message for the customer"""
        name = customer.get('name', 'there').split()[0]
        
        if not recommendations:
            return f"Hi {name}! Let me help you find something perfect for you."
        
        # Try Gemini for more natural messages
        if GEMINI_ENABLED and gemini_assistant.is_available():
            try:
                message = gemini_assistant.generate_recommendation_message(customer, recommendations)
                if message:
                    return message
            except Exception as e:
                print(f"Gemini error: {str(e)}")
        
        # Fallback messages
        main_product = recommendations[0]
        
        messages = [
            f"Hi {name}! Based on your preferences, I think you'll love this {main_product['name']}.",
            f"Hello {name}! I've found some great options for you. This {main_product['name']} is perfect!",
            f"Hi {name}! I noticed you like {customer.get('browsing_history', [''])[0]}, so I picked this {main_product['name']} for you."
        ]
        
        import random
        return random.choice(messages)
