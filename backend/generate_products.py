"""
Generate 200+ diverse products for Apex shopping platform with real images
"""
import json
import random

# Real image URLs - using specific verified Unsplash images
IMAGE_URLS = {
    "saree": [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop",
    ],
    "suit": [
        "https://images.unsplash.com/photo-1583391733981-8b1c68a41e03?w=400&h=500&fit=crop",
    ],
    "kurta": [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
    ],
    "lehenga": [
        "https://images.unsplash.com/photo-1610030469978-5b6a4f6e8c0c?w=400&h=500&fit=crop",
    ],
    "dress": [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop",
    ],
    "top": [
        "https://images.unsplash.com/photo-1564257577142-98f5c7ef2a8e?w=400&h=500&fit=crop",
    ],
    "jeans": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    ],
    "shirt": [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
    ],
    "tshirt": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop",
    ],
    "watch": [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop",
    ],
    "bag": [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop",
    ],
    "shoes": [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
    ],
    "jewelry": [
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
    ],
    "jacket": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    ],
    "sunglasses": [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
    ],
    "sports": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop",
    ],
    "belt": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    ],
    "wallet": [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
    ],
}

def get_image_for_product(product_name):
    """Get appropriate image URL based on product name"""
    name_lower = product_name.lower()
    
    if "saree" in name_lower or "sari" in name_lower:
        return random.choice(IMAGE_URLS["saree"])
    elif "suit" in name_lower or "anarkali" in name_lower:
        return random.choice(IMAGE_URLS["suit"])
    elif "kurta" in name_lower:
        return random.choice(IMAGE_URLS["kurta"])
    elif "lehenga" in name_lower:
        return random.choice(IMAGE_URLS["lehenga"])
    elif "dress" in name_lower:
        return random.choice(IMAGE_URLS["dress"])
    elif "top" in name_lower or "blouse" in name_lower:
        return random.choice(IMAGE_URLS["top"])
    elif "jeans" in name_lower or "trouser" in name_lower:
        return random.choice(IMAGE_URLS["jeans"])
    elif "shirt" in name_lower and "t-shirt" not in name_lower:
        return random.choice(IMAGE_URLS["shirt"])
    elif "t-shirt" in name_lower or "tshirt" in name_lower or "polo" in name_lower:
        return random.choice(IMAGE_URLS["tshirt"])
    elif "watch" in name_lower:
        return random.choice(IMAGE_URLS["watch"])
    elif "bag" in name_lower or "handbag" in name_lower:
        return random.choice(IMAGE_URLS["bag"])
    elif "shoe" in name_lower or "sneaker" in name_lower or "boot" in name_lower:
        return random.choice(IMAGE_URLS["shoes"])
    elif "jewelry" in name_lower or "necklace" in name_lower or "earring" in name_lower:
        return random.choice(IMAGE_URLS["jewelry"])
    elif "jacket" in name_lower or "blazer" in name_lower:
        return random.choice(IMAGE_URLS["jacket"])
    elif "sunglass" in name_lower:
        return random.choice(IMAGE_URLS["sunglasses"])
    elif "sport" in name_lower or "gym" in name_lower or "yoga" in name_lower:
        return random.choice(IMAGE_URLS["sports"])
    else:
        # Default fallback
        return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"

def generate_products():
    products = []
    sku_counter = 1
    
    # Women's Ethnic Wear (40 products)
    womens_ethnic = [
        # Sarees
        *[{"name": f"{style} Silk Saree", "subcategory": "Sarees", "price_range": (5999, 15999), "material": "Silk"} 
          for style in ["Banarasi", "Kanjivaram", "Tussar", "Mysore", "Paithani"]],
        *[{"name": f"{color} Cotton Saree", "subcategory": "Sarees", "price_range": (1999, 4999), "material": "Cotton"}
          for color in ["Blue", "Red", "Green", "Yellow", "Pink"]],
        
        # Suits
        *[{"name": f"{style} Suit Set", "subcategory": "Suits", "price_range": (2999, 8999), "material": "Cotton/Silk"}
          for style in ["Anarkali", "Palazzo", "Straight Cut", "A-Line", "Pakistani"]],
        
        # Kurtas
        *[{"name": f"{style} Kurta Set", "subcategory": "Kurta Sets", "price_range": (1499, 3999), "material": "Cotton"}
          for style in ["Printed", "Embroidered", "Block Print", "Bandhani", "Chikankari"]],
        
        # Lehengas
        *[{"name": f"{style} Lehenga Choli", "subcategory": "Lehengas", "price_range": (8999, 25999), "material": "Silk/Velvet"}
          for style in ["Bridal", "Party Wear", "Designer", "Floral", "Heavy Work"]],
        
        # Dupattas & Stoles
        *[{"name": f"{style} Dupatta", "subcategory": "Dupattas", "price_range": (599, 1999), "material": "Chiffon/Cotton"}
          for style in ["Silk", "Chiffon", "Net", "Georgette", "Bandhej"]],
    ]
    
    # Women's Western Wear (40 products)
    womens_western = [
        # Dresses
        *[{"name": f"{style} Dress", "subcategory": "Dresses", "price_range": (1999, 5999), "material": "Polyester/Cotton"}
          for style in ["Maxi", "Midi", "Mini", "A-Line", "Bodycon", "Shift", "Wrap", "Shirt"]],
        
        # Tops & Tunics
        *[{"name": f"{style} Top", "subcategory": "Tops", "price_range": (799, 2499), "material": "Cotton/Polyester"}
          for style in ["Crop", "Peplum", "Off-Shoulder", "Cold-Shoulder", "Halter", "Tank", "Button-Down"]],
        
        # Jeans & Trousers
        *[{"name": f"{style} Jeans", "subcategory": "Bottoms", "price_range": (1499, 3999), "material": "Denim"}
          for style in ["Skinny", "Boyfriend", "Wide-Leg", "Bootcut", "High-Waist", "Ripped"]],
        
        # Skirts
        *[{"name": f"{style} Skirt", "subcategory": "Skirts", "price_range": (999, 2999), "material": "Cotton/Polyester"}
          for style in ["Pencil", "A-Line", "Pleated", "Denim", "Maxi"]],
        
        # Jackets & Blazers
        *[{"name": f"{style} Jacket", "subcategory": "Outerwear", "price_range": (2499, 6999), "material": "Polyester/Cotton"}
          for style in ["Denim", "Leather", "Bomber", "Blazer", "Trench"]],
    ]
    
    # Men's Formal Wear (30 products)
    mens_formal = [
        # Shirts
        *[{"name": f"{color} Formal Shirt", "subcategory": "Shirts", "price_range": (1299, 2999), "material": "Cotton"}
          for color in ["White", "Blue", "Black", "Grey", "Light Blue", "Pink", "Lavender"]],
        
        # Trousers
        *[{"name": f"{color} Formal Trousers", "subcategory": "Trousers", "price_range": (1499, 3499), "material": "Polyester/Wool"}
          for color in ["Black", "Grey", "Navy", "Beige", "Brown"]],
        
        # Suits & Blazers
        *[{"name": f"{style} Blazer", "subcategory": "Blazers", "price_range": (3999, 9999), "material": "Wool/Polyester"}
          for style in ["Single-Breasted", "Double-Breasted", "Slim-Fit", "Regular-Fit", "Textured"]],
        
        # Formal Shoes
        *[{"name": f"{style} Formal Shoes", "subcategory": "Shoes", "price_range": (2499, 5999), "material": "Leather"}
          for style in ["Oxford", "Derby", "Monk Strap", "Loafers", "Brogues"]],
    ]
    
    # Men's Casual Wear (30 products)
    mens_casual = [
        # T-Shirts
        *[{"name": f"{style} T-Shirt", "subcategory": "T-Shirts", "price_range": (599, 1499), "material": "Cotton"}
          for style in ["Polo", "Round Neck", "V-Neck", "Henley", "Graphic Print", "Striped", "Solid"]],
        
        # Casual Shirts
        *[{"name": f"{style} Casual Shirt", "subcategory": "Shirts", "price_range": (999, 2499), "material": "Cotton/Linen"}
          for style in ["Denim", "Flannel", "Linen", "Checkered", "Printed"]],
        
        # Jeans
        *[{"name": f"{style} Jeans", "subcategory": "Jeans", "price_range": (1499, 3999), "material": "Denim"}
          for style in ["Slim Fit", "Regular Fit", "Skinny", "Relaxed", "Straight"]],
        
        # Casual Shoes
        *[{"name": f"{style} Casual Shoes", "subcategory": "Shoes", "price_range": (1999, 4999), "material": "Canvas/Leather"}
          for style in ["Sneakers", "Loafers", "Boat Shoes", "Slip-Ons", "Canvas"]],
    ]
    
    # Men's Ethnic Wear (20 products)
    mens_ethnic = [
        *[{"name": f"{style} Kurta Pajama Set", "subcategory": "Kurta Sets", "price_range": (1999, 5999), "material": "Cotton/Silk"}
          for style in ["Plain", "Embroidered", "Printed", "Designer", "Wedding"]],
        
        *[{"name": f"{style} Sherwani", "subcategory": "Sherwanis", "price_range": (8999, 25999), "material": "Silk/Brocade"}
          for style in ["Wedding", "Indo-Western", "Traditional", "Designer", "Royal"]],
        
        *[{"name": f"{style} Dhoti Kurta Set", "subcategory": "Dhoti Sets", "price_range": (2499, 6999), "material": "Cotton/Silk"}
          for style in ["Traditional", "Modern", "Festive", "Party Wear", "Casual"]],
    ]
    
    # Footwear (25 products)
    footwear = [
        # Women's Footwear
        *[{"name": f"Women's {style}", "subcategory": "Women's Footwear", "price_range": (999, 3999), "material": "Leather/Synthetic"}
          for style in ["Heels", "Wedges", "Flats", "Sandals", "Boots", "Pumps", "Stilettos", "Ankle Boots"]],
        
        # Men's Footwear
        *[{"name": f"Men's {style}", "subcategory": "Men's Footwear", "price_range": (1499, 4999), "material": "Leather/Synthetic"}
          for style in ["Sports Shoes", "Running Shoes", "Boots", "Sandals", "Flip Flops"]],
        
        # Kids Footwear
        *[{"name": f"Kids {style}", "subcategory": "Kids Footwear", "price_range": (599, 1999), "material": "Synthetic"}
          for style in ["School Shoes", "Sneakers", "Sandals", "Boots"]],
    ]
    
    # Accessories (30 products)
    accessories = [
        # Watches
        *[{"name": f"{style} Watch", "subcategory": "Watches", "price_range": (2999, 9999), "material": "Stainless Steel"}
          for style in ["Analog", "Digital", "Smart", "Chronograph", "Designer", "Luxury"]],
        
        # Bags
        *[{"name": f"{style} Handbag", "subcategory": "Bags", "price_range": (1999, 8999), "material": "Leather/Synthetic"}
          for style in ["Tote", "Satchel", "Clutch", "Crossbody", "Hobo", "Backpack"]],
        
        *[{"name": f"Men's {style} Bag", "subcategory": "Bags", "price_range": (1499, 5999), "material": "Leather/Canvas"}
          for style in ["Laptop", "Messenger", "Duffel", "Backpack"]],
        
        # Jewelry
        *[{"name": f"{style} Jewelry Set", "subcategory": "Jewelry", "price_range": (999, 4999), "material": "Artificial/Gold Plated"}
          for style in ["Necklace", "Earrings", "Bracelet", "Ring", "Pendant"]],
        
        # Others
        *[{"name": f"{item}", "subcategory": "Accessories", "price_range": (299, 1999), "material": "Various"}
          for item in ["Sunglasses", "Belt", "Wallet", "Scarf", "Hat"]],
    ]
    
    # Kids Wear (30 products)
    kids_wear = [
        *[{"name": f"Boy's {style}", "subcategory": "Boys Wear", "price_range": (499, 1999), "material": "Cotton"}
          for style in ["T-Shirt", "Shirt", "Jeans", "Shorts", "Tracksuit", "Ethnic Kurta", "Polo T-Shirt", "Cargo Pants"]],
        
        *[{"name": f"Girl's {style}", "subcategory": "Girls Wear", "price_range": (599, 2499), "material": "Cotton/Polyester"}
          for style in ["Dress", "Frock", "Lehenga", "Skirt Set", "Top & Jeans", "Ethnic Dress", "Party Gown", "Tutu Dress"]],
        
        *[{"name": f"Kids {style}", "subcategory": "Kids Wear", "price_range": (699, 1999), "material": "Cotton"}
          for style in ["Winter Jacket", "Sweater", "Raincoat", "School Uniform", "Party Wear", "Hoodie", "Sweatshirt"]],
    ]
    
    # Sports & Activewear (25 products)
    sportswear = [
        *[{"name": f"{style} Sports Wear", "subcategory": "Sportswear", "price_range": (1299, 3999), "material": "Polyester/Spandex"}
          for style in ["Running", "Gym", "Yoga", "Training", "Track Suit"]],
        
        *[{"name": f"Sports {item}", "subcategory": "Sports Accessories", "price_range": (599, 2499), "material": "Synthetic"}
          for item in ["Shoes", "Bag", "Water Bottle", "Cap", "Gloves", "Socks"]],
        
        *[{"name": f"{style} Activewear Set", "subcategory": "Activewear", "price_range": (1999, 4999), "material": "Lycra/Cotton"}
          for style in ["Women's Yoga", "Men's Gym", "Running", "Cycling", "Swimming", "CrossFit", "Boxing", "Tennis"]],
    ]
    
    # Combine all categories
    all_items = [
        ("Women's Ethnic", womens_ethnic),
        ("Women's Western", womens_western),
        ("Men's Formal", mens_formal),
        ("Men's Casual", mens_casual),
        ("Men's Ethnic", mens_ethnic),
        ("Footwear", footwear),
        ("Accessories", accessories),
        ("Kids", kids_wear),
        ("Sportswear", sportswear),
    ]
    
    colors = ["Red", "Blue", "Green", "Black", "White", "Pink", "Yellow", "Purple", "Orange", "Brown", "Grey", "Navy"]
    sizes = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
    occasions = ["Casual", "Formal", "Party", "Festive", "Wedding", "Office"]
    
    for category, items in all_items:
        for item in items:
            min_price, max_price = item["price_range"]
            price = random.randint(min_price // 100, max_price // 100) * 100
            mrp = int(price * random.uniform(1.3, 1.8))
            discount = int(((mrp - price) / mrp) * 100)
            
            # Get appropriate image
            image_url = get_image_for_product(item["name"])
            
            product = {
                "sku": f"SKU{str(sku_counter).zfill(4)}",
                "name": item["name"],
                "category": category,
                "subcategory": item["subcategory"],
                "price": price,
                "mrp": mrp,
                "discount": discount,
                "description": f"Premium quality {item['name'].lower()} made from {item['material']}. Perfect for your wardrobe collection.",
                "attributes": {
                    "color": random.sample(colors, random.randint(2, 4)),
                    "size": random.sample(sizes, random.randint(3, 5)) if "Footwear" not in category else ["6", "7", "8", "9", "10"],
                    "material": item["material"],
                    "occasion": random.choice(occasions)
                },
                "image_url": image_url,
                "rating": round(random.uniform(3.8, 4.9), 1),
                "reviews": random.randint(50, 500),
                "images": [
                    image_url,
                    image_url
                ]
            }
            
            products.append(product)
            sku_counter += 1
    
    return products

if __name__ == "__main__":
    products = generate_products()
    
    # Save to products.json
    with open('data/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Generated {len(products)} products successfully!")
    print(f"\nProducts by category:")
    
    categories = {}
    for p in products:
        cat = p['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count} products")
