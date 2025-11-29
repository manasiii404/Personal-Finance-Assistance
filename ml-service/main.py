"""FastAPI ML Service for Personal Finance Assistant"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
import logging

from services.transaction_categorizer import TransactionCategorizer
from services.expense_forecaster import ExpenseForecaster
from config import PORT, HOST

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Personal Finance ML Service",
    description="Machine Learning service for transaction categorization and expense forecasting",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Transaction(BaseModel):
    description: str
    amount: float
    date: Optional[str] = None
    category: Optional[str] = None

class TransactionList(BaseModel):
    user_id: str
    transactions: List[Transaction]

class PredictRequest(BaseModel):
    user_id: str
    transaction: Transaction

class PredictBatchRequest(BaseModel):
    user_id: str
    transactions: List[Transaction]

class TrainCategorizerRequest(BaseModel):
    user_id: str
    transactions: List[Transaction]

class TrainForecasterRequest(BaseModel):
    user_id: str
    transactions: List[Transaction]

class ForecastRequest(BaseModel):
    user_id: str
    category: Optional[str] = None
    periods: int = Field(default=30, ge=1, le=365)


# Health check
@app.get("/")
async def root():
    return {
        "service": "Personal Finance ML Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Transaction Categorization Endpoints
@app.post("/categorize/train")
async def train_categorizer(request: TrainCategorizerRequest, background_tasks: BackgroundTasks):
    """Train transaction categorization model for a user"""
    try:
        categorizer = TransactionCategorizer(request.user_id)
        
        # Convert Pydantic models to dicts
        transactions = [t.dict() for t in request.transactions]
        
        # Train model
        result = categorizer.train(transactions)
        
        return {
            "success": True,
            "message": "Categorization model trained successfully",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error training categorizer: {e}")
        raise HTTPException(status_code=500, detail="Failed to train categorization model")


@app.post("/categorize/predict")
async def predict_category(request: PredictRequest):
    """Predict category for a single transaction"""
    try:
        categorizer = TransactionCategorizer(request.user_id)
        
        if not categorizer.is_trained():
            raise HTTPException(
                status_code=400,
                detail="Model not trained. Please train the model first."
            )
        
        # Convert Pydantic model to dict
        transaction = request.transaction.dict()
        
        # Predict
        result = categorizer.predict(transaction)
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting category: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict category")


@app.post("/categorize/predict-batch")
async def predict_categories_batch(request: PredictBatchRequest):
    """Predict categories for multiple transactions"""
    try:
        categorizer = TransactionCategorizer(request.user_id)
        
        if not categorizer.is_trained():
            raise HTTPException(
                status_code=400,
                detail="Model not trained. Please train the model first."
            )
        
        # Convert Pydantic models to dicts
        transactions = [t.dict() for t in request.transactions]
        
        # Predict
        results = categorizer.predict_batch(transactions)
        
        return {
            "success": True,
            "data": results
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict categories")


# Expense Forecasting Endpoints
@app.post("/forecast/train")
async def train_forecaster(request: TrainForecasterRequest):
    """Train expense forecasting model for a user"""
    try:
        forecaster = ExpenseForecaster(request.user_id)
        
        # Convert Pydantic models to dicts
        transactions = [t.dict() for t in request.transactions]
        
        # Train model
        result = forecaster.train(transactions)
        
        return {
            "success": True,
            "message": "Forecasting model trained successfully",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error training forecaster: {e}")
        raise HTTPException(status_code=500, detail="Failed to train forecasting model")


@app.post("/forecast/predict")
async def forecast_expenses(request: ForecastRequest):
    """Forecast expenses for a user"""
    try:
        forecaster = ExpenseForecaster(request.user_id)
        
        if not forecaster.is_trained():
            raise HTTPException(
                status_code=400,
                detail="Model not trained. Please train the model first."
            )
        
        # Forecast
        if request.category:
            result = forecaster.forecast_category(request.category, request.periods)
        else:
            result = forecaster.forecast_all(request.periods)
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error forecasting expenses: {e}")
        raise HTTPException(status_code=500, detail="Failed to forecast expenses")


@app.post("/forecast/next-month")
async def forecast_next_month(request: BaseModel):
    """Forecast expenses for the next month"""
    try:
        user_id = request.dict().get('user_id')
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        forecaster = ExpenseForecaster(user_id)
        
        if not forecaster.is_trained():
            raise HTTPException(
                status_code=400,
                detail="Model not trained. Please train the model first."
            )
        
        result = forecaster.forecast_next_month()
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error forecasting next month: {e}")
        raise HTTPException(status_code=500, detail="Failed to forecast next month")


# Model Status Endpoints
@app.get("/models/status/{user_id}")
async def get_model_status(user_id: str):
    """Get status of ML models for a user"""
    try:
        categorizer = TransactionCategorizer(user_id)
        forecaster = ExpenseForecaster(user_id)
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "categorizer": {
                    "trained": categorizer.is_trained(),
                    "categories": list(categorizer.classifier.classes_) if categorizer.is_trained() else []
                },
                "forecaster": {
                    "trained": forecaster.is_trained(),
                    "categories": list(forecaster.models.keys()) if forecaster.is_trained() else []
                }
            }
        }
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get model status")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting ML Service on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
