# Quick Start: ML Model Training

## 🎯 Current Status

Your database is **empty** (0 users, 0 transactions). You need to seed data first before training models.

## 📋 Step-by-Step Guide

### Step 1: Seed the Database

```bash
# In backend directory
cd backend
npm run db:seed
```

This creates:
- 2 demo users (demo@example.com, t1@g.com)
- 100+ transactions for each user
- Budgets and goals

### Step 2: Verify Data

```bash
# In ml-service directory
cd ml-service
python verify_database.py
```

Expected output:
```
Users in database: 2
Transactions in database: 200+

User accounts:
  - demo@example.com (ID: xxx, Transactions: 150)
  - t1@g.com (ID: yyy, Transactions: 120)
```

### Step 3: Train Initial Models

```bash
# Still in ml-service directory
python initial_model_training.py --all
```

This will:
- Train categorization models (Random Forest)
- Train forecasting models (Prophet)
- Save models to `models/` directory
- Show accuracy metrics

Expected output:
```
============================================================
TRAINING ML MODELS FOR ALL USERS
============================================================

Found 2 users in database

============================================================
Training models for user: xxx
============================================================
[OK] Found 150 transactions

1. Training Transaction Categorizer...
   [OK] Categorizer trained successfully!
   - Accuracy: 92.00%
   - Transactions used: 150
   - Categories: 8

2. Training Expense Forecaster...
   [OK] Forecaster trained successfully!
   - Categories trained: 8

============================================================
[SUCCESS] All models trained successfully for user xxx
============================================================

...

============================================================
TRAINING SUMMARY
============================================================
[SUCCESS] Successfully trained: 2 users
[WARNING] Insufficient data: 0 users
[ERROR] Failed: 0 users
Total users: 2
============================================================
```

### Step 4: Start Continuous Learning (Optional)

```bash
# Run in background for automatic retraining
python continuous_learning.py
```

This will:
- Run daily at 2:00 AM
- Check all users for new transactions
- Retrain models when 20+ new transactions added
- Log all activities to `continuous_learning.log`

Press `Ctrl+C` to stop.

## 🔧 Configuration

Edit `ml-service/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/finance_db

# Training Thresholds
MIN_TRANSACTIONS_FOR_TRAINING=50        # Initial training minimum
MIN_NEW_TRANSACTIONS_FOR_RETRAIN=20     # Retrain trigger
RETRAIN_INTERVAL_DAYS=7                 # Days between retraining
```

## 📊 Testing the Models

### Test Auto-Categorization

```bash
# In backend, with ML service running
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Grocery shopping at Walmart",
    "amount": -45.50,
    "date": "2024-12-05",
    "type": "expense"
  }'

# Category will be automatically predicted as "Food"
```

### Test Expense Forecasting

```bash
curl -X GET http://localhost:3000/api/ml/forecast/next-month \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns predicted expenses for next month
```

## 🎓 Key Commands

| Command | Purpose |
|---------|---------|
| `python verify_database.py` | Check database status |
| `python initial_model_training.py --all` | Train all users |
| `python initial_model_training.py --user USER_ID` | Train specific user |
| `python continuous_learning.py` | Start auto-retraining service |

## 📝 Files Created

- ✅ `initial_model_training.py` - Manual training script
- ✅ `continuous_learning.py` - Automated retraining service
- ✅ `verify_database.py` - Database checker
- ✅ `ML_TRAINING_GUIDE.md` - Comprehensive documentation
- ✅ `requirements.txt` - Updated with `schedule` library

## 🚀 Next Steps

1. **Seed database**: `cd backend && npm run db:seed`
2. **Verify data**: `cd ml-service && python verify_database.py`
3. **Train models**: `python initial_model_training.py --all`
4. **Test predictions**: Create transactions and see auto-categorization
5. **Enable continuous learning**: `python continuous_learning.py` (optional)

## ❓ Troubleshooting

**Q: "No users found in database"**
- Run `npm run db:seed` in backend directory

**Q: "Insufficient data"**
- Need 50+ transactions per user
- Lower threshold: `--min-transactions 20`

**Q: "Model not trained" error**
- Run initial training first
- Check `models/` directory exists

**Q: "Unicode encoding error"**
- Fixed! Now using ASCII characters only

---

**Ready to train? Start with Step 1!** 🎯
