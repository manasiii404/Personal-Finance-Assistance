# Personal Finance Management System

A comprehensive full-stack personal finance management application with AI-powered insights, SMS transaction parsing, and real-time financial monitoring.

## 🚀 Features

### Frontend (React + TypeScript)

- **Modern UI**: Beautiful, responsive interface built with React, TypeScript, and Tailwind CSS
- **Authentication**: Secure user registration, login, and profile management
- **Dashboard**: Real-time financial overview with charts and metrics
- **Transaction Management**: Add, edit, delete, and categorize transactions
- **SMS Parsing**: Automatically extract transaction data from bank SMS notifications
- **Budget Management**: Set and track spending limits by category
- **Goal Tracking**: Create and monitor financial goals with progress tracking
- **Analytics**: Comprehensive financial insights and reporting
- **Alerts System**: Smart notifications for budget limits and goal milestones
- **Settings**: Complete user profile and system configuration

### Backend (Node.js + Express + TypeScript)

- **RESTful API**: Comprehensive API endpoints for all frontend features
- **Authentication**: JWT-based secure authentication system
- **Database**: PostgreSQL with Prisma ORM for robust data management
- **SMS Parsing**: Intelligent transaction extraction from bank SMS
- **AI Integration**: OpenAI-powered financial insights and recommendations
- **Data Validation**: Comprehensive input validation with Zod
- **Error Handling**: Centralized error management and logging
- **Rate Limiting**: API protection and performance optimization
- **Testing**: Unit and integration tests with Jest
- **Docker Support**: Containerized deployment with Docker Compose

## 🛠 Technology Stack

### Frontend

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Context API** - State management

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **Prisma** - Database ORM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **OpenAI API** - AI insights
- **Jest** - Testing framework
- **Docker** - Containerization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Docker (optional)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   PORT=3001
   DATABASE_URL="postgresql://username:password@localhost:5432/finance_db"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Set up database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the backend server**

   ```bash
   npm run dev
   ```

   Backend will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env`:

   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

### Docker Setup (Alternative)

1. **Start both frontend and backend with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 📱 Usage

### Getting Started

1. **Register**: Create a new account or use demo credentials
2. **Login**: Sign in with your credentials
3. **Add Transactions**: Manually add transactions or use SMS parsing
4. **Set Budgets**: Create spending limits for different categories
5. **Create Goals**: Set financial goals and track progress
6. **Monitor**: Use the dashboard to track your financial health

### Demo Credentials

- **Email**: demo@example.com
- **Password**: demo123

### SMS Parsing

The system can automatically parse bank SMS notifications to extract transaction data. Supported patterns include:

- Credit card transactions
- Bank transfers
- ATM withdrawals
- Salary credits
- Bill payments

### AI Insights

Get personalized financial recommendations powered by OpenAI:

- Spending pattern analysis
- Budget optimization suggestions
- Goal achievement strategies
- Financial health insights

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Transactions

- `GET /api/transactions` - Get transactions (with filtering)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/parse-sms` - Parse SMS text
- `GET /api/transactions/export/data` - Export transactions

### Budgets

- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/stats/overview` - Budget statistics

### Goals

- `GET /api/goals` - Get goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/contribute` - Add contribution

### Analytics

- `GET /api/analytics/insights` - Financial insights
- `GET /api/analytics/spending-analysis` - Spending analysis
- `GET /api/analytics/monthly-trends` - Monthly trends
- `GET /api/analytics/category-breakdown` - Category breakdown

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Database Schema

### Users

- id, email, password, name, createdAt, updatedAt

### Transactions

- id, userId, date, description, amount, category, type, source, createdAt

### Budgets

- id, userId, category, limit, spent, period, createdAt, updatedAt

### Goals

- id, userId, title, target, current, deadline, category, createdAt, updatedAt

### Alerts

- id, userId, type, title, message, read, createdAt

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive validation with Zod
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Cross-origin request security
- **Data Encryption**: Sensitive data encryption at rest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Bank account integration
- [ ] Investment tracking
- [ ] Tax reporting
- [ ] Multi-currency support
- [ ] Family/shared accounts
- [ ] Advanced analytics and reporting

---

**Built with ❤️ using modern web technologies**
