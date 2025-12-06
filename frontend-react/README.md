# AI Sales Agent - React Frontend

This is the React-based frontend for the AI-Driven Conversational Sales Agent.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend-react/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── SessionSelector.jsx
│   │   ├── SessionSelector.css
│   │   ├── ChatInterface.jsx
│   │   ├── ChatInterface.css
│   │   ├── ProductGrid.jsx
│   │   └── ProductGrid.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎨 Features

- **Session Management**: Start shopping sessions with customer selection
- **Chat Interface**: Real-time conversation with AI assistant
- **Channel Switching**: Seamlessly switch between web, store, and mobile channels
- **Product Grid**: Browse and search products with filters
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Quick Actions**: Pre-defined quick action buttons for common queries

## 🛠️ Technologies Used

- **React 18**: Frontend framework
- **Axios**: HTTP client for API calls
- **CSS3**: Styling with modern features (Grid, Flexbox, Animations)
- **Lucide React**: Icon library

## 📡 API Endpoints

The frontend connects to the following backend endpoints:

- `POST /api/start_session` - Start a new shopping session
- `POST /api/chat` - Send messages to the AI assistant
- `POST /api/switch_channel` - Switch between channels
- `GET /api/products` - Fetch product catalog

## 🎯 Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🌈 Components

### Header
Displays the application branding and key features.

### SessionSelector
Allows users to select customer ID and channel before starting a session.

### ChatInterface
Main chat UI with message history, typing indicators, and channel switching.

### ProductGrid
Displays products in a grid with search and filter capabilities.

## 📝 Notes

- Make sure the backend server is running on port 5000
- The Data API should be running on port 5001
- CORS is enabled on the backend for localhost:3000

## 🐛 Troubleshooting

If you encounter CORS issues:
1. Ensure the backend has CORS enabled
2. Check that the backend server is running
3. Verify the API URLs in the component files

## 📄 License

This project is part of the ABFRL Retail Challenge.
