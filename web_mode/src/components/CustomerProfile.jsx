import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerProfile = ({ customerData, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOrdersClick = () => {
    setIsOpen(false);
    navigate('/orders');
  };

  const handleMenuClick = (item) => {
    setIsOpen(false);
    console.log(`${item} clicked - Page coming soon`);
  };

  if (!customerData) return null;

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 px-2 py-1 hover:border hover:border-white rounded transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 bg-[#FF9900] rounded-full flex items-center justify-center text-[#131921] font-bold text-sm">
          {customerData.name?.charAt(0) || 'K'}
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-400 leading-tight">Hello, {customerData.name?.split(' ')[0] || 'Guest'}</div>
          <div className="text-sm font-bold leading-tight flex items-center gap-1">
            Account & Lists
            <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-300 rounded shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
            
            {/* Menu Items */}
            <div className="p-2">
              <button 
                onClick={handleOrdersClick}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded text-left transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span className="text-sm">My Orders</span>
                </div>
                {customerData.pendingOrders > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {customerData.pendingOrders}
                  </span>
                )}
              </button>
              <button 
                onClick={() => handleMenuClick('Wishlist')}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded text-left transition-all"
              >
                <span className="text-lg">❤️</span>
                <span className="text-sm">Wishlist</span>
              </button>
              <button 
                onClick={() => handleMenuClick('Coupons')}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded text-left transition-all"
              >
                <span className="text-lg">🎟️</span>
                <span className="text-sm">Coupons</span>
              </button>
              <button 
                onClick={() => handleMenuClick('Settings')}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded text-left transition-all"
              >
                <span className="text-lg">⚙️</span>
                <span className="text-sm">Settings</span>
              </button>
              <button 
                onClick={() => handleMenuClick('Addresses')}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded text-left transition-all"
              >
                <span className="text-lg">📍</span>
                <span className="text-sm">Addresses</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="p-3 border-t border-gray-200">
              <button 
                className="w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded text-sm font-normal transition-all hover:bg-gray-100"
                onClick={onLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerProfile;
