"""Expense Forecasting ML Model"""
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import joblib
from pathlib import Path
import logging

from config import MODEL_PATH, MIN_TRANSACTIONS_FOR_TRAINING

logger = logging.getLogger(__name__)


class ExpenseForecaster:
    """ML model for expense and income forecasting"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.model_dir = MODEL_PATH / f"forecaster_{user_id}"
        self.model_dir.mkdir(exist_ok=True, parents=True)
        
        # Models for different categories
        self.models = {}
        self.category_stats = {}
        
        # Load existing models if available
        self.load_models()
    
    def prepare_data(self, transactions: List[Dict], category: Optional[str] = None) -> pd.DataFrame:
        """Prepare transaction data for Prophet"""
        df = pd.DataFrame(transactions)
        
        # Filter by category if specified
        if category:
            df = df[df['category'] == category]
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by date and sum amounts
        daily_data = df.groupby('date').agg({
            'amount': 'sum'
        }).reset_index()
        
        # Rename columns for Prophet (ds = date, y = value)
        daily_data.columns = ['ds', 'y']
        
        # Take absolute value for expenses
        daily_data['y'] = daily_data['y'].abs()
        
        return daily_data
    
    def train_category_model(self, transactions: List[Dict], category: str) -> Dict:
        """Train forecasting model for a specific category"""
        logger.info(f"Training forecaster for user {self.user_id}, category: {category}")
        
        # Prepare data
        df = self.prepare_data(transactions, category)
        
        if len(df) < 30:  # Need at least 30 days of data
            logger.warning(f"Insufficient data for category {category}: {len(df)} days")
            return {
                "category": category,
                "status": "insufficient_data",
                "days_available": len(df)
            }
        
        # Create and train Prophet model
        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=True if len(df) > 365 else False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )
        
        # Fit model
        model.fit(df)
        
        # Store model and statistics
        self.models[category] = model
        self.category_stats[category] = {
            "mean": float(df['y'].mean()),
            "std": float(df['y'].std()),
            "min": float(df['y'].min()),
            "max": float(df['y'].max()),
            "days_of_data": len(df)
        }
        
        return {
            "category": category,
            "status": "trained",
            "days_of_data": len(df),
            "mean_daily_expense": float(df['y'].mean())
        }
    
    def train(self, transactions: List[Dict]) -> Dict:
        """Train forecasting models for all categories"""
        logger.info(f"Training expense forecaster for user {self.user_id}")
        
        if len(transactions) < MIN_TRANSACTIONS_FOR_TRAINING:
            raise ValueError(f"Need at least {MIN_TRANSACTIONS_FOR_TRAINING} transactions to train")
        
        df = pd.DataFrame(transactions)
        categories = df['category'].unique()
        
        results = []
        for category in categories:
            category_transactions = df[df['category'] == category].to_dict('records')
            result = self.train_category_model(category_transactions, category)
            results.append(result)
        
        # Save models
        self.save_models()
        
        return {
            "user_id": self.user_id,
            "categories_trained": len([r for r in results if r['status'] == 'trained']),
            "total_categories": len(categories),
            "results": results,
            "trained_at": datetime.now().isoformat()
        }
    
    def forecast_category(self, category: str, periods: int = 30) -> Dict:
        """Forecast expenses for a specific category"""
        if category not in self.models:
            return {
                "category": category,
                "status": "not_trained",
                "forecast": []
            }
        
        model = self.models[category]
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods)
        
        # Make predictions
        forecast = model.predict(future)
        
        # Get only future predictions
        forecast_future = forecast.tail(periods)
        
        # Prepare forecast data
        forecast_data = []
        for _, row in forecast_future.iterrows():
            forecast_data.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_amount": float(max(0, row['yhat'])),  # Ensure non-negative
                "lower_bound": float(max(0, row['yhat_lower'])),
                "upper_bound": float(max(0, row['yhat_upper']))
            })
        
        # Calculate monthly aggregate
        monthly_total = sum(item['predicted_amount'] for item in forecast_data)
        
        return {
            "category": category,
            "status": "success",
            "forecast_days": periods,
            "daily_forecast": forecast_data,
            "monthly_total": monthly_total,
            "statistics": self.category_stats.get(category, {})
        }
    
    def forecast_all(self, periods: int = 30) -> Dict:
        """Forecast expenses for all categories"""
        forecasts = {}
        total_forecast = 0
        
        for category in self.models.keys():
            forecast = self.forecast_category(category, periods)
            if forecast['status'] == 'success':
                forecasts[category] = forecast
                total_forecast += forecast['monthly_total']
        
        # Generate insights
        insights = self.generate_insights(forecasts)
        
        return {
            "user_id": self.user_id,
            "forecast_period_days": periods,
            "total_predicted_expense": total_forecast,
            "categories": forecasts,
            "insights": insights,
            "generated_at": datetime.now().isoformat()
        }
    
    def forecast_next_month(self) -> Dict:
        """Forecast expenses for the next month"""
        # Calculate days until end of next month
        today = datetime.now()
        next_month = today.replace(day=28) + timedelta(days=4)
        last_day_next_month = next_month.replace(day=1) + timedelta(days=32)
        last_day_next_month = last_day_next_month.replace(day=1) - timedelta(days=1)
        
        days_to_forecast = (last_day_next_month - today).days
        
        return self.forecast_all(periods=days_to_forecast)
    
    def generate_insights(self, forecasts: Dict) -> List[str]:
        """Generate insights from forecasts"""
        insights = []
        
        # Find highest expense category
        if forecasts:
            sorted_categories = sorted(
                forecasts.items(),
                key=lambda x: x[1].get('monthly_total', 0),
                reverse=True
            )
            
            if sorted_categories:
                top_category, top_data = sorted_categories[0]
                insights.append(
                    f"Your highest predicted expense is {top_category} "
                    f"at ${top_data['monthly_total']:.2f} for the next month"
                )
            
            # Check for categories with high variance
            for category, data in forecasts.items():
                stats = data.get('statistics', {})
                if stats.get('std', 0) > stats.get('mean', 1) * 0.5:
                    insights.append(
                        f"{category} spending shows high variability - "
                        f"consider setting a flexible budget"
                    )
            
            # Seasonal insights (simplified)
            current_month = datetime.now().month
            if current_month == 12:
                insights.append(
                    "December typically sees increased spending on Entertainment and Shopping"
                )
            elif current_month in [6, 7, 8]:
                insights.append(
                    "Summer months often have higher Travel and Entertainment expenses"
                )
        
        if not insights:
            insights.append("Continue tracking your expenses for more personalized insights")
        
        return insights
    
    def save_models(self):
        """Save all models to disk"""
        try:
            # Save each category model
            for category, model in self.models.items():
                safe_category = category.replace('/', '_').replace('\\', '_')
                model_path = self.model_dir / f"model_{safe_category}.pkl"
                joblib.dump(model, model_path)
            
            # Save statistics
            stats_path = self.model_dir / "category_stats.pkl"
            joblib.dump(self.category_stats, stats_path)
            
            # Save metadata
            metadata = {
                "user_id": self.user_id,
                "categories": list(self.models.keys()),
                "saved_at": datetime.now().isoformat()
            }
            joblib.dump(metadata, self.model_dir / "metadata.pkl")
            
            logger.info(f"Forecaster models saved to {self.model_dir}")
        except Exception as e:
            logger.error(f"Error saving forecaster models: {e}")
    
    def load_models(self) -> bool:
        """Load models from disk"""
        try:
            metadata_path = self.model_dir / "metadata.pkl"
            stats_path = self.model_dir / "category_stats.pkl"
            
            if not metadata_path.exists():
                return False
            
            # Load metadata
            metadata = joblib.load(metadata_path)
            
            # Load statistics
            if stats_path.exists():
                self.category_stats = joblib.load(stats_path)
            
            # Load each category model
            for category in metadata.get('categories', []):
                safe_category = category.replace('/', '_').replace('\\', '_')
                model_path = self.model_dir / f"model_{safe_category}.pkl"
                
                if model_path.exists():
                    self.models[category] = joblib.load(model_path)
            
            logger.info(f"Loaded {len(self.models)} forecaster models from {self.model_dir}")
            return True
        except Exception as e:
            logger.error(f"Error loading forecaster models: {e}")
            return False
    
    def is_trained(self) -> bool:
        """Check if any models are trained"""
        return len(self.models) > 0
