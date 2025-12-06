import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getProductImage } from '../utils/productImage';

const ProductGrid = ({ sessionId, onAddToCart, onShowAgent }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    if (onShowAgent) {
      onShowAgent('inventory', 'processing', 'Fetching latest products...');
    }
    
    try {
      const response = await axios.get('http://localhost:5001/api/products');
      setProducts(response.data.slice(0, 12)); // Show first 12 products
      setLoading(false);
      
      if (onShowAgent) {
        onShowAgent('inventory', 'success', 'Products loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      
      if (onShowAgent) {
        onShowAgent('inventory', 'error', 'Failed to load products');
      }
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;

    if (filter !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));
    }

    return filtered;
  };

  const handleQuickView = (product) => {
    navigate('/product', { state: { product } });
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      // Add image field to product before passing to cart
      const productWithImage = {
        ...product,
        image: getProductImage(product)
      };
      onAddToCart(productWithImage);
    }
    
    if (onShowAgent) {
      onShowAgent('sales', 'success', `Added ${product.name} to cart`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white">
        <div className="flex flex-col items-center justify-center h-[400px] gap-5 text-gray-700">
          <div className="w-[50px] h-[50px] border-[5px] border-gray-200 border-t-[#667eea] rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="bg-white min-h-screen">
      {/* Category Navigation Bar */}
      <div className="bg-[#232F3E] shadow-sm sticky top-[60px] z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-2">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-normal whitespace-nowrap transition-all border-none ${
                filter === 'all'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('ethnic')}
              className={`px-3 py-1.5 text-sm font-normal whitespace-nowrap transition-all border-none ${
                filter === 'ethnic'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Women's Ethnic
            </button>
            <button
              onClick={() => setFilter('western')}
              className={`px-3 py-1.5 text-sm font-normal whitespace-nowrap transition-all border-none ${
                filter === 'western'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Women's Western
            </button>
            <button
              onClick={() => setFilter('men')}
              className={`px-3 py-1.5 text-sm font-normal whitespace-nowrap transition-all border-none ${
                filter === 'men'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Men's Fashion
            </button>
            <button
              onClick={() => setFilter('kids')}
              className={`px-3 py-1.5 text-sm font-normal whitespace-nowrap transition-all border-none ${
                filter === 'kids'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Kids Wear
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-lg font-normal text-gray-700 m-0">
            {filteredProducts.length} results
          </h2>
        </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-[60px] px-5 text-gray-500 text-lg bg-white rounded border border-gray-200">
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {filteredProducts.map((product) => (
            <div key={product.sku} className="bg-white border border-gray-300 rounded hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="relative h-[280px] bg-gray-100 overflow-hidden">
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#CC0C39] text-white text-xs font-bold z-10">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Stock Badge */}
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#FF9900] text-white text-xs font-bold z-10">
                    Only {product.stock} left
                  </div>
                )}
                
                <img 
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onClick={() => handleQuickView(product)}
                  loading="lazy"
                />
              </div>
              
              <div className="p-3">
                <h3 className="text-sm font-normal text-gray-900 m-0 mb-1 overflow-hidden line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2 text-sm">
                  <span className="text-orange-500">{'★'.repeat(Math.floor(product.rating))}</span>
                  <span className="text-gray-400">{'★'.repeat(5 - Math.floor(product.rating))}</span>
                  <span className="text-gray-500 text-xs ml-1">
                    ({product.reviews})
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-normal text-gray-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
                  <span className="text-sm text-[#CC0C39] font-normal">({product.discount}% off)</span>
                </div>
                
                <button 
                  className="w-full py-2 px-3 bg-[#FF9900] hover:bg-[#e88b00] text-gray-900 border-none rounded text-sm font-normal cursor-pointer transition-colors"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductGrid;

