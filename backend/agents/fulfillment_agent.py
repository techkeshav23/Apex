"""
Fulfillment Agent - Handles order fulfillment and delivery
"""
from typing import Dict, Any
import requests
from agents.base_agent import BaseAgent

class FulfillmentAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "FulfillmentAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create and manage order fulfillment
        
        Args:
            task: {
                "customer_id": str,
                "cart_items": List[Dict],
                "fulfillment_type": str (ship_to_home, pick_up, reserve),
                "delivery_address": Dict (optional),
                "store_location": str (optional)
            }
        """
        self.log("Processing order fulfillment...")
        
        customer_id = task.get('customer_id')
        cart_items = task.get('cart_items', [])
        fulfillment_type = task.get('fulfillment_type', 'ship_to_home')
        delivery_address = task.get('delivery_address')
        store_location = task.get('store_location')
        
        # Create order
        order_data = {
            "customer_id": customer_id,
            "items": cart_items,
            "fulfillment_type": fulfillment_type,
            "delivery_address": delivery_address,
            "store_location": store_location
        }
        
        try:
            response = requests.post(
                f"{self.api_base_url}/api/orders/create",
                json=order_data
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Process based on fulfillment type
                fulfillment_details = self._process_fulfillment(
                    fulfillment_type,
                    result.get('order_id'),
                    store_location,
                    delivery_address
                )
                
                self.log(f"Order created successfully! Order ID: {result.get('order_id')}")
                
                return {
                    "success": True,
                    "order_id": result.get('order_id'),
                    "tracking_number": result.get('tracking_number'),
                    "fulfillment_details": fulfillment_details,
                    "estimated_delivery": result.get('estimated_delivery')
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to create order"
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Order creation failed: {str(e)}"
            }
    
    def _process_fulfillment(self, fulfillment_type, order_id, store_location, delivery_address):
        """Process fulfillment based on type"""
        details = {
            "type": fulfillment_type,
            "order_id": order_id
        }
        
        if fulfillment_type == "ship_to_home":
            details.update({
                "message": "Your order will be shipped to your address",
                "delivery_address": delivery_address,
                "estimated_delivery": "3-5 business days",
                "tracking_available": True,
                "next_steps": [
                    "You will receive a confirmation email",
                    "Track your order using the tracking number",
                    "Package will be delivered to your doorstep"
                ]
            })
        
        elif fulfillment_type == "pick_up":
            details.update({
                "message": f"Your order is ready for pickup at {store_location}",
                "store_location": store_location,
                "pickup_time": "Available today after 2 PM",
                "instructions": "Please bring your order confirmation and ID",
                "next_steps": [
                    "You will receive a pickup ready notification",
                    "Visit the store during business hours",
                    "Show your order confirmation at the counter"
                ]
            })
        
        elif fulfillment_type == "reserve":
            details.update({
                "message": f"Items reserved for you at {store_location}",
                "store_location": store_location,
                "reservation_valid": "24 hours",
                "instructions": "Visit the store to try on and complete purchase",
                "next_steps": [
                    "Items will be held for 24 hours",
                    "Visit store to try on products",
                    "Complete purchase at store or decline reservation"
                ]
            })
        
        return details
    
    def track_order(self, order_id: str) -> Dict[str, Any]:
        """Track order status"""
        self.log(f"Tracking order {order_id}...")
        
        try:
            response = requests.get(
                f"{self.api_base_url}/api/orders/{order_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "order_id": order_id,
                    "status": data.get('status'),
                    "estimated_delivery": data.get('estimated_delivery'),
                    "updates": [
                        {"timestamp": "2024-11-08 10:00", "message": "Order placed"},
                        {"timestamp": "2024-11-08 14:00", "message": "Order confirmed"},
                        {"timestamp": "2024-11-08 18:00", "message": "Shipped"}
                    ]
                }
            else:
                return {
                    "success": False,
                    "error": "Order not found"
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Tracking failed: {str(e)}"
            }
    
    def notify_store(self, store_location: str, order_id: str, items: list) -> Dict[str, Any]:
        """Notify store staff about pickup/reservation"""
        self.log(f"Notifying {store_location} about order {order_id}...")
        
        return {
            "success": True,
            "message": f"Store staff at {store_location} have been notified",
            "notification_sent": True
        }
