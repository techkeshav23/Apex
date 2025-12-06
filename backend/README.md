# Backend - AI Sales Agent API

## Overview
Backend server with AI agents and REST API endpoints.

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Server
```bash
python app.py
```

Server runs on: **http://localhost:5001**

## Project Structure
```
backend/
├── agents/                  # AI Agents
│   ├── base_agent.py
│   ├── sales_agent.py
│   ├── recommendation_agent.py
│   ├── inventory_agent.py
│   ├── payment_agent.py
│   ├── loyalty_agent.py
│   ├── fulfillment_agent.py
│   └── post_purchase_agent.py
├── api/
│   └── mock_server.py      # Data API endpoints
├── data/                    # Database (JSON)
│   ├── customers.json
│   ├── products.json
│   ├── inventory.json
│   └── promotions.json
├── src/
│   └── gemini_helper.py    # AI helper
├── app.py                   # Main backend server
└── requirements.txt
```

## API Endpoints

### Data API (Port 5001)
- `GET  /api/health` - Health check
- `GET  /api/customers` - Get all customers
- `GET  /api/customers/<id>` - Get customer by ID
- `GET  /api/products` - Get all products
- `GET  /api/inventory/<sku>` - Get inventory
- `POST /api/payment/process` - Process payment
- `GET  /api/promotions` - Get promotions
- `GET  /api/loyalty/<id>` - Get loyalty info
- `POST /api/orders/create` - Create order

### Sales Agent API (Port 5000)
- `POST /api/start_session` - Start new session
- `POST /api/chat` - Send message to agent
- `POST /api/switch_channel` - Switch communication channel

## Environment Variables
Create `.env` file:
```
GEMINI_API_KEY=your_api_key_here
PORT=5001
```

## Tech Stack
- Python 3.11
- Flask (REST API)
- Google Gemini AI (optional)
- JSON (data storage)

## Agents Overview

### Sales Agent (Orchestrator)
Main coordinator that routes tasks to worker agents.

### Worker Agents
1. **Recommendation Agent** - Product suggestions
2. **Inventory Agent** - Stock checking
3. **Payment Agent** - Payment processing
4. **Loyalty Agent** - Promotions & points
5. **Fulfillment Agent** - Order delivery
6. **Post-Purchase Agent** - Returns & tracking
