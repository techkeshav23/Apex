import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Avatar3D from './components/Avatar3D';
import './index.css';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function App() {
  const [page, setPage] = useState('landing');
  const [difficultyLevel, setDifficultyLevel] = useState('fresher');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [webcamStream, setWebcamStream] = useState(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [interviewDuration, setInterviewDuration] = useState(0);
  
  // New states for improvements
  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewStream, setPreviewStream] = useState(null);
  const [isPreviewOn, setIsPreviewOn] = useState(false);
  
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const durationInterval = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Check Speech API support on mount
  useEffect(() => {
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    
    if (!hasSpeechRecognition || !hasSpeechSynthesis) {
      setSpeechSupported(false);
      setErrorMessage('Your browser does not support voice features. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load voices
  useEffect(() => {
    if (speechSupported) {
      const loadVoices = () => synthesisRef.current.getVoices();
      loadVoices();
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, [speechSupported]);

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone access.');
        }
      };
      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  // Socket listeners
  useEffect(() => {
    socket.on('ai_response', (data) => {
      setIsAiThinking(false);
      setAiMessage(data.message);
      speakText(data.message);
      if (data.questionNumber) setCurrentQuestionNum(data.questionNumber);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
    });
    
    socket.on('interview_started', (data) => {
      setIsLoading(false);
      setTotalQuestions(data.totalQuestions || 8);
      setCurrentQuestionNum(1);
    });
    
    socket.on('interview_feedback', (data) => {
      setFeedback(data);
      setPage('results');
      setIsLoading(false);
      clearInterval(durationInterval.current);
    });

    socket.on('connect_error', () => {
      setErrorMessage('Connection failed. Please ensure the server is running.');
      setIsLoading(false);
      setIsAiThinking(false);
    });

    socket.on('disconnect', () => {
      if (page === 'interview') {
        setErrorMessage('Connection lost. Attempting to reconnect...');
      }
    });

    socket.on('connect', () => {
      if (errorMessage?.includes('Connection')) {
        setErrorMessage('');
      }
    });
    
    return () => {
      socket.off('ai_response');
      socket.off('interview_started');
      socket.off('interview_feedback');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, []);

  // Webcam stream attachment
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream, page, isVideoOff]);

  // Preview stream attachment
  useEffect(() => {
    if (previewStream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  // Cleanup preview on page change
  useEffect(() => {
    if (page !== 'landing' && previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
      setIsPreviewOn(false);
    }
  }, [page, previewStream]);

  const togglePreview = async () => {
    if (isPreviewOn) {
      previewStream?.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
      setIsPreviewOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setPreviewStream(stream);
        setIsPreviewOn(true);
        setErrorMessage('');
      } catch (error) {
        console.error('Camera preview error:', error);
        setErrorMessage('Camera access denied. Please allow camera access to preview.');
      }
    }
  };

  const speakText = (text) => {
    if (!speechSupported) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = synthesisRef.current.getVoices();
    const voice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) 
      || voices.find(v => v.lang.includes('en-US')) 
      || voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthesisRef.current.speak(utterance);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setWebcamStream(stream);
      setErrorMessage('');
    } catch (error) {
      console.error('Webcam error:', error);
      setErrorMessage('Camera access denied. You can still continue without video.');
    }
  };

  const stopWebcam = () => {
    webcamStream?.getTracks().forEach(track => track.stop());
    setWebcamStream(null);
  };

  const startInterview = (level) => {
    if (!speechSupported) {
      setErrorMessage('Voice features not supported. Please use Chrome or Edge browser.');
      return;
    }
    
    setIsLoading(true);
    setDifficultyLevel(level);
    setCurrentQuestionNum(0);
    setAiMessage('');
    setErrorMessage('');
    
    // Short delay to show loading state
    setTimeout(() => {
      setPage('interview');
      setIsLoading(false);
      setInterviewDuration(0);
      durationInterval.current = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);
      startWebcam();
      socket.emit('start_interview', { type: 'technical', difficulty: level });
    }, 500);
  };

  const toggleListening = () => {
    if (!speechSupported) {
      setErrorMessage('Speech recognition not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        setIsAiThinking(true);
        socket.emit('user_message', { message: transcript });
        setTranscript('');
      }
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setErrorMessage('Failed to start microphone. Please check permissions.');
      }
    }
  };

  const toggleVideo = () => {
    if (webcamStream) {
      webcamStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const endInterview = () => {
    setIsLoading(true);
    recognitionRef.current?.stop();
    setIsListening(false);
    synthesisRef.current?.cancel();
    stopWebcam();
    clearInterval(durationInterval.current);
    socket.emit('end_interview');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const levelConfig = {
    fresher: {
      icon: '🎓',
      title: 'Fresher',
      subtitle: 'Entry Level',
      description: 'Perfect for recent graduates. Covers fundamental concepts in JavaScript, React, Node.js, and databases.',
      color: 'emerald',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100',
    },
    intermediate: {
      icon: '💼',
      title: 'Intermediate',
      subtitle: '2-4 Years Experience',
      description: 'For professionals with hands-on experience. Includes practical scenarios, API design, and state management.',
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-100',
    },
    advanced: {
      icon: '🚀',
      title: 'Advanced',
      subtitle: 'Senior Level',
      description: 'For senior engineers. Covers system design, architecture patterns, security, and DevOps practices.',
      color: 'purple',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-700',
      badgeBg: 'bg-purple-100',
    }
  };

  // Landing Page - Premium Professional Design
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Premium Header */}
        <header className="glass sticky top-0 z-50 border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">InterviewAI</h1>
                <p className="text-xs text-slate-500 font-medium">Professional Practice Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600">AI Ready</span>
              </div>
              <span className="text-sm text-slate-500 font-mono">{formatTime(currentTime)}</span>
              <button 
                onClick={() => speakText("Hello! I'm your AI interviewer. Select your experience level to begin the interview.")}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                </svg>
                Test Audio
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-24">
          {/* Error/Warning Messages */}
          {errorMessage && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-2xl flex items-center gap-3 animate-scale-in">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-700 text-sm font-medium flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Browser Support Warning */}
          {!speechSupported && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-amber-50/80 backdrop-blur border border-amber-200 rounded-2xl flex items-center gap-3 animate-scale-in">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-amber-700 text-sm font-medium">Voice features require Chrome, Edge, or Safari. Please switch browsers for the full experience.</p>
            </div>
          )}

          {/* Hero Content */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-full text-sm font-semibold text-blue-700 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              Powered by Google Gemini AI
            </div>
            <h2 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Master Your Next<br />
              <span className="gradient-text">Technical Interview</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Practice with our AI interviewer that adapts to your experience level. 
              Get <span className="font-semibold text-slate-800">real-time feedback</span> and build confidence for your dream job.
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-10">
              {[
                { value: '100+', label: 'Questions' },
                { value: '3', label: 'Levels' },
                { value: 'Free', label: 'Forever' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Camera Preview Section - Premium Design */}
          <div className="max-w-lg mx-auto mb-16 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="glass rounded-3xl overflow-hidden">
              <div className="aspect-video relative bg-gradient-to-br from-slate-100 to-slate-200">
                {isPreviewOn && previewStream ? (
                  <video 
                    ref={previewVideoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white/80 backdrop-blur rounded-3xl flex items-center justify-center shadow-xl mb-4 animate-float">
                      <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Preview your camera before starting</p>
                  </div>
                )}
                
                {/* Status indicator */}
                {isPreviewOn && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-green-500/90 backdrop-blur text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}
              </div>
              
              {/* Preview Controls */}
              <div className="p-5 bg-white/50 backdrop-blur flex items-center justify-center gap-4">
                <button
                  onClick={togglePreview}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                    isPreviewOn 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {isPreviewOn ? 'Stop Camera' : 'Test Camera'}
                </button>
                <button 
                  onClick={() => speakText("Hello! I'm your AI interviewer. Your audio is working correctly.")}
                  className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Test Audio
                </button>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-indigo-400 border-b-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <p className="text-lg font-semibold text-slate-800">Preparing your interview</p>
                <p className="text-sm text-slate-500 mt-1">Setting up AI interviewer...</p>
              </div>
            </div>
          )}

          {/* Level Selection Cards - Premium Design */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            {Object.entries(levelConfig).map(([level, config], index) => (
              <div
                key={level}
                onClick={() => !isLoading && startInterview(level)}
                className={`group relative animate-fade-in-up ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.color === 'emerald' ? 'from-emerald-500 to-teal-500' : config.color === 'blue' ? 'from-blue-500 to-indigo-500' : 'from-purple-500 to-violet-500'} rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                <div className={`relative card card-hover p-8 bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor}`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    {config.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-800">{config.title}</h3>
                    <span className={`px-3 py-1 ${config.badgeBg} ${config.textColor} text-xs font-bold rounded-full`}>
                      {config.subtitle}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {config.description}
                  </p>
                  
                  {/* CTA */}
                  <div className={`flex items-center gap-2 ${config.textColor} font-bold text-sm group-hover:gap-4 transition-all duration-300`}>
                    Start Interview
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features - Premium Grid */}
          <div className="glass rounded-3xl p-10 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <h3 className="text-center text-2xl font-bold text-slate-800 mb-10">Why Choose InterviewAI?</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: '🎤', title: 'Voice Recognition', desc: 'Natural speech-to-text powered by Web Speech API' },
                { icon: '🤖', title: 'AI Feedback', desc: 'Real-time responses from Google Gemini' },
                { icon: '📹', title: 'Video Support', desc: 'Practice with camera for real experience' },
                { icon: '📊', title: 'Performance', desc: 'Detailed analysis of your answers' },
              ].map((feature, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="font-bold text-slate-800 mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-sm text-slate-400">
            <p>Built with ❤️ for developers • Powered by React & Gemini AI</p>
          </div>
        </main>
      </div>
    );
  }

  // Interview Room - Premium Professional Theme
  if (page === 'interview') {
    const config = levelConfig[difficultyLevel];
    
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Premium Header */}
        <header className="relative glass border-b border-slate-200/50 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-40"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Interview Session</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config.color === 'emerald' ? 'bg-emerald-500' : config.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                <span className={`text-xs font-semibold ${config.textColor}`}>{config.title} Level</span>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator - Premium */}
          <div className="flex items-center gap-6">
            {totalQuestions > 0 && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalQuestions }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < currentQuestionNum ? 'bg-blue-500' : 'bg-slate-200'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {currentQuestionNum}/{totalQuestions}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200/50 rounded-2xl">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-50"></div>
              </div>
              <span className="font-mono text-sm font-bold text-red-600">{formatDuration(interviewDuration)}</span>
            </div>
            
            <span className="text-sm text-slate-500 font-medium">{formatTime(currentTime)}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative flex-1 p-6 flex gap-6 max-w-7xl mx-auto w-full z-10">
          {/* AI Interviewer Panel - Premium Card */}
          <div className={`flex-1 glass rounded-3xl overflow-hidden relative transition-all duration-500 ${isSpeaking ? 'ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-100' : ''}`}>
            <Avatar3D isSpeaking={isSpeaking} />
            
            {/* AI Label - Floating Card */}
            <div className="absolute top-5 left-5">
              <div className="glass px-5 py-3 rounded-2xl flex items-center gap-4">
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg ${isSpeaking ? 'animate-pulse-glow' : ''}`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {isSpeaking && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <span className="text-slate-800 text-sm font-bold block">AI Interviewer</span>
                  <span className={`text-xs font-medium flex items-center gap-1.5 ${isSpeaking ? 'text-green-600' : isAiThinking ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSpeaking ? (
                      <>
                        <span className="flex gap-0.5">
                          <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></span>
                          <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                        </span>
                        Speaking
                      </>
                    ) : isAiThinking ? (
                      <>Processing...</>
                    ) : (
                      <>Ready</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Thinking Indicator - Premium */}
            {isAiThinking && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="glass rounded-2xl p-6 max-w-3xl animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                    <div>
                      <span className="text-slate-700 text-sm font-semibold">AI is analyzing your response...</span>
                      <span className="text-slate-400 text-xs block">Preparing next question</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Message Caption - Premium */}
            {aiMessage && !isAiThinking && (
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="glass rounded-2xl p-6 max-w-3xl animate-fade-in-up">
                  <p className="text-slate-700 text-base leading-relaxed font-medium">{aiMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - User Panel */}
          <div className="w-80 flex flex-col gap-5">
            {/* User Video Card - Premium */}
            <div className={`glass rounded-3xl overflow-hidden transition-all duration-500 ${isListening ? 'ring-2 ring-green-400 ring-offset-4 ring-offset-slate-100' : ''}`}>
              <div className="aspect-video relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {(isVideoOff || !webcamStream) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="w-20 h-20 bg-white/80 backdrop-blur rounded-3xl flex items-center justify-center shadow-xl">
                      <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* User Label */}
                <div className="absolute top-3 left-3">
                  <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                    <div className={`relative w-2.5 h-2.5`}>
                      <div className={`w-full h-full rounded-full ${isListening ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      {isListening && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50"></div>}
                    </div>
                    <span className="text-slate-700 text-xs font-bold">You</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Card - Premium */}
            <div className="flex-1 glass rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-700">Your Response</h3>
              </div>
              <div className="min-h-[120px] bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
                {transcript ? (
                  <p className="text-slate-700 text-sm leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-slate-400 text-sm">
                    {isListening ? 'Listening...' : 'Click the mic to start speaking'}
                  </p>
                )}
              </div>
              {isListening && (
                <div className="mt-4 flex items-center justify-center gap-1">
                  {[4, 6, 4, 5, 3, 4, 6].map((h, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full animate-pulse" 
                      style={{height: `${h * 4}px`, animationDelay: `${i * 0.1}s`}}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Control Bar - Premium Footer */}
        <footer className="relative glass border-t border-slate-200/50 px-6 py-5 z-10">
          <div className="flex items-center justify-center gap-4">
            {/* Mic Button - Premium */}
            <button
              onClick={toggleListening}
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40' 
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-lg'
              }`}
            >
              {isListening && (
                <div className="absolute inset-0 rounded-2xl bg-green-400 animate-ping opacity-20"></div>
              )}
              <svg className={`w-7 h-7 relative z-10 ${isListening ? 'text-white' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Video Button - Premium */}
            <button
              onClick={toggleVideo}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                isVideoOff 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40' 
                  : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg className={`w-7 h-7 ${isVideoOff ? 'text-white' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-12 bg-slate-200 mx-3"></div>

            {/* End Call Button - Premium */}
            <button
              onClick={endInterview}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
              End Interview
            </button>
          </div>
          
          {/* Status Text */}
          <p className="text-center text-slate-500 text-sm mt-4 font-medium">
            {isListening 
              ? '🎤 Recording your answer • Click mic when finished' 
              : '💡 Press the microphone to start speaking'}
          </p>
        </footer>
      </div>
    );
  }

  // Results Page - Premium Design
  if (page === 'results') {
    const getScoreColor = (avgWords) => {
      if (avgWords > 50) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600', label: 'Excellent' };
      if (avgWords > 25) return { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600', label: 'Good' };
      return { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600', label: 'Needs Improvement' };
    };
    
    const scoreInfo = feedback ? getScoreColor(feedback.averageResponseLength) : getScoreColor(0);
    
    return (
      <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden flex items-center justify-center p-6">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative glass max-w-2xl w-full rounded-3xl p-10 animate-scale-in">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${scoreInfo.bg} rounded-3xl blur-xl opacity-50`}></div>
              <div className={`relative w-24 h-24 bg-gradient-to-br ${scoreInfo.bg} rounded-3xl flex items-center justify-center shadow-xl`}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-800 mb-3">Interview Complete!</h2>
            <p className="text-lg text-slate-500">Here's your performance analysis</p>
          </div>

          {feedback && (
            <div className="space-y-6">
              {/* Stats Grid - Premium Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5 text-center">
                    <p className="text-4xl font-extrabold text-blue-600">{feedback.totalQuestions}</p>
                    <p className="text-sm font-semibold text-blue-700 mt-1">Questions</p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-5 text-center">
                    <p className="text-4xl font-extrabold text-green-600">{feedback.responsesGiven}</p>
                    <p className="text-sm font-semibold text-green-700 mt-1">Responses</p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50 rounded-2xl p-5 text-center">
                    <p className="text-4xl font-extrabold text-purple-600">{feedback.averageResponseLength}</p>
                    <p className="text-sm font-semibold text-purple-700 mt-1">Avg Words</p>
                  </div>
                </div>
              </div>

              {/* Performance Score Bar */}
              <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Performance Score</span>
                  <span className={`text-sm font-bold ${scoreInfo.text}`}>{scoreInfo.label}</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${scoreInfo.bg} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.min((feedback.averageResponseLength / 60) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* AI Feedback Card - Premium */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">AI Feedback</h3>
                    <p className="text-slate-600 leading-relaxed">{feedback.feedback}</p>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">Pro Tip</h4>
                  <p className="text-sm text-amber-700">
                    Practice regularly and focus on the STAR method (Situation, Task, Action, Result) for behavioral questions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Premium */}
          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => setPage('landing')} 
              className="flex-1 px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
            <button 
              onClick={() => startInterview(difficultyLevel)} 
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
