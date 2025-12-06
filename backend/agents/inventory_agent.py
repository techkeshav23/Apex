"""
Inventory Agent - Checks stock availability across warehouses and stores
"""
from typing import Dict, Any, List
import requests
from agents.base_agent import BaseAgent

class InventoryAgent(BaseAgent):
    def __init__(self, api_base_url: str = "http://localhost:8080"):
        super().__init__(api_base_url)
        self.name = "InventoryAgent"
    
    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check inventory availability
        
        Args:
            task: {
                "sku": str,
                "quantity": int,
                "preferred_location": str (optional),
                "customer_location": str (optional)
            }
        """
        self.log("Checking inventory availability...")
        
        sku = task.get('sku')
        quantity = task.get('quantity', 1)
        preferred_location = task.get('preferred_location')
        customer_location = task.get('customer_location')
        
        # Get inventory data
        try:
            inventory_response = requests.get(
                f"{self.api_base_url}/api/inventory/{sku}"
            )
            inventory = inventory_response.json()
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch inventory: {str(e)}"
            }
        
        # Check availability
        availability = self._check_availability(
            inventory, quantity, preferred_location, customer_location
        )
        
        self.log(f"Inventory check complete: {availability['status']}")
        
        return {
            "success": True,
            "sku": sku,
            "product_name": inventory.get('name'),
            "availability": availability
        }
    
    def _check_availability(self, inventory, quantity, preferred_location, customer_location):
        """Check where the product is available"""
        availability = {
            "status": "not_available",
            "options": []
        }
        
        store_stock = inventory.get('store_stock', {})
        warehouse_stock = inventory.get('warehouse_stock', {})
        
        # Check preferred store first
        if preferred_location and preferred_location in store_stock:
            if store_stock[preferred_location] >= quantity:
                availability['status'] = 'available'
                availability['options'].append({
                    "type": "in_store",
                    "location": preferred_location,
                    "quantity": store_stock[preferred_location],
                    "fulfillment": "pick_up_today",
                    "message": f"Available at {preferred_location}. Pick up today!"
                })
        
        # Check nearby stores
        for store, stock in store_stock.items():
            if stock >= quantity and store != preferred_location:
                availability['status'] = 'available'
                availability['options'].append({
                    "type": "in_store",
                    "location": store,
                    "quantity": stock,
                    "fulfillment": "reserve_and_collect",
                    "message": f"Reserve at {store} for try-on"
                })
        
        # Check warehouse stock for home delivery
        total_warehouse = sum(warehouse_stock.values())
        if total_warehouse >= quantity:
            availability['status'] = 'available'
            availability['options'].append({
                "type": "online",
                "location": "warehouse",
                "quantity": total_warehouse,
                "fulfillment": "ship_to_home",
                "delivery_time": "3-5 business days",
                "message": "Ship to home - Delivery in 3-5 business days"
            })
        
        # Sort options - in-store first
        availability['options'].sort(key=lambda x: 0 if x['type'] == 'in_store' else 1)
        
        if not availability['options']:
            availability['status'] = 'out_of_stock'
            availability['message'] = "Currently out of stock"
            
            # Suggest alternatives
            availability['suggestion'] = "Would you like me to notify you when it's back in stock, or show you similar products?"
        
        return availability
