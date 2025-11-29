# 🚀 Quick Start - ML Features

## Installation (One-time)

```bash
# 1. Install Python dependencies
cd ml-service
pip install -r requirements.txt

# 2. Create .env file
cp .env.example .env
```

## Running the Services

```bash
# Terminal 1: ML Service
cd ml-service
python main.py
# ✓ Running on http://localhost:8000

# Terminal 2: Backend
cd backend
npm run dev
# ✓ Running on http://localhost:3000

# Terminal 3: Frontend
npm run dev
# ✓ Running on http://localhost:5173
```

## First-Time Setup

```bash
# After adding 50+ transactions, train models:
curl -X POST http://localhost:3000/api/ml/train/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Test the Features

### 1. Test Auto-Categorization
```bash
# Create transaction without category
POST /api/transactions
{
  "description": "Coffee at Starbucks",
  "amount": -5.50,
  "date": "2024-11-29",
  "type": "expense",
  "source": "manual"
}
# ✓ Category automatically predicted!
```

### 2. Test Forecasting
```bash
# Get next month forecast
GET /api/ml/forecast/next-month
# ✓ Returns predicted expenses by category
```

## File Structure

```
Personal-Finance-Assistance/
├── ml-service/              # Python ML Service
│   ├── main.py             # Start here
│   ├── requirements.txt    # Dependencies
│   └── services/           # ML models
│
├── backend/src/
│   ├── services/mlService.ts      # ML integration
│   ├── controllers/mlController.ts # ML endpoints
│   └── routes/ml.ts               # ML routes
│
└── ML_IMPLEMENTATION_GUIDE.md  # Full documentation
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ml/train/all` | POST | Train both models |
| `/api/ml/categorize/predict` | POST | Predict category |
| `/api/ml/forecast/next-month` | GET | Get forecast |
| `/api/ml/status` | GET | Check model status |

## Requirements

- ✅ Python 3.8+
- ✅ Node.js 18+
- ✅ MongoDB running
- ✅ 50+ transactions for training

## Troubleshooting

**ML Service won't start?**
```bash
python --version  # Check Python 3.8+
pip install -r requirements.txt
```

**Models not training?**
- Need 50+ transactions minimum
- Check MongoDB connection
- Verify transactions have categories

## What's Next?

1. ✅ Install & start services
2. ✅ Train models
3. ✅ Test auto-categorization
4. ✅ Test forecasting
5. 🎨 Add UI components (optional)

---

**Full docs**: `ML_IMPLEMENTATION_GUIDE.md`  
**Summary**: `ML_FEATURES_COMPLETE.md`
