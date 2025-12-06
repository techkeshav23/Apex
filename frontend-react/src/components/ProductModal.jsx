import React, { useState } from 'react';

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product?.attributes?.size?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.attributes?.color?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out] p-5" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl bg-white/10 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-hidden animate-[slideInUp_0.3s_ease-out]" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-5 right-5 w-10 h-10 bg-white/10 backdrop-blur-sm text-white text-xl font-bold border-none rounded-full cursor-pointer transition-all duration-300 z-10 flex items-center justify-center hover:bg-white/20 hover:rotate-90" 
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="grid grid-cols-2 gap-10 p-10 overflow-y-auto max-h-[90vh]">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[4/5] bg-white/5 rounded-xl overflow-hidden">
              <img 
                src={product.image || `https://via.placeholder.com/400x500/667eea/ffffff?text=${product.name}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.discount > 0 && (
              <div className="absolute top-5 left-5 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg">
                {product.discount}% OFF
              </div>
            )}
            <div className="absolute bottom-5 left-5 px-4 py-2 backdrop-blur-xl border border-white/20 rounded-lg text-sm font-semibold">
              {product.stock > 10 ? (
                <span className="text-green-400">✓ In Stock</span>
              ) : product.stock > 0 ? (
                <span className="text-orange-400">⚠️ Only {product.stock} left</span>
              ) : (
                <span className="text-red-400">✕ Out of Stock</span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2 -tracking-tight">{product.name}</h2>
                <p className="text-base text-gray-400 uppercase tracking-wide">{product.category}</p>
              </div>
              <button 
                className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-primary/20 rounded-full flex items-center justify-center text-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:scale-110" 
                title="Add to Wishlist"
              >
                ❤️
              </button>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{'⭐'.repeat(Math.floor(product.rating))}</span>
              <span className="text-base font-bold text-white">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-extrabold text-white">₹{product.price.toLocaleString()}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
                  <span className="text-sm text-green-400 font-semibold">
                    You save ₹{(product.mrp - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10">
              <button 
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'details'
                    ? 'text-white border-primary'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'description'
                    ? 'text-white border-primary'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'delivery'
                    ? 'text-white border-primary'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
                onClick={() => setActiveTab('delivery')}
              >
                Delivery
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              {activeTab === 'details' && (
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">{product.description}</p>
                  
                  {/* Size Selection */}
                  {product.attributes?.size && product.attributes.size.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">Select Size:</label>
                      <div className="flex flex-wrap gap-3">
                        {product.attributes.size.map((size) => (
                          <button
                            key={size}
                            className={`px-5 py-2.5 border-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                              selectedSize === size
                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(102,126,234,0.5)]'
                                : 'bg-white/5 border-primary/20 text-gray-300 hover:bg-white/10 hover:border-primary/40'
                            }`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.attributes?.color && product.attributes.color.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">Select Color:</label>
                      <div className="flex flex-wrap gap-3">
                        {product.attributes.color.map((color) => (
                          <button
                            key={color}
                            className={`px-5 py-2.5 border-2 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
                              selectedColor === color
                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(102,126,234,0.5)]'
                                : 'bg-white/5 border-primary/20 text-gray-300 hover:bg-white/10 hover:border-primary/40'
                            }`}
                            onClick={() => setSelectedColor(color)}
                            title={color}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">Quantity:</label>
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-primary/20 text-white text-xl font-bold rounded-lg transition-all duration-300 hover:bg-primary/20 hover:border-primary" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-lg font-bold text-white">{quantity}</span>
                      <button 
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-primary/20 text-white text-xl font-bold rounded-lg transition-all duration-300 hover:bg-primary/20 hover:border-primary" 
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">{product.description}</p>
                  <ul className="space-y-3">
                    {['Premium quality fabric', 'Easy to maintain', 'Perfect for all occasions', 'Available in multiple sizes and colors'].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-primary flex-shrink-0 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-5">
                  {[
                    { icon: '🚚', title: 'Standard Delivery', desc: 'Delivered in 5-7 business days' },
                    { icon: '⚡', title: 'Express Delivery', desc: 'Delivered in 2-3 business days' },
                    { icon: '🏪', title: 'Click & Collect', desc: 'Pick up from nearest store' }
                  ].map((option, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-primary/10 rounded-lg">
                      <span className="text-3xl">{option.icon}</span>
                      <div>
                        <strong className="block text-base text-white mb-1">{option.title}</strong>
                        <p className="text-sm text-gray-400 m-0">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                className="py-4 bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold border-none rounded-lg cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_10px_30px_rgba(102,126,234,0.5)] hover:-translate-y-0.5"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                🛒 Add to Cart
              </button>
              <button 
                className="py-4 bg-white/10 backdrop-blur-sm border-2 border-primary text-white text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 hover:-translate-y-0.5" 
                disabled={product.stock === 0}
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              {[
                { icon: '🔄', label: 'Easy Returns' },
                { icon: '💯', label: '100% Authentic' },
                { icon: '�', label: 'Free Delivery' }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-xs text-gray-400">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
