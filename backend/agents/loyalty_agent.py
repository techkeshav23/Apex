"""
Loyalty and Offers Agent - Manages loyalty points and promotions
"""
from typing import Dict, Any, List
import requests
from agents.base_agent import BaseAgent

class LoyaltyAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "LoyaltyAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply loyalty benefits and promotions
        
        Args:
            task: {
                "customer_id": str,
                "cart_total": float,
                "cart_items": List[Dict],
                "promo_code": str (optional)
            }
        """
        self.log("Calculating loyalty benefits and offers...")
        
        customer_id = task.get('customer_id')
        cart_total = task.get('cart_total')
        cart_items = task.get('cart_items', [])
        promo_code = task.get('promo_code')
        
        result = {
            "success": True,
            "original_total": cart_total,
            "discounts": [],
            "loyalty_info": {},
            "final_total": cart_total
        }
        
        # Get customer loyalty info
        try:
            loyalty_response = requests.get(
                f"{self.api_base_url}/api/loyalty/{customer_id}",
                timeout=5
            )
            loyalty_data = loyalty_response.json()
            result['loyalty_info'] = loyalty_data
        except Exception as e:
            self.log(f"Warning: Could not fetch loyalty data: {str(e)}")
        
        # Apply promo code if provided
        if promo_code:
            promo_discount = self._apply_promo_code(promo_code, cart_total, cart_items)
            if promo_discount['valid']:
                result['discounts'].append(promo_discount)
                result['final_total'] -= promo_discount['discount']
        
        # Check for automatic promotions
        auto_promos = self._check_automatic_promotions(cart_total, cart_items)
        for promo in auto_promos:
            result['discounts'].append(promo)
            result['final_total'] -= promo['discount']
        
        # Calculate points that will be earned
        if 'loyalty_info' in result and result['loyalty_info']:
            points_earned = self._calculate_points_earned(
                result['final_total'],
                result['loyalty_info'].get('tier_benefits', {})
            )
            result['points_to_earn'] = points_earned
        
        # Calculate total savings
        result['total_savings'] = cart_total - result['final_total']
        
        self.log(f"Total savings: ₹{result['total_savings']}")
        
        return result
    
    def _apply_promo_code(self, promo_code, cart_total, cart_items):
        """Apply a promo code"""
        try:
            categories = [item.get('category') for item in cart_items]
            
            response = requests.post(
                f"{self.api_base_url}/api/promotions/apply",
                json={
                    "promo_code": promo_code,
                    "cart_total": cart_total,
                    "categories": categories
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "valid": True,
                    "type": "promo_code",
                    "code": promo_code,
                    "discount": data.get('discount'),
                    "description": data.get('description')
                }
            else:
                error = response.json()
                return {
                    "valid": False,
                    "error": error.get('message')
                }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Failed to apply promo code: {str(e)}"
            }
    
    def _check_automatic_promotions(self, cart_total, cart_items):
        """Check for applicable automatic promotions"""
        promotions = []
        
        try:
            response = requests.get(f"{self.api_base_url}/api/promotions", timeout=5)
            all_promos = response.json()
            
            categories = [item.get('category') for item in cart_items]
            
            for promo in all_promos:
                if not promo.get('active'):
                    continue
                
                # Check if promotion applies
                min_purchase = promo.get('min_purchase', 0)
                if cart_total < min_purchase:
                    continue
                
                # Check category requirements
                applicable_categories = promo.get('applicable_categories', [])
                if applicable_categories:
                    if not any(cat in categories for cat in applicable_categories):
                        continue
                
                # Check minimum items requirement
                min_items = promo.get('min_items', 0)
                if len(cart_items) < min_items:
                    continue
                
                # Calculate discount
                if promo['type'] == 'percentage':
                    discount = cart_total * (promo['value'] / 100)
                else:
                    discount = promo['value']
                
                promotions.append({
                    "valid": True,
                    "type": "automatic",
                    "promo_id": promo['promo_id'],
                    "discount": discount,
                    "description": promo['description']
                })
        
        except Exception as e:
            self.log(f"Warning: Could not check promotions: {str(e)}")
        
        return promotions
    
    def _calculate_points_earned(self, amount, tier_benefits):
        """Calculate loyalty points to be earned"""
        points_per_100 = tier_benefits.get('points_per_100', 5)
        points = int(amount / 100) * points_per_100
        return points
    
    def redeem_points(self, customer_id: str, points: int) -> Dict[str, Any]:
        """Redeem loyalty points"""
        self.log(f"Redeeming {points} loyalty points...")
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/loyalty/redeem",
                json={
                    "customer_id": customer_id,
                    "points": points
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"Points redeemed successfully! Discount: ₹{data.get('discount')}")
                return {
                    "success": True,
                    "points_redeemed": points,
                    "discount": data.get('discount'),
                    "remaining_points": data.get('remaining_points')
                }
            else:
                error = response.json()
                return {
                    "success": False,
                    "error": error.get('message')
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to redeem points: {str(e)}"
            }
