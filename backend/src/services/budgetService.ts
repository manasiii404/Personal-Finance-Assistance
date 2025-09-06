import { Prisma, BudgetPeriod } from '@prisma/client';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { 
  CreateBudgetRequest, 
  UpdateBudgetRequest 
} from '@/types';
import logger from '@/utils/logger';

export class BudgetService {
  // Create budget
  static async createBudget(userId: string, data: CreateBudgetRequest) {
    try {
      // Check if budget already exists for this category and period
      const existingBudget = await prisma.budget.findFirst({
        where: {
          userId,
          category: data.category,
          period: data.period.toUpperCase() as BudgetPeriod,
        },
      });

      if (existingBudget) {
        throw createError('Budget already exists for this category and period', 409);
      }

      const budget = await prisma.budget.create({
        data: {
          userId,
          category: data.category,
          limit: data.limit,
          spent: 0,
          period: data.period.toUpperCase() as BudgetPeriod,
        },
      });

      logger.info('Budget created:', { 
        budgetId: budget.id, 
        userId, 
        category: data.category,
        limit: data.limit 
      });

      return budget;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw createError('Budget already exists for this category and period', 409);
        }
      }
      throw error;
    }
  }

  // Get budgets
  static async getBudgets(userId: string, period?: string) {
    try {
      const where: Prisma.BudgetWhereInput = {
        userId,
        ...(period && { period: period.toUpperCase() as BudgetPeriod }),
      };

      const budgets = await prisma.budget.findMany({
        where,
        orderBy: { category: 'asc' },
      });

      return budgets;
    } catch (error) {
      logger.error('Error fetching budgets:', error);
      throw error;
    }
  }

  // Get budget by ID
  static async getBudgetById(userId: string, budgetId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: {
          id: budgetId,
          userId,
        },
      });

      if (!budget) {
        throw createError('Budget not found', 404);
      }

      return budget;
    } catch (error) {
      throw error;
    }
  }

  // Update budget
  static async updateBudget(userId: string, budgetId: string, data: UpdateBudgetRequest) {
    try {
      // Check if budget exists
      const existingBudget = await prisma.budget.findFirst({
        where: {
          id: budgetId,
          userId,
        },
      });

      if (!existingBudget) {
        throw createError('Budget not found', 404);
      }

      // Check if new category and period combination already exists
      if (data.category && data.period) {
        const conflictingBudget = await prisma.budget.findFirst({
          where: {
            userId,
            category: data.category,
            period: data.period.toUpperCase() as BudgetPeriod,
            id: { not: budgetId },
          },
        });

        if (conflictingBudget) {
          throw createError('Budget already exists for this category and period', 409);
        }
      }

      const budget = await prisma.budget.update({
        where: { id: budgetId },
        data: {
          ...(data.category && { category: data.category }),
          ...(data.limit && { limit: data.limit }),
          ...(data.period && { period: data.period.toUpperCase() as BudgetPeriod }),
        },
      });

      logger.info('Budget updated:', { budgetId, userId, updates: data });

      return budget;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw createError('Budget already exists for this category and period', 409);
        }
      }
      throw error;
    }
  }

  // Delete budget
  static async deleteBudget(userId: string, budgetId: string) {
    try {
      const budget = await prisma.budget.findFirst({
        where: {
          id: budgetId,
          userId,
        },
      });

      if (!budget) {
        throw createError('Budget not found', 404);
      }

      await prisma.budget.delete({
        where: { id: budgetId },
      });

      logger.info('Budget deleted:', { budgetId, userId });

      return { message: 'Budget deleted successfully' };
    } catch (error) {
      logger.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Get budget statistics
  static async getBudgetStats(userId: string, period?: string) {
    try {
      const where: Prisma.BudgetWhereInput = {
        userId,
        ...(period && { period: period.toUpperCase() as BudgetPeriod }),
      };

      const budgets = await prisma.budget.findMany({ where });

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
      const remainingBudget = totalBudget - totalSpent;

      // Get overspent budgets
      const overspentBudgets = budgets.filter(
        budget => budget.spent > budget.limit
      );

      // Get budgets near limit (>80%)
      const nearLimitBudgets = budgets.filter(budget => {
        const percentage = (budget.spent / budget.limit) * 100;
        return percentage > 80 && percentage <= 100;
      });

      return {
        totalBudget,
        totalSpent,
        remainingBudget,
        overspentCount: overspentBudgets.length,
        nearLimitCount: nearLimitBudgets.length,
        budgets: budgets.map(budget => ({
          ...budget,
          percentage: (budget.spent / budget.limit) * 100,
          isOverBudget: budget.spent > budget.limit,
          isNearLimit: (budget.spent / budget.limit) * 100 > 80,
        })),
      };
    } catch (error) {
      logger.error('Error getting budget stats:', error);
      throw error;
    }
  }

  // Reset budget spending (useful for new periods)
  static async resetBudgetSpending(userId: string, period?: string) {
    try {
      const where: Prisma.BudgetWhereInput = {
        userId,
        ...(period && { period: period.toUpperCase() as BudgetPeriod }),
      };

      await prisma.budget.updateMany({
        where,
        data: {
          spent: 0,
        },
      });

      logger.info('Budget spending reset:', { userId, period });

      return { message: 'Budget spending reset successfully' };
    } catch (error) {
      logger.error('Error resetting budget spending:', error);
      throw error;
    }
  }

  // Get budget alerts
  static async getBudgetAlerts(userId: string) {
    try {
      const budgets = await prisma.budget.findMany({
        where: { userId },
        orderBy: { category: 'asc' },
      });

      const alerts = [];

      for (const budget of budgets) {
        const limit = budget.limit;
        const spent = budget.spent;
        const percentage = (spent / limit) * 100;

        if (spent > limit) {
          alerts.push({
            type: 'error',
            title: 'Budget Exceeded',
            message: `${budget.category} budget is over by $${(spent - limit).toFixed(2)}`,
            category: budget.category,
            amount: spent - limit,
          });
        } else if (percentage > 90) {
          alerts.push({
            type: 'warning',
            title: 'Budget Warning',
            message: `${budget.category} budget is at ${percentage.toFixed(1)}% of limit`,
            category: budget.category,
            percentage,
          });
        } else if (percentage > 80) {
          alerts.push({
            type: 'info',
            title: 'Budget Alert',
            message: `${budget.category} budget is at ${percentage.toFixed(1)}% of limit`,
            category: budget.category,
            percentage,
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting budget alerts:', error);
      throw error;
    }
  }
}
