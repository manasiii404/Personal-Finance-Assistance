# Personal Finance Management System with AI & Family Collaboration

> A comprehensive full-stack personal finance management application with AI-powered insights, SMS transaction parsing, family room collaboration, and real-time financial monitoring.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Core Features](#core-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [ML Features](#ml-features)
- [Family Room](#family-room)
- [SMS Companion App](#sms-companion-app)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This is a production-ready personal finance management system built for the **EDAI (Emerging Domain in AI)** course at VIT. The application combines modern web technologies with machine learning to provide intelligent financial insights, automated transaction categorization, expense forecasting, and collaborative family finance management.

### What Makes This Special?

- **AI-Powered**: Machine learning models for automatic categorization and expense forecasting
- **Family Collaboration**: Multi-user family rooms with granular permission controls
- **SMS Integration**: Android companion app for automatic transaction extraction from bank SMS
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
- ✅ **Data Export**: Export transactions to CSV/JSON

### AI & Machine Learning
- ✅ **Auto-Categorization**: Random Forest ML model (95%+ accuracy)
- ✅ **Expense Forecasting**: Facebook Prophet time-series predictions
- ✅ **Spending Insights**: AI-powered financial recommendations
- ✅ **Pattern Detection**: Seasonal trends and anomaly detection

### Family Room (Multi-User Collaboration)
- ✅ **Multi-Room Support**: Create/join multiple family rooms
- ✅ **Permission System**: VIEW_ONLY or VIEW_EDIT access per member
- ✅ **Transaction Privacy**: Opt-in transaction sharing with confirmation
- ✅ **Shared Budgets & Goals**: Collaborative financial planning
- ✅ **Real-Time Sync**: WebSocket updates for all family members
- ✅ **Admin Controls**: Role-based access (Creator, Admin, Member)
- ✅ **Goal Contributions**: Track individual contributions to shared goals

### SMS Transaction Parsing
- ✅ **Android Companion App**: React Native app for SMS monitoring
- ✅ **Automatic Extraction**: Parse bank SMS for transaction details
- ✅ **QR Code Linking**: Easy device pairing
- ✅ **Multi-Bank Support**: Works with major Indian banks
- ✅ **Background Processing**: Automatic sync when SMS received

---

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling with glassmorphism
- **Recharts** - Beautiful, responsive charts
- **Socket.IO Client** - Real-time WebSocket communication
- **Lucide React** - Modern icon library
- **Context API** - State management

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **MongoDB** - NoSQL database
- **Prisma ORM** - Type-safe database client
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Winston** - Logging
- **Jest** - Testing framework

### ML Service
- **Python 3.8+** - ML runtime
- **FastAPI** - High-performance API framework
- **scikit-learn** - Random Forest classifier
- **Facebook Prophet** - Time-series forecasting
- **pandas** - Data manipulation
- **numpy** - Numerical computing

### SMS Companion App
- **React Native** - Cross-platform mobile development
- **Expo** - Development toolchain
- **Android SMS API** - SMS reading permissions

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                   │
│  - Dashboard  - Transactions  - Budgets  - Goals            │
│  - Family Room  - Analytics  - Settings                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST + WebSocket
┌──────────────────▼──────────────────────────────────────────┐
│              Backend (Node.js + Express + TS)               │
│  - Authentication  - Transaction Service  - Family Service  │
│  - Budget Service  - Goal Service  - Analytics Service      │
└──────┬─────────────────────────┬────────────────────────────┘
       │                         │
       │ HTTP/REST               │ Prisma ORM
       │                         │
┌──────▼──────────┐      ┌──────▼──────────┐
│  ML Service     │      │    MongoDB      │
│  (Python/FastAPI)│      │   (Database)    │
│  - Categorizer  │      │  - Users        │
│  - Forecaster   │      │  - Transactions │
└─────────────────┘      │  - Budgets      │
                         │  - Goals        │
                         │  - Families     │
                         └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          SMS Companion App (React Native/Android)           │
│  - SMS Reading  - QR Linking  - Auto-sync                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+ (local or Atlas)
- **Python** 3.8+ (for ML features)
- **Android Studio** (for SMS companion app)

### Quick Start

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "financial management project"
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# DATABASE_URL="mongodb://localhost:27017/finance_db"
# JWT_SECRET="your-super-secret-jwt-key"
# JWT_EXPIRES_IN="7d"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed

# Start backend server
npm run dev
# Backend runs on http://localhost:3000
```

#### 3. Frontend Setup

```bash
# In project root
npm install

# Set up environment variables
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Start frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. ML Service Setup (Optional)

```bash
cd ml-service

# Install Python dependencies
pip install -r requirements.txt

# Start ML service
python main.py
# ML service runs on http://localhost:8000
```

#### 5. SMS Companion App (Optional)

```bash
cd finance-sms-companion

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on Android
```

### Demo Credentials

```
Email: demo@example.com
Password: demo123
```

---

## 💡 Core Features

### 1. Transaction Management

**Add Transactions**
- Manual entry with category selection
- Automatic categorization via ML (if trained)
- SMS parsing for automatic extraction
- Support for income and expenses

**View & Filter**
- Date range filtering
- Category filtering
- Search by description
- Sort by date/amount

**Edit & Delete**
- Update transaction details
- Change categories
- Soft delete with confirmation

### 2. Budget Management

**Create Budgets**
- Set limits per category
- Choose period: Weekly, Monthly, Yearly
- Track spending automatically

**Budget Monitoring**
- Real-time progress bars
- Alert when approaching limit (80%)
- Alert when limit exceeded
- Visual indicators (green/yellow/red)

### 3. Goal Tracking

**Personal Goals**
- Set target amount and deadline
- Track progress with contributions
- Visual progress indicators
- Completion notifications

**Family Goals** (in Family Room)
- Shared goals with all members
- Individual contribution tracking
- Collaborative progress monitoring

### 4. Analytics Dashboard

**Overview Cards**
- Total income (current month)
- Total expenses (current month)
- Net savings
- Active budgets count

**Charts**
- Spending by category (pie chart)
- Monthly trends (line chart)
- Budget vs actual (bar chart)
- Goal progress (progress bars)

---

## 🤝 Family Room

The Family Room feature enables collaborative financial management for families, roommates, or any group.

### How It Works

#### Creating a Family Room

1. Navigate to **Family Room** page
2. Click **"Create Room"**
3. Enter family name
4. Receive unique 6-character room code
5. Share code with family members

#### Joining a Family Room

1. Navigate to **Family Room** page
2. Click **"Join Room"**
3. Enter room code
4. Select permission level:
   - **VIEW_ONLY**: See family data, cannot edit
   - **VIEW_EDIT**: Full access to add/edit data
5. Wait for creator/admin approval

#### Permission System

**Roles:**
- **Creator**: Full control, can delete family
- **Admin**: Can accept/reject members, manage data
- **Member**: Access based on chosen permission

**Permissions:**
- **VIEW_ONLY**: Read-only access to shared data
- **VIEW_EDIT**: Can add transactions, budgets, goals

**Self-Managed**: Members can change their own permissions anytime

#### Transaction Privacy

**Default**: Transactions are private (hidden from family)

**Opt-In Sharing:**
1. Go to Family Room → Transactions tab
2. Click **"Share My Transactions"**
3. Confirm in modal dialog
4. Your transactions now visible to family

**Opt-Out:**
1. Click **"Hide My Transactions"**
2. Confirm
3. Transactions hidden again

**Benefits:**
- Full control over data sharing
- Explicit consent required
- Can toggle anytime
- Clear visual indicators

#### Shared Data

**Family Summary:**
- Combined income from all members
- Combined expenses
- Net family savings
- Shared goal progress

**Transactions:**
- Per-member transaction lists
- Only from members who opted to share
- Last 50 transactions per member
- Member selector tabs

**Budgets & Goals:**
- Family-wide budgets
- Shared goals with individual contributions
- Progress tracking per member

#### Real-Time Updates

**WebSocket Integration:**
- Instant updates when members join/leave
- Live transaction additions
- Real-time permission changes
- Budget/goal updates

**Events:**
- `family:member-joined`
- `family:member-left`
- `family:transaction-added`
- `family:permission-changed`

---

## 🤖 ML Features

### 1. Smart Transaction Categorization

**How It Works:**
- Trains Random Forest model on your transaction history
- Uses TF-IDF text analysis of descriptions
- Considers time-based features (day, month, hour)
- Achieves 95%+ accuracy after sufficient training

**Usage:**
```bash
# Train the model (requires 50+ transactions)
POST /api/ml/train/categorizer
Authorization: Bearer <token>

# Automatic categorization when creating transactions
POST /api/transactions
{
  "description": "Grocery shopping at Walmart",
  "amount": -45.50,
  "date": "2024-12-05",
  "type": "expense"
  // Category automatically predicted as "Food"
}
```

**Training Requirements:**
- Minimum: 50 transactions
- Optimal: 200+ transactions
- Retraining: Recommended monthly

### 2. Expense Forecasting

**How It Works:**
- Uses Facebook Prophet time-series model
- Detects seasonal patterns (holidays, weekends)
- Provides confidence intervals
- Category-wise predictions

**Usage:**
```bash
# Train forecasting model
POST /api/ml/train/forecaster
Authorization: Bearer <token>

# Get next month forecast
GET /api/ml/forecast/next-month
Authorization: Bearer <token>

# Response:
{
  "total_predicted_expense": 2450.50,
  "categories": {
    "Food": { "monthly_total": 850.00 },
    "Transportation": { "monthly_total": 400.00 }
  },
  "insights": [
    "Your highest predicted expense is Food at $850.00"
  ]
}
```

**Training Requirements:**
- Minimum: 30 days of transaction data
- Optimal: 90+ days
- Forecast range: Up to 90 days ahead

### 3. Training Models

**PowerShell Script (Windows):**
```powershell
# Train all models at once
.\train_models.ps1
```

**Manual Training:**
```bash
# Train both models
POST /api/ml/train/all
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "data": {
    "categorizer": {
      "accuracy": 0.92,
      "num_transactions": 150
    },
    "forecaster": {
      "categories_trained": 8
    }
  }
}
```

---

## 📱 SMS Companion App

### Overview

Android app that automatically extracts transaction data from bank SMS notifications.

### Features

- **Automatic SMS Reading**: Monitors incoming SMS
- **Bank Pattern Recognition**: Supports major Indian banks
- **QR Code Linking**: Easy device pairing with web app
- **Background Sync**: Automatic transaction upload
- **Privacy-Focused**: SMS data never leaves your device

### Setup

#### 1. Install the App

```bash
cd finance-sms-companion
npm install
npx expo start
# Scan QR code with Expo Go on Android
```

#### 2. Link Device

1. Open web app → Settings → SMS Setup
2. Scan QR code with companion app
3. Grant SMS permissions on Android
4. Device linked successfully

#### 3. Usage

- App runs in background
- Automatically detects bank SMS
- Parses transaction details
- Uploads to your account
- Shows in web app instantly

### Supported SMS Patterns

```
✅ Credit card transactions
✅ Debit card purchases
✅ ATM withdrawals
✅ UPI payments
✅ Net banking transfers
✅ Salary credits
✅ Bill payments
```

### Privacy & Security

- SMS data processed locally on device
- Only transaction details sent to server
- Encrypted communication
- Can revoke access anytime
- No SMS content stored

---

## 🔐 Security

### Authentication

**JWT-Based:**
- Secure token generation
- 7-day expiration (configurable)
- HTTP-only cookies (optional)
- Refresh token support

**Password Security:**
- bcrypt hashing (10 rounds)
- Minimum 6 characters
- Password change with verification

### Authorization

**Role-Based Access Control (RBAC):**
- User-level permissions
- Family role hierarchy
- Resource ownership validation

**Permission Checks:**
- Middleware-based validation
- Route-level protection
- Resource-level authorization

### Data Protection

**Input Validation:**
- Joi schema validation
- Type checking with TypeScript
- SQL injection prevention
- XSS protection

**Rate Limiting:**
- 1000 requests per minute per IP
- Configurable limits
- DDoS protection

**CORS:**
- Whitelist-based origins
- Credential support
- Preflight handling

### WebSocket Security

**JWT Authentication:**
- Token verification on connection
- User identity validation
- Room-based access control

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Coverage:**
- Authentication service
- Transaction service
- Budget service
- Goal service
- Family service

### Frontend Tests

```bash
npm test

# E2E tests
npm run test:e2e
```

### Manual Testing

**Test Accounts:**
```
User 1: demo@example.com / demo123
User 2: t1@g.com / password123
```

**Test Family:**
- Family Name: "Manasi's Fam"
- Members: demo@example.com (Admin), t1@g.com (Admin)
- Has transactions, budgets, and goals

---

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
npm run build
# Outputs to dist/
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/finance_db
JWT_SECRET=your-production-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Cloud Deployment

**Recommended Platforms:**
- **Backend**: Heroku, Railway, Render
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas
- **ML Service**: AWS Lambda, Google Cloud Run

---

## 📊 Database Schema

### Users
```typescript
{
  id: ObjectId
  email: string (unique)
  password: string (hashed)
  name: string?
  smsSetupComplete: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Transactions
```typescript
{
  id: ObjectId
  userId: ObjectId
  date: DateTime
  description: string
  amount: number
  category: string
  type: "INCOME" | "EXPENSE"
  source: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Budgets
```typescript
{
  id: ObjectId
  userId: ObjectId
  familyId: ObjectId?
  category: string
  limit: number
  spent: number
  period: "WEEKLY" | "MONTHLY" | "YEARLY"
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Goals
```typescript
{
  id: ObjectId
  userId: ObjectId
  familyId: ObjectId?
  title: string
  target: number
  current: number
  deadline: DateTime
  category: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Families
```typescript
{
  id: ObjectId
  name: string
  roomCode: string (unique, 6 chars)
  creatorId: ObjectId
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### FamilyMembers
```typescript
{
  id: ObjectId
  familyId: ObjectId
  userId: ObjectId
  role: "CREATOR" | "ADMIN" | "MEMBER"
  permissions: "VIEW_ONLY" | "VIEW_EDIT"
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  isSharingTransactions: boolean
  joinedAt: DateTime
  updatedAt: DateTime
}
```

### GoalContributions
```typescript
{
  id: ObjectId
  goalId: ObjectId
  userId: ObjectId
  amount: number
  date: DateTime
  createdAt: DateTime
}
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
PUT    /api/auth/change-password   - Change password
DELETE /api/auth/account           - Delete account
```

### Transaction Endpoints

```
GET    /api/transactions           - Get transactions (with filters)
POST   /api/transactions           - Create transaction
PUT    /api/transactions/:id       - Update transaction
DELETE /api/transactions/:id       - Delete transaction
POST   /api/transactions/parse-sms - Parse SMS text
GET    /api/transactions/export    - Export data (CSV/JSON)
```

### Budget Endpoints

```
GET    /api/budgets                - Get budgets
POST   /api/budgets                - Create budget
PUT    /api/budgets/:id            - Update budget
DELETE /api/budgets/:id            - Delete budget
GET    /api/budgets/stats          - Budget statistics
```

### Goal Endpoints

```
GET    /api/goals                  - Get goals
POST   /api/goals                  - Create goal
PUT    /api/goals/:id              - Update goal
DELETE /api/goals/:id              - Delete goal
POST   /api/goals/:id/contribute   - Add contribution
```

### Family Endpoints

```
POST   /api/family                         - Create family
GET    /api/family                         - Get user's families
POST   /api/family/join                    - Request to join
GET    /api/family/requests                - Get pending requests
POST   /api/family/:id/accept/:memberId    - Accept request
POST   /api/family/:id/reject/:memberId    - Reject request
DELETE /api/family/:id                     - Delete family
POST   /api/family/leave                   - Leave family
PUT    /api/family/my-permissions          - Update own permissions
POST   /api/family/:id/share-transactions  - Toggle transaction sharing
```

### Family Data Endpoints

```
GET    /api/family/:id/summary       - Family financial summary
GET    /api/family/:id/transactions  - Family transactions (per member)
GET    /api/family/:id/budgets       - Family budgets
GET    /api/family/:id/goals         - Family goals
```

### ML Endpoints

```
POST   /api/ml/train/categorizer     - Train categorization model
POST   /api/ml/train/forecaster      - Train forecasting model
POST   /api/ml/train/all             - Train all models
POST   /api/ml/categorize/predict    - Predict category
GET    /api/ml/forecast              - Get expense forecast
GET    /api/ml/forecast/next-month   - Next month forecast
GET    /api/ml/status                - Model training status
```

### Analytics Endpoints

```
GET    /api/analytics/insights          - Financial insights
GET    /api/analytics/spending-analysis - Spending analysis
GET    /api/analytics/monthly-trends    - Monthly trends
GET    /api/analytics/category-breakdown - Category breakdown
```

---

## 🛠 Troubleshooting

### Common Issues

#### Backend Won't Start

**Error: `Cannot connect to MongoDB`**
```bash
# Check MongoDB is running
mongod --version

# Check DATABASE_URL in .env
# For local: mongodb://localhost:27017/finance_db
# For Atlas: mongodb+srv://...
```

**Error: `Prisma Client not generated`**
```bash
cd backend
npm run db:generate
```

#### Frontend Build Errors

**Error: `Module not found`**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: `VITE_API_URL not defined`**
```bash
# Create .env file in project root
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

#### ML Service Issues

**Error: `Python module not found`**
```bash
cd ml-service
pip install --upgrade -r requirements.txt
```

**Error: `Models not training`**
- Ensure you have 50+ transactions
- Check MongoDB connection
- Verify transactions have categories

#### Family Room Issues

**Error: `WebSocket connection failed`**
- Check backend is running
- Verify CORS settings
- Check browser console for errors

**Transactions not showing:**
- Ensure member has VIEW_EDIT permission
- Check if member enabled transaction sharing
- Verify transactions exist in database

### Performance Issues

**Slow Dashboard Loading:**
```bash
# Check database indexes
# Optimize queries
# Enable caching
```

**High Memory Usage:**
```bash
# Limit transaction fetch (currently 50 per member)
# Implement pagination
# Clear old alerts
```

---

## 📁 Project Structure

```
financial-management-project/
├── backend/                      # Node.js backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utility functions
│   │   ├── server.ts            # Express app setup
│   │   └── websocket.ts         # Socket.IO setup
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.js              # Database seeding
│   ├── tests/                   # Jest tests
│   └── package.json
│
├── src/                         # React frontend
│   ├── components/              # React components
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Budgets.tsx
│   │   ├── Goals.tsx
│   │   ├── FamilyRoom.tsx
│   │   ├── FamilyDataDashboard.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── AlertContext.tsx
│   │   ├── CurrencyContext.tsx
│   │   └── SocketContext.tsx
│   ├── services/
│   │   └── api.ts               # API client
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
│
├── ml-service/                  # Python ML service
│   ├── services/
│   │   ├── transaction_categorizer.py
│   │   └── expense_forecaster.py
│   ├── main.py                  # FastAPI app
│   ├── config.py                # ML configuration
│   └── requirements.txt
│
├── finance-sms-companion/       # React Native app
│   ├── App.tsx
│   ├── components/
│   └── package.json
│
├── package.json                 # Frontend dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── README.md                   # This file
```

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Full-Stack Development**: React + Node.js + MongoDB  
✅ **TypeScript**: Type-safe frontend and backend  
✅ **Machine Learning Integration**: Python ML service with REST API  
✅ **Real-Time Communication**: WebSocket with Socket.IO  
✅ **Mobile Development**: React Native companion app  
✅ **Database Design**: MongoDB with Prisma ORM  
✅ **Authentication & Authorization**: JWT + RBAC  
✅ **API Design**: RESTful endpoints with validation  
✅ **State Management**: React Context API  
✅ **Testing**: Jest for backend, React Testing Library  
✅ **Deployment**: Docker, cloud platforms  

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- **Manasi R. Mhatre** - VIT Student (EDAI Course Project)

---

## 🙏 Acknowledgments

- VIT University for the EDAI course
- OpenAI for AI integration guidance
- Facebook Prophet for time-series forecasting
- Socket.IO for real-time communication
- Prisma for excellent ORM

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review the troubleshooting section
3. Check the API documentation
4. Create an issue in the repository

---

**Built with ❤️ for the EDAI course at VIT University**

*Last Updated: December 5, 2024*
