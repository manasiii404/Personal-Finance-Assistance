# ML Model Storage Location

## 📁 Where Models Are Saved

Your trained ML models are saved in:
```
ml-service/models/
```

## 📂 Directory Structure

For each user, models are stored in a dedicated folder:

```
ml-service/
└── models/
    ├── categorizer_{user_id}/
    │   ├── tfidf_vectorizer.pkl    # Text feature extractor
    │   ├── scaler.pkl               # Numerical feature scaler
    │   ├── classifier.pkl           # Random Forest model
    │   └── metadata.pkl             # Model metadata
    │
    └── forecaster_{user_id}/
        ├── prophet_models.pkl       # Prophet forecasting models
        └── metadata.pkl             # Model metadata
```

## 🔍 Example

For user `692ae52f54482855e11ebfc1` (t1@g.com):

```
models/
├── categorizer_692ae52f54482855e11ebfc1/
│   ├── tfidf_vectorizer.pkl    (~50 KB)
│   ├── scaler.pkl              (~2 KB)
│   ├── classifier.pkl          (~500 KB)
│   └── metadata.pkl            (~1 KB)
│
└── forecaster_692ae52f54482855e11ebfc1/
    ├── prophet_models.pkl      (~200 KB)
    └── metadata.pkl            (~1 KB)
```

## 📝 File Details

### Categorizer Files:
- **tfidf_vectorizer.pkl**: Converts transaction descriptions to numerical features
- **scaler.pkl**: Normalizes numerical features (amount, date, time)
- **classifier.pkl**: Random Forest model (100 trees, trained on your data)
- **metadata.pkl**: User ID, save timestamp, categories list

### Forecaster Files:
- **prophet_models.pkl**: Facebook Prophet models (one per category)
- **metadata.pkl**: Training info, categories trained

## 🔒 Important Notes

1. **Gitignored**: The `models/` directory is in `.gitignore` so models aren't committed to git
2. **User-Specific**: Each user has their own models (privacy & personalization)
3. **Auto-Load**: Models are automatically loaded when needed
4. **Persistent**: Models persist between server restarts
5. **Size**: Typical model size is ~1-2 MB per user

## 🔄 Model Lifecycle

1. **Training**: Models created and saved to `models/categorizer_{user_id}/`
2. **Loading**: Auto-loaded when making predictions
3. **Retraining**: Old models overwritten with new ones
4. **Backup**: Consider backing up `models/` directory periodically

## 📊 Check Your Models

```bash
# List all trained models
cd ml-service
ls -R models/

# Or on Windows
dir models /s
```

## 🗑️ Deleting Models

To retrain from scratch:
```bash
# Delete specific user's models
rm -rf models/categorizer_{user_id}
rm -rf models/forecaster_{user_id}

# Or delete all models
rm -rf models/*
```

Then retrain:
```bash
python find_and_train.py
```

## 💾 Backup Models

```bash
# Create backup
cp -r models/ models_backup_$(date +%Y%m%d)/

# Or on Windows
xcopy models models_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2% /E /I
```

## 🔍 Model Inspection

To inspect model details:
```python
import joblib

# Load categorizer metadata
metadata = joblib.load('models/categorizer_{user_id}/metadata.pkl')
print(metadata)

# Output:
# {
#   'user_id': '692ae52f54482855e11ebfc1',
#   'saved_at': '2024-12-06T00:09:08.123456',
#   'categories': ['Food', 'Transport', 'Shopping', ...]
# }
```

---

**Your models are safe and ready to use!** 🎯
