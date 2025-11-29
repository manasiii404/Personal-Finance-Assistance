"""Configuration settings for ML service"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Server Configuration
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/finance_db")

# Model Configuration
BASE_DIR = Path(__file__).parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "models"))
MODEL_PATH.mkdir(exist_ok=True)

# Training Configuration
MIN_TRANSACTIONS_FOR_TRAINING = int(os.getenv("MIN_TRANSACTIONS_FOR_TRAINING", "50"))
RETRAIN_INTERVAL_DAYS = int(os.getenv("RETRAIN_INTERVAL_DAYS", "7"))

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Categories
DEFAULT_CATEGORIES = [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Education",
    "Travel",
    "Salary",
    "Investment",
    "Other"
]
