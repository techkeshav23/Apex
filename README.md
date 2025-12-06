# AI-Driven Conversational Sales Agent# AI-Driven Conversational Sales Agent# AI-Driven Conversational Sales Agent# AI-Driven Conversational Sales Agent - ABFRL Retail Challenge



## 📁 Project Structure



```## 🏗️ Project Structure

prototype/

├── backend/                 # Backend Server (AI Agents + API)

│   ├── agents/             # All AI agents

│   ├── api/                # Data API endpoints```## Overview## Overview

│   ├── data/               # Database (JSON files)

│   ├── src/                # Helper servicesprototype/

│   ├── app.py              # Main backend server

│   └── requirements.txt│Agentic AI solution for retail sales that orchestrates multiple specialized agents to handle the complete customer journey from product discovery to post-purchase support.This is a complete implementation of an Agentic AI solution for retail sales that seamlessly operates across online and physical channels.

│

├── frontend/                # Frontend (Web UI)├── backend/                 # Backend Server (AI Agents + API)

│   ├── templates/          # HTML templates

│   ├── web_app.py          # Flask frontend server│   ├── agents/             # AI Agents (Sales, Recommendation, etc.)

│   └── requirements.txt

││   ├── api/                # Data API endpoints

└── README.md               # This file

```│   ├── data/               # Database (JSON files)## Architecture## Architecture



---│   ├── src/                # Helper services (Gemini AI)



## 🚀 How to Start│   ├── app.py              # Main backend server- **Sales Agent**: Main orchestrator managing multi-channel conversation flow



### Step 1: Start Backend│   ├── requirements.txt

Open terminal 1:

```bash│   └── README.md### Sales Agent (Orchestrator)- **Worker Agents**:

cd backend

pip install -r requirements.txt│

python app.py

```├── frontend/                # Frontend Server (Web UI)- Manages multi-channel conversation flow  - Recommendation Agent



Backend runs on:│   ├── templates/          # HTML templates

- **Data API**: http://localhost:5001

- **Sales Agent API**: http://localhost:5000│   ├── web_app.py          # Flask frontend server- Routes tasks to worker agents  - Inventory Agent



### Step 2: Start Frontend│   ├── requirements.txt

Open terminal 2:

```bash│   └── README.md- Maintains session continuity across channels  - Payment Agent

cd frontend

pip install -r requirements.txt│

python web_app.py

```├── start_backend.bat        # Start backend only  - Fulfillment Agent



Frontend runs on: **http://localhost:5000**├── start_frontend.bat       # Start frontend only



### Step 3: Open Browser├── start_all.bat            # Start both (recommended)### Worker Agents  - Loyalty and Offers Agent

```

http://localhost:5000└── README.md                # This file

```

```1. **Recommendation Agent** - Personalized product suggestions  - Post-Purchase Support Agent

---



## 🎯 What's Included

---2. **Inventory Agent** - Real-time stock checking across locations

### Backend

- ✅ **6 AI Agents** (Sales, Recommendation, Inventory, Payment, Loyalty, Fulfillment, Post-Purchase)

- ✅ **REST API** for data access

- ✅ **JSON Database** (10 customers, 22 products)## 🚀 Quick Start (Windows)3. **Payment Agent** - Payment processing with retry logic## Features

- ✅ **Gemini AI** integration (optional)



### Frontend

- ✅ **Chat Interface** with modern UI### Option 1: Start Everything at Once (Easiest)4. **Fulfillment Agent** - Order delivery and pickup management- ✅ Multi-channel support (Web, Mobile, WhatsApp, In-store Kiosk)

- ✅ **Customer Selection** dropdown

- ✅ **Multi-Channel** support (Web, Mobile, WhatsApp, etc.)```batch

- ✅ **Real-time** messaging

start_all.bat5. **Loyalty Agent** - Points, promotions, and offers- ✅ Session continuity across channels

---

```

## 💡 Usage

This will start both backend and frontend servers.6. **Post-Purchase Agent** - Returns, exchanges, tracking, feedback- ✅ Personalized recommendations

1. Select a customer from dropdown

2. Choose a channel (Web, Mobile, etc.)

3. Start chatting:

   - "Show me ethnic wear"### Option 2: Manual Start- ✅ Real-time inventory checks

   - "I need formal shirts"

   - "Add to cart"

   - "Apply promo code SAVE20"

   - "Checkout"#### Step 1: Start Backend## Quick Start- ✅ Payment processing with retry logic



---```batch



## 🔐 Optional: Gemini AIstart_backend.bat- ✅ Loyalty points and promotions



For better responses, add Gemini API key:```



1. Get free key: https://makersuite.google.com/app/apikeyOr manually:### 1. Install Dependencies- ✅ Post-purchase support

2. Create `backend/.env`:

``````bash

GEMINI_API_KEY=your_api_key_here

```cd backend```bash- ✅ **Gemini AI integration** for natural conversations (optional)



System works without it using rule-based responses.pip install -r requirements.txt



---python app.pypip install -r requirements.txt



## 📚 Documentation```



- `backend/README.md` - Backend API documentation**Backend runs on:**```## Setup

- `frontend/README.md` - Frontend setup guide

- `HOW_AGENTS_WORK.md` - How AI agents work- Data API: `http://localhost:5001`

- `DEPLOYMENT_GUIDE.md` - Deploy to web/mobile

- Sales Agent API: `http://localhost:5000`

---



## 🛠️ Tech Stack

#### Step 2: Start Frontend (in new terminal)### 2. Start API Server### 1. Install Dependencies

**Backend**: Python, Flask, Google Gemini AI  

**Frontend**: HTML/CSS/JavaScript, Flask  ```batch

**Database**: JSON files  

start_frontend.bat```bash```bash

---

```

## ✅ Features

Or manually:python api/mock_server.pypip install -r requirements.txt

- 🤖 Multi-agent AI system

- 🔄 Seamless channel switching```bash

- 💳 Payment processing with retry

- 📦 Multi-location inventorycd frontend``````

- 🎁 Automatic promotions

- 📱 Omnichannel supportpip install -r requirements.txt

- ♻️ Error handling

- 📊 Personalizationpython web_app.pyServer runs on: http://localhost:5001



---```



**Ready to start!** 🚀**Frontend runs on:** `http://localhost:5000`### 2. Environment Configuration



Terminal 1: `cd backend && python app.py`  

Terminal 2: `cd frontend && python web_app.py`  

Browser: `http://localhost:5000`#### Step 3: Open Browser### 3. Run DemoCreate a `.env` file:


```

http://localhost:5000In a new terminal:```

```

```bashGEMINI_API_KEY=your_gemini_api_key_here

---

python demo.py```

## 🔧 Architecture

```

### Backend (Port 5001, 5000)

- **AI Agents**: Sales, Recommendation, Inventory, Payment, Loyalty, Fulfillment, Post-Purchase**Get FREE Gemini API Key:**

- **Data API**: Customer, Product, Inventory, Promotions endpoints

- **Business Logic**: All AI processing happens hereOr use the automated demo:1. Visit: https://makersuite.google.com/app/apikey



### Frontend (Port 5000)```bash2. Sign in with Google

- **Web Interface**: Chat UI, customer selection, channel switcher

- **API Proxy**: Routes requests to backendpython run_demo.py3. Create API key

- **User Experience**: Modern responsive interface

```4. Add to `.env` file

### Communication Flow

```

User (Browser)

    ↓### 4. Web Interface (Optional)**Note:** Gemini is optional. System works with rule-based responses if no API key is provided.

Frontend (Port 5000)

    ↓ HTTP Requests```bash

Backend API (Port 5000)

    ↓ Function Callspython web_app.pySee detailed setup: [GEMINI_SETUP.md](GEMINI_SETUP.md)

AI Agents

    ↓ HTTP Requests```

Data API (Port 5001)

    ↓ Read/WriteVisit: http://localhost:5000### 3. Run the Application

JSON Files (Database)

``````bash



---## Project Structure# Start the mock API server



## 📦 Technologies```python api/mock_server.py



### Backendprototype/

- Python 3.11

- Flask (REST API)├── agents/                  # All AI agents# In another terminal, run the demo

- Google Gemini AI (optional)

- JSON (data storage)│   ├── sales_agent.py      # Main orchestratorpython demo.py



### Frontend│   ├── recommendation_agent.py```

- HTML5, CSS3, JavaScript

- Flask (server)│   ├── inventory_agent.py

- Fetch API (AJAX)

│   ├── payment_agent.py### 4. Run Web Interface

---

│   ├── loyalty_agent.py```bash

## 🌟 Features

│   ├── fulfillment_agent.pypython web_app.py

### Multi-Agent System

- ✅ 6 specialized worker agents│   └── post_purchase_agent.py```

- ✅ Sales Agent orchestrator

- ✅ Modular architecture├── api/Visit http://localhost:5000



### Omnichannel Support│   └── mock_server.py      # Mock API endpoints

- ✅ Web, Mobile, WhatsApp, In-store Kiosk

- ✅ Session continuity across channels├── data/## Project Structure

- ✅ Context preservation

│   ├── customers.json      # 10 customer profiles```

### Complete E-commerce Flow

- ✅ Product discovery & recommendations│   ├── products.json       # 22 productsprototype/

- ✅ Real-time inventory checking

- ✅ Payment processing with retry logic│   ├── inventory.json      # Stock data├── agents/           # All AI agents

- ✅ Order fulfillment (ship/pickup)

- ✅ Loyalty points & promotions│   └── promotions.json     # Active promotions├── api/             # Mock API endpoints

- ✅ Post-purchase support (returns, tracking)

├── src/├── data/            # Synthetic data files

---

│   └── gemini_helper.py    # Optional AI enhancement├── src/             # Core utilities

## 📊 Data

├── templates/├── demo.py          # CLI demo

### Synthetic Data Included

- **10 customers** with profiles, history, preferences│   └── index.html          # Web UI├── web_app.py       # Web interface

- **22 products** across multiple categories

- **Stock levels** in 3 stores + 3 warehouses├── demo.py                 # Interactive demos└── README.md

- **3 active promotions** with validation logic

├── run_demo.py             # Automated demo```

---

└── web_app.py              # Web interface

## 🎨 Usage

```## Demo Scenarios

1. **Select Customer**: Choose from dropdown (e.g., Keshav Sharma)

2. **Choose Channel**: Click Web, Mobile, WhatsApp, etc.1. **Customer Journey**: Mobile app → In-store kiosk transition

3. **Start Chatting**: Type your query

4. **Try Different Flows**:## Features2. **Edge Cases**: Payment failures, out-of-stock handling

   - "Show me ethnic wear"

   - "I need formal shirts"- ✅ Multi-channel support (Web, Mobile, WhatsApp, In-store Kiosk)3. **Upselling**: Complementary product recommendations

   - "Add to cart"

   - "Apply promo code SAVE20"- ✅ Session continuity across channels4. **Loyalty**: Points redemption and offers

   - "Checkout"

- ✅ End-to-end purchase orchestration

---

- ✅ Payment failure recovery## Key Deliverables

## 🔐 Optional: Gemini AI Integration

- ✅ Real-time inventory checking- End-to-end orchestration: recommendation → inventory → payment → fulfillment

For enhanced natural language responses:

- ✅ Loyalty rewards and promotions- Multi-channel session continuity

1. Create `.env` file in `backend/`:

```- ✅ Post-purchase support- Worker agent modularity

GEMINI_API_KEY=your_api_key_here

```- ✅ Optional Gemini AI for natural conversations



2. Get free API key: https://makersuite.google.com/app/apikey## Optional: Gemini AI Integration



**Note:** System works with rule-based responses if Gemini is not configured.Create `.env` file:

```

---GEMINI_API_KEY=your_api_key_here

```

## 📱 Deploy to Production

Get free API key: https://makersuite.google.com/app/apikey

### Backend Deployment (Render/Heroku)

```bashSystem works with rule-based responses if Gemini is not configured.

cd backend

git init## Technology Stack

git add .- Python 3.x

git commit -m "Deploy backend"- Flask (API & Web)

# Push to Render.com or Heroku- Google Gemini AI (optional)

```- JSON data storage



### Frontend Deployment## Key Capabilities

```bash- 🤖 6 specialized worker agents

cd frontend- 🔄 Seamless channel switching

# Update BACKEND_URL in web_app.py to your deployed backend URL- 💳 Multiple payment methods

git init- 📦 Multi-location inventory

git add .- 🎁 Automatic promotions

git commit -m "Deploy frontend"- 📱 Omnichannel experience

# Push to Render.com or Heroku- ♻️ Retry & error handling

```- 📊 Customer personalization


See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🛠️ Development

### Backend Development
```bash
cd backend
python app.py  # Runs on 5001 + 5000
```

### Frontend Development
```bash
cd frontend
python web_app.py  # Runs on 5000
```

### Adding New Agent
1. Create new agent in `backend/agents/`
2. Extend `BaseAgent` class
3. Implement `execute()` method
4. Add to `SalesAgent` orchestrator

---

## 📚 Documentation

- `backend/README.md` - Backend architecture & API docs
- `frontend/README.md` - Frontend setup & features
- `HOW_AGENTS_WORK.md` - Detailed agent explanation
- `DEPLOYMENT_GUIDE.md` - Production deployment guide

---

## 🐛 Troubleshooting

### "Connection refused" Error
- Make sure backend is running before frontend
- Check if ports 5001, 5000, 5000 are not in use

### "Module not found" Error
```bash
cd backend
pip install -r requirements.txt

cd ../frontend
pip install -r requirements.txt
```

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:5000/health
```

---

## 📈 Key Capabilities

- 🤖 **6 Specialized Worker Agents**
- 🔄 **Seamless Channel Switching**
- 💳 **Multiple Payment Methods**
- 📦 **Multi-Location Inventory**
- 🎁 **Automatic Promotions**
- 📱 **Omnichannel Experience**
- ♻️ **Retry & Error Handling**
- 📊 **Customer Personalization**

---

## 🎯 Project Status

✅ **Backend**: Complete with all 6 agents  
✅ **Frontend**: Web interface ready  
✅ **API**: REST endpoints implemented  
✅ **Data**: 10 customers, 22 products  
✅ **Deployment Ready**: Production configuration included  

---

## 📞 Support

For questions or issues, refer to documentation files or check the code comments.

**Ready to start!** Run `start_all.bat` and open `http://localhost:5000` 🚀
