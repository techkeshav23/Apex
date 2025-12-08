# Telegram Bot - Backend Agent Integration

A lightweight Telegram bot that forwards user queries to a Node.js backend agent deployed on Render.

## Architecture

```
User → Telegram Bot → Backend Agent (Render) → Response → User
```

- **Telegram Bot**: Simple messenger (no logic)
- **Backend**: Intelligence layer at https://apex-1-v7pe.onrender.com

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **bot token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot token:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   BACKEND_URL=https://apex-1-v7pe.onrender.com
   BACKEND_ENDPOINT=/api/query
   ```

   > ⚠️ **Important**: Update `BACKEND_ENDPOINT` to match your actual backend API endpoint

### 4. Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Backend API Requirements

Your backend at `https://apex-1-v7pe.onrender.com` should expose an endpoint (e.g., `/api/query`) that:

### Accepts POST requests with:
```json
{
  "query": "user's message",
  "userId": 123456789,
  "userName": "John",
  "chatId": 987654321,
  "timestamp": "2025-12-07T16:29:49.000Z"
}
```

### Returns a response with:
```json
{
  "response": "The bot's answer to the user's query"
}
```

**Alternative response formats** (the bot will try to extract from these fields):
- `response.data.answer`
- `response.data.message`
- `response.data.response`

## Supported Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help information
- `/status` - Check if backend is online

## How It Works

1. User sends a message to the bot
2. Bot shows "typing..." indicator
3. Bot forwards the message to your backend via POST request
4. Backend processes the query (your agent logic)
5. Backend returns a response
6. Bot sends the response back to the user

## Error Handling

The bot includes comprehensive error handling for:
- Backend timeouts (30 second limit)
- Connection errors
- Backend errors (4xx, 5xx)
- Invalid responses

## Project Structure

```
TelegramBot/
├── bot.js              # Main bot logic
├── package.json        # Dependencies
├── .env               # Environment variables (create this)
├── .env.example       # Environment template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Deployment Options

### Option 1: Run Locally
```bash
npm start
```
Keep your terminal open while the bot is running.

### Option 2: Deploy to a Server
- **Heroku**: Connect your repo and deploy
- **Railway**: Import project and deploy
- **DigitalOcean**: Run on a droplet with PM2
- **Your own VPS**: Use PM2 or systemd

### Using PM2 (recommended for production)
```bash
npm install -g pm2
pm2 start bot.js --name telegram-bot
pm2 save
pm2 startup
```

## Testing

1. Start the bot: `npm start`
2. Open Telegram and search for your bot
3. Send `/start` to begin
4. Send any message to test the backend integration
5. Use `/status` to check backend connectivity

## Troubleshooting

### Bot not responding
- Check if bot is running: `npm start`
- Verify `TELEGRAM_BOT_TOKEN` in `.env`
- Check Telegram bot token is correct

### Backend errors
- Verify `BACKEND_URL` is correct
- Check `BACKEND_ENDPOINT` matches your API
- Use `/status` command to test connectivity
- Ensure backend is running on Render

### Timeout errors
- Check if backend is responding within 30 seconds
- Increase timeout in `bot.js` if needed
- Verify Render service is not sleeping

## Next Steps

1. **Customize the backend endpoint** in `.env` to match your actual API
2. **Add authentication** if your backend requires API keys
3. **Enhance error messages** based on your use case
4. **Add more commands** as needed
5. **Deploy to production** server

## License

ISC
