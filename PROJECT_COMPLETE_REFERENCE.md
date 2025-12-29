# Personal Finance Management System - Complete Project Reference

## 📌 Project Overview

**Name:** Finance SMS Companion / Personal Finance Management System  
**Purpose:** Privacy-first personal finance management with AI-powered insights, SMS transaction parsing, and family collaboration  
**Academic Context:** EDAI (Emerging Domain in AI) course project at VIT  
**Developer:** Manasi R. Mhatre

### Core Problem Solved
- Traditional finance apps require bank account linking (privacy risk)
- Third-party SMS parsing services store sensitive data
- Users lack control over transaction data
- Manual expense tracking is time-consuming

### Solution
- Local SMS parsing on Android device (privacy-first)
- On-device ML for transaction categorization
- Encrypted sync to secure backend
- Web dashboard for analytics and insights
- Zero third-party dependencies for core functionality

---

## 🎯 Key Features

### Personal Finance Management
- Transaction management (add, edit, delete, categorize)
- Budget tracking with real-time progress
- Goal management with contribution history
- Analytics dashboard with comprehensive charts
- Smart alerts for budgets and goals
- Data export (CSV/JSON)
- Terms & Conditions with privacy policy

### AI-Powered Features
- Google Gemini AI for intelligent financial insights
- Spending pattern analysis
- Smart budgeting suggestions
- Trend detection and anomaly identification
- Goal recommendations based on spending
- Monthly financial reports

### Machine Learning Models
1. **Transaction Categorizer** (On-Device)
   - TensorFlow Lite for instant categorization
   - Random Forest classifier
   - <100ms categorization time
   - 95%+ accuracy
   - Trained on user's transaction history

2. **Expense Forecaster** (Cloud)
   - Facebook Prophet for time-series forecasting
   - Predicts future expenses by category
   - Monthly/weekly predictions
   - Helps with proactive budget planning

### Family Room Features
- Create and manage family financial groups
- Role-based access (Admin, Member)
- Shared family budgets tracked across all members
- Collaborative savings goals with individual contribution tracking
- Real-time WebSocket synchronization
- Optional transaction sharing with privacy controls
- Family dashboard with member statistics

### SMS Notifications (Twilio)
- Budget alerts at 80% and 100% thresholds
- Goal milestone notifications (50%, 75%, 100%)
- Real-time financial event alerts
- International phone number support
- Optional user preference controls

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────┐
│  Android App    │ ← Local SMS parsing + On-device ML (TensorFlow Lite)
└────────┬────────┘
         │ (Encrypted HTTPS + JWT)
         ↓
┌─────────────────┐
│   REST API      │ ← Express.js + Authentication
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│Database │ │ML Service│ ← Prophet forecasting + Model training
│MongoDB  │ │Python    │
└────┬────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           ↓
    ┌─────────────┐
    │Web Dashboard│ ← React + TypeScript
    └─────────────┘
```

### Data Flow
1. SMS Reception → Bank SMS received on Android
2. Local Parsing → Extract transaction details (amount, merchant, type)
3. On-Device ML → Categorize using TensorFlow Lite
4. Encryption → AES-256 encryption
5. Secure Sync → Upload via HTTPS + JWT
6. Storage → MongoDB database
7. ML Analytics → Generate forecasts using Prophet
8. Visualization → Display on web dashboard

---

## 💻 Technology Stack

### Frontend (Web Dashboard)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Real-time:** Socket.IO Client
- **Build Tool:** Vite

### Backend (API Server)
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** Bcrypt
- **Real-time:** Socket.IO
- **SMS Service:** Twilio SDK
- **AI Service:** Google Gemini API
- **Security:** Helmet, CORS, Rate Limiting

### Mobile (Android App)
- **Framework:** React Native with Expo
- **ML:** TensorFlow Lite (on-device inference)
- **Local Storage:** SQLite
- **Network:** Axios
- **SMS Parsing:** Native Android SMS Reader

### ML Service (Python)
- **Framework:** Flask/FastAPI
- **Forecasting:** Facebook Prophet
- **Classification:** Scikit-learn (Random Forest)
- **Data Processing:** Pandas, NumPy
- **Model Storage:** Joblib

### Database
- **Primary:** MongoDB (Atlas or local)
- **ORM:** Prisma Client
- **Cache:** Redis (sessions, temporary data)
- **Mobile:** SQLite (local cache)

### DevOps & Security
- **Containerization:** Docker
- **Encryption:** HTTPS/TLS, AES-256
- **Version Control:** Git + GitHub
- **Logging:** Winston

---

## 📊 Database Schema (Prisma)

### Core Models

**User**
- id, email, password, name, phone
- smsSetupComplete, createdAt, updatedAt
- Relations: transactions, budgets, goals, alerts, families

**Transaction**
- id, userId, date, description, amount
- category, type (INCOME/EXPENSE), source
- Relations: user

**Budget**
- id, userId, familyId, category, limit, spent
- period (WEEKLY/MONTHLY/YEARLY)
- Relations: user, family

**Goal**
- id, userId, familyId, title, target, current
- deadline, category
- Relations: user, family, contributions

**Family**
- id, name, roomCode, creatorId, isActive
- Relations: creator, members, budgets, goals

**FamilyMember**
- id, familyId, userId, role, permissions
- status (PENDING/ACCEPTED/REJECTED)
- isSharingTransactions

**GoalContribution**
- id, goalId, userId, amount, date
- Relations: goal, user

**Alert**
- id, userId, type, title, message, read
- Relations: user

---

## 🚀 Unique Selling Points (USPs)

### 1. Privacy-First Architecture
- SMS data never leaves device unencrypted
- Local parsing using on-device algorithms
- No third-party SMS access (no Plaid, Yodlee)
- End-to-end AES-256 encryption
- User has complete control over data

### 2. Hybrid Intelligence System
- On-Device ML: TensorFlow Lite for instant categorization
- Cloud ML: Prophet for advanced forecasting
- Best of both worlds: Privacy + Powerful Analytics
- Reduces server costs (processing on device)

### 3. Zero External Dependencies
- No bank API integrations required
- No third-party SMS parsing services
- Self-contained ecosystem
- Works offline for local parsing

### 4. Multi-Platform Ecosystem
- Android app for data capture
- Web dashboard for analytics
- Unified user experience
- Future: iOS, browser extensions

### 5. Family Collaboration
- Shared budgets and goals
- Granular privacy controls
- Real-time synchronization
- Role-based permissions

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with token expiration
- Bcrypt password hashing (10 rounds)
- Protected API routes with middleware
- Role-based access control for family features

### Data Protection
- Input validation and sanitization (Joi)
- SQL/NoSQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Rate limiting (1000 requests/minute)
- AES-256 encryption for sensitive data

### Privacy Controls
- Granular permission management
- Optional transaction sharing in families
- Phone number privacy policy
- Mandatory Terms & Conditions acceptance
- Data export and deletion rights

---

## 📱 ML Model Details

### Transaction Categorizer
**Algorithm:** Random Forest Classifier  
**Training Data:** User's historical transactions (min 50)  
**Features:** Transaction description, amount, merchant patterns  
**Output:** Category prediction with confidence score  
**Deployment:** TensorFlow Lite on Android device  
**Performance:** <100ms inference time, 95%+ accuracy  
**Storage:** .tflite model file on device

### Expense Forecaster
**Algorithm:** Facebook Prophet  
**Training Data:** User's transaction history by category  
**Features:** Time-series data (date, amount, category)  
**Output:** Future expense predictions (7/30/90 days)  
**Deployment:** Python ML service (cloud)  
**Performance:** Trained per user, per category  
**Storage:** .joblib model files on server

### Continuous Learning
- Automatic model retraining when new data available
- Minimum 20 new transactions triggers retrain
- Retrain interval: 7 days
- Daily scheduled checks at 2 AM
- Training history tracked in database

---

## 🎬 Project Structure

```
Personal-Finance-Assistance/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── twilioNotificationService.ts
│   │   │   ├── AIInsightsService.ts
│   │   │   ├── familyGoalService.ts
│   │   │   └── mlService.ts
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helper functions
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── .env                   # Environment variables
│
├── ml-service/                # Python ML service
│   ├── main.py               # FastAPI server
│   ├── initial_model_training.py
│   ├── continuous_learning.py
│   ├── services/
│   │   ├── categorizer_service.py
│   │   ├── forecaster_service.py
│   │   └── training_service.py
│   ├── models/               # Trained model files
│   └── requirements.txt
│
├── finance-sms-companion/    # React Native Android app
│   ├── App.js               # Main app component
│   ├── android/             # Native Android code
│   │   └── app/src/main/java/
│   │       ├── SMSReceiver.java
│   │       └── SMSForwardService.java
│   └── plugins/             # Expo config plugins
│
├── src/                      # React web dashboard
│   ├── components/
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FamilyRoom.tsx
│   │   ├── FamilyDataDashboard.tsx
│   │   ├── Settings.tsx
│   │   └── ui/
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── SocketContext.tsx
│   │   └── CurrencyContext.tsx
│   └── services/
│       └── api.ts
│
└── diagrams/                 # Documentation & visuals
    ├── HACKATHON_PITCH.md
    ├── system-architecture.html
    ├── data-flow.html
    ├── tech-stack.html
    └── mobile-screens/
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (Atlas or local)
- Google Gemini API key
- Twilio account (optional, for SMS)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npm run dev
```

### ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Android App Setup
```bash
cd finance-sms-companion
npm install
npx expo start
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=mongodb://...
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**ML Service (.env)**
```
MONGODB_URI=mongodb://...
MIN_TRANSACTIONS_FOR_TRAINING=50
MIN_NEW_TRANSACTIONS_FOR_RETRAIN=20
RETRAIN_INTERVAL_DAYS=7
```

---

## 📊 API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Transactions
- GET `/api/transactions` - Get all transactions
- POST `/api/transactions` - Create transaction
- PUT `/api/transactions/:id` - Update transaction
- DELETE `/api/transactions/:id` - Delete transaction

### Budgets
- GET `/api/budgets` - Get all budgets
- POST `/api/budgets` - Create budget
- PUT `/api/budgets/:id` - Update budget
- DELETE `/api/budgets/:id` - Delete budget

### Goals
- GET `/api/goals` - Get all goals
- POST `/api/goals` - Create goal
- POST `/api/goals/:id/contribute` - Add contribution
- PUT `/api/goals/:id` - Update goal
- DELETE `/api/goals/:id` - Delete goal

### Family
- POST `/api/family/create` - Create family
- POST `/api/family/join` - Join family
- GET `/api/family/data` - Get family data
- POST `/api/family/budgets` - Create family budget
- POST `/api/family/goals` - Create family goal

### ML Service
- POST `/api/ml/categorize/train` - Train categorizer
- POST `/api/ml/categorize/predict` - Predict category
- POST `/api/ml/forecast/train` - Train forecaster
- POST `/api/ml/forecast/predict` - Get forecast
- GET `/api/ml/models/status/:userId` - Model status

### AI Insights
- GET `/api/ai/insights` - Get AI insights
- POST `/api/ai/analyze` - Analyze spending

---

## 🎯 Key Metrics & Performance

### Technical Metrics
- 95%+ SMS parsing accuracy
- <100ms on-device categorization
- <2s sync time for 100 transactions
- 99.9% uptime target

### ML Model Performance
- Categorizer: 92-95% accuracy
- Forecaster: Trained per user, per category
- Minimum 50 transactions for training
- Retraining every 7 days with 20+ new transactions

### Security
- AES-256 encryption
- JWT token expiration: 7 days
- Rate limiting: 1000 requests/minute
- Bcrypt rounds: 10

---

## 🏆 Competitive Advantages

| Feature | Our App | Mint | YNAB | Plaid |
|---------|---------|------|------|-------|
| Privacy-First | ✅ Local | ❌ Cloud | ❌ Cloud | ❌ Cloud |
| No Bank Linking | ✅ SMS | ❌ Required | ❌ Required | ❌ Required |
| On-Device ML | ✅ TFLite | ❌ | ❌ | ❌ |
| Offline Parsing | ✅ Works | ❌ | ❌ | ❌ |
| Family Rooms | ✅ Full | ⚠️ Limited | ❌ | ❌ |
| Open Source | ✅ Potential | ❌ | ❌ | ❌ |

---

## 🎓 Innovation Highlights

### Technical Innovation (9/10)
- Novel local-first architecture in fintech
- Hybrid edge + cloud ML approach
- Privacy-preserving on-device inference
- Zero-dependency SMS parsing

### Complexity (8/10)
- Multi-platform (Android + Web)
- Full-stack (Frontend + Backend + ML)
- Dual ML models (on-device + cloud)
- Real-time WebSocket synchronization

### Scalability (9/10)
- Microservices architecture
- Docker containerization
- Horizontal scaling ready
- Database optimization (MongoDB + Redis)

### User Impact (10/10)
- Addresses real privacy concerns
- Automatic transaction tracking
- Predictive financial insights
- User owns and controls data

### Market Potential (9/10)
- TAM: 1B+ smartphone users
- Growing privacy awareness
- Freemium monetization model
- Unique privacy-first differentiation

---

## 📈 Future Roadmap

### Phase 1: MVP (Current)
- ✅ Web dashboard with analytics
- ✅ Backend API with authentication
- ✅ ML service for forecasting
- ✅ Transaction categorization
- 🔄 Android app (In Progress)

### Phase 2: Enhancement
- Bill payment reminders
- Investment portfolio tracking
- Multi-currency support
- Advanced analytics

### Phase 3: Scale
- iOS app
- Multi-language support
- International bank formats
- API for third-party integrations

### Phase 4: Monetization
- Freemium model
- Premium analytics features
- Family plan subscriptions
- Enterprise version

---

## 💡 Key Talking Points for Pitches

### For Technical Judges
- "TensorFlow Lite achieves <100ms on-device categorization"
- "Hybrid ML: edge computing for privacy + cloud for power"
- "Horizontally scalable microservices architecture"
- "End-to-end encryption with AES-256 and JWT"

### For Business Judges
- "Solves the privacy paradox in fintech"
- "Zero-dependency model reduces costs by 60%"
- "TAM of 1B+ smartphone users in emerging markets"
- "Freemium model with premium analytics"

### For General Audience
- "Your bank SMS never leaves your phone unencrypted"
- "Automatic expense tracking without bank linking"
- "See future expense predictions to plan better"
- "You own your data—delete anytime, export anywhere"

---

## 🏅 Award Categories

### Best Fit Categories
- Best Privacy/Security Solution
- Best Use of Machine Learning
- Most Innovative Fintech Solution
- Best Mobile Application
- People's Choice Award

### Judging Criteria Alignment
- ✅ Innovation: Local-first ML in fintech
- ✅ Technical Excellence: Multi-platform, full-stack
- ✅ User Impact: Solves real privacy concerns
- ✅ Scalability: Microservices, containerized
- ✅ Presentation: Professional diagrams, clear demo

---

## 📚 Important Files & Documentation

### Documentation
- `README.md` - Main project documentation
- `diagrams/HACKATHON_PITCH.md` - Pitch document
- `ml-service/ML_TRAINING_GUIDE.md` - ML training guide
- `backend/README.md` - Backend API documentation

### Diagrams
- `diagrams/system-architecture.html` - System architecture
- `diagrams/data-flow.html` - Data flow diagram
- `diagrams/tech-stack.html` - Technology stack
- `diagrams/mobile-screens/` - Mobile UI screenshots

### Configuration
- `backend/.env` - Backend environment variables
- `ml-service/.env` - ML service configuration
- `backend/prisma/schema.prisma` - Database schema

---

## 🎯 Success Metrics

### User Metrics (Target)
- 1000+ beta users in first month
- 4.5+ star rating on Play Store
- 80%+ user retention after 30 days
- 50%+ daily active users

### Business Metrics
- $0 third-party API costs
- <$50/month hosting costs (MVP)
- 10%+ conversion to premium
- Seed funding potential: $500K+

---

## 🔧 Troubleshooting & Common Issues

### ML Training Issues
- Ensure minimum 50 transactions per user
- Check MongoDB connection
- Verify Python dependencies installed
- Review `continuous_learning.log`

### Android App Issues
- SMS permissions must be granted
- Check network connectivity
- Verify backend API URL in .env
- Test with actual bank SMS

### Backend Issues
- Verify MongoDB connection string
- Check JWT_SECRET is set
- Ensure all environment variables configured
- Review Winston logs

---

## 📞 Contact & Support

**Developer:** Manasi R. Mhatre  
**Institution:** VIT  
**Course:** EDAI (Emerging Domain in AI)  
**Project Type:** Academic + Hackathon

---

**Built with ❤️ for Privacy-Conscious Users**

*Finance SMS Companion - Your Money, Your Privacy, Your Control*
