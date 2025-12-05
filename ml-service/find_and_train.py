"""
Find and train users with transaction data
"""
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent))
from services.transaction_categorizer import TransactionCategorizer
from services.expense_forecaster import ExpenseForecaster

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI') or os.getenv('DATABASE_URL', 'mongodb://localhost:27017/finance_db')
print(f"Connecting to: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else MONGODB_URI}\n")

client = MongoClient(MONGODB_URI)
db = client.get_database()

# Find all users with their transaction counts
print("="*60)
print("FINDING USERS WITH TRANSACTION DATA")
print("="*60)

users_with_data = []
all_users = list(db.users.find({}, {'_id': 1, 'email': 1, 'name': 1}))

print(f"\nChecking {len(all_users)} users...\n")

for user in all_users:
    user_id_obj = user['_id']  # Keep as ObjectId
    user_id_str = str(user_id_obj)  # String version for ML models
    email = user.get('email', 'N/A')
    name = user.get('name', 'N/A')
    # Query with ObjectId type
    txn_count = db.transactions.count_documents({'userId': user_id_obj})
    
    if txn_count > 0:
        users_with_data.append({
            'id': user_id_str,  # String for ML models
            'id_obj': user_id_obj,  # ObjectId for queries
            'email': email,
            'name': name,
            'transactions': txn_count
        })
        print(f"[FOUND] {email} ({name})")
        print(f"        User ID: {user_id_str}")
        print(f"        Transactions: {txn_count}")
        print()

if not users_with_data:
    print("[WARNING] No users with transaction data found!")
    print("\nPlease ensure:")
    print("1. Database is seeded: npm run db:seed")
    print("2. Users have added transactions via the app")
    client.close()
    sys.exit(0)

print("="*60)
print(f"FOUND {len(users_with_data)} USERS WITH DATA")
print("="*60)

# Train models for users with sufficient data
print("\nStarting training...\n")

MIN_TRANSACTIONS = 30  # Lower threshold for initial training

trained = 0
skipped = 0

for user_data in users_with_data:
    user_id = user_data['id']
    email = user_data['email']
    txn_count = user_data['transactions']
    
    if txn_count < MIN_TRANSACTIONS:
        print(f"[SKIP] {email}: Only {txn_count} transactions (need {MIN_TRANSACTIONS}+)")
        skipped += 1
        continue
    
    print("="*60)
    print(f"Training: {email}")
    print("="*60)
    
    try:
        # Get transactions using ObjectId
        transactions = list(db.transactions.find({'userId': user_data['id_obj']}))
        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                'description': txn.get('description', ''),
                'amount': float(txn.get('amount', 0)),
                'date': txn.get('date').isoformat() if txn.get('date') else None,
                'category': txn.get('category', '')
            })
        
        # Train categorizer
        print(f"\n1. Training Categorizer ({len(formatted_transactions)} transactions)...")
        categorizer = TransactionCategorizer(user_id)
        cat_result = categorizer.train(formatted_transactions)
        print(f"   [OK] Accuracy: {cat_result.get('accuracy', 0):.2%}")
        print(f"   [OK] Categories: {len(cat_result.get('categories', []))}")
        
        # Train forecaster
        print(f"\n2. Training Forecaster...")
        forecaster = ExpenseForecaster(user_id)
        fore_result = forecaster.train(formatted_transactions)
        print(f"   [OK] Categories trained: {fore_result.get('categories_trained', 0)}")
        
        print(f"\n[SUCCESS] Models trained for {email}")
        trained += 1
        
    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "="*60)
print("TRAINING COMPLETE")
print("="*60)
print(f"[SUCCESS] Trained: {trained} users")
print(f"[SKIP] Skipped: {skipped} users (insufficient data)")
print("="*60)

client.close()
