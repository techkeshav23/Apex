import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductDetailPage = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const [selectedColor, setSelectedColor] = useState(product?.attributes?.color?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.attributes?.size?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#FF9900] hover:bg-[#e88b00] text-gray-900 border-none rounded text-sm cursor-pointer"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      selectedColor,
      selectedSize,
      quantity
    });
    // Optionally navigate to cart
    // navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 hover:underline">
            Back to results
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-gray-100 rounded overflow-hidden mb-4">
              <img
                src={product.image || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-normal mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-orange-500">{'★'.repeat(Math.floor(product.rating))}</span>
                <span className="text-gray-400">{'★'.repeat(5 - Math.floor(product.rating))}</span>
              </div>
              <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                {product.reviews} ratings
              </span>
            </div>

            <div className="border-t border-b border-gray-300 py-2 mb-4">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm text-gray-600">Deal Price:</span>
                <span className="text-3xl text-[#B12704]">₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-600">M.R.P.:</span>
                <span className="text-sm text-gray-600 line-through">₹{product.mrp.toLocaleString()}</span>
                <span className="text-sm text-[#CC0C39]">({product.discount}% off)</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stock > 0 ? (
                <p className="text-green-700 text-base">In Stock</p>
              ) : (
                <p className="text-red-700 text-base">Out of Stock</p>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-[#B12704] text-sm">Only {product.stock} left in stock - order soon.</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-base font-bold mb-2">About this item</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.attributes?.color && product.attributes.color.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Color: {selectedColor}</label>
                <div className="flex gap-2">
                  {product.attributes.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded text-sm ${
                        selectedColor === color
                          ? 'border-orange-500 ring-1 ring-orange-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.attributes?.size && product.attributes.size.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Size: {selectedSize}</label>
                <div className="flex gap-2 flex-wrap">
                  {product.attributes.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded text-sm ${
                        selectedSize === size
                          ? 'border-orange-500 ring-1 ring-orange-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-6 py-2 bg-[#FF9900] hover:bg-[#e88b00] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 border-none rounded text-sm cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                disabled={product.stock === 0}
                className="px-6 py-2 bg-[#FFA41C] hover:bg-[#e8940c] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 border-none rounded text-sm cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Loyalty Points */}
            <div className="bg-gray-100 border border-gray-300 rounded p-3">
              <p className="text-sm text-gray-700">
                ⭐ Earn <span className="font-bold">{Math.floor(product.price / 10)} points</span> with this purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
