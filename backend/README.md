# Personal Finance Management Backend API

A comprehensive backend API for personal finance management built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with secure password hashing
- 💰 **Transaction Management** - CRUD operations for income and expenses
- 📊 **Budget Tracking** - Category-based budgets with spending alerts
- 🎯 **Goal Management** - Financial goal setting and progress tracking
- 📱 **SMS Parsing** - Automatic transaction extraction from bank SMS
- 🤖 **AI Insights** - OpenAI-powered financial recommendations
- 📈 **Analytics** - Comprehensive financial analytics and reporting
- 🔔 **Alert System** - Smart notifications for budgets and goals
- 📤 **Data Export** - CSV/JSON export functionality
- 🛡️ **Security** - Rate limiting, input validation, and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **AI**: OpenAI GPT-3.5
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
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

   Update the `.env` file with your configuration:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/personal_finance_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   OPENAI_API_KEY="your-openai-api-key" # Optional
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `DELETE /account` - Delete account

#### Transactions (`/api/transactions`)

- `POST /` - Create transaction
- `GET /` - Get transactions (with filters)
- `GET /:id` - Get transaction by ID
- `PUT /:id` - Update transaction
- `DELETE /:id` - Delete transaction
- `GET /stats/overview` - Get transaction statistics
- `GET /stats/categories` - Get spending by category
- `POST /parse-sms` - Parse SMS transaction
- `POST /create-from-sms` - Create transaction from SMS
- `GET /export/data` - Export transactions
- `GET /sms/patterns` - Get supported SMS patterns

#### Budgets (`/api/budgets`)

- `POST /` - Create budget
- `GET /` - Get budgets
- `GET /:id` - Get budget by ID
- `PUT /:id` - Update budget
- `DELETE /:id` - Delete budget
- `GET /stats/overview` - Get budget statistics
- `POST /reset-spending` - Reset budget spending
- `GET /alerts/list` - Get budget alerts

#### Goals (`/api/goals`)

- `POST /` - Create goal
- `GET /` - Get goals
- `GET /:id` - Get goal by ID
- `PUT /:id` - Update goal
- `DELETE /:id` - Delete goal
- `POST /:id/contribute` - Add contribution to goal
- `GET /stats/overview` - Get goal statistics
- `GET /alerts/list` - Get goal alerts
- `GET /analytics/categories` - Get goals by category

#### Alerts (`/api/alerts`)

- `POST /` - Create alert
- `GET /` - Get alerts
- `GET /:id` - Get alert by ID
- `PUT /:id/read` - Mark alert as read
- `PUT /read-all` - Mark all alerts as read
- `DELETE /:id` - Delete alert
- `DELETE /clear-all` - Clear all alerts
- `GET /stats/unread-count` - Get unread count

#### Analytics (`/api/analytics`)

- `GET /insights` - Get financial insights
- `GET /spending-analysis` - Get spending analysis
- `GET /goal-recommendations` - Get goal recommendations
- `GET /monthly-trends` - Get monthly trends
- `GET /category-breakdown` - Get category breakdown
- `GET /export/report` - Export analytics report

## Database Schema

The database includes the following main entities:

- **Users** - User accounts and authentication
- **Transactions** - Income and expense records
- **Budgets** - Category-based spending limits
- **Goals** - Financial objectives and progress
- **Alerts** - Notifications and warnings
- **Categories** - Predefined transaction categories

## SMS Parsing

The API supports automatic transaction extraction from bank SMS messages. Supported patterns include:

- Account debited by $X.XX for [merchant]
- Credit of $X.XX received from [source]
- ATM withdrawal of $X.XX at [location]
- Payment of $X.XX to [merchant]
- Salary credit of $X.XX
- Purchase at [merchant] for $X.XX

## AI Features

When OpenAI API key is configured, the API provides:

- Intelligent financial insights
- Spending pattern analysis
- Goal achievement recommendations
- Personalized financial advice

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- SMS Parsing: 10 requests per minute
- Export: 3 requests per 5 minutes

## Logging

The API uses Winston for structured logging:

- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

   ```env
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

## Development

```bash
# Start development server with hot reload
npm run dev

# Generate Prisma client
npm run db:generate

# Push database changes
npm run db:push

# Open Prisma Studio
npm run db:studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
