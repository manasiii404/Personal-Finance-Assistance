import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { familyDataService } from '@/services/familyDataService';
import logger from '@/utils/logger';

export const familyDataController = {
    // Get family transactions
    async getFamilyTransactions(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const data = await familyDataService.getFamilyTransactions(userId, familyId);

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error: any) {
            logger.error('Error in getFamilyTransactions controller:', error);

            if (error.message.includes('not a member')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family transactions',
            });
        }
    },

    // Get family budgets
    async getFamilyBudgets(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const budgets = await familyDataService.getFamilyBudgets(userId, familyId);

            res.status(200).json({
                success: true,
                data: budgets,
            });
        } catch (error: any) {
            logger.error('Error in getFamilyBudgets controller:', error);

            if (error.message.includes('not a member')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family budgets',
            });
        }
    },

    // Get family goals
    async getFamilyGoals(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const goals = await familyDataService.getFamilyGoals(userId, familyId);

            res.status(200).json({
                success: true,
                data: goals,
            });
        } catch (error: any) {
            logger.error('Error in getFamilyGoals controller:', error);

            if (error.message.includes('not a member')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family goals',
            });
        }
    },

    // Get family summary
    async getFamilySummary(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const summary = await familyDataService.getFamilySummary(userId, familyId);

            res.status(200).json({
                success: true,
                data: summary,
            });
        } catch (error: any) {
            logger.error('Error in getFamilySummary controller:', error);

            if (error.message.includes('not a member')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family summary',
            });
        }
    },
};
