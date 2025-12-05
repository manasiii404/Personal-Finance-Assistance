# ML Service - Quick Reference

## 📁 Directory Structure

```
ml-service/
├── main.py                      # FastAPI ML service (port 8000)
├── config.py                    # Configuration settings
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
│
├── services/                    # ML model implementations
│   ├── transaction_categorizer.py
│   └── expense_forecaster.py
│
├── models/                      # Trained models (gitignored)
│   ├── categorizer_{user_id}/
│   └── forecaster_{user_id}/
│
├── initial_model_training.py   # Manual training script
├── find_and_train.py           # Smart training (finds users with data)
├── continuous_learning.py      # Automated periodic retraining
│
└── Documentation/
    ├── README.md               # Service overview
    ├── ML_TRAINING_GUIDE.md    # Comprehensive training guide
    ├── QUICK_START_ML.md       # Quick start guide
    └── MODEL_STORAGE.md        # Model storage details
```

## 🚀 Quick Commands

### Start ML Service
```bash
cd ml-service
python main.py
# Runs on http://localhost:8000
```

### Train Models (One-Time)
```bash
# Train all users with data
python find_and_train.py

# Train specific user
python initial_model_training.py --user USER_ID

# Train all users (checks all 12 users)
python initial_model_training.py --all
```

### Continuous Learning (Automated)
```bash
# Start automated retraining service
python continuous_learning.py

# Runs daily at 2:00 AM
# Retrains when users add 20+ new transactions
# Logs to continuous_learning.log
```

## 📊 Current Status

**Trained Models:**
- ✅ t1@g.com: 81.97% accuracy (301 transactions)

**Users with Data:**
- demo@example.com: 798 transactions (date format issue)
- t1@g.com: 301 transactions ✅ TRAINED
- dattatraykshirsagar2005@gmail.com: 1 transaction
- t5@g.com: 1 transaction

## 🔧 Configuration (.env)

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Training Thresholds
MIN_TRANSACTIONS_FOR_TRAINING=50
MIN_NEW_TRANSACTIONS_FOR_RETRAIN=20
RETRAIN_INTERVAL_DAYS=7
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI ML service |
| `find_and_train.py` | **Recommended** - Smart training |
| `initial_model_training.py` | Manual training for all users |
| `continuous_learning.py` | Automated retraining |
| `config.py` | Configuration settings |

## 🎯 Typical Workflow

1. **Setup**: Install dependencies (`pip install -r requirements.txt`)
2. **Start Service**: `python main.py`
3. **Initial Training**: `python find_and_train.py`
4. **Enable Auto-Retraining**: `python continuous_learning.py` (optional)

## 📚 Documentation

- **ML_TRAINING_GUIDE.md** - Complete training documentation
- **QUICK_START_ML.md** - Quick start guide
- **MODEL_STORAGE.md** - Model storage details
- **README.md** - Service overview

---

**Need help? Check ML_TRAINING_GUIDE.md for detailed instructions!**
