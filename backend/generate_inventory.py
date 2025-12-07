import json
import random
import os

def load_json(filename):
    filepath = os.path.join('data', filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_json(filename, data):
    filepath = os.path.join('data', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def generate_inventory():
    products = load_json('products.json')
    if not products:
        print("No products found!")
        return

    inventory = {}
    
    warehouses = ["Mumbai Warehouse", "Delhi Warehouse", "Bangalore Warehouse"]
    stores = [
        "Phoenix Mall Mumbai", "DLF Mall Delhi", "Brigade Road Bangalore",
        "Phoenix Pune", "Alpha One Mall Ahmedabad", "Inorbit Mall Hyderabad",
        "Express Avenue Chennai", "Lulu Mall Kochi", "World Trade Park Jaipur"
    ]

    for product in products:
        sku = product['sku']
        name = product['name']
        
        # Generate random stock
        warehouse_stock = {w: random.randint(50, 500) for w in warehouses}
        store_stock = {s: random.randint(0, 50) for s in stores}
        
        inventory[sku] = {
            "sku": sku,
            "name": name,
            "warehouse_stock": warehouse_stock,
            "store_stock": store_stock
        }
    
    save_json('inventory.json', inventory)
    print(f"Generated inventory for {len(inventory)} products.")

if __name__ == "__main__":
    # Change directory to backend if running from root
    if os.path.basename(os.getcwd()) != 'backend':
        if os.path.exists('backend'):
            os.chdir('backend')
            
    generate_inventory()
