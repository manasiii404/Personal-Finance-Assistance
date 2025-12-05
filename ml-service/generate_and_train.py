"""
Generate Sample Transactions for ML Training

This script generates 100+ sample transactions to train ML models.
Run this after logging in to quickly get training data.
"""

import requests
import json
from datetime import datetime, timedelta
import random

# Configuration
API_URL = "http://localhost:3000/api"
AUTH_TOKEN = input("Enter your JWT token (from login): ").strip()

HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

# Sample transaction templates
TRANSACTION_TEMPLATES = {
    "Food": [
        "Starbucks Coffee",
        "McDonald's",
        "Subway Sandwich",
        "Pizza Hut",
        "Domino's Pizza",
        "KFC",
        "Burger King",
        "Chipotle",
        "Panera Bread",
        "Dunkin Donuts",
        "Local Restaurant",
        "Grocery Store",
        "Whole Foods",
        "Trader Joe's",
        "Walmart Groceries"
    ],
    "Transportation": [
        "Uber Ride",
        "Lyft",
        "Gas Station",
        "Shell Gas",
        "Metro Card",
        "Parking Fee",
        "Car Wash",
        "Taxi",
        "Bus Ticket",
        "Train Ticket"
    ],
    "Shopping": [
        "Amazon Purchase",
        "Target",
        "Walmart",
        "Best Buy",
        "Nike Store",
        "Zara",
        "H&M",
        "IKEA",
        "Home Depot",
        "Costco"
    ],
    "Entertainment": [
        "Netflix Subscription",
        "Spotify Premium",
        "Movie Theater",
        "Concert Tickets",
        "Gaming Purchase",
        "YouTube Premium",
        "Disney+",
        "HBO Max",
        "Apple Music",
        "Gym Membership"
    ],
    "Bills": [
        "Electric Bill",
        "Water Bill",
        "Internet Bill",
        "Phone Bill",
        "Rent Payment",
        "Insurance Premium",
        "Credit Card Payment"
    ],
    "Healthcare": [
        "Doctor Visit",
        "Pharmacy",
        "Dental Checkup",
        "Health Insurance",
        "Medical Supplies",
        "Gym Membership"
    ],
    "Education": [
        "Course Fee",
        "Books Purchase",
        "Online Course",
        "Tuition Payment",
        "Study Materials"
    ],
    "Travel": [
        "Flight Booking",
        "Hotel Stay",
        "Airbnb",
        "Travel Insurance",
        "Vacation Package"
    ],
    "Salary": [
        "Monthly Salary",
        "Bonus Payment",
        "Freelance Income"
    ],
    "Investment": [
        "Stock Purchase",
        "Mutual Fund",
        "Crypto Investment"
    ]
}

# Amount ranges for each category
AMOUNT_RANGES = {
    "Food": (3, 50),
    "Transportation": (5, 100),
    "Shopping": (20, 300),
    "Entertainment": (10, 150),
    "Bills": (50, 500),
    "Healthcare": (30, 300),
    "Education": (50, 1000),
    "Travel": (100, 2000),
    "Salary": (2000, 5000),
    "Investment": (100, 1000)
}

def generate_transactions(num_transactions=100):
    """Generate sample transactions"""
    transactions = []
    start_date = datetime.now() - timedelta(days=90)  # Last 90 days
    
    for i in range(num_transactions):
        # Random category
        category = random.choice(list(TRANSACTION_TEMPLATES.keys()))
        
        # Random description from category
        description = random.choice(TRANSACTION_TEMPLATES[category])
        
        # Random amount in category range
        min_amt, max_amt = AMOUNT_RANGES[category]
        amount = round(random.uniform(min_amt, max_amt), 2)
        
        # Determine type
        if category in ["Salary", "Investment"]:
            trans_type = "income"
        else:
            trans_type = "expense"
            amount = -abs(amount)  # Expenses are negative
        
        # Random date in last 90 days
        days_ago = random.randint(0, 89)
        date = (start_date + timedelta(days=days_ago)).strftime("%Y-%m-%d")
        
        transaction = {
            "description": description,
            "amount": amount,
            "date": date,
            "category": category,
            "type": trans_type,
            "source": "manual"
        }
        
        transactions.append(transaction)
    
    return transactions

def create_transactions(transactions):
    """Create transactions via API"""
    print(f"\n🚀 Creating {len(transactions)} sample transactions...")
    
    success_count = 0
    error_count = 0
    
    for i, transaction in enumerate(transactions, 1):
        try:
            response = requests.post(
                f"{API_URL}/transactions",
                headers=HEADERS,
                json=transaction
            )
            
            if response.status_code in [200, 201]:
                success_count += 1
                if i % 10 == 0:
                    print(f"✅ Created {i}/{len(transactions)} transactions...")
            else:
                error_count += 1
                print(f"❌ Error creating transaction {i}: {response.text}")
        
        except Exception as e:
            error_count += 1
            print(f"❌ Exception creating transaction {i}: {e}")
    
    print(f"\n✅ Successfully created: {success_count}")
    print(f"❌ Errors: {error_count}")
    return success_count

def train_models():
    """Train ML models"""
    print("\n🤖 Training ML models...")
    
    try:
        response = requests.post(
            f"{API_URL}/ml/train/all",
            headers=HEADERS
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Models trained successfully!")
            print(json.dumps(result, indent=2))
            return True
        else:
            print(f"❌ Error training models: {response.text}")
            return False
    
    except Exception as e:
        print(f"❌ Exception training models: {e}")
        return False

def check_model_status():
    """Check if models are trained"""
    print("\n📊 Checking model status...")
    
    try:
        response = requests.get(
            f"{API_URL}/ml/status",
            headers=HEADERS
        )
        
        if response.status_code == 200:
            result = response.json()
            print(json.dumps(result, indent=2))
            return result
        else:
            print(f"❌ Error checking status: {response.text}")
            return None
    
    except Exception as e:
        print(f"❌ Exception checking status: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("  ML Model Training - Sample Data Generator")
    print("=" * 60)
    
    # Generate transactions
    transactions = generate_transactions(100)
    print(f"\n✅ Generated {len(transactions)} sample transactions")
    
    # Show sample
    print("\n📝 Sample transactions:")
    for t in transactions[:3]:
        print(f"  - {t['description']}: ${abs(t['amount']):.2f} ({t['category']})")
    print("  ...")
    
    # Ask for confirmation
    confirm = input("\n❓ Create these transactions? (yes/no): ").strip().lower()
    
    if confirm == "yes":
        # Create transactions
        success_count = create_transactions(transactions)
        
        if success_count >= 50:
            # Train models
            train_confirm = input("\n❓ Train ML models now? (yes/no): ").strip().lower()
            
            if train_confirm == "yes":
                if train_models():
                    print("\n🎉 Training complete! Model files created.")
                    print("\n📁 Check ml-service/models/ for .pkl files")
                    
                    # Check status
                    check_model_status()
        else:
            print(f"\n⚠️  Only {success_count} transactions created.")
            print("   Need at least 50 for training.")
    else:
        print("\n❌ Cancelled.")
    
    print("\n" + "=" * 60)
    print("  Done!")
    print("=" * 60)
