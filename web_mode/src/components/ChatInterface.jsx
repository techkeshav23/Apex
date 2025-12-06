import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getProductImage } from '../utils/productImage';

const ChatInterface = ({ sessionData, onSessionEnd, onAddToCart }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessionData?.message) {
      setMessages([{
        type: 'bot',
        text: sessionData.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      // Auto-expand when session starts with a message
      setIsExpanded(true);
    }
  }, [sessionData]);

  useEffect(() => {
    scrollToBottom();
    // Auto-expand when new messages arrive
    if (messages.length > 0) {
      setIsExpanded(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        session_id: sessionData.session_id,
        message: inputMessage
      });

      const botMessage = {
        type: 'bot',
        text: response.data.message || 'I received your message.',
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle cart updates from AI responses
      console.log('Chat response data:', response.data);
      if (response.data.cart && Array.isArray(response.data.cart) && onAddToCart) {
        console.log('Cart in response:', response.data.cart);
        // Get the newly added items (last item in the cart array)
        const lastItem = response.data.cart[response.data.cart.length - 1];
        console.log('Last item in cart:', lastItem);
        if (lastItem && lastItem.sku) {
          // Generate proper image URL using shared utility
          const imageUrl = getProductImage(lastItem);
          
          // Transform backend format to frontend format
          const productForCart = {
            sku: lastItem.sku,
            name: lastItem.name,
            price: lastItem.price,
            image: imageUrl,
            quantity: lastItem.quantity || 1,
            selectedSize: lastItem.attributes?.size?.[0],
            selectedColor: lastItem.attributes?.color?.[0],
            attributes: lastItem.attributes
          };
          console.log('Adding product to cart:', productForCart);
          onAddToCart(productForCart);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        text: `⚠️ Connection Error: ${error.message}\n\nPlease check:\n• Backend server is running on http://localhost:5000\n• Run: cd backend && python app.py`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Floating Chat Widget */}
      {isExpanded ? (
        /* Expanded Chat Window */
        <div className="w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-[fadeInUp_0.3s_ease] border-2 border-gray-300">
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-base">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold m-0 leading-tight">Apex Agent</h3>
                <span className="flex items-center gap-1 text-[10px] opacity-90">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex gap-1.5 items-center">
              {/* Minimize Button */}
              <button 
                className="w-6 h-6 bg-white/20 hover:bg-white/30 text-white rounded-md text-sm transition-all duration-200" 
                onClick={() => setIsExpanded(false)} 
                title="Minimize"
              >
                ▼
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">{messages.map((message, index) => (
              <div key={index} className={`flex gap-2 mb-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  message.type === 'bot' ? 'bg-black' : 'bg-gray-300'
                }`}>
                  {message.type === 'bot' ? 'A' : '👤'}
                </div>
                <div className={`max-w-[75%] flex flex-col gap-0.5 ${message.type === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap ${
                    message.type === 'bot' 
                      ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm' 
                      : 'bg-black text-white rounded-tr-sm shadow-md'
                  }`}>
                    {message.text}
                  </div>
                  {(message.data?.products || message.data?.recommendations) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-1.5 mt-0.5 shadow-sm">
                      {(message.data?.products || message.data?.recommendations).map((product, idx) => (
                        <div key={idx} className="py-1 border-b border-gray-100 last:border-b-0 text-[10px] text-gray-700">
                          <strong className="text-gray-900">{product.name}</strong> - ₹{product.price}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[9px] text-gray-400 px-1">{message.timestamp}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-black flex-shrink-0">
                  A
                </div>
                <div className="flex gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typing_1.4s_infinite]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex gap-1.5 mb-2 overflow-x-auto">
              <button 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-[10px] whitespace-nowrap transition-all duration-200 text-gray-700 font-medium"
                onClick={() => setInputMessage('Show me trending products')}
              >
                🔥 Trending
              </button>
              <button 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-[10px] whitespace-nowrap transition-all duration-200 text-gray-700 font-medium"
                onClick={() => setInputMessage('What are today\'s offers?')}
              >
                🎁 Offers
              </button>
              <button 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-[10px] whitespace-nowrap transition-all duration-200 text-gray-700 font-medium"
                onClick={() => setInputMessage('Help me find something')}
              >
                🔍 Help
              </button>
            </div>
            
            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-full text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 bg-black text-white rounded-full text-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                disabled={loading || !inputMessage.trim()}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Minimized Chat Button */
        <div className="relative">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:bg-gray-800 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-[pulse-glow_3s_infinite]"
            title="Open Chat"
          >
            A
          </button>
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {messages.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
