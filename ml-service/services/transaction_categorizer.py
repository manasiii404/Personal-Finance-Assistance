"""Transaction Categorization ML Model"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from pathlib import Path
from datetime import datetime
import re
from typing import Dict, List, Tuple, Optional
import logging

from config import MODEL_PATH, DEFAULT_CATEGORIES, MIN_TRANSACTIONS_FOR_TRAINING

logger = logging.getLogger(__name__)


class TransactionCategorizer:
    """ML model for automatic transaction categorization"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.model_dir = MODEL_PATH / f"categorizer_{user_id}"
        self.model_dir.mkdir(exist_ok=True, parents=True)
        
        # Model components
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=100,
            ngram_range=(1, 2),
            stop_words='english'
        )
        self.scaler = StandardScaler()
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        # Load existing model if available
        self.load_model()
    
    def preprocess_description(self, description: str) -> str:
        """Clean and preprocess transaction description"""
        # Convert to lowercase
        text = description.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra spaces
        text = ' '.join(text.split())
        
        return text
    
    def extract_features(self, transactions: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """Extract features from transactions"""
        # Preprocess descriptions
        descriptions = transactions['description'].apply(self.preprocess_description)
        
        # TF-IDF features from description
        if fit:
            tfidf_features = self.tfidf_vectorizer.fit_transform(descriptions)
        else:
            tfidf_features = self.tfidf_vectorizer.transform(descriptions)
        
        # Numerical features
        numerical_features = []
        
        # Amount (normalized)
        amounts = transactions['amount'].values.reshape(-1, 1)
        
        # Time features
        if 'date' in transactions.columns:
            dates = pd.to_datetime(transactions['date'])
            hour_of_day = dates.dt.hour.values.reshape(-1, 1)
            day_of_week = dates.dt.dayofweek.values.reshape(-1, 1)
            day_of_month = dates.dt.day.values.reshape(-1, 1)
            month = dates.dt.month.values.reshape(-1, 1)
            
            numerical_features = np.hstack([
                amounts,
                hour_of_day,
                day_of_week,
                day_of_month,
                month
            ])
        else:
            numerical_features = amounts
        
        # Scale numerical features
        if fit:
            numerical_features_scaled = self.scaler.fit_transform(numerical_features)
        else:
            numerical_features_scaled = self.scaler.transform(numerical_features)
        
        # Combine TF-IDF and numerical features
        combined_features = np.hstack([
            tfidf_features.toarray(),
            numerical_features_scaled
        ])
        
        return combined_features
    
    def train(self, transactions: List[Dict]) -> Dict:
        """Train the categorization model"""
        logger.info(f"Training categorizer for user {self.user_id} with {len(transactions)} transactions")
        
        if len(transactions) < MIN_TRANSACTIONS_FOR_TRAINING:
            raise ValueError(f"Need at least {MIN_TRANSACTIONS_FOR_TRAINING} transactions to train")
        
        # Convert to DataFrame
        df = pd.DataFrame(transactions)
        
        # Filter out transactions without categories
        df = df[df['category'].notna()]
        
        if len(df) < MIN_TRANSACTIONS_FOR_TRAINING:
            raise ValueError(f"Need at least {MIN_TRANSACTIONS_FOR_TRAINING} labeled transactions")
        
        # Extract features
        X = self.extract_features(df, fit=True)
        y = df['category'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.classifier.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.classifier.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Model trained with accuracy: {accuracy:.2%}")
        
        # Save model
        self.save_model()
        
        return {
            "accuracy": float(accuracy),
            "num_transactions": len(df),
            "num_categories": len(df['category'].unique()),
            "trained_at": datetime.now().isoformat()
        }
    
    def predict(self, transaction: Dict) -> Dict:
        """Predict category for a single transaction"""
        # Convert to DataFrame
        df = pd.DataFrame([transaction])
        
        # Extract features
        X = self.extract_features(df, fit=False)
        
        # Predict
        category = self.classifier.predict(X)[0]
        probabilities = self.classifier.predict_proba(X)[0]
        
        # Get confidence (max probability)
        confidence = float(max(probabilities))
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_predictions = [
            {
                "category": self.classifier.classes_[idx],
                "confidence": float(probabilities[idx])
            }
            for idx in top_indices
        ]
        
        return {
            "category": category,
            "confidence": confidence,
            "alternatives": top_predictions
        }
    
    def predict_batch(self, transactions: List[Dict]) -> List[Dict]:
        """Predict categories for multiple transactions"""
        if not transactions:
            return []
        
        # Convert to DataFrame
        df = pd.DataFrame(transactions)
        
        # Extract features
        X = self.extract_features(df, fit=False)
        
        # Predict
        categories = self.classifier.predict(X)
        probabilities = self.classifier.predict_proba(X)
        
        results = []
        for i, (category, probs) in enumerate(zip(categories, probabilities)):
            confidence = float(max(probs))
            
            # Get top 3 predictions
            top_indices = np.argsort(probs)[-3:][::-1]
            top_predictions = [
                {
                    "category": self.classifier.classes_[idx],
                    "confidence": float(probs[idx])
                }
                for idx in top_indices
            ]
            
            results.append({
                "category": category,
                "confidence": confidence,
                "alternatives": top_predictions
            })
        
        return results
    
    def save_model(self):
        """Save model to disk"""
        try:
            joblib.dump(self.tfidf_vectorizer, self.model_dir / "tfidf_vectorizer.pkl")
            joblib.dump(self.scaler, self.model_dir / "scaler.pkl")
            joblib.dump(self.classifier, self.model_dir / "classifier.pkl")
            
            # Save metadata
            metadata = {
                "user_id": self.user_id,
                "saved_at": datetime.now().isoformat(),
                "categories": list(self.classifier.classes_) if hasattr(self.classifier, 'classes_') else []
            }
            joblib.dump(metadata, self.model_dir / "metadata.pkl")
            
            logger.info(f"Model saved to {self.model_dir}")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_model(self) -> bool:
        """Load model from disk"""
        try:
            tfidf_path = self.model_dir / "tfidf_vectorizer.pkl"
            scaler_path = self.model_dir / "scaler.pkl"
            classifier_path = self.model_dir / "classifier.pkl"
            
            if all(p.exists() for p in [tfidf_path, scaler_path, classifier_path]):
                self.tfidf_vectorizer = joblib.load(tfidf_path)
                self.scaler = joblib.load(scaler_path)
                self.classifier = joblib.load(classifier_path)
                
                logger.info(f"Model loaded from {self.model_dir}")
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def is_trained(self) -> bool:
        """Check if model is trained"""
        return hasattr(self.classifier, 'classes_')
