"""
Payment Agent - Processes payments with retry logic
"""
from typing import Dict, Any
import requests
from agents.base_agent import BaseAgent

class PaymentAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "PaymentAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process payment
        
        Args:
            task: {
                "amount": float,
                "method": str (card, upi, gift_card, pos),
                "card_number": str (optional),
                "retry": bool (optional)
            }
        """
        self.log(f"Processing payment of ₹{task.get('amount')}...")
        
        amount = task.get('amount')
        method = task.get('method', 'card')
        card_number = task.get('card_number', '')
        is_retry = task.get('retry', False)
        
        # Validate amount
        if not amount or amount <= 0:
            return {
                "success": False,
                "error": "Invalid payment amount"
            }
        
        # Process payment
        try:
            if is_retry:
                response = requests.post(
                    f"{self.api_base_url}/api/payment/retry",
                    json={
                        "amount": amount,
                        "method": method
                    }
                )
            else:
                response = requests.post(
                    f"{self.api_base_url}/api/payment/process",
                    json={
                        "amount": amount,
                        "method": method,
                        "card_number": card_number
                    }
                )
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"Payment successful! Transaction ID: {result.get('transaction_id')}")
                
                return {
                    "success": True,
                    "transaction_id": result.get('transaction_id'),
                    "amount": amount,
                    "method": method,
                    "timestamp": result.get('timestamp'),
                    "message": "Payment processed successfully"
                }
            else:
                error_data = response.json()
                self.log(f"Payment failed: {error_data.get('message')}")
                
                return {
                    "success": False,
                    "error": error_data.get('message'),
                    "error_code": error_data.get('error_code'),
                    "retry_available": True,
                    "suggestion": "Would you like to try another payment method or retry?"
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Payment processing failed: {str(e)}",
                "retry_available": True
            }
    
    def retry_payment(self, original_task: Dict[str, Any]) -> Dict[str, Any]:
        """Retry a failed payment"""
        self.log("Retrying payment...")
        original_task['retry'] = True
        return self.execute(original_task)
    
    def get_payment_methods(self, customer_id: str) -> Dict[str, Any]:
        """Get available payment methods for customer"""
        return {
            "success": True,
            "methods": [
                {
                    "type": "card",
                    "name": "Credit/Debit Card",
                    "available": True
                },
                {
                    "type": "upi",
                    "name": "UPI",
                    "available": True
                },
                {
                    "type": "gift_card",
                    "name": "Gift Card",
                    "available": True
                },
                {
                    "type": "pos",
                    "name": "In-Store POS",
                    "available": True
                }
            ]
        }
