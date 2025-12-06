import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveItem, customerData }) => {
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 0 : 0; // Free shipping
    return subtotal + shipping;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-gray-200 shadow-2xl">
            <div className="text-8xl mb-6 opacity-40">🛒</div>
            <h2 className="text-3xl font-bold mb-4 text-black">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add items to your cart to see them here.</p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white border-none rounded-lg text-base font-bold cursor-pointer transition-all duration-300 hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-black flex items-center gap-3">
          🛒 Shopping Cart
          <span className="text-lg font-normal text-gray-600">
            ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-5 p-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-all duration-300">
                  <div className="w-[150px] h-[150px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300 shadow-lg">
                    <img
                      src={item.image || 'https://via.placeholder.com/150/000000/ffffff?text=Product'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-black">{item.name}</h3>
                      <p className="text-sm text-green-600 mb-3 font-semibold">✓ In stock</p>
                      
                      <div className="flex gap-4 mb-3">
                        {item.color && (
                          <p className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-300">
                            <span className="font-semibold">Color:</span> {item.color}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-300">
                            <span className="font-semibold">Size:</span> {item.size}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-r-2 border-gray-300 text-black font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-5 py-2 min-w-[50px] text-center font-bold text-black">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-l-2 border-gray-300 text-black font-bold transition-all duration-200"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg text-sm font-semibold transition-all duration-200"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      <p className="text-2xl font-black text-black">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-20 border-2 border-gray-200 shadow-xl">
              <h2 className="text-xl font-bold text-black mb-5 pb-3 border-b-2 border-gray-200">
                Order Summary
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-4 text-base">
                  <span className="text-gray-700 font-semibold">
                    Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):
                  </span>
                  <span className="font-bold text-black text-lg">
                    ₹{calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between mb-4 text-base">
                  <span className="text-gray-700 font-semibold">Shipping:</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                
                <div className="flex justify-between pt-4 border-t-2 border-gray-200 text-xl">
                  <span className="text-black font-black">Total:</span>
                  <span className="font-black text-black">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-4 bg-black hover:bg-gray-800 text-white border-none rounded-xl text-base font-black cursor-pointer mb-4 transition-all duration-300 hover:scale-105"
                onClick={() => alert('Proceeding to checkout')}
              >
                🚀 Proceed to Buy
              </button>

              {/* Loyalty Points */}
              {customerData && (
                <div className="text-sm border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
                    <p className="mb-2 text-black font-semibold">
                      ⭐ You will earn <span className="font-black text-black text-base">
                        {Math.floor(calculateTotal() / 10)} points
                      </span> from this purchase
                    </p>
                    <p className="text-gray-700">
                      Current points: <span className="font-bold text-black">{customerData.points}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
