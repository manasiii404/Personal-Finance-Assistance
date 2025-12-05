# ML Model Training Guide

## 🎯 Goal
Train machine learning models to get `.pkl` model files like your friend has.

---

## 📋 Prerequisites

### 1. Install Python Dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

**Required packages:**
- fastapi
- uvicorn
- pandas
- numpy
- scikit-learn
- prophet
- joblib

### 2. Check Configuration
The models will be saved in: `ml-service/models/`

**Minimum Requirements:**
- **50+ transactions** with categories for training
- Transactions should have: description, amount, date, category

---

## 🚀 Step-by-Step Training Process

### Step 1: Start the ML Service

```bash
cd ml-service
python main.py
```

**Expected output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
Connected to MongoDB
```

### Step 3: Add Transactions (if you don't have 50+)

You need at least 50 transactions with categories. You can:

**Option A: Use the frontend**
1. Start frontend: `npm run dev`
2. Login to your account
3. Add transactions manually

**Option B: Import sample data**
Create a file `sample_transactions.json`:

```json
[
  {"description": "Starbucks Coffee", "amount": -5.50, "date": "2024-11-01", "category": "Food", "type": "expense"},
  {"description": "Uber ride", "amount": -12.00, "date": "2024-11-02", "category": "Transportation", "type": "expense"},
  {"description": "Amazon purchase", "amount": -45.99, "date": "2024-11-03", "category": "Shopping", "type": "expense"},
  {"description": "Netflix subscription", "amount": -15.99, "date": "2024-11-04", "category": "Entertainment", "type": "expense"},
  {"description": "Salary", "amount": 3000.00, "date": "2024-11-05", "category": "Salary", "type": "income"}
  // ... add 45+ more transactions
]
```

### Step 4: Train the Models

**Method 1: Using API directly**

```bash
# Get your auth token first (login via frontend or API)
$token = "your_jwt_token_here"

# Train both models at once
curl -X POST http://localhost:3000/api/ml/train/all `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json"
```

**Method 2: Using PowerShell script**

```powershell
# Save this as train_models.ps1
$token = Read-Host "Enter your JWT token"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Training ML models..." -ForegroundColor Yellow

$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/ml/train/all" `
    -Method POST `
    -Headers $headers

Write-Host "Training complete!" -ForegroundColor Green
$response | ConvertTo-Json -Depth 5
```

Run it:
```bash
.\train_models.ps1
```

### Step 5: Verify Model Files Created

After training, check for model files:

```bash
ls ml-service/models/
```

**Expected files for user ID `abc123`:**

```
models/
├── categorizer_abc123/
│   ├── tfidf_vectorizer.pkl
│   ├── scaler.pkl
│   ├── classifier.pkl
│   └── metadata.pkl
└── forecaster_abc123/
    ├── model_Food.pkl
    ├── model_Transportation.pkl
    ├── model_Shopping.pkl
    ├── model_Entertainment.pkl
    ├── category_stats.pkl
    └── metadata.pkl
```

---

## 🧪 Testing the Trained Models

### Test Auto-Categorization

```bash
# Create a transaction without category
curl -X POST http://localhost:3000/api/transactions `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "description": "Coffee at Cafe",
    "amount": -4.50,
    "date": "2024-12-05",
    "type": "expense",
    "source": "manual"
  }'
```

**Expected:** The transaction should automatically get categorized!

### Test Expense Forecasting

```bash
# Get next month forecast
curl http://localhost:3000/api/ml/forecast/next-month `
  -H "Authorization: Bearer $token"
```

**Expected:** JSON response with predicted expenses by category.

---

## 📊 Model Details

### Categorization Model
- **Algorithm**: Random Forest Classifier
- **Features**: TF-IDF from description + amount + time features
- **Files**: 
  - `tfidf_vectorizer.pkl` - Text feature extractor
  - `scaler.pkl` - Numerical feature scaler
  - `classifier.pkl` - Trained Random Forest model
  - `metadata.pkl` - Model metadata

### Forecasting Model
- **Algorithm**: Facebook Prophet
- **Features**: Time series of expenses per category
- **Files**:
  - `model_{category}.pkl` - Prophet model for each category
  - `category_stats.pkl` - Statistical data per category
  - `metadata.pkl` - Model metadata

---

## 🔧 Troubleshooting

### "Need at least 50 transactions"
- Add more transactions to your account
- Each transaction must have a category
- Use the sample data script above

### "Model not trained"
- Run the training endpoint first
- Check ML service is running on port 8000
- Verify backend can connect to ML service

### "ML Service not responding"
```bash
# Check if ML service is running
curl http://localhost:8000/health

# If not, start it
cd ml-service
python main.py
```

### Models not saving
- Check `ml-service/models/` directory exists
- Verify write permissions
- Check logs for errors

---

## 📁 Sharing Model Files

To share your trained models with others:

1. **Zip the models folder:**
```bash
cd ml-service
Compress-Archive -Path models -DestinationPath trained_models.zip
```

2. **To use someone else's models:**
```bash
# Extract to ml-service/models/
Expand-Archive -Path trained_models.zip -DestinationPath ml-service/
```

**Note:** Models are user-specific. Each user has their own models based on their user ID.

---

## 🎯 Next Steps After Training

1. ✅ Models trained and saved as .pkl files
2. ✅ Test auto-categorization on new transactions
3. ✅ View expense forecasts in Analytics
4. 🔄 Retrain periodically as you add more transactions
5. 📊 Compare predictions with actual spending

---

## 💡 Tips

- **Retrain regularly**: As you add more transactions, retrain for better accuracy
- **Minimum 30 days**: Forecasting works best with at least 30 days of data per category
- **Category consistency**: Use consistent category names for better predictions
- **Data quality**: More accurate transaction descriptions = better categorization

---

## 🚀 Quick Commands Reference

```bash
# Start ML service
cd ml-service && python main.py

# Start backend
cd backend && npm run dev

# Train models (PowerShell)
curl -X POST http://localhost:3000/api/ml/train/all -H "Authorization: Bearer $token"

# Check model status
curl http://localhost:3000/api/ml/status -H "Authorization: Bearer $token"

# Get forecast
curl http://localhost:3000/api/ml/forecast/next-month -H "Authorization: Bearer $token"
```

---

**Happy Training! 🎉**
