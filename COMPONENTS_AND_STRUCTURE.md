# Personal-Finance-Assistance — Components & File Structure

## 🏗️ Project Overview

**Personal-Finance-Assistance** is a full-stack web application for personal and family finance management. It consists of three sub-services that work together:

| Sub-System | Technology | Purpose |
|---|---|---|
| `src/` (Frontend) | React 18 + Vite + TypeScript + Tailwind CSS | Web dashboard UI |
| `backend/` | Node.js + Express + TypeScript + Prisma + MongoDB | REST API + WebSocket server |
| `ml-service/` | Python 3 + FastAPI + scikit-learn | ML categorization & forecasting |
| `finance-sms-companion/` | React Native + Expo (Android) | SMS forwarding companion app |

---

## 📁 Root File Structure

```
Personal-Finance-Assistance/
├── src/                          # React web frontend
├── backend/                      # Node.js/Express API backend
├── ml-service/                   # Python FastAPI ML service
├── finance-sms-companion/        # Android SMS companion app
├── index.html                    # Vite entry HTML
├── vite.config.ts                # Vite bundler config
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config (root)
├── package.json                  # Root dependencies (Vite frontend)
└── train_models.ps1              # PowerShell script to train ML models
```

---

## 🌐 Frontend — `src/`

**Framework**: React 18 + Vite + TypeScript + Tailwind CSS  
**Port**: 5174 (dev)

### File Structure

```
src/
├── App.tsx                       # Root component — routing + auth guard + context providers
├── main.tsx                      # React entry point
├── index.css                     # Global Tailwind + custom CSS
├── vite-env.d.ts                 # Vite type declarations
├── components/                   # All UI components (pages/views)
│   ├── Auth.tsx                  # Login & Register forms
│   ├── Dashboard.tsx             # Home dashboard (summary, charts, recent txns)
│   ├── Transactions.tsx          # Transaction list, add, filter, search
│   ├── Budget.tsx                # Budget management with limits & alerts
│   ├── Goals.tsx                 # Savings goals + progress tracking
│   ├── Analytics.tsx             # Charts, spending breakdown, trends
│   ├── Reports.tsx               # Monthly/yearly financial reports
│   ├── Alerts.tsx                # Smart alerts (budget breach, goal milestones)
│   ├── Settings.tsx              # User preferences, currency, profile
│   ├── Navigation.tsx            # Left sidebar navigation
│   ├── FamilyRoom.tsx            # Family group — invite, manage, shared view
│   ├── FamilyDataDashboard.tsx   # Aggregated family spending overview
│   ├── FamilyBudgets.tsx         # Family-shared budget management
│   ├── FamilyGoals.tsx           # Shared family savings goals
│   ├── SMSParser.tsx             # SMS transaction parsing interface
│   ├── SMSSetupModal.tsx         # First-login SMS link setup modal
│   └── ui/                       # Reusable UI primitives (buttons, cards, inputs)
├── contexts/                     # React Context — global state management
│   ├── AuthContext.tsx           # JWT auth state, login/logout/register
│   ├── FinanceContext.tsx        # Transactions, budgets, goals global state
│   ├── AlertContext.tsx          # Alert/notification state
│   ├── CurrencyContext.tsx       # Currency selection (INR/USD/etc.)
│   └── SocketContext.tsx         # WebSocket real-time connection
└── services/                     # API service layer (calls to backend)
```

### Key Components Detail

| Component | Purpose |
|---|---|
| `App.tsx` | Root app; wraps everything in Context providers, handles auth guard, shows SMS setup modal for new users |
| `AuthContext.tsx` | Manages JWT token in localStorage, exposes `useAuth()` hook, handles login/register/logout |
| `FinanceContext.tsx` | Central state for all financial data (transactions, budgets, goals, alerts) |
| `SocketContext.tsx` | Maintains Socket.IO connection to backend for real-time budget alerts |
| `Dashboard.tsx` | Landing page after login — monthly summary, pie charts, recent transactions |
| `Transactions.tsx` | Full CRUD for transactions — add/edit/delete, filter by date/category/type |
| `Analytics.tsx` | Visual charts — spending by category, income vs expense, trends over time |
| `FamilyRoom.tsx` | Create/join family rooms using room codes, manage member permissions |
| `SMSSetupModal.tsx` | Guides new users to set up SMS forwarding from mobile companion app |

---

## 🖥️ Backend — `backend/`

**Framework**: Node.js + Express + TypeScript  
**Database**: MongoDB Atlas (via Prisma ORM)  
**Port**: 3000  
**Auth**: JWT (7-day expiry)  
**Real-time**: Socket.IO WebSocket

### File Structure

```
backend/
├── src/
│   ├── server.ts                     # Express app entry — registers all routes & middleware
│   ├── websocket.ts                  # Socket.IO initialization and event handlers
│   ├── config/
│   │   └── env.ts                    # Config loader from .env variables
│   ├── controllers/                  # Business logic per feature
│   │   ├── authController.ts         # Register, login, JWT issue, password reset
│   │   ├── transactionController.ts  # CRUD for transactions + ML categorize
│   │   ├── budgetController.ts       # Budget CRUD + limit checking
│   │   ├── goalController.ts         # Goals CRUD + contribution tracking
│   │   ├── alertController.ts        # Alert creation, read, dismiss
│   │   ├── analyticsController.ts    # Spending analytics, category breakdown
│   │   ├── reportsController.ts      # Monthly/yearly report generation
│   │   ├── familyController.ts       # Family room create/join/manage/members
│   │   ├── familyFinanceController.ts # Family-level budgets and shared goals
│   │   ├── familyDataController.ts   # Family aggregated spending data
│   │   ├── mlController.ts           # ML model train/predict proxy to ml-service
│   │   ├── smsController.ts          # SMS transaction parsing endpoint
│   │   ├── aiInsightsController.ts   # Gemini AI-powered financial advice
│   │   ├── exportController.ts       # Export transactions to CSV/JSON
│   │   └── importController.ts       # Import transactions from CSV
│   ├── routes/                       # Express router definitions
│   │   ├── auth.ts                   # POST /api/auth/register, /login, /me
│   │   ├── transactions.ts           # GET/POST/PUT/DELETE /api/transactions
│   │   ├── budgets.ts                # CRUD /api/budgets
│   │   ├── goals.ts                  # CRUD /api/goals
│   │   ├── alerts.ts                 # GET/PUT /api/alerts
│   │   ├── analytics.ts              # GET /api/analytics
│   │   ├── reports.ts                # GET /api/reports
│   │   ├── family.ts                 # Family room management endpoints
│   │   ├── ml.ts                     # ML train/predict endpoints
│   │   ├── sms.ts                    # POST /api/sms/parse
│   │   ├── aiInsights.ts             # POST /api/ai-insights
│   │   ├── notifications.ts          # Push notification management
│   │   ├── export.ts                 # GET /api/export
│   │   └── import.ts                 # POST /api/import
│   ├── middleware/
│   │   ├── authMiddleware.ts         # JWT verification middleware
│   │   ├── rateLimiter.ts            # express-rate-limit config
│   │   └── errorHandler.ts           # Global 404 + error handler
│   ├── services/                     # Reusable service classes
│   ├── ml/                           # Backend-side ML helpers
│   ├── types/                        # TypeScript interfaces
│   └── utils/
│       └── logger.ts                 # Winston logger
├── prisma/
│   ├── schema.prisma                 # Full data model (Users, Transactions, Budgets, Goals, Alerts, Family, GoalContributions)
│   └── seed.ts                       # Database seeder with sample data
├── .env                              # Environment variables (DB URL, JWT, API keys)
├── Dockerfile                        # Docker support
├── docker-compose.yml                # Docker Compose for backend + DB
└── package.json
```

### Database Models (Prisma Schema)

| Model | Key Fields | Relations |
|---|---|---|
| `User` | email, password, name, phone, smsSetupComplete | Transactions, Budgets, Goals, Alerts, FamilyMemberships |
| `Transaction` | amount, description, category, type (INCOME/EXPENSE), date, source | User |
| `Budget` | category, limit, spent, period (WEEKLY/MONTHLY/YEARLY) | User, Family |
| `Goal` | title, target, current, deadline, category | User, Family, GoalContributions |
| `Alert` | type, title, message, read | User |
| `Family` | name, roomCode (unique), isActive | Creator (User), Members, Budgets, Goals |
| `FamilyMember` | role (CREATOR/ADMIN/MEMBER), permissions, status, isSharingTransactions | Family, User |
| `GoalContribution` | amount, date | Goal, User |

### API Routes Summary

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login, returns JWT |
| `/api/auth/me` | GET | Get current user (protected) |
| `/api/transactions` | GET/POST | List or create transactions |
| `/api/transactions/:id` | PUT/DELETE | Update or delete transaction |
| `/api/budgets` | GET/POST/PUT/DELETE | Budget management |
| `/api/goals` | GET/POST/PUT/DELETE | Goal management |
| `/api/alerts` | GET/PUT | Get and mark alerts as read |
| `/api/analytics` | GET | Spending analytics data |
| `/api/reports` | GET | Monthly/yearly reports |
| `/api/family/*` | Various | Family room management |
| `/api/ml/categorize` | POST | ML-based category prediction |
| `/api/ml/forecast` | POST | Expense forecasting |
| `/api/sms/parse` | POST | Parse SMS text to transaction |
| `/api/ai-insights` | POST | Gemini AI financial insight |
| `/api/export` | GET | Export transactions as CSV |
| `/api/import` | POST | Import transactions from CSV |
| `/health` | GET | Health check |

### Middleware Stack

| Middleware | Library | Purpose |
|---|---|---|
| Security headers | `helmet` | XSS protection, CSP headers |
| CORS | `cors` | Only allows frontend URL |
| Rate limiting | `express-rate-limit` | 100 requests/15 min |
| Body parsing | `express.json` | JSON body parsing (10MB limit) |
| Compression | `compression` | Gzip response compression |
| Logging | `morgan` + `winston` | HTTP request + structured logging |
| Auth | Custom JWT middleware | Protects all non-auth routes |

---

## 🤖 ML Service — `ml-service/`

**Framework**: Python 3 + FastAPI  
**ML Libraries**: scikit-learn  
**Port**: 8000  

### File Structure

```
ml-service/
├── main.py                          # FastAPI app entry — all endpoints
├── config.py                        # HOST, PORT config
├── requirements.txt                 # Python dependencies
├── initial_model_training.py        # One-time model bootstrap script
├── continuous_learning.py           # Incremental model update logic
├── find_and_train.py                # Helper to find user data and train
└── services/
    ├── transaction_categorizer.py   # sklearn text classifier (TF-IDF + Random Forest)
    └── expense_forecaster.py        # Time-series expense forecaster (LinearRegression)
```

### ML Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/categorize/train` | POST | Train categorization model for a user |
| `/categorize/predict` | POST | Predict category for one transaction |
| `/categorize/predict-batch` | POST | Predict categories for many transactions |
| `/forecast/train` | POST | Train forecasting model for a user |
| `/forecast/predict` | POST | Forecast expenses for N days/by category |
| `/forecast/next-month` | POST | Forecast next month's expenses |
| `/models/status/{user_id}` | GET | Check if models are trained for user |
| `/health` | GET | Service health check |

### How ML Works

1. **Transaction Categorizer**: Uses **TF-IDF vectorization** on transaction descriptions → **Random Forest** classifier. Trained per-user. Predicts categories like Food, Transport, Shopping, etc.
2. **Expense Forecaster**: Uses **LinearRegression** on past spending grouped by day. Trained per-user. Forecasts future spending by category.
3. Models are saved per-user and loaded on demand. Minimum 50 transactions required for categorizer, 20 for forecaster.

---

## 📱 SMS Companion App — `finance-sms-companion/`

**Framework**: React Native + Expo (Android only)  
**Purpose**: Reads SMS messages on Android device and forwards bank transaction SMSes to the backend for parsing

### File Structure

```
finance-sms-companion/
├── App.js                          # Main app — SMS reading + API forwarding logic
├── SMSForwardService.java          # Native Android service for background SMS listening
├── SMSReceiver.java                # Android BroadcastReceiver for incoming SMS
├── index.js                        # Expo entry point
├── metro.config.js                 # Metro bundler config
├── app.json                        # Expo app config (permissions declared)
├── eas.json                        # Expo EAS build config
└── plugins/                        # Native Expo plugins
```

### Android Permissions Used
- `RECEIVE_SMS` — Listen for incoming SMS
- `READ_SMS` — Read existing bank SMSes
- `FOREGROUND_SERVICE` — Keep SMS service alive in background

---

## 🔗 Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Web Frontend | React + Vite + TypeScript | React 18 |
| Styling | Tailwind CSS | 3.x |
| Backend API | Node.js + Express + TypeScript | Node 18+ |
| ORM | Prisma | 5.x |
| Database | MongoDB Atlas | Cloud |
| Auth | JWT (jsonwebtoken + bcryptjs) | — |
| Real-time | Socket.IO | 4.x |
| ML Service | FastAPI + scikit-learn | Python 3.10+ |
| Mobile | React Native + Expo | SDK 54 |
| State (mobile) | Redux Toolkit | 2.x |
| Navigation (mobile) | React Navigation | 7.x |
| AI Insights | Google Gemini API | — |
| Email | Nodemailer (Gmail SMTP) | — |
| SMS Notifications | Twilio | — |
| Containerization | Docker + Docker Compose | — |

---

## 🔐 External Services & Credentials

| Service | Purpose | Config Key |
|---|---|---|
| MongoDB Atlas | Cloud database | `DATABASE_URL` |
| Google Gemini | AI financial insights | `GEMINI_API_KEY` |
| Gmail SMTP | Email notifications | `SMTP_USER`, `SMTP_PASS` |
| Twilio | SMS notifications | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |

---

## 🔄 Data Flow

```
User (Web Browser)
    ↓ HTTPS
React Frontend (Vite, port 5174)
    ↓ REST API / WebSocket
Node.js Backend (Express, port 3000)
    ↓ Prisma ORM
MongoDB Atlas (Cloud)
    ↓ ML requests
Python ML Service (FastAPI, port 8000)

Android Phone
    ↓ SMS forwarding
SMS Companion App (Expo/React Native)
    ↓ POST /api/sms/parse
Node.js Backend
```
