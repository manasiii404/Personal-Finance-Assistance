import { Request, Response } from 'express';
import { TransactionService } from '@/services/transactionService';
import { MLService } from '@/services/mlService';
import { asyncHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

export class MLController {
    // Train categorization model
    static trainCategorizer = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        logger.info(`Training categorization model for user ${userId}`);

        // Get user's historical transactions
        const { data: transactions } = await TransactionService.getTransactions(userId, {
            page: 1,
            limit: 10000, // Get all transactions
        });

        // Filter transactions with categories
        const labeledTransactions = transactions
            .filter(t => t.category && t.category !== 'Other')
            .map(t => ({
                description: t.description,
                amount: t.amount,
                date: t.date.toISOString(),
                category: t.category
            }));

        if (labeledTransactions.length < 50) {
            return res.status(400).json({
                success: false,
                message: `Need at least 50 categorized transactions to train. You have ${labeledTransactions.length}.`,
            });
        }

        // Train model
        const result = await MLService.trainCategorizer(userId, labeledTransactions);

        res.json({
            success: true,
            message: 'Categorization model trained successfully',
            data: result.data,
        });
    });

    // Train forecasting model
    static trainForecaster = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        logger.info(`Training forecasting model for user ${userId}`);

        // Get user's historical transactions
        const { data: transactions } = await TransactionService.getTransactions(userId, {
            page: 1,
            limit: 10000,
        });

        const transactionData = transactions.map(t => ({
            description: t.description,
            amount: Math.abs(t.amount),
            date: t.date.toISOString(),
            category: t.category
        }));

        if (transactionData.length < 50) {
            return res.status(400).json({
                success: false,
                message: `Need at least 50 transactions to train. You have ${transactionData.length}.`,
            });
        }

        // Train model
        const result = await MLService.trainForecaster(userId, transactionData);

        res.json({
            success: true,
            message: 'Forecasting model trained successfully',
            data: result.data,
        });
    });

    // Get expense forecast
    static getForecast = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { category, periods = 30 } = req.query;

        const forecast = await MLService.forecastExpenses(
            userId,
            category as string | undefined,
            parseInt(periods as string)
        );

        if (!forecast) {
            return res.status(400).json({
                success: false,
                message: 'Forecasting model not trained. Please train the model first.',
            });
        }

        res.json({
            success: true,
            message: 'Forecast retrieved successfully',
            data: forecast,
        });
    });

    // Get next month forecast
    static getNextMonthForecast = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        const forecast = await MLService.forecastNextMonth(userId);

        if (!forecast) {
            return res.status(400).json({
                success: false,
                message: 'Forecasting model not trained. Please train the model first.',
            });
        }

        res.json({
            success: true,
            message: 'Next month forecast retrieved successfully',
            data: forecast,
        });
    });

    // Get model status
    static getModelStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        const status = await MLService.getModelStatus(userId);

        res.json({
            success: true,
            message: 'Model status retrieved successfully',
            data: status,
        });
    });

    // Predict category for transaction
    static predictCategory = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { description, amount, date } = req.body;

        if (!description || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Description and amount are required',
            });
        }

        const prediction = await MLService.predictCategory(userId, {
            description,
            amount,
            date: date || new Date().toISOString()
        });

        if (!prediction) {
            return res.status(400).json({
                success: false,
                message: 'Categorization model not trained. Please train the model first.',
            });
        }

        res.json({
            success: true,
            message: 'Category predicted successfully',
            data: prediction,
        });
    });

    // Train both models
    static trainAllModels = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;

        logger.info(`Training all ML models for user ${userId}`);

        // Get user's historical transactions
        const { data: transactions } = await TransactionService.getTransactions(userId, {
            page: 1,
            limit: 10000,
        });

        if (transactions.length < 50) {
            return res.status(400).json({
                success: false,
                message: `Need at least 50 transactions to train. You have ${transactions.length}.`,
            });
        }

        const results: any = {
            categorizer: null,
            forecaster: null
        };

        // Train categorizer
        try {
            const labeledTransactions = transactions
                .filter(t => t.category && t.category !== 'Other')
                .map(t => ({
                    description: t.description,
                    amount: t.amount,
                    date: t.date.toISOString(),
                    category: t.category
                }));

            if (labeledTransactions.length >= 50) {
                const categorizerResult = await MLService.trainCategorizer(userId, labeledTransactions);
                results.categorizer = categorizerResult.data;
            } else {
                results.categorizer = { error: 'Insufficient labeled transactions' };
            }
        } catch (error: any) {
            results.categorizer = { error: error.message };
        }

        // Train forecaster
        try {
            const transactionData = transactions.map(t => ({
                description: t.description,
                amount: Math.abs(t.amount),
                date: t.date.toISOString(),
                category: t.category
            }));

            const forecasterResult = await MLService.trainForecaster(userId, transactionData);
            results.forecaster = forecasterResult.data;
        } catch (error: any) {
            results.forecaster = { error: error.message };
        }

        res.json({
            success: true,
            message: 'ML models training completed',
            data: results,
        });
    });
}
