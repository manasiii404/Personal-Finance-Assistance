"""
Continuous Learning Service for ML Models
Automatically retrains models periodically based on new transaction data
"""
import schedule
import time
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from services.transaction_categorizer import TransactionCategorizer
from services.expense_forecaster import ExpenseForecaster

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('continuous_learning.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/finance_db')
MIN_TRANSACTIONS = int(os.getenv('MIN_TRANSACTIONS_FOR_TRAINING', '50'))
MIN_NEW_TRANSACTIONS = int(os.getenv('MIN_NEW_TRANSACTIONS_FOR_RETRAIN', '20'))
RETRAIN_INTERVAL_DAYS = int(os.getenv('RETRAIN_INTERVAL_DAYS', '7'))

# MongoDB connection
client = MongoClient(MONGODB_URI)
db = client.get_database()


class ContinuousLearningService:
    """Service for continuous model training and improvement"""
    
    def __init__(self):
        self.last_training_times = {}  # user_id -> last_training_datetime
        logger.info("Continuous Learning Service initialized")
    
    def get_user_transactions(self, user_id: str, since_date=None):
        """Fetch transactions for a user, optionally since a specific date"""
        query = {'userId': user_id}
        if since_date:
            query['createdAt'] = {'$gte': since_date}
        
        transactions = list(db.transactions.find(query))
        
        # Convert MongoDB documents to dict format
        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                'description': txn.get('description', ''),
                'amount': float(txn.get('amount', 0)),
                'date': txn.get('date').isoformat() if txn.get('date') else None,
                'category': txn.get('category', '')
            })
        
        return formatted_transactions
    
    def get_last_training_time(self, user_id: str):
        """Get the last time models were trained for a user"""
        # Check in-memory cache first
        if user_id in self.last_training_times:
            return self.last_training_times[user_id]
        
        # Check database for training history
        training_record = db.model_training_history.find_one(
            {'userId': user_id},
            sort=[('trainedAt', -1)]
        )
        
        if training_record:
            last_time = training_record['trainedAt']
            self.last_training_times[user_id] = last_time
            return last_time
        
        return None
    
    def save_training_record(self, user_id: str, model_type: str, metrics: dict):
        """Save training record to database"""
        record = {
            'userId': user_id,
            'modelType': model_type,
            'trainedAt': datetime.now(),
            'metrics': metrics
        }
        db.model_training_history.insert_one(record)
        self.last_training_times[user_id] = record['trainedAt']
    
    def should_retrain(self, user_id: str):
        """Determine if models should be retrained for a user"""
        last_training = self.get_last_training_time(user_id)
        
        # If never trained, check if enough data exists
        if not last_training:
            total_transactions = len(self.get_user_transactions(user_id))
            if total_transactions >= MIN_TRANSACTIONS:
                logger.info(f"User {user_id}: Never trained, {total_transactions} transactions available")
                return True, "initial_training"
            return False, "insufficient_data"
        
        # Check if enough time has passed
        days_since_training = (datetime.now() - last_training).days
        if days_since_training < RETRAIN_INTERVAL_DAYS:
            return False, "too_soon"
        
        # Check if enough new transactions exist
        new_transactions = self.get_user_transactions(user_id, since_date=last_training)
        if len(new_transactions) >= MIN_NEW_TRANSACTIONS:
            logger.info(f"User {user_id}: {len(new_transactions)} new transactions since last training")
            return True, "periodic_retrain"
        
        return False, "insufficient_new_data"
    
    def train_user_models(self, user_id: str):
        """Train both categorizer and forecaster for a user"""
        logger.info(f"Starting training for user {user_id}")
        
        try:
            # Get all transactions
            transactions = self.get_user_transactions(user_id)
            
            if len(transactions) < MIN_TRANSACTIONS:
                logger.warning(f"User {user_id}: Insufficient data ({len(transactions)} transactions)")
                return False
            
            # Train categorizer
            logger.info(f"Training categorizer for user {user_id}...")
            categorizer = TransactionCategorizer(user_id)
            cat_result = categorizer.train(transactions)
            self.save_training_record(user_id, 'categorizer', cat_result)
            logger.info(f"Categorizer trained: Accuracy={cat_result.get('accuracy', 0):.2%}")
            
            # Train forecaster
            logger.info(f"Training forecaster for user {user_id}...")
            forecaster = ExpenseForecaster(user_id)
            fore_result = forecaster.train(transactions)
            self.save_training_record(user_id, 'forecaster', fore_result)
            logger.info(f"Forecaster trained: {fore_result.get('categories_trained', 0)} categories")
            
            logger.info(f"✅ Successfully trained models for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error training user {user_id}: {e}", exc_info=True)
            return False
    
    def check_and_train_all_users(self):
        """Check all users and train models if needed"""
        logger.info("="*60)
        logger.info("Starting periodic model training check")
        logger.info("="*60)
        
        try:
            # Get all users
            users = list(db.users.find({}, {'_id': 1}))
            logger.info(f"Found {len(users)} users")
            
            trained_count = 0
            skipped_count = 0
            
            for user in users:
                user_id = str(user['_id'])
                
                should_train, reason = self.should_retrain(user_id)
                
                if should_train:
                    logger.info(f"Training user {user_id} (Reason: {reason})")
                    if self.train_user_models(user_id):
                        trained_count += 1
                else:
                    logger.debug(f"Skipping user {user_id} (Reason: {reason})")
                    skipped_count += 1
            
            logger.info("="*60)
            logger.info(f"Training cycle complete: {trained_count} trained, {skipped_count} skipped")
            logger.info("="*60)
            
        except Exception as e:
            logger.error(f"Error in training cycle: {e}", exc_info=True)
    
    def run_continuous_learning(self):
        """Run continuous learning service with scheduled tasks"""
        logger.info("Starting Continuous Learning Service")
        logger.info(f"Configuration:")
        logger.info(f"  - Minimum transactions: {MIN_TRANSACTIONS}")
        logger.info(f"  - Minimum new transactions for retrain: {MIN_NEW_TRANSACTIONS}")
        logger.info(f"  - Retrain interval: {RETRAIN_INTERVAL_DAYS} days")
        logger.info(f"  - Check schedule: Daily at 02:00 AM")
        
        # Schedule daily training check at 2 AM
        schedule.every().day.at("02:00").do(self.check_and_train_all_users)
        
        # Also run immediately on startup
        logger.info("Running initial training check...")
        self.check_and_train_all_users()
        
        # Keep the service running
        logger.info("Service running. Press Ctrl+C to stop.")
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Service stopped by user")
        finally:
            client.close()


def main():
    """Main entry point"""
    service = ContinuousLearningService()
    service.run_continuous_learning()


if __name__ == "__main__":
    main()
