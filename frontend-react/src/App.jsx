import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ChatInterface from './components/ChatInterface';
import ProductGrid from './components/ProductGrid';
import Header from './components/Header';
import AgentActivity from './components/AgentActivity';
import NotificationBar from './components/NotificationBar';
import ToastContainer from './components/Toast';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';

function AppContent() {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  
  // Cart State - Initialize from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('fashionhub_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fashionhub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist session data to localStorage
  useEffect(() => {
    if (sessionData) {
      localStorage.setItem('fashionhub_session', JSON.stringify(sessionData));
    }
  }, [sessionData]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('fashionhub_session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSessionData(parsedSession);
        setSessionActive(true);
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
  }, []);
  
  // Cart State

  
  // Customer Data
  const [customerData] = useState({
    customerId: 'CUST001',
    name: 'Keshav Upadhyay',
    loyaltyTier: 'Gold',
    points: 1250,
    pointsToNextTier: 500,
    totalOrders: 24,
    totalSpent: 45000,
    pendingOrders: 2,
    activeOffers: [
      { name: 'Weekend Special', discount: 20, expiryDate: '2 days' },
      { name: 'First Purchase Bonus', discount: 15, expiryDate: '7 days' }
    ]
  });
  
  // Agent Activity State
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStatus, setAgentStatus] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Toast Messages
  const [toasts, setToasts] = useState([]);

  // Auto-start session on component mount
  useEffect(() => {
    handleQuickStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSessionStart = (data) => {
    setSessionData(data);
    setSessionActive(true);
  };

  const handleSessionEnd = () => {
    setSessionActive(false);
    setSessionData(null);
    setCartItems([]);
    localStorage.removeItem('fashionhub_session');
    localStorage.removeItem('fashionhub_cart');
    addToast('Session ended', 'info');
  };

  const handleQuickStart = async () => {
    // Start session with backend check
    try {
      const response = await fetch('http://localhost:5000/api/start_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: 'CUST001',
          channel: 'web'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        handleSessionStart({
          session_id: data.session_id,
          message: data.message,
          customer_id: 'CUST001',
          channel: 'web'
        });
      } else {
        alert('Failed to start session: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Cannot connect to backend server. Please ensure:\n\n1. Backend is running (python app.py)\n2. Backend is on http://localhost:5000\n3. No firewall blocking the connection');
    }
  };

  // Cart Functions
  const handleAddToCart = async (product) => {
    const existingItem = cartItems.find(item => 
      item.id === product.sku && 
      item.size === product.selectedSize && 
      item.color === product.selectedColor
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + (product.quantity || 1) }
          : item
      ));
      addToast(`Updated quantity for ${product.name}`, 'success');
    } else {
      const newItem = {
        id: product.sku,
        name: product.name,
        price: product.price,
        image: product.image,
        size: product.selectedSize || product.attributes?.size?.[0],
        color: product.selectedColor || product.attributes?.color?.[0],
        quantity: product.quantity || 1
      };
      setCartItems([...cartItems, newItem]);
      addToast(`${product.name} added to cart!`, 'success');
    }

    // Sync with backend SalesAgent cart
    try {
      if (sessionData?.session_id) {
        await axios.post('http://localhost:5000/api/cart/add', {
          session_id: sessionData.session_id,
          sku: product.sku,
          quantity: product.quantity || 1
        });
      }
    } catch (e) {
      console.error('Failed to sync cart with backend:', e.message);
      addToast('Backend cart sync failed', 'error');
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    setCartItems(cartItems.filter(item => item.id !== itemId));
    addToast(`${item.name} removed from cart`, 'info');
  };

  const handleDismissNotification = () => {
    setNotifications([]);
  };

  const handleNotificationClick = () => {
    setNotificationCount(0);
    // TODO: Open notifications panel
    console.log('Show all notifications');
  };

  // Toast Functions
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Agent Activity Functions
  const showAgentActivity = (agent, status, message) => {
    setActiveAgent(agent);
    setAgentStatus(status);
    setAgentMessage(message);
    
    // Auto hide after 3 seconds for success/error
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setActiveAgent(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(118,75,162,0.05)_0%,transparent_50%)]" />
      
      <Header 
        onGetStarted={handleQuickStart}
        cartItemCount={cartItems.length}
        customerData={sessionActive ? customerData : null}
        onNotificationClick={handleNotificationClick}
        notificationCount={notificationCount}
        sessionActive={sessionActive}
      />
      
      {/* Notifications */}
      <NotificationBar 
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />
      
      {/* Agent Activity Indicator */}
      {activeAgent && (
        <AgentActivity
          activeAgent={activeAgent}
          status={agentStatus}
          message={agentMessage}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer 
        toasts={toasts}
        onRemoveToast={removeToast}
      />
      
      {/* Routes */}
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="flex-1 relative z-10 bg-gray-50">
              <div className="min-h-screen pb-24">
                <ProductGrid 
                  sessionId={sessionData?.session_id}
                  onAddToCart={handleAddToCart}
                  onShowAgent={showAgentActivity}
                />
              </div>
            </div>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <CartPage 
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              customerData={customerData}
            />
          } 
        />
        <Route 
          path="/product" 
          element={
            <ProductDetailPage 
              onAddToCart={handleAddToCart}
            />
          } 
        />
        <Route 
          path="/orders" 
          element={
            <OrdersPage 
              customerData={customerData}
            />
          } 
        />
      </Routes>

      {/* Floating AI Chat Assistant - Available on all pages */}
      {sessionActive && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatInterface 
            sessionData={sessionData}
            onSessionEnd={handleSessionEnd}
            onAddToCart={handleAddToCart}
            onShowAgent={showAgentActivity}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
