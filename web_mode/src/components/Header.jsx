import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerProfile from './CustomerProfile';

const Header = ({ 
  onGetStarted, 
  showBackButton, 
  onBack, 
  cartItemCount = 0,
  customerData,
  onNotificationClick,
  notificationCount = 0,
  sessionActive = false
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implement search functionality
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 px-4 py-2">
        {/* Logo/Brand */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold whitespace-nowrap">
            APEX
          </div>
        </div>

        {/* Search Bar */}
        <form className="flex items-center flex-1 max-w-[600px] mx-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search FashionHub"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border-none bg-white rounded-l text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
          <button 
            type="submit" 
            className="px-3 py-2 bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] border-none rounded-r text-base cursor-pointer transition-colors flex items-center justify-center"
            title="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
        
        {/* Action Items */}
        <nav className="flex items-center gap-4 flex-shrink-0">
          {/* AI Assistant */}
          {!sessionActive && (
            <button 
              onClick={onGetStarted}
              className="flex items-center gap-1 hover:border hover:border-white px-2 py-1 rounded transition-all text-sm whitespace-nowrap"
            >
              <span>🤖</span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs">Start with</span>
                <span className="font-bold text-xs">AI Assistant</span>
              </div>
            </button>
          )}

          {/* Notifications */}
          {sessionActive && (
            <button 
              className="relative flex items-center justify-center hover:border hover:border-white p-2 rounded transition-all"
              onClick={onNotificationClick}
              title="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#FF9900] text-[#131921] rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Cart */}
          <button 
            className="relative flex items-center gap-1 hover:border hover:border-white px-2 py-1 rounded transition-all whitespace-nowrap"
            onClick={() => navigate('/cart')}
            title="Cart"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF9900] text-[#131921] rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Customer Profile */}
          {customerData && (
            <CustomerProfile 
              customerData={customerData}
              sessionActive={sessionActive}
              onLogout={() => console.log('Logout')}
            />
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
