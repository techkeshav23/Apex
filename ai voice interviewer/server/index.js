const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Load questions from JSON file
const questionsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8')
);

// Track used questions per session to prevent repeats
const usedQuestionsMap = new Map();

// Get interview questions based on difficulty level (no repeats)
function getInterviewQuestions(level = 'fresher', sessionId = null) {
  const questions = questionsData[level] || questionsData.fresher;
  const allQuestions = [];
  
  // Get or create used questions set for this session
  const usedQuestions = sessionId ? (usedQuestionsMap.get(sessionId) || new Set()) : new Set();
  
  // Categories based on level
  const categoryMap = {
    fresher: ['introduction', 'javascript', 'react', 'nodejs', 'database', 'general', 'closing'],
    intermediate: ['introduction', 'javascript', 'react', 'nodejs', 'database', 'api', 'closing'],
    advanced: ['introduction', 'javascript', 'react', 'nodejs', 'systemDesign', 'security', 'devops', 'closing']
  };
  
  const categories = categoryMap[level] || categoryMap.fresher;
  
  // Number of questions per category based on level
  const questionsPerCategory = {
    fresher: 1,
    intermediate: 2,
    advanced: 2
  };
  
  const numQuestions = questionsPerCategory[level] || 1;
  
  categories.forEach(category => {
    if (questions[category]) {
      const categoryQuestions = questions[category];
      // Filter out already used questions
      const availableQuestions = categoryQuestions.filter(q => !usedQuestions.has(q));
      // If all questions used, reset for this category
      const questionsToUse = availableQuestions.length > 0 ? availableQuestions : categoryQuestions;
      const shuffled = [...questionsToUse].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numQuestions);
      
      // Mark selected questions as used
      selected.forEach(q => usedQuestions.add(q));
      allQuestions.push(...selected);
    }
  });
  
  // Store updated used questions
  if (sessionId) {
    usedQuestionsMap.set(sessionId, usedQuestions);
  }
  
  return allQuestions;
}

// Gemini API integration (FREE)
async function getAIResponse(userMessage, conversationHistory, currentQuestions, questionIndex) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback to predefined responses if no API key
    return getFallbackResponse(userMessage, conversationHistory, currentQuestions, questionIndex);
  }

  try {
    const nextQuestion = currentQuestions[questionIndex] || null;
    const isLastQuestion = questionIndex >= currentQuestions.length;
    
    const prompt = isLastQuestion 
      ? `You are an AI technical interviewer. The candidate just answered the final question.
         Their answer: "${userMessage}"
         
         Thank them warmly for completing the interview and give a brief encouraging closing remark.
         Keep it to 2 sentences max.`
      : `You are an AI technical interviewer conducting a MERN stack interview.
         You are friendly but professional. Keep responses concise (2-3 sentences max).
         
         Previous conversation:
         ${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}
         
         Candidate just said: "${userMessage}"
         
         The next question you MUST ask is: "${nextQuestion}"
         
         Briefly acknowledge their answer (1 sentence), then ask the next question naturally.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackResponse(userMessage, conversationHistory, currentQuestions, questionIndex);
  }
}

// Fallback responses when no API key
function getFallbackResponse(userMessage, conversationHistory, currentQuestions, questionIndex) {
  const acknowledgments = [
    "That's a great answer! ",
    "Interesting perspective. ",
    "Thank you for sharing that. ",
    "Good point! ",
    "I appreciate your detailed response. ",
    "Nice explanation! ",
    "That shows good understanding. "
  ];
  
  const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  
  if (questionIndex < currentQuestions.length) {
    return randomAck + currentQuestions[questionIndex];
  } else {
    return "Thank you for your time! That concludes our technical interview. You did great! We covered a lot of important topics today.";
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let conversationHistory = [];
  let currentQuestions = [];
  let questionIndex = 0;
  let currentDifficulty = 'fresher';

  socket.on('start_interview', (data) => {
    conversationHistory = [];
    currentDifficulty = data?.difficulty || 'fresher';
    // Pass socket.id to track used questions per session
    currentQuestions = getInterviewQuestions(currentDifficulty, socket.id);
    questionIndex = 0;
    
    const levelGreetings = {
      fresher: "Welcome to your technical interview! I'm excited to learn about you. Since this is a fresher-level interview, we'll focus on fundamental concepts and your learning potential.",
      intermediate: "Welcome to your technical interview! I'm looking forward to discussing your experience. This intermediate-level interview will cover both concepts and practical scenarios.",
      advanced: "Welcome to your senior-level technical interview! I'm eager to dive deep into your expertise. We'll explore system design, architecture decisions, and complex problem-solving."
    };
    
    console.log(`Starting ${currentDifficulty} interview with ${currentQuestions.length} questions`);
    
    const firstQuestion = currentQuestions[0];
    const greeting = `Hello! I'm your AI interviewer today. ${levelGreetings[currentDifficulty]} Let's begin! ${firstQuestion}`;
    
    questionIndex = 1; // Move to next question for after first response
    conversationHistory.push({ role: 'interviewer', content: greeting });
    
    // Send interview started event with question count
    socket.emit('interview_started', { 
      totalQuestions: currentQuestions.length,
      difficulty: currentDifficulty
    });
    
    // Send first question with progress info
    socket.emit('ai_response', { 
      message: greeting,
      questionNumber: 1,
      totalQuestions: currentQuestions.length
    });
  });

  socket.on('user_message', async (data) => {
    const { message } = data;
    conversationHistory.push({ role: 'candidate', content: message });
    
    const aiResponse = await getAIResponse(message, conversationHistory, currentQuestions, questionIndex);
    conversationHistory.push({ role: 'interviewer', content: aiResponse });
    
    questionIndex++; // Move to next question
    
    // Send response with progress info
    socket.emit('ai_response', { 
      message: aiResponse,
      questionNumber: Math.min(questionIndex, currentQuestions.length),
      totalQuestions: currentQuestions.length
    });
  });

  socket.on('end_interview', () => {
    const feedback = generateFeedback(conversationHistory, currentQuestions.length);
    // Clean up used questions for this session
    usedQuestionsMap.delete(socket.id);
    socket.emit('interview_feedback', feedback);
    conversationHistory = [];
    currentQuestions = [];
    questionIndex = 0;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up used questions map on disconnect
    usedQuestionsMap.delete(socket.id);
  });
});

function generateFeedback(history, totalPossibleQuestions) {
  const candidateResponses = history.filter(m => m.role === 'candidate');
  const questionsAsked = history.filter(m => m.role === 'interviewer').length;
  
  const avgWords = candidateResponses.length > 0 
    ? candidateResponses.reduce((acc, m) => acc + m.content.split(' ').length, 0) / candidateResponses.length 
    : 0;
  
  let feedbackText = "";
  
  if (avgWords > 50) {
    feedbackText = "Excellent! Your answers were detailed and comprehensive. You demonstrated strong communication skills and deep technical knowledge.";
  } else if (avgWords > 25) {
    feedbackText = "Good job! Your answers were clear and concise. Consider adding more examples and details to strengthen your responses.";
  } else {
    feedbackText = "You completed the interview. Try to elaborate more on your answers with specific examples and technical details to make a stronger impression.";
  }
  
  return {
    totalQuestions: questionsAsked,
    responsesGiven: candidateResponses.length,
    averageResponseLength: Math.round(avgWords),
    feedback: feedbackText
  };
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded difficulty levels: ${Object.keys(questionsData).join(', ')}`);
});
