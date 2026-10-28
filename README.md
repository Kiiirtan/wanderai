# WanderAI — Personalized AI Travel Itinerary Planner ✈️

> A full-stack, AI-powered web application that simplifies travel planning through intelligent automation, personalized day-by-day recommendations, and an **Airy Scandi-Minimalist Light Mode** design.

---

## 🌟 Key Features

- **Personalized Itinerary Engine**: Generates customized day-by-day travel itineraries based on destination, dates, budget levels, travel pace, and interests (culture, dining, adventure, sightseeing, nightlife, etc.).
- **Scandi-Minimalist Light UI**: Designed with clean white surfaces, subtle drop shadows, soft emerald price tags, and warm terracotta coral accents.
- **Interactive Multi-Step Input Panel**: Quick inputs for destination, dates, start times, budget categories, and multi-select interest chips.
- **AI Output Timeline**: Dynamic vertical timeline linking daily itineraries with price tags, activity breakdowns, and curated travel badges (`Budget-friendly`, `Family`, `Tips`).
- **Integrated Light-Mode Map Snippet**: Vector SVG map preview showing routes, stops, geographic points, and interactive zoom controls.
- **Full-Stack Authentication**: JWT-based secure user registration and login with bcrypt hashing.
- **Trip Management Catalog**: Filterable directory to browse, save, inspect, and manage all your past and upcoming journeys.
- **Single-Day & Full-Trip Regeneration**: Ability to tweak or regenerate specific days with custom feedback.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS Design System with CSS variables (`src/index.css`)
- **Typography**: `@fontsource/inter` (weights 400 to 800)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM v7

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy async & aiosqlite
- **Authentication**: JWT (python-jose) + native bcrypt password hashing
- **AI Integration**: Google Gemini AI (`google-generativeai`) with mock fallback for local development

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **Python** (v3.10 or newer)
- **Git**

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Copy environment file and add your Gemini API Key
cp .env.example .env

# Run FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be live at: `http://127.0.0.1:8000`  
Interactive API Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

In a separate terminal window:

```bash
# In the project root directory
npm install

# Start Vite dev server
npm run dev
```

The application will be running at: `http://127.0.0.1:5173`

---

## 📁 Project Structure

```
Project SW/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Authentication routes (login, register, me)
│   │   │   └── trips.py         # Trip CRUD & AI itinerary generation routes
│   │   ├── core/
│   │   │   ├── config.py        # Settings & environment variables
│   │   │   ├── database.py      # SQLAlchemy async SQLite engine & session
│   │   │   └── auth.py          # JWT token generation & bcrypt utilities
│   │   ├── models/
│   │   │   ├── user.py          # User ORM model
│   │   │   └── trip.py          # Trip & ItineraryDay models
│   │   ├── services/
│   │   │   └── gemini_service.py# Gemini AI prompt engine & mock generator
│   │   └── main.py              # FastAPI application entry point
│   ├── requirements.txt         # Backend Python dependencies
│   └── .env.example             # Example environment variables
├── src/
│   ├── api/
│   │   └── client.js            # Unified API fetch client with JWT interceptors
│   ├── components/
│   │   ├── AppLayout.jsx        # Sidebar navigation & responsive layout wrapper
│   │   └── LightMap.jsx         # Interactive light-mode SVG map component
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication React context & session state
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Split-screen planner & AI output workspace
│   │   ├── TripsListPage.jsx    # Itineraries catalog & status filtering
│   │   ├── ItineraryViewPage.jsx# Detailed day-by-day itinerary inspector
│   │   ├── ExplorePage.jsx      # Community destination inspiration
│   │   ├── SettingsPage.jsx     # Profile & currency preferences
│   │   ├── LoginPage.jsx        # Minimalist sign-in screen
│   │   └── RegisterPage.jsx     # Minimalist sign-up screen
│   ├── App.jsx                  # Main application routes & auth protection
│   ├── index.css                # 800+ lines Scandi-minimalist light design system
│   └── main.jsx                 # React root mount
├── vite.config.js               # Vite config with React plugin & API proxy
└── package.json                 # Frontend dependencies and scripts
```

---

## 🔑 Environment Variables

Create a `backend/.env` file:

```env
APP_NAME=WanderAI - Travel Itinerary Planner
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///./travel_planner.db
SECRET_KEY=your-super-secret-jwt-key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

*(Note: If `GEMINI_API_KEY` is omitted, WanderAI automatically falls back to curated offline travel planning data for seamless offline testing!)*

---

## 📄 License

MIT License. Crafted with ❤️ for travelers everywhere.
