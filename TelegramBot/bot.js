require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}

if (!process.env.BACKEND_URL) {
    console.error('❌ Error: BACKEND_URL is not set in .env file');
    process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const BACKEND_URL = process.env.BACKEND_URL;

console.log('🤖 Telegram Bot started successfully!');
console.log(`📡 Connected to backend: ${BACKEND_URL}`);

// Store user sessions - maps Telegram userId to backend session_id
const userSessions = new Map();

/**
 * Create a new session for a user on the backend
 */
async function createSession(userId, userName) {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/start_session`,
            {
                customer_id: `TG_${userId}`,
                channel: 'telegram'
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        if (response.data.success && response.data.session_id) {
            userSessions.set(userId, {
                session_id: response.data.session_id,
                created_at: new Date()
            });
            console.log(`✅ Session created for user ${userName} (${userId}): ${response.data.session_id}`);
            return {
                success: true,
                session_id: response.data.session_id,
                greeting: response.data.message
            };
        } else {
            throw new Error('Failed to create session');
        }
    } catch (error) {
        console.error('❌ Error creating session:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get or create session for a user
 */
async function getOrCreateSession(userId, userName) {
    // Check if session exists
    if (userSessions.has(userId)) {
        return { success: true, session_id: userSessions.get(userId).session_id };
    }

    // Create new session
    return await createSession(userId, userName);
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'there';

    bot.sendChatAction(chatId, 'typing');

    // Create a new session for this user
    const result = await createSession(userId, firstName);

    if (result.success) {
        bot.sendMessage(
            chatId,
            `👋 Hello ${firstName}!\n\n` +
            `${result.greeting || "I'm your intelligent shopping assistant. How can I help you today?"}\n\n` +
            `Just send me any message and I'll assist you! 🚀`
        );
    } else {
        bot.sendMessage(
            chatId,
            `👋 Hello ${firstName}!\n\n` +
            `I'm your intelligent assistant bot. I'm having trouble connecting to the backend right now.\n\n` +
            `Please try again in a moment or use /start to reconnect.`
        );
    }
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        `📚 *How to use this bot:*\n\n` +
        `• Simply send me any question or query\n` +
        `• I'll forward it to the backend agent\n` +
        `• You'll receive an intelligent response\n\n` +
        `*Commands:*\n` +
        `/start - Start a new session\n` +
        `/help - Show this help message\n` +
        `/status - Check backend status\n` +
        `/newsession - Create a fresh session`,
        { parse_mode: 'Markdown' }
    );
});

// Handle /status command
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        const hasSession = userSessions.has(userId);

        bot.sendMessage(
            chatId,
            `✅ Backend is online!\n\n` +
            `Status: ${response.data.status}\n` +
            `Message: ${response.data.message}\n` +
            `Your session: ${hasSession ? '✅ Active' : '❌ None (use /start)'}`
        );
    } catch (error) {
        bot.sendMessage(
            chatId,
            `⚠️ Backend might be offline or slow to respond.\n\nError: ${error.message}`
        );
    }
});

// Handle /newsession command - force create a new session
bot.onText(/\/newsession/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'User';

    bot.sendChatAction(chatId, 'typing');

    // Clear existing session
    userSessions.delete(userId);

    // Create new session
    const result = await createSession(userId, firstName);

    if (result.success) {
        bot.sendMessage(chatId, `🔄 New session created!\n\n${result.greeting || 'How can I help you today?'}`);
    } else {
        bot.sendMessage(chatId, `⚠️ Failed to create new session: ${result.error}`);
    }
});

// Handle all text messages
bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    const chatId = msg.chat.id;
    const userMessage = msg.text;
    const userId = msg.from.id;
    const userName = msg.from.first_name || 'User';

    // Ignore empty messages
    if (!userMessage || userMessage.trim() === '') {
        return;
    }

    console.log(`📨 Message from ${userName} (${userId}): ${userMessage}`);

    try {
        // Send "typing..." indicator
        bot.sendChatAction(chatId, 'typing');

        // Get or create session
        const sessionResult = await getOrCreateSession(userId, userName);

        if (!sessionResult.success) {
            bot.sendMessage(
                chatId,
                `⚠️ Session error. Please use /start to begin a new session.`
            );
            return;
        }

        const sessionId = sessionResult.session_id;

        // Send message to backend chat endpoint
        const response = await axios.post(
            `${BACKEND_URL}/api/chat`,
            {
                session_id: sessionId,
                message: userMessage
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000 // 60 second timeout for AI processing
            }
        );

        // Extract response from backend
        let botResponse;

        if (response.data.message) {
            botResponse = response.data.message;
        } else if (response.data.response) {
            botResponse = response.data.response;
        } else if (response.data.answer) {
            botResponse = response.data.answer;
        } else if (typeof response.data === 'string') {
            botResponse = response.data;
        } else {
            botResponse = JSON.stringify(response.data, null, 2);
        }

        // Send response back to user
        await bot.sendMessage(chatId, botResponse);

        console.log(`✅ Response sent to ${userName}`);

    } catch (error) {
        console.error('❌ Error processing message:', error.message);

        let errorMessage = '⚠️ Sorry, I encountered an error processing your request.\n\n';

        if (error.code === 'ECONNABORTED') {
            errorMessage += 'The backend took too long to respond. Please try again.';
        } else if (error.response) {
            // Handle session not found - create new session
            if (error.response.status === 404 && error.response.data?.error === 'Session not found') {
                userSessions.delete(userId);
                errorMessage = '🔄 Your session expired. Please use /start to begin a new session.';
            } else {
                errorMessage += `Backend error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
            }
        } else if (error.request) {
            errorMessage += 'Could not reach the backend. It might be offline.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }

        bot.sendMessage(chatId, errorMessage);
    }
});

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    bot.stopPolling();
    process.exit(0);
});
