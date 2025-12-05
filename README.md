# Personal Finance Management System with AI & Family Collaboration

> A comprehensive full-stack personal finance management application with AI-powered insights, SMS transaction parsing, family room collaboration, and real-time financial monitoring.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Core Features](#core-features)
- [Family Room](#family-room)
- [SMS Alerts (Twilio)](#sms-alerts-twilio)
- [ML Features](#ml-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This is a production-ready personal finance management system built for the **EDAI (Emerging Domain in AI)** course at VIT. The application combines modern web technologies with machine learning to provide intelligent financial insights, automated transaction categorization, expense forecasting, and collaborative family finance management.

### What Makes This Special?

- **AI-Powered**: Google Gemini AI for intelligent financial insights and recommendations
- **Family Collaboration**: Multi-user family rooms with granular permission controls
- **SMS Alerts**: Twilio integration for budget and goal notifications
- **Real-Time Updates**: WebSocket-based live data synchronization
- **Privacy-First**: Granular transaction sharing controls and permission management
- **Production-Ready**: Complete with authentication, validation, error handling, and testing

---

## 🚀 Key Features

### Personal Finance Management
- ✅ **Transaction Management**: Add, edit, delete, and categorize income/expenses
- ✅ **Budget Tracking**: Set spending limits by category with real-time progress
- ✅ **Goal Management**: Create and track financial goals with contribution history
- ✅ **Analytics Dashboard**: Comprehensive charts and insights
- ✅ **Smart Alerts**: Notifications for budget limits and goal milestones
- ✅ **Data Export**: Export transactions to CSV/JSON with detailed information
- ✅ **Phone Number Collection**: User phone numbers for SMS notifications
- ✅ **Terms & Conditions**: Mandatory T&C acceptance with privacy policy

### AI-Powered Insights
- 🤖 **Google Gemini AI**: Intelligent financial analysis and recommendations
- 📊 **Spending Patterns**: AI-powered spending behavior analysis
- 💡 **Smart Suggestions**: Personalized saving and budgeting tips
- 📈 **Trend Analysis**: Identify spending trends and anomalies
- 🎯 **Goal Recommendations**: AI-suggested financial goals based on spending

### Family Room Features
- 👨‍👩‍👧‍👦 **Family Collaboration**: Create and manage family financial groups
- 🔐 **Role-Based Access**: Admin and member roles with different permissions
- 💰 **Family Budgets**: Shared budgets tracked across all family members
- 🎯 **Family Goals**: Collaborative savings goals with individual contributions
- 📊 **Contribution Tracking**: Visual charts showing member contributions to family goals
- 🔄 **Real-Time Sync**: WebSocket updates for instant family data synchronization
- 📱 **Transaction Sharing**: Optional sharing of personal transactions with family

### SMS Notifications (Twilio)
- 📱 **Budget Alerts**: SMS when budget reaches 80% or exceeds limit
- 🎯 **Goal Milestones**: SMS notifications at 50%, 75%, and 100% goal completion
- 🔔 **Real-Time Notifications**: Instant alerts for important financial events
- 🌍 **International Support**: Auto-formats phone numbers (Indian +91 default)
- ⚙️ **Optional**: Users can enable/disable SMS notifications in settings

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Socket.IO Client** for real-time updates
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** with MongoDB
- **JWT** for authentication
- **Socket.IO** for WebSockets
- **Twilio SDK** for SMS notifications
- **Google Gemini AI** for insights

### Database
- **MongoDB** (Atlas or local)
- **Prisma** as ORM layer

### Additional Services
- **Twilio** for SMS alerts
- **Google Gemini API** for AI insights

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (Atlas account or local installation)
- Google Gemini API key (for AI insights)
- Twilio account (optional, for SMS alerts)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd financial-management-project
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Set up environment variables**

Create `backend/.env`:
```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# JWT
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"
AI_INSIGHTS_ENABLED="true"

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number_with_country_code"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

4. **Generate Prisma Client**
```bash
cd backend
npx prisma generate
```

5. **Start the application**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 💡 Core Features

### 1. User Authentication
- Secure registration with email and password
- Phone number collection (required)
- Mandatory Terms & Conditions acceptance
- Privacy policy for phone number usage
- JWT-based authentication
- Password hashing with bcrypt

### 2. Dashboard
- Real-time financial overview
- Income vs Expenses visualization
- Budget progress tracking
- Goal completion status
- AI-powered insights and recommendations
- Recent transactions list

### 3. Transactions
- Add income/expense transactions
- Edit transaction categories
- Filter by type, category, date range
- Search functionality
- Bulk operations
- CSV/JSON export with detailed data

### 4. Budgets
- Create category-based budgets
- Real-time spending tracking
- Visual progress indicators
- Alert notifications at 80% and 100%
- Monthly/weekly budget periods
- Budget vs actual comparison

### 5. Goals
- Personal and family goals
- Contribution tracking
- Progress visualization
- Deadline management
- Milestone notifications (50%, 75%, 100%)
- Goal completion celebrations

### 6. Settings
- Profile management (name, email, phone)
- Password change
- SMS notification preferences
- Data export (JSON/CSV)
- Account deletion
- Privacy controls

---

## 👨‍👩‍👧‍👦 Family Room

### Overview
The Family Room feature enables collaborative financial management for families, allowing members to share budgets, goals, and optionally transactions.

### Key Features

#### Family Management
- **Create Family**: Set up a new family group
- **Invite Members**: Send email invitations to family members
- **Role Management**: Admin vs Member permissions
- **Member Removal**: Admins can remove members

#### Family Budgets
- **Shared Budgets**: Create budgets tracked across all family members
- **Automatic Tracking**: Aggregates spending from all members' transactions
- **Category-Based**: Organize by spending categories
- **Real-Time Updates**: WebSocket sync across all family members

#### Family Goals
- **Collaborative Savings**: Create shared financial goals
- **Individual Contributions**: Track who contributed how much
- **Contribution Chart**: Visual representation of member contributions
- **Progress Tracking**: Real-time goal completion percentage
- **Milestone Alerts**: Notifications at key milestones

#### Family Dashboard
- **Summary View**: Total income, expenses, and savings rate
- **Member Statistics**: Income and expenses by member
- **Spending by Category**: Category breakdown with member details
- **Goal Contributions Chart**: Multi-line chart showing member contributions across family goals
- **Budget Progress**: Visual budget tracking

#### Privacy Controls
- **Transaction Sharing**: Optional - members can choose to share or hide transactions
- **Granular Permissions**: View-only vs edit access
- **Data Isolation**: Personal data remains private unless explicitly shared

---

## 📱 SMS Alerts (Twilio)

### Setup

1. **Create Twilio Account**
   - Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Get Account SID, Auth Token, and Phone Number

2. **Configure Environment**
   - Add Twilio credentials to `backend/.env`
   - See `.env.example` for reference

3. **Enable in Settings**
   - Users can toggle SMS notifications in Settings tab
   - Phone number required for SMS alerts

### Alert Types

#### Budget Alerts
- **80% Threshold**: Warning when budget is 80% used
- **100% Exceeded**: Alert when budget limit is exceeded
- **Example**: "Budget Alert: Your Food budget is 80% used (₹800.00 of ₹1000.00)"

#### Goal Alerts
- **50% Milestone**: Notification at halfway point
- **75% Milestone**: Notification at three-quarter mark
- **100% Completion**: Celebration message when goal is achieved
- **Example**: "Goal Achieved! 🎉 You've completed your goal 'New Car' with ₹100000.00"

### Features
- **Auto-Formatting**: Converts 10-digit numbers to +91 (Indian format)
- **Error Handling**: Graceful failure if Twilio not configured
- **Optional**: Users can disable SMS in settings
- **Privacy**: Phone numbers used only for alerts, not marketing

### Cost
- **Free Trial**: $15 credit, SMS to verified numbers only
- **Production**: ~₹0.60 per SMS (India)
- **Upgrade Required**: For sending to unverified numbers

---

## 🤖 ML Features

### AI Insights (Google Gemini)
- **Spending Analysis**: AI-powered analysis of spending patterns
- **Personalized Recommendations**: Budget and saving suggestions
- **Trend Detection**: Identify unusual spending or income patterns
- **Goal Suggestions**: AI-recommended financial goals
- **Monthly Reports**: Comprehensive AI-generated financial summaries

### How It Works
1. System aggregates user's financial data (transactions, budgets, goals)
2. Sends structured data to Google Gemini AI
3. AI analyzes patterns and generates insights
4. Insights displayed in Dashboard with actionable recommendations

### Privacy
- Data sent to AI is anonymized
- No personal identifiers included
- AI insights stored locally
- Users can disable AI insights in settings

---

## 🔒 Security

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration and refresh
- Protected API routes

### Data Protection
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Rate limiting

### Privacy
- Granular permission controls
- Optional data sharing
- Phone number privacy policy
- Terms & Conditions acceptance
- Data export and deletion rights

---

## 📁 Project Structure

```
financial-management-project/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── twilioNotificationService.ts  # SMS alerts
│   │   │   ├── AIInsightsService.ts         # Gemini AI
│   │   │   ├── familyGoalService.ts         # Family goals
│   │   │   └── ...
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── .env                 # Environment variables
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Auth.tsx                    # Login/Signup with T&C
│   │   ├── Dashboard.tsx               # Main dashboard
│   │   ├── FamilyRoom.tsx              # Family management
│   │   ├── FamilyDataDashboard.tsx     # Family analytics
│   │   ├── FamilyGoals.tsx             # Family goals
│   │   ├── Settings.tsx                # User settings
│   │   └── ui/
│   │       └── TermsModal.tsx          # T&C modal
│   ├── contexts/
│   │   ├── AuthContext.tsx             # Auth state
│   │   ├── SocketContext.tsx           # WebSocket
│   │   └── CurrencyContext.tsx         # Currency
│   ├── services/
│   │   └── api.ts                      # API client
│   └── App.tsx
├── README.md
└── package.json
```

---

## 🎓 Academic Context

This project was developed for the **EDAI (Emerging Domain in AI)** course at VIT, demonstrating:

- **AI Integration**: Google Gemini for intelligent insights
- **Real-Time Systems**: WebSocket implementation
- **Full-Stack Development**: React + Node.js + MongoDB
- **Third-Party APIs**: Twilio SMS integration
- **Database Design**: Prisma ORM with MongoDB
- **Security Best Practices**: Authentication, authorization, data protection
- **User Experience**: Responsive design, real-time updates, intuitive UI

---

## 📝 License

This project is developed for educational purposes as part of the EDAI course at VIT.

---

## 👥 Contributors

- **Manasi R. Mhatre** - VIT Student

---

## 🙏 Acknowledgments

- VIT EDAI Course Faculty
- Google Gemini AI
- Twilio SMS Platform
- MongoDB Atlas
- Open Source Community
