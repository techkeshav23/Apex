# AI-Driven Conversational Sales Agent - Retail Challenge [ABFRL]

## 📖 Overview
This project is an **Agentic AI solution** designed to revolutionize the retail sales experience. It deploys a **Conversational Sales Agent** that seamlessly operates across online and physical channels (Web, Mobile, Telegram, In-Store). The agent emulates a top-tier sales associate, orchestrating specialized **Worker Agents** to handle tasks from product discovery to checkout and post-purchase support.

## 🎯 Problem Statement
Customers face fragmented experiences when moving between online browsing, mobile apps, messaging platforms, and in-store interactions. This solution aims to:
- **Unify the experience:** Maintain context across all channels.
- **Increase Sales:** Use personalized recommendations and up-selling.
- **Automate Operations:** Handle inventory, payments, and fulfillment via AI agents.

## 🏗️ Architecture
The system is built with a modular architecture consisting of a central Backend (Brain) and multiple Frontend interfaces (Channels).

### 🧠 Backend (`backend/`)
The core logic resides here. It hosts the AI Agents and exposes APIs for the frontends.
- **Tech Stack:** Python, Flask, Google Gemini (LLM).
- **Agents:**
  - `Sales Agent`: Orchestrator managing conversation flow.
  - `Recommendation Agent`: Suggests products based on profile and trends.
  - `Inventory Agent`: Checks stock across locations.
  - `Payment Agent`: Handles transactions.
  - `Fulfillment Agent`: Schedules delivery or pickup.
  - `Loyalty Agent`: Manages points and offers.
  - `Post-Purchase Agent`: Handles returns and feedback.

### 💻 Web Mode (`web_mode/`)
A React-based web application for online shopping.
- **Features:** Chat interface, Product catalog, Cart management, Customer profile view.

### 📱 Mobile Mode (`Mobile_mode/`)
A React Native (Expo) application for the mobile shopping experience.
- **Features:** Mobile-optimized chat and shopping interface.

### 🏪 Store Mode (`store_mode/`)
A React application designed for In-Store Kiosks.
- **Features:** Kiosk interface for customers to interact with the agent in physical stores.

### 🤖 Telegram Bot (`TelegramBot/`)
A Node.js bot that connects the Sales Agent to Telegram.
- **Features:** Conversational commerce via messaging app.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Set up your GEMINI_API_KEY in environment variables or .env
python app.py
```

### 2. Web Mode Setup
```bash
cd web_mode
npm install
npm start
```

### 3. Store Mode Setup
```bash
cd store_mode
npm install
npm start
```

### 4. Mobile Mode Setup
```bash
cd Mobile_mode
npm install
npx expo start
```

### 5. Telegram Bot Setup
```bash
cd TelegramBot
npm install
# Configure bot token
node bot.js
```

## 🔄 Workflow
1.  **Initiation:** Customer starts a chat on any channel (Web, Mobile, etc.).
2.  **Orchestration:** The **Sales Agent** receives the input, understands intent, and calls Worker Agents if needed.
3.  **Action:**
    *   **Recommendation Agent** finds products.
    *   **Inventory Agent** checks availability.
    *   **Payment Agent** processes the order.
4.  **Response:** The Sales Agent generates a natural language response back to the user.

## 📂 Folder Structure
```
Apex-master/
├── backend/            # Python Flask Server & AI Agents
├── web_mode/           # React Web App
├── Mobile_mode/        # React Native Mobile App
├── store_mode/         # React In-Store Kiosk App
├── TelegramBot/        # Telegram Bot Service
├── PS.md               # Problem Statement
└── README.md           # Project Documentation
```
