import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Mic, Send, MapPin, Tag, User, ShoppingBag, Volume2, Search, ShoppingCart, CreditCard, X, Check } from 'lucide-react';
import { getProductImage } from './utils/productImage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cart & Checkout States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle, processing, success, error
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [wakeWordActive, setWakeWordActive] = useState(false); // Changed to false by default

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  
  // Ref to hold the latest handleSendMessage to avoid stale closures in event listeners
  const handleSendMessageRef = useRef(null);
  
  // Ref to track listening state without triggering re-renders of the effect
  const isListeningRef = useRef(isListening);
  const wakeWordActiveRef = useRef(wakeWordActive);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    wakeWordActiveRef.current = wakeWordActive;
  }, [wakeWordActive]);

  // Text-to-Speech Function
  const speak = useCallback((text) => {
    if (!voiceSupported) return;
    
    // Cancel any current speech
    synthesisRef.current.cancel();

    // Strip markdown/formatting for speech
    const cleanText = text.replace(/[*#_]/g, '').replace(/https?:\/\/\S+/g, 'link');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  }, [voiceSupported]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Continuous listening for Wake Word
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const latestResult = event.results[event.results.length - 1];
        const transcript = latestResult[0].transcript.trim().toLowerCase();
        console.log('Heard:', transcript);

        // Wake Word Logic
        // Normalize transcript to remove punctuation for better matching
        // eslint-disable-next-line no-useless-escape
        const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        
        if (cleanTranscript.includes('hey apex') || cleanTranscript.includes('hey apecs') || cleanTranscript.includes('apex') || cleanTranscript.includes('hey epics') || cleanTranscript.includes('hi apex') || cleanTranscript.includes('hello apex')) {
           setIsListening(true);
           
           // Check if there is a command AFTER the wake word
           // Remove the wake word variations to get the command
           const command = cleanTranscript.replace(/hey apex|hey apecs|apex|hey epics|hi apex|hello apex/g, '').trim();
           
           if (command.length > 2) {
              setInputMessage(command);
              if (handleSendMessageRef.current) {
                handleSendMessageRef.current(command);
              }
           } else {
             // Just woke up, waiting for command
             speak("I'm listening.");
           }
        } else if (isListeningRef.current) {
           // Already listening, treat as command
           setInputMessage(transcript);
           if (handleSendMessageRef.current) {
             handleSendMessageRef.current(transcript);
           }
        }
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if wake word mode is active
        if (wakeWordActiveRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'aborted') return; // Ignore aborted errors
        console.error('Speech error:', event.error);
        if (event.error === 'not-allowed') {
           setWakeWordActive(false);
           setIsListening(false);
        }
      };
      
      // Don't start automatically - wait for user interaction
      // Users can click the microphone button to start

    } else {
      setVoiceSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent auto-restart on unmount
        recognitionRef.current.stop();
      }
    };
  }, [speak]); // Removed wakeWordActive from dependencies



  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      // If currently active listening, stop everything (User wants to cancel)
      setIsListening(false);
      setWakeWordActive(false);
      try {
        recognitionRef.current.stop();
      } catch(e) {
        console.log("Recognition already stopped");
      }
    } else if (wakeWordActive) {
      // If in standby (waiting for wake word), switch to active listening (User wants to talk now)
      setIsListening(true);
      speak("I'm listening.");
      // Recognition is already running, so we don't need to start it
    } else {
      // If completely off, start everything
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsListening(true); 
      setWakeWordActive(true);
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.log("Recognition already started");
      }
    }
  };

  // Start session on mount
  const sessionStartedRef = useRef(false);
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const startSession = async () => {
      try {
        const response = await axios.post(`${API_URL}/api/start_session`, {
          customer_id: 'CUST001',
          channel: 'kiosk' // Important: Set channel to kiosk
        });
        
        if (response.data.success) {
          setSessionData(response.data);
          const welcomeMsg = `Welcome to our Store! \nI'm your Virtual Assistant. \n\nScan an item or ask me about products in the store.`;
          setMessages([{
            type: 'bot',
            text: welcomeMsg,
            timestamp: new Date().toLocaleTimeString()
          }]);
          // Optional: Speak welcome message on interaction (browsers block auto-play audio)
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        if (error.response) {
            console.error("Server Response:", error.response.status, error.response.data);
        }
        setMessages([{
            type: 'bot',
            text: `⚠️ Connection Error: ${error.response ? `Server returned ${error.response.status}` : error.message}. Please check backend logs.`,
            timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };
    
    startSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (text = inputMessage) => {
    if (!text.trim() || loading || !sessionData) return;

    // Go back to Standby mode (Waiting for Wake Word)
    setIsListening(false);
    // Ensure wake word remains active so onend restarts it
    setWakeWordActive(true); 
    wakeWordActiveRef.current = true;

    const userMessage = {
      type: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        session_id: sessionData.session_id,
        message: text
      });      const botMessage = {
        type: 'bot',
        text: response.data.message || 'I received your message.',
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update Cart if present in response
      if (response.data.cart) {
        setCart(response.data.cart);
        // Auto-open cart if items were added
        if (response.data.cart.length > cart.length) {
           setIsCartOpen(true);
        }
      }

      // Speak the response
      speak(response.data.message);

    } catch (error) {
      console.error('Chat error:', error);
      let errorMsg = "⚠️ Connection Error. Please ask a store associate for help.";
      
      if (error.code === "ERR_NETWORK") {
          errorMsg = "⚠️ Network Error: Cannot reach server. (Possible CORS issue or Server Down)";
      } else if (error.response) {
          errorMsg = `⚠️ Server Error (${error.response.status}): ${error.response.data.error || 'Unknown error'}`;
      }

      setMessages(prev => [...prev, {
        type: 'bot',
        text: errorMsg,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, sessionData, speak, cart.length]);

  // Update the ref whenever handleSendMessage changes
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const handleCheckout = async () => {
    setCheckoutStatus('processing');
    try {
      const response = await axios.post(`${API_URL}/api/checkout`, {
        session_id: sessionData.session_id
      });
      
      if (response.data.success) {
        setCheckoutStatus('success');
        setCart([]); // Clear local cart
        
        // Add success message to chat
        setMessages(prev => [...prev, {
          type: 'bot',
          text: response.data.message,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        speak("Payment successful! Your order has been placed.");
        
        setTimeout(() => {
          setIsCheckoutOpen(false);
          setCheckoutStatus('idle');
          setIsCartOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      setCheckoutStatus('error');
      speak("Sorry, payment failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 text-gray-900 z-50 flex flex-col font-sans">
      {/* Kiosk Header */}
      <div className="bg-white p-6 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200 transition-all text-white ${isSpeaking ? 'bg-green-500 scale-110' : 'bg-blue-600'}`}>
            {isSpeaking ? <Volume2 size={24} /> : <ShoppingBag size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">IN-STORE ASSISTANT</h1>
            <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={14} /> Kiosk ID: K-04 • Aisle 3</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="relative p-3 bg-gray-100 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
           >
             <ShoppingCart size={24} />
             {cart.length > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                 {cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
               </span>
             )}
           </button>
           <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 block">STORE</span>
              <span className="font-bold text-gray-800">Phoenix Mall, BLR</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Cart Sidebar Overlay */}
        {isCartOpen && (
          <div className="absolute inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-sm transition-all" onClick={() => setIsCartOpen(false)}>
            <div className="w-96 bg-white h-full shadow-2xl flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-blue-600 font-bold">₹{item.price}</span>
                          <span className="text-xs text-gray-500">Qty: {item.quantity || 1}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)}
                  </span>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  <CreditCard size={20} /> Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold">Secure Checkout</h2>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="p-8 text-center">
                {checkoutStatus === 'idle' && (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Tap to Pay</h3>
                    <p className="text-gray-500">Total Amount: <span className="font-bold text-gray-900">₹{cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)}</span></p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleCheckout} className="p-4 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2">
                        <span className="text-2xl">💳</span>
                        <span className="font-semibold">Card</span>
                      </button>
                      <button onClick={handleCheckout} className="p-4 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2">
                        <span className="text-2xl">📱</span>
                        <span className="font-semibold">UPI / QR</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {checkoutStatus === 'processing' && (
                  <div className="py-10">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-gray-800">Processing Payment...</h3>
                    <p className="text-gray-500 mt-2">Please wait while we connect to the terminal.</p>
                  </div>
                )}
                
                {checkoutStatus === 'success' && (
                  <div className="py-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <Check size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                    <p className="text-gray-500 mt-2">Your order has been confirmed.</p>
                    <p className="text-sm text-gray-400 mt-4">Redirecting...</p>
                  </div>
                )}
                
                {checkoutStatus === 'error' && (
                  <div className="py-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <X size={40} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
                    <p className="text-gray-500 mt-2">Please try again or ask for assistance.</p>
                    <button onClick={() => setCheckoutStatus('idle')} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg">Try Again</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Left Panel: Chat */}
        <div className="w-2/3 flex flex-col border-r border-gray-200 bg-white relative">
          <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 shadow-md text-white ${
                  message.type === 'bot' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {message.type === 'bot' ? <ShoppingBag size={18} /> : <User size={18} />}
                </div>
                <div className={`max-w-[80%] flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-6 py-4 rounded-2xl text-lg leading-relaxed shadow-sm whitespace-pre-wrap ${
                    message.type === 'bot' 
                      ? 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200' 
                      : 'bg-blue-600 text-white rounded-tr-sm shadow-blue-200'
                  }`}>
                    {message.text}
                  </div>
                  
                  {/* Product Cards in Chat */}
                  {(message.data?.products || message.data?.recommendations) && (
                    <div className="grid grid-cols-2 gap-4 mt-2 w-full">
                      {(message.data?.products || message.data?.recommendations).map((product, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-blue-400 transition-all">
                          <div className="h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                             <img 
                                src={getProductImage(product)} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = 'https://placehold.co/300x300/f3f4f6/9ca3af?text=Product';
                                }}
                              />
                          </div>
                          <h4 className="font-bold text-lg truncate text-gray-900">{product.name}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-600 font-bold text-xl">₹{product.price}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">In Stock: Aisle 4</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-gray-400 px-2">{message.timestamp}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"><ShoppingBag size={18} /></div>
                <div className="bg-gray-100 px-6 py-4 rounded-2xl rounded-tl-sm border border-gray-200 flex gap-2 items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 z-10">
            <div className={`flex gap-4 items-center transition-all duration-300 p-2 rounded-2xl ${isListening || wakeWordActive ? 'bg-blue-50 border border-blue-200 shadow-inner' : ''}`}>
              {/* Voice Button */}
              <button 
                onClick={toggleListening}
                disabled={!voiceSupported}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg border-2 relative overflow-hidden group ${
                  isListening 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-blue-300 scale-105' // Active Listening
                    : wakeWordActive 
                      ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-blue-100' // Standby (Wake Word)
                      : 'bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:shadow-md' // Off
                } ${!voiceSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!voiceSupported ? 'Voice not supported' : isListening ? 'Click to stop' : wakeWordActive ? 'Listening for "Hey Apex"' : 'Click to start'}
              >
                {isListening ? (
                   <div className="flex gap-1 items-center h-6">
                      <div className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDuration: '1s' }}></div>
                      <div className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDuration: '1s', animationDelay: '0.1s' }}></div>
                      <div className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></div>
                   </div>
                ) : (
                  <Mic size={28} className={`transition-transform ${wakeWordActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                )}
                
                {/* Pulse Ring - Only for Active Listening */}
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-4 border-white opacity-30 animate-ping"></span>
                )}
                
                {/* Slow Pulse for Standby */}
                {wakeWordActive && !isListening && (
                   <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-20 animate-pulse"></span>
                )}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening || wakeWordActive ? "Listening... Say 'Hey Apex'..." : "Type to search..."}
                  className={`w-full bg-gray-50 text-gray-900 px-6 py-4 pl-12 rounded-xl border focus:outline-none focus:ring-2 text-lg placeholder-gray-400 transition-all ${
                    isListening || wakeWordActive 
                      ? 'border-blue-300 bg-white ring-2 ring-blue-100' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {isListening || wakeWordActive ? (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  ) : (
                    <Search size={20} />
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 hover:scale-105 active:scale-95"
              >
                <Send size={24} className={loading ? 'opacity-0' : 'ml-1'} />
                {loading && <div className="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              </button>
            </div>
            
            {/* Voice Status Text */}
            <div className={`text-center mt-2 text-sm font-medium transition-all duration-300 ${isListening || wakeWordActive ? 'text-blue-600 opacity-100' : 'text-gray-400 opacity-0 h-0'}`}>
               {isListening ? "Listening..." : "Listening for 'Hey Apex'..."}
            </div>
          </div>
        </div>

        {/* Right Panel: Quick Actions & Context */}
        <div className="w-1/3 bg-gray-50 p-8 flex flex-col gap-8 border-l border-gray-200">
          
          {/* Quick Actions */}
          <div>
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2"><Tag size={16} /> Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleQuickAction("Where is the trial room?")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🚪</span>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700">Find Trial Room</span>
              </button>
              <button onClick={() => handleQuickAction("Check price of this item")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">🏷️</span>
                <span className="font-semibold text-gray-700 group-hover:text-purple-700">Price Check</span>
              </button>
              <button onClick={() => handleQuickAction("Call a store associate")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:bg-green-600 group-hover:text-white transition-colors">🙋‍♂️</span>
                <span className="font-semibold text-gray-700 group-hover:text-green-700">Call Staff</span>
              </button>
            </div>
          </div>

          {/* Store Map Placeholder */}
          <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <MapPin size={40} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Store Map</h3>
            <p className="text-gray-500 mt-2">You are in Zone A</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
