/**
 * ML Service Integration for Node.js Backend
 */
import axios from 'axios';
import logger from '@/utils/logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export class MLService {
  // Transaction Categorization
  static async trainCategorizer(userId: string, transactions: any[]): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/categorize/train`, {
        user_id: userId,
        transactions
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error training categorizer:', error.response?.data || error.message);
      throw new Error('Failed to train categorization model');
    }
  }

  static async predictCategory(userId: string, transaction: any): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/categorize/predict`, {
        user_id: userId,
        transaction
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Error predicting category:', error.response?.data || error.message);

      // Return null if model not trained, let fallback to rule-based
      if (error.response?.status === 400) {
        return null;
      }

      throw new Error('Failed to predict category');
    }
  }

  static async predictCategoriesBatch(userId: string, transactions: any[]): Promise<any[]> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/categorize/predict-batch`, {
        user_id: userId,
        transactions
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Error predicting categories batch:', error.response?.data || error.message);

      // Return empty array if model not trained
      if (error.response?.status === 400) {
        return [];
      }

      throw new Error('Failed to predict categories');
    }
  }

  // Expense Forecasting
  static async trainForecaster(userId: string, transactions: any[]): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/forecast/train`, {
        user_id: userId,
        transactions
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error training forecaster:', error.response?.data || error.message);
      throw new Error('Failed to train forecasting model');
    }
  }

  static async forecastExpenses(userId: string, category?: string, periods: number = 30): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/forecast/predict`, {
        user_id: userId,
        category,
        periods
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Error forecasting expenses:', error.response?.data || error.message);

      // Return null if model not trained
      if (error.response?.status === 400) {
        return null;
      }

      throw new Error('Failed to forecast expenses');
    }
  }

  static async forecastNextMonth(userId: string): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/forecast/next-month`, {
        user_id: userId
      });

      return response.data.data;
    } catch (error: any) {
      logger.error('Error forecasting next month:', error.response?.data || error.message);

      // Return null if model not trained
      if (error.response?.status === 400) {
        return null;
      }

      throw new Error('Failed to forecast next month');
    }
  }

  // Model Status
  static async getModelStatus(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/models/status/${userId}`);

      return response.data.data;
    } catch (error: any) {
      logger.error('Error getting model status:', error.response?.data || error.message);
      throw new Error('Failed to get model status');
    }
  }

  // Health Check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      logger.error('ML Service health check failed:', error);
      return false;
    }
  }
}
