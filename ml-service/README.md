# Personal Finance ML Service

Python-based machine learning service for transaction categorization and expense forecasting.

## Features

- **Transaction Categorization**: Automatically categorize transactions using Random Forest classifier
- **Expense Forecasting**: Predict future expenses using Facebook Prophet
- **User-Specific Models**: Train personalized models for each user
- **REST API**: FastAPI-based API for easy integration

## Setup

### 1. Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Service

```bash
python main.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### Training

- `POST /categorize/train` - Train categorization model
- `POST /forecast/train` - Train forecasting model

### Prediction

- `POST /categorize/predict` - Predict category for transaction
- `POST /categorize/predict-batch` - Predict categories for multiple transactions
- `POST /forecast/predict` - Get expense forecast
- `POST /forecast/next-month` - Get next month forecast

### Status

- `GET /models/status/{user_id}` - Get model training status
- `GET /health` - Health check

## Integration with Node.js Backend

The Node.js backend communicates with this ML service via HTTP requests. See `backend/src/services/mlService.ts` for integration code.

## Model Storage

Models are stored in the `models/` directory, organized by user ID:
- `models/categorizer_{user_id}/` - Categorization models
- `models/forecaster_{user_id}/` - Forecasting models

## Requirements

- Python 3.8+
- 50+ transactions for training
- MongoDB connection (shares database with main backend)
