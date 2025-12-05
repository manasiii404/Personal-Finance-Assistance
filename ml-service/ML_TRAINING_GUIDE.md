# ML Model Training & Continuous Learning Guide

## 🎯 Overview

This guide explains how to:
1. **Train initial ML models** for the first time
2. **Set up continuous learning** for automatic model improvements
3. **Monitor and manage** model performance

---

## 📦 Prerequisites

### 1. Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create `.env` file in `ml-service/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/finance_db

# Training Configuration
MIN_TRANSACTIONS_FOR_TRAINING=50
MIN_NEW_TRANSACTIONS_FOR_RETRAIN=20
RETRAIN_INTERVAL_DAYS=7
```

### 3. Ensure ML Service is Running

```bash
# In ml-service directory
python main.py
# Service runs on http://localhost:8000
```

---

## 🚀 Initial Model Training

### Option 1: Train All Users (Recommended)

```bash
cd ml-service
python initial_model_training.py --all
```

**What it does:**
- Scans all users in database
- Trains models for users with 50+ transactions
- Shows detailed progress and results
- Skips users with insufficient data

**Output:**
```
============================================================
TRAINING ML MODELS FOR ALL USERS
============================================================

Found 5 users in database

============================================================
Training models for user: 674f1234567890abcdef1234
============================================================
✓ Found 150 transactions

1. Training Transaction Categorizer...
   ✓ Categorizer trained successfully!
   - Accuracy: 92.00%
   - Transactions used: 150
   - Categories: 8

2. Training Expense Forecaster...
   ✓ Forecaster trained successfully!
   - Categories trained: 8

============================================================
✅ All models trained successfully for user 674f1234567890abcdef1234
============================================================

...

============================================================
TRAINING SUMMARY
============================================================
✅ Successfully trained: 3 users
⚠️  Insufficient data: 2 users
✗ Failed: 0 users
Total users: 5
============================================================
```

### Option 2: Train Specific User

```bash
python initial_model_training.py --user YOUR_USER_ID
```

### Option 3: Interactive Mode

```bash
python initial_model_training.py
```

Then choose from menu:
1. Train models for specific user
2. Train models for all users
3. Exit

### Option 4: Custom Minimum Transactions

```bash
# Require 100 transactions instead of default 50
python initial_model_training.py --all --min-transactions 100
```

---

## 🔄 Continuous Learning Setup

### What is Continuous Learning?

The continuous learning service automatically:
- ✅ Monitors all users for new transactions
- ✅ Retrains models when sufficient new data is available
- ✅ Runs daily checks (scheduled at 2 AM)
- ✅ Logs all training activities
- ✅ Improves model accuracy over time

### How It Works

1. **Daily Check**: Every day at 2:00 AM, the service checks all users
2. **Eligibility Check**: For each user, it determines if retraining is needed:
   - **Never trained**: Trains if user has 50+ transactions
   - **Previously trained**: Retrains if:
     - At least 7 days since last training AND
     - At least 20 new transactions added
3. **Automatic Training**: Trains both categorizer and forecaster
4. **History Tracking**: Saves training records to database

### Configuration

Edit `.env` file to customize:

```env
# Minimum transactions required for initial training
MIN_TRANSACTIONS_FOR_TRAINING=50

# Minimum new transactions to trigger retraining
MIN_NEW_TRANSACTIONS_FOR_RETRAIN=20

# Days to wait between retraining
RETRAIN_INTERVAL_DAYS=7
```

**Recommended Settings:**

| User Activity | MIN_TRANSACTIONS | MIN_NEW_TRANSACTIONS | RETRAIN_INTERVAL_DAYS |
|---------------|------------------|----------------------|-----------------------|
| Low (< 10/month) | 50 | 30 | 30 |
| Medium (10-50/month) | 50 | 20 | 14 |
| High (> 50/month) | 50 | 20 | 7 |

### Running Continuous Learning

#### Option 1: Foreground (for testing)

```bash
cd ml-service
python continuous_learning.py
```

**Output:**
```
2024-12-05 23:00:00 - __main__ - INFO - Continuous Learning Service initialized
2024-12-05 23:00:00 - __main__ - INFO - Starting Continuous Learning Service
2024-12-05 23:00:00 - __main__ - INFO - Configuration:
2024-12-05 23:00:00 - __main__ - INFO -   - Minimum transactions: 50
2024-12-05 23:00:00 - __main__ - INFO -   - Minimum new transactions for retrain: 20
2024-12-05 23:00:00 - __main__ - INFO -   - Retrain interval: 7 days
2024-12-05 23:00:00 - __main__ - INFO -   - Check schedule: Daily at 02:00 AM
2024-12-05 23:00:00 - __main__ - INFO - Running initial training check...
2024-12-05 23:00:00 - __main__ - INFO - ============================================================
2024-12-05 23:00:00 - __main__ - INFO - Starting periodic model training check
2024-12-05 23:00:00 - __main__ - INFO - ============================================================
2024-12-05 23:00:00 - __main__ - INFO - Found 5 users
2024-12-05 23:00:01 - __main__ - INFO - Training user 674f1234... (Reason: periodic_retrain)
2024-12-05 23:00:01 - __main__ - INFO - Starting training for user 674f1234...
2024-12-05 23:00:02 - __main__ - INFO - Training categorizer for user 674f1234...
2024-12-05 23:00:05 - __main__ - INFO - Categorizer trained: Accuracy=94.00%
2024-12-05 23:00:05 - __main__ - INFO - Training forecaster for user 674f1234...
2024-12-05 23:00:08 - __main__ - INFO - Forecaster trained: 8 categories
2024-12-05 23:00:08 - __main__ - INFO - ✅ Successfully trained models for user 674f1234
2024-12-05 23:00:08 - __main__ - INFO - ============================================================
2024-12-05 23:00:08 - __main__ - INFO - Training cycle complete: 1 trained, 4 skipped
2024-12-05 23:00:08 - __main__ - INFO - ============================================================
2024-12-05 23:00:08 - __main__ - INFO - Service running. Press Ctrl+C to stop.
```

#### Option 2: Background (production)

**Windows (PowerShell):**
```powershell
# Start in background
Start-Process python -ArgumentList "continuous_learning.py" -WorkingDirectory "ml-service" -WindowStyle Hidden

# Or use Windows Task Scheduler for automatic startup
```

**Linux/Mac:**
```bash
# Using nohup
nohup python continuous_learning.py > continuous_learning.log 2>&1 &

# Or using systemd service (recommended)
# Create /etc/systemd/system/ml-continuous-learning.service
```

**Docker (recommended for production):**
```dockerfile
# Add to docker-compose.yml
ml-continuous-learning:
  build: ./ml-service
  command: python continuous_learning.py
  environment:
    - MONGODB_URI=mongodb://mongo:27017/finance_db
  depends_on:
    - mongo
  restart: always
```

---

## 📊 Monitoring

### Check Training Logs

```bash
# View continuous learning logs
tail -f ml-service/continuous_learning.log
```

### Query Training History

```javascript
// In MongoDB shell or Compass
db.model_training_history.find().sort({ trainedAt: -1 }).limit(10)

// Example output:
{
  "_id": ObjectId("..."),
  "userId": "674f1234567890abcdef1234",
  "modelType": "categorizer",
  "trainedAt": ISODate("2024-12-05T17:30:00Z"),
  "metrics": {
    "accuracy": 0.94,
    "num_transactions": 150,
    "categories": ["Food", "Transport", ...]
  }
}
```

### Check Model Status via API

```bash
# Get model status for a user
curl http://localhost:8000/models/status/YOUR_USER_ID

# Response:
{
  "success": true,
  "data": {
    "user_id": "674f1234567890abcdef1234",
    "categorizer": {
      "trained": true,
      "categories": ["Food", "Transport", "Entertainment", ...]
    },
    "forecaster": {
      "trained": true,
      "categories": ["Food", "Transport", "Entertainment", ...]
    }
  }
}
```

---

## 🎯 Training Strategies

### Strategy 1: Immediate Training (Recommended)

**When:** After initial setup or when adding demo data

```bash
# 1. Seed database with demo data
cd backend
npm run db:seed

# 2. Train models immediately
cd ../ml-service
python initial_model_training.py --all

# 3. Start continuous learning
python continuous_learning.py
```

### Strategy 2: On-Demand Training

**When:** User requests model training via UI

```bash
# Backend triggers training via API
POST http://localhost:3000/api/ml/train/all
Authorization: Bearer <user-token>
```

### Strategy 3: Scheduled Batch Training

**When:** Large user base, want to control training times

```bash
# Use cron or Task Scheduler
# Daily at 2 AM:
0 2 * * * cd /path/to/ml-service && python initial_model_training.py --all
```

---

## 🔧 Troubleshooting

### Issue: "Insufficient data" for all users

**Solution:**
```bash
# Check transaction count
mongo finance_db --eval "db.transactions.count()"

# If low, seed more data
cd backend
npm run db:seed

# Or lower minimum threshold temporarily
python initial_model_training.py --all --min-transactions 20
```

### Issue: Training fails with "Model not converging"

**Solution:**
- Ensure transactions have diverse categories
- Check for data quality issues
- Increase minimum transaction requirement

### Issue: Continuous learning not running

**Solution:**
```bash
# Check if process is running
ps aux | grep continuous_learning

# Check logs for errors
tail -f ml-service/continuous_learning.log

# Restart service
pkill -f continuous_learning.py
python continuous_learning.py &
```

### Issue: Models not improving

**Solution:**
- Check if users are adding new transactions
- Verify `MIN_NEW_TRANSACTIONS_FOR_RETRAIN` is not too high
- Review training history to see last training date
- Consider reducing `RETRAIN_INTERVAL_DAYS`

---

## 📈 Performance Optimization

### 1. Batch Training

For large user bases (1000+ users):

```python
# Modify continuous_learning.py
# Add batch processing with limits
MAX_USERS_PER_CYCLE = 100

# Process users in batches
for i in range(0, len(users), MAX_USERS_PER_CYCLE):
    batch = users[i:i+MAX_USERS_PER_CYCLE]
    # Train batch...
```

### 2. Parallel Training

```python
# Use multiprocessing for faster training
from multiprocessing import Pool

def train_user_wrapper(user_id):
    return train_user_models(user_id)

with Pool(processes=4) as pool:
    results = pool.map(train_user_wrapper, user_ids)
```

### 3. Model Caching

Models are automatically cached to disk:
- Location: `ml-service/models/`
- Format: `.joblib` files
- Naming: `{user_id}_categorizer.joblib`, `{user_id}_forecaster.joblib`

---

## 🎓 Best Practices

1. **Initial Training**: Always train models after seeding database
2. **Monitor Logs**: Check `continuous_learning.log` regularly
3. **Adjust Thresholds**: Tune based on user activity patterns
4. **Backup Models**: Periodically backup `models/` directory
5. **Version Control**: Track model performance metrics over time
6. **User Feedback**: Allow users to correct predictions to improve accuracy

---

## 📝 Summary

### Quick Start Checklist

- [ ] Install Python dependencies (`pip install -r requirements.txt`)
- [ ] Configure `.env` file
- [ ] Start ML service (`python main.py`)
- [ ] Run initial training (`python initial_model_training.py --all`)
- [ ] Start continuous learning (`python continuous_learning.py`)
- [ ] Monitor logs and verify training

### Key Files

- `initial_model_training.py` - One-time/manual training script
- `continuous_learning.py` - Automated periodic retraining service
- `continuous_learning.log` - Training activity logs
- `models/` - Trained model files (gitignored)
- `requirements.txt` - Python dependencies

---

**Questions? Check the main README.md or create an issue!**
