import { Request, Response } from 'express';
import { familyBudgetService } from '../services/familyBudgetService';
import { familyGoalService } from '../services/familyGoalService';
import logger from '@/utils/logger';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const familyFinanceController = {
    // ===== BUDGET ENDPOINTS =====

    async createFamilyBudget(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;
            const { category, limit, period } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const budget = await familyBudgetService.createFamilyBudget(userId, familyId, {
                category,
                limit,
                period,
            });

            res.status(201).json({
                success: true,
                message: 'Family budget created',
                data: budget,
            });
        } catch (error: any) {
            logger.error('Error in createFamilyBudget controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create family budget',
            });
        }
    },

    async getFamilyBudgets(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const budgets = await familyBudgetService.getFamilyBudgets(userId, familyId);

            res.status(200).json({
                success: true,
                data: budgets,
            });
        } catch (error: any) {
            logger.error('Error in getFamilyBudgets controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family budgets',
            });
        }
    },

    async updateFamilyBudget(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId, budgetId } = req.params;
            const { category, limit, period } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const budget = await familyBudgetService.updateFamilyBudget(userId, familyId, budgetId, {
                category,
                limit,
                period,
            });

            res.status(200).json({
                success: true,
                message: 'Family budget updated',
                data: budget,
            });
        } catch (error: any) {
            logger.error('Error in updateFamilyBudget controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update family budget',
            });
        }
    },

    async deleteFamilyBudget(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId, budgetId } = req.params;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            await familyBudgetService.deleteFamilyBudget(userId, familyId, budgetId);

            res.status(200).json({
                success: true,
                message: 'Family budget deleted',
            });
        } catch (error: any) {
            logger.error('Error in deleteFamilyBudget controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete family budget',
            });
        }
    },

    // ===== GOAL ENDPOINTS =====

    async createFamilyGoal(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;
            const { title, target, deadline, category } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const goal = await familyGoalService.createFamilyGoal(userId, familyId, {
                title,
                target,
                deadline: new Date(deadline),
                category,
            });

            res.status(201).json({
                success: true,
                message: 'Family goal created',
                data: goal,
            });
        } catch (error: any) {
            logger.error('Error in createFamilyGoal controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create family goal',
            });
        }
    },

    async getFamilyGoals(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const goals = await familyGoalService.getFamilyGoals(userId, familyId);

            res.status(200).json({
                success: true,
                data: goals,
            });
        } catch (error: any) {
            logger.error('Error in getFamilyGoals controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family goals',
            });
        }
    },

    async contributeToGoal(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId, goalId } = req.params;
            const { amount } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const result = await familyGoalService.contributeToGoal(userId, familyId, goalId, amount);

            res.status(200).json({
                success: true,
                message: 'Contribution added',
                data: result,
            });
        } catch (error: any) {
            logger.error('Error in contributeToGoal controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to contribute to goal',
            });
        }
    },

    async updateFamilyGoal(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId, goalId } = req.params;
            const { title, target, deadline, category } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const goal = await familyGoalService.updateFamilyGoal(userId, familyId, goalId, {
                title,
                target,
                deadline: deadline ? new Date(deadline) : undefined,
                category,
            });

            res.status(200).json({
                success: true,
                message: 'Family goal updated',
                data: goal,
            });
        } catch (error: any) {
            logger.error('Error in updateFamilyGoal controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update family goal',
            });
        }
    },

    async deleteFamilyGoal(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId, goalId } = req.params;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            await familyGoalService.deleteFamilyGoal(userId, familyId, goalId);

            res.status(200).json({
                success: true,
                message: 'Family goal deleted',
            });
        } catch (error: any) {
            logger.error('Error in deleteFamilyGoal controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({ success: false, message: error.message });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete family goal',
            });
        }
    },
};
