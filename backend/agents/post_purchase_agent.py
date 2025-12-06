"""
Post-Purchase Support Agent - Handles returns, exchanges, and feedback
"""
from typing import Dict, Any
from agents.base_agent import BaseAgent

class PostPurchaseAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "PostPurchaseAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle post-purchase requests
        
        Args:
            task: {
                "request_type": str (return, exchange, feedback, track_shipment),
                "order_id": str,
                "reason": str (optional),
                "rating": int (optional),
                "comments": str (optional)
            }
        """
        request_type = task.get('request_type')
        
        if request_type == 'return':
            return self._process_return(task)
        elif request_type == 'exchange':
            return self._process_exchange(task)
        elif request_type == 'feedback':
            return self._collect_feedback(task)
        elif request_type == 'track_shipment':
            return self._track_shipment(task)
        else:
            return {
                "success": False,
                "error": "Invalid request type"
            }
    
    def _process_return(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process return request"""
        self.log("Processing return request...")
        
        order_id = task.get('order_id')
        reason = task.get('reason', 'Not specified')
        
        # Generate return ID
        import random
        return_id = f"RET{random.randint(100000, 999999)}"
        
        return {
            "success": True,
            "return_id": return_id,
            "order_id": order_id,
            "status": "initiated",
            "message": "Return request has been initiated",
            "refund_details": {
                "method": "Original payment method",
                "timeline": "5-7 business days after pickup"
            },
            "pickup_details": {
                "scheduled": True,
                "date": "Within 2 business days",
                "message": "A pickup will be scheduled from your address"
            },
            "next_steps": [
                "Keep the product in original packaging",
                "Courier will pick up from your address",
                "Refund will be processed after quality check"
            ],
            "policy": {
                "return_window": "30 days from delivery",
                "conditions": [
                    "Product must be unused",
                    "Original tags and packaging required",
                    "Quality check will be performed"
                ]
            }
        }
    
    def _process_exchange(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process exchange request"""
        self.log("Processing exchange request...")
        
        order_id = task.get('order_id')
        reason = task.get('reason', 'Size/color issue')
        exchange_for = task.get('exchange_for', {})
        
        import random
        exchange_id = f"EXC{random.randint(100000, 999999)}"
        
        return {
            "success": True,
            "exchange_id": exchange_id,
            "order_id": order_id,
            "status": "initiated",
            "message": "Exchange request has been initiated",
            "exchange_details": {
                "original_item": task.get('item_name', 'Product'),
                "exchange_for": exchange_for,
                "price_difference": 0
            },
            "process": {
                "step1": "Return pickup will be scheduled",
                "step2": "Quality check of returned item",
                "step3": "New item will be shipped",
                "timeline": "7-10 business days"
            },
            "next_steps": [
                "Keep the product in original packaging",
                "Pickup will be scheduled within 2 days",
                "New item ships after quality check"
            ]
        }
    
    def _collect_feedback(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Collect customer feedback"""
        self.log("Collecting customer feedback...")
        
        order_id = task.get('order_id')
        rating = task.get('rating', 0)
        comments = task.get('comments', '')
        
        return {
            "success": True,
            "message": "Thank you for your feedback!",
            "order_id": order_id,
            "rating": rating,
            "comments": comments,
            "reward": {
                "points_earned": 50,
                "message": "You've earned 50 bonus loyalty points for sharing feedback!"
            },
            "followup": "We value your opinion and will use it to improve our service"
        }
    
    def _track_shipment(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Track shipment status"""
        self.log("Tracking shipment...")
        
        order_id = task.get('order_id')
        
        return {
            "success": True,
            "order_id": order_id,
            "status": "In Transit",
            "current_location": "Mumbai Distribution Center",
            "estimated_delivery": "November 10, 2024",
            "tracking_updates": [
                {
                    "timestamp": "2024-11-08 10:00",
                    "status": "Order Placed",
                    "location": "Online"
                },
                {
                    "timestamp": "2024-11-08 14:00",
                    "status": "Order Confirmed",
                    "location": "Warehouse"
                },
                {
                    "timestamp": "2024-11-08 18:00",
                    "status": "Shipped",
                    "location": "Mumbai Warehouse"
                },
                {
                    "timestamp": "2024-11-09 08:00",
                    "status": "In Transit",
                    "location": "Mumbai Distribution Center"
                }
            ],
            "delivery_contact": "+91-9876543210"
        }
    
    def get_support_options(self) -> Dict[str, Any]:
        """Get available support options"""
        return {
            "success": True,
            "support_options": [
                {
                    "type": "return",
                    "name": "Return Product",
                    "description": "Return unwanted products within 30 days"
                },
                {
                    "type": "exchange",
                    "name": "Exchange Product",
                    "description": "Exchange for different size or color"
                },
                {
                    "type": "track_shipment",
                    "name": "Track Shipment",
                    "description": "Get real-time delivery updates"
                },
                {
                    "type": "feedback",
                    "name": "Share Feedback",
                    "description": "Tell us about your experience"
                }
            ],
            "contact": {
                "phone": "1800-123-4567",
                "email": "support@retailstore.com",
                "chat": "Available 24/7"
            }
        }
