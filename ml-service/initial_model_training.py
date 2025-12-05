"""
Initial ML Model Training Script
Run this script to train models for the first time or manually retrain
"""
import asyncio
import sys
from pathlib import Path
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from services.transaction_categorizer import TransactionCategorizer
from services.expense_forecaster import ExpenseForecaster

# Load environment variables
load_dotenv()

# MongoDB connection - try multiple sources
MONGODB_URI = os.getenv('MONGODB_URI') or os.getenv('DATABASE_URL', 'mongodb://localhost:27017/finance_db')
print(f"Connecting to: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else MONGODB_URI}")

client = MongoClient(MONGODB_URI)
db = client.get_database()


def get_user_transactions(user_id: str):
    """Fetch all transactions for a user from MongoDB"""
    transactions = list(db.transactions.find({'userId': user_id}))
    
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


def get_all_users():
    """Get all user IDs from database"""
    users = db.users.find({}, {'_id': 1})
    return [str(user['_id']) for user in users]


def train_user_models(user_id: str, min_transactions: int = 50):
    """Train both categorizer and forecaster for a user"""
    print(f"\n{'='*60}")
    print(f"Training models for user: {user_id}")
    print(f"{'='*60}")
    
    # Get transactions
    transactions = get_user_transactions(user_id)
    
    if len(transactions) < min_transactions:
        print(f"[WARNING] Insufficient data: {len(transactions)} transactions (minimum {min_transactions} required)")
        return False
    
    print(f"[OK] Found {len(transactions)} transactions")
    
    # Train categorizer
    print("\n1. Training Transaction Categorizer...")
    try:
        categorizer = TransactionCategorizer(user_id)
        result = categorizer.train(transactions)
        print(f"   [OK] Categorizer trained successfully!")
        print(f"   - Accuracy: {result.get('accuracy', 0):.2%}")
        print(f"   - Transactions used: {result.get('num_transactions', 0)}")
        print(f"   - Categories: {len(result.get('categories', []))}")
    except Exception as e:
        print(f"   [ERROR] Categorizer training failed: {e}")
        return False
    
    # Train forecaster
    print("\n2. Training Expense Forecaster...")
    try:
        forecaster = ExpenseForecaster(user_id)
        result = forecaster.train(transactions)
        print(f"   [OK] Forecaster trained successfully!")
        print(f"   - Categories trained: {result.get('categories_trained', 0)}")
    except Exception as e:
        print(f"   [ERROR] Forecaster training failed: {e}")
        return False
    
    print(f"\n{'='*60}")
    print(f"[SUCCESS] All models trained successfully for user {user_id}")
    print(f"{'='*60}\n")
    return True


def train_all_users(min_transactions: int = 50):
    """Train models for all users with sufficient data"""
    print("\n" + "="*60)
    print("TRAINING ML MODELS FOR ALL USERS")
    print("="*60)
    
    users = get_all_users()
    print(f"\nFound {len(users)} users in database")
    
    # First, show transaction counts for all users
    print("\nTransaction counts per user:")
    for user_id in users:
        txn_count = len(get_user_transactions(user_id))
        print(f"  User {user_id[:8]}...: {txn_count} transactions")
    
    print(f"\nTraining users with {min_transactions}+ transactions...")
    
    successful = 0
    failed = 0
    insufficient_data = 0
    
    for user_id in users:
        try:
            transactions = get_user_transactions(user_id)
            if len(transactions) < min_transactions:
                insufficient_data += 1
                continue
            
            if train_user_models(user_id, min_transactions):
                successful += 1
            else:
                failed += 1
        except Exception as e:
            print(f"Error training user {user_id}: {e}")
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    print(f"[SUCCESS] Successfully trained: {successful} users")
    print(f"[WARNING] Insufficient data: {insufficient_data} users")
    print(f"[ERROR] Failed: {failed} users")
    print(f"Total users: {len(users)}")
    print("="*60 + "\n")


def main():
    """Main training function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train ML models for finance app')
    parser.add_argument('--user', type=str, help='Train models for specific user ID')
    parser.add_argument('--all', action='store_true', help='Train models for all users')
    parser.add_argument('--min-transactions', type=int, default=50, 
                       help='Minimum transactions required (default: 50)')
    
    args = parser.parse_args()
    
    try:
        if args.user:
            # Train specific user
            train_user_models(args.user, args.min_transactions)
        elif args.all:
            # Train all users
            train_all_users(args.min_transactions)
        else:
            # Interactive mode
            print("\n" + "="*60)
            print("ML MODEL TRAINING")
            print("="*60)
            print("\nOptions:")
            print("1. Train models for specific user")
            print("2. Train models for all users")
            print("3. Exit")
            
            choice = input("\nEnter your choice (1-3): ").strip()
            
            if choice == '1':
                user_id = input("Enter user ID: ").strip()
                train_user_models(user_id, args.min_transactions)
            elif choice == '2':
                train_all_users(args.min_transactions)
            else:
                print("Exiting...")
    except KeyboardInterrupt:
        print("\n\nTraining interrupted by user")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    main()
