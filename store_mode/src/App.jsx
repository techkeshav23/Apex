import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getProductImage } from './utils/productImage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [wakeWordActive, setWakeWordActive] = useState(true); // New state for Wake Word

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  
  // Ref to hold the latest handleSendMessage to avoid stale closures in event listeners
  const handleSendMessageRef = useRef(null);
  
  // Ref to track listening state without triggering re-renders of the effect
  const isListeningRef = useRef(isListening);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

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
        if (transcript.includes('hey apex') || transcript.includes('hey apecs') || transcript.includes('apex')) {
           setIsListening(true);
           // Visual feedback or sound could go here
           
           // Check if there is a command AFTER the wake word
           const command = transcript.replace(/hey apex|hey apecs|apex/g, '').trim();
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
        if (wakeWordActive) {
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
        }
      };
      
      // Start listening immediately
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.log("Autostart blocked, waiting for interaction");
      }

    } else {
      setVoiceSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent auto-restart on unmount
        recognitionRef.current.stop();
      }
    };
  }, [wakeWordActive, speak]); // Removed isListening from dependencies



  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Don't stop recognition, just go back to wake word mode
    } else {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setIsListening(true);
    }
  };

  // Start session on mount
  useEffect(() => {
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
      
      // Speak the response
      speak(response.data.message);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "⚠️ Connection Error. Please ask a store associate for help.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  }, [inputMessage, loading, sessionData, speak]);

  // Update the ref whenever handleSendMessage changes
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 text-gray-900 z-50 flex flex-col font-sans">
      {/* Kiosk Header */}
      <div className="bg-white p-6 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200 transition-all text-white ${isSpeaking ? 'bg-green-500 scale-110' : 'bg-blue-600'}`}>
            {isSpeaking ? '🔊' : 'A'}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">IN-STORE ASSISTANT</h1>
            <p className="text-gray-500 text-sm">Kiosk ID: K-04 • Aisle 3</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 block">STORE</span>
              <span className="font-bold text-gray-800">Phoenix Mall, BLR</span>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Chat */}
        <div className="w-2/3 flex flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 shadow-md text-white ${
                  message.type === 'bot' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {message.type === 'bot' ? 'A' : '👤'}
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
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">A</div>
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
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex gap-4">
              {/* Voice Button */}
              <button 
                onClick={toggleListening}
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all shadow-sm border relative ${
                  isListening 
                    ? 'bg-red-50 border-red-200 text-red-500 animate-pulse shadow-red-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                {isListening ? '🎤' : '🎙️'}
                {wakeWordActive && !isListening && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" title="Listening for 'Hey Apex'"></span>
                )}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening..." : "Say 'Hey Apex' or type to search..."}
                className="flex-1 bg-gray-50 text-gray-900 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg placeholder-gray-400 transition-all"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Quick Actions & Context */}
        <div className="w-1/3 bg-gray-50 p-8 flex flex-col gap-8 border-l border-gray-200">
          
          {/* Quick Actions */}
          <div>
            <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleQuickAction("Where is the trial room?")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group">
                <span className="text-2xl mb-1 block">🚪</span>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700">Find Trial Room</span>
              </button>
              <button onClick={() => handleQuickAction("Check price of this item")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group">
                <span className="text-2xl mb-1 block">🏷️</span>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700">Price Check</span>
              </button>
              <button onClick={() => handleQuickAction("Call a store associate")} className="bg-white hover:bg-blue-50 p-4 rounded-xl text-left transition-all border border-gray-200 hover:border-blue-300 shadow-sm group">
                <span className="text-2xl mb-1 block">🙋‍♂️</span>
                <span className="font-semibold text-gray-700 group-hover:text-blue-700">Call Staff</span>
              </button>
            </div>
          </div>

          {/* Store Map Placeholder */}
          <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="text-6xl mb-4 opacity-50">🗺️</div>
            <h3 className="text-xl font-bold text-gray-800">Store Map</h3>
            <p className="text-gray-500 mt-2">You are in Zone A</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
