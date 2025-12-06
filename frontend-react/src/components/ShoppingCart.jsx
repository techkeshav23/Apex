import React, { useState } from 'react';
import axios from 'axios';

const ShoppingCart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, customerData, sessionId }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    let discount = 0;
    if (appliedPromo) {
      discount += (calculateSubtotal() * appliedPromo.percentage) / 100;
    }
    return discount;
  };

  const calculateLoyaltyDiscount = () => {
    if (!usePoints || !customerData?.points) return 0;
    // 1 point = ₹1, max 20% of subtotal
    const maxDiscount = calculateSubtotal() * 0.2;
    const pointsValue = Math.min(customerData.points, maxDiscount);
    return pointsValue;
  };

  const calculateDelivery = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 1000 ? 0 : 50; // Free delivery above ₹1000
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const loyaltyDiscount = calculateLoyaltyDiscount();
    const delivery = calculateDelivery();
    return subtotal - discount - loyaltyDiscount + delivery;
  };

  const handleApplyPromo = async () => {
    if (!sessionId) {
      alert('Please start a session with AI Assistant first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/cart/apply_promo', {
        session_id: sessionId,
        promo_code: promoCode.toUpperCase()
      });

      if (response.data.success) {
        setAppliedPromo({
          code: promoCode.toUpperCase(),
          discount: response.data.discount,
          description: `Saved ₹${response.data.discount.toFixed(0)}`
        });
        alert(`✅ Promo ${promoCode.toUpperCase()} applied! You saved ₹${response.data.discount.toFixed(0)}`);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid promo code';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
      setPromoCode('');
    }
  };

  const handleTogglePoints = async (checked) => {
    if (!sessionId) {
      alert('Please start a session first');
      return;
    }

    if (checked) {
      // Redeem points
      const pointsToUse = Math.min(customerData.points, calculateSubtotal() * 0.2);
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/cart/redeem_points', {
          session_id: sessionId,
          points: Math.floor(pointsToUse)
        });

        if (response.data.success) {
          setUsePoints(true);
          alert(`✅ Redeemed ${Math.floor(pointsToUse)} points! Saved ₹${response.data.discount}`);
        }
      } catch (error) {
        alert('❌ Failed to redeem points: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    } else {
      setUsePoints(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    if (!sessionId) {
      alert('Please start a session with AI Assistant to checkout');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/checkout', {
        session_id: sessionId
      });

      if (response.data.success) {
        alert(`🎉 Order Confirmed!\n\nOrder ID: ${response.data.order?.order_id}\nTotal Paid: ₹${calculateTotal()}\n\nThank you for shopping!`);
        onClose();
        // Clear cart in parent (App.jsx should handle this via callback)
      } else {
        alert('❌ Checkout failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`❌ Checkout Error: ${msg}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[1000] transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className={`absolute right-0 top-0 w-[450px] max-w-full h-full bg-white shadow-[-4px_0_32px_rgba(0,0,0,0.8)] border-l-2 border-gray-300 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 bg-black text-white flex justify-between items-center shadow-lg border-b-2 border-gray-300">
          <h2 className="m-0 text-[1.4rem] font-bold flex items-center gap-3">
            🛒 Shopping Cart
            <span className="text-[0.85rem] bg-gray-800 px-3 py-1 rounded-full font-semibold border-2 border-gray-700">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <button 
            className="w-10 h-10 border-2 border-gray-600 bg-gray-800 text-white rounded-lg text-xl cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-gray-700 hover:border-gray-500 hover:rotate-90" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-[6rem] mb-6 opacity-40">🛍️</div>
              <h3 className="m-0 mb-3 text-2xl font-bold text-black">Your cart is empty</h3>
              <p className="m-0 text-base text-gray-600">Start adding items to fill your cart!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mb-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-gray-400">
                    <div className="w-24 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-300 shadow-md">
                      <img 
                        src={item.image || `https://via.placeholder.com/96x112/000000/ffffff?text=${item.name.substring(0, 3)}`} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="m-0 mb-2 text-base text-black font-bold leading-tight">
                          {item.name}
                        </h4>
                        <p className="m-0 mb-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block border border-gray-300">
                          {item.size && <span className="font-semibold">Size: {item.size}</span>}
                          {item.color && <span className="font-semibold"> • Color: {item.color}</span>}
                        </p>
                      </div>
                      <div className="text-lg font-black text-black">
                        ₹{item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-3">
                      <div className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-1.5 shadow-md">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 border-none bg-gray-200 text-black rounded-md cursor-pointer text-lg font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-300 hover:scale-110"
                        >
                          −
                        </button>
                        <span className="min-w-[28px] text-center font-bold text-black text-base px-2">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border-none bg-gray-200 text-black rounded-md cursor-pointer text-lg font-bold transition-all duration-200 flex items-center justify-center hover:bg-gray-300 hover:scale-110"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="bg-white border-2 border-gray-300 px-3 py-1.5 rounded-lg text-base cursor-pointer text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 hover:scale-110" 
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="mb-5 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="🎟️ Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 bg-white rounded-lg text-sm uppercase font-bold text-black placeholder-gray-400 focus:outline-none focus:border-black transition-all duration-300"
                  />
                  <button 
                    onClick={handleApplyPromo} 
                    className="px-6 py-3 bg-black text-white border-none rounded-lg font-bold cursor-pointer transition-all duration-300 text-sm hover:bg-gray-800 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={loading || !promoCode.trim()}
                  >
                    {loading ? '⏳' : '✓ Apply'}
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-3 px-4 py-3 bg-green-50 text-green-700 border-2 border-green-300 rounded-lg text-sm font-bold flex justify-between items-center">
                    <span>✓ {appliedPromo.code} applied - {appliedPromo.description}</span>
                    <button 
                      onClick={() => setAppliedPromo(null)} 
                      className="bg-none border-none text-green-700 cursor-pointer text-lg p-0 px-2 transition-all duration-200 hover:text-black hover:scale-125"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Loyalty Points Section */}
              {customerData && customerData.points > 0 && (
                <div className="mb-5 p-4 bg-gray-100 rounded-xl border-2 border-gray-300 shadow-md">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-black">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => handleTogglePoints(e.target.checked)}
                      className="w-5 h-5 cursor-pointer accent-black"
                      disabled={loading}
                    />
                    <span className="flex items-center gap-2">
                      ⭐ Use <span className="text-black">{customerData.points}</span> loyalty points 
                      <span className="text-black font-black">
                        (Save ₹{Math.min(customerData.points, calculateSubtotal() * 0.2).toFixed(0)})
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-white p-5 rounded-xl border-2 border-gray-200 mb-4 shadow-md">
                <div className="flex justify-between mb-4 text-base text-gray-700 pb-3 border-b border-gray-200">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold text-black">₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between mb-4 text-base text-green-600 font-bold pb-3 border-b border-gray-200">
                    <span>🎟️ Promo Discount</span>
                    <span>−₹{calculateDiscount().toFixed(0)}</span>
                  </div>
                )}
                
                {usePoints && calculateLoyaltyDiscount() > 0 && (
                  <div className="flex justify-between mb-4 text-base text-gray-700 font-bold pb-3 border-b border-gray-200">
                    <span>⭐ Loyalty Points</span>
                    <span>−₹{calculateLoyaltyDiscount().toFixed(0)}</span>
                  </div>
                )}
                
                <div className="flex justify-between mb-4 text-base text-gray-700 pb-3 border-b border-gray-200">
                  <span className="font-semibold">Delivery Charges</span>
                  <span className="font-bold text-black">
                    {calculateDelivery() === 0 ? (
                      <span className="text-green-600">FREE 🎉</span>
                    ) : (
                      `₹${calculateDelivery()}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between pt-4 text-xl font-black text-black">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>

                {(calculateDiscount() + calculateLoyaltyDiscount()) > 0 && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 text-center rounded-lg font-bold text-sm border-2 border-green-300">
                    🎉 You're saving ₹{(calculateDiscount() + calculateLoyaltyDiscount()).toFixed(0)}!
                  </div>
                )}
              </div>

              {/* Earn Points Info */}
              {customerData && (
                <div className="p-3 bg-gray-100 text-black text-center rounded-xl text-sm font-bold border-2 border-gray-300">
                  ⭐ Earn <span className="text-black text-base">{Math.floor(calculateTotal() / 10)}</span> loyalty points on this order
                </div>
              )}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 bg-white border-t-2 border-gray-300 shadow-lg">
            <button 
              className="w-full px-5 py-4 bg-black text-white border-none rounded-xl text-base font-black cursor-pointer transition-all duration-300 flex justify-between items-center hover:scale-[1.02] hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              <span className="flex items-center gap-2">
                {checkoutLoading ? '⏳ Processing...' : '🚀 Proceed to Checkout'}
              </span>
              <span className="text-xl font-black bg-gray-800 px-4 py-2 rounded-lg">
                ₹{calculateTotal().toLocaleString()}
              </span>
            </button>
            <div className="mt-3 text-center">
              {calculateDelivery() > 0 && calculateSubtotal() < 1000 && (
                <p className="m-0 text-sm font-semibold text-gray-700">
                  💡 Add ₹{(1000 - calculateSubtotal()).toFixed(0)} more for FREE delivery
                </p>
              )}
              {calculateDelivery() === 0 && (
                <p className="m-0 text-sm font-bold text-green-600">
                  🎉 You've unlocked FREE delivery!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
