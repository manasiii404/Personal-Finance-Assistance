import { Prisma } from '@prisma/client';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { 
  CreateGoalRequest, 
  UpdateGoalRequest,
  AddContributionRequest 
} from '@/types';
import { daysBetween } from '@/utils/helpers';
import logger from '@/utils/logger';

export class GoalService {
  // Create goal
  static async createGoal(userId: string, data: CreateGoalRequest) {
    try {
      const goal = await prisma.goal.create({
        data: {
          userId,
          title: data.title,
          target: data.target,
          current: 0,
          deadline: new Date(data.deadline),
          category: data.category,
        },
      });

      logger.info('Goal created:', { 
        goalId: goal.id, 
        userId, 
        title: data.title,
        target: data.target 
      });

      return goal;
    } catch (error) {
      logger.error('Error creating goal:', error);
      throw error;
    }
  }

  // Get goals
  static async getGoals(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { deadline: 'asc' },
      });

      return goals.map(goal => ({
        ...goal,
        daysLeft: daysBetween(new Date(), goal.deadline),
        percentage: (goal.current / goal.target) * 100,
        isCompleted: goal.current >= goal.target,
        isOverdue: new Date() > goal.deadline && goal.current < goal.target,
      }));
    } catch (error) {
      logger.error('Error fetching goals:', error);
      throw error;
    }
  }

  // Get goal by ID
  static async getGoalById(userId: string, goalId: string) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId,
        },
      });

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      return {
        ...goal,
        daysLeft: daysBetween(new Date(), goal.deadline),
        percentage: (goal.current / goal.target) * 100,
        isCompleted: goal.current >= goal.target,
        isOverdue: new Date() > goal.deadline && goal.current < goal.target,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update goal
  static async updateGoal(userId: string, goalId: string, data: UpdateGoalRequest) {
    try {
      const existingGoal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId,
        },
      });

      if (!existingGoal) {
        throw createError('Goal not found', 404);
      }

      const goal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.target && { target: data.target }),
          ...(data.deadline && { deadline: new Date(data.deadline) }),
          ...(data.category && { category: data.category }),
        },
      });

      logger.info('Goal updated:', { goalId, userId, updates: data });

      return {
        ...goal,
        daysLeft: daysBetween(new Date(), goal.deadline),
        percentage: (goal.current / goal.target) * 100,
        isCompleted: goal.current >= goal.target,
        isOverdue: new Date() > goal.deadline && goal.current < goal.target,
      };
    } catch (error) {
      logger.error('Error updating goal:', error);
      throw error;
    }
  }

  // Add contribution to goal
  static async addContribution(userId: string, goalId: string, data: AddContributionRequest) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId,
        },
      });

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      const currentAmount = goal.current;
      const newAmount = currentAmount + data.amount;

      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          current: newAmount,
        },
      });

      const isCompleted = newAmount >= goal.target;

      logger.info('Contribution added to goal:', { 
        goalId, 
        userId, 
        amount: data.amount,
        newTotal: newAmount,
        isCompleted 
      });

      return {
        ...updatedGoal,
        daysLeft: daysBetween(new Date(), updatedGoal.deadline),
        percentage: (updatedGoal.current / updatedGoal.target) * 100,
        isCompleted,
        isOverdue: new Date() > updatedGoal.deadline && !isCompleted,
        contributionAdded: data.amount,
      };
    } catch (error) {
      logger.error('Error adding contribution to goal:', error);
      throw error;
    }
  }

  // Delete goal
  static async deleteGoal(userId: string, goalId: string) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId,
        },
      });

      if (!goal) {
        throw createError('Goal not found', 404);
      }

      await prisma.goal.delete({
        where: { id: goalId },
      });

      logger.info('Goal deleted:', { goalId, userId });

      return { message: 'Goal deleted successfully' };
    } catch (error) {
      logger.error('Error deleting goal:', error);
      throw error;
    }
  }

  // Get goal statistics
  static async getGoalStats(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
      });

      const totalGoals = goals.length;
      const completedGoals = goals.filter(
        goal => goal.current >= goal.target
      ).length;
      const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
      const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0);
      const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

      // Goals by status
      const goalsByStatus = goals.map(goal => {
        const daysLeft = daysBetween(new Date(), goal.deadline);
        const percentage = (goal.current / goal.target) * 100;
        const isCompleted = goal.current >= goal.target;
        const isOverdue = new Date() > goal.deadline && !isCompleted;

        let status = 'on-track';
        if (isCompleted) status = 'completed';
        else if (isOverdue) status = 'overdue';
        else if (daysLeft <= 30) status = 'urgent';

        return {
          ...goal,
          daysLeft,
          percentage,
          isCompleted,
          isOverdue,
          status,
        };
      });

      return {
        totalGoals,
        completedGoals,
        totalTarget,
        totalCurrent,
        overallProgress,
        goalsByStatus,
      };
    } catch (error) {
      logger.error('Error getting goal stats:', error);
      throw error;
    }
  }

  // Get goal alerts
  static async getGoalAlerts(userId: string) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
      });

      const alerts = [];

      for (const goal of goals) {
        const daysLeft = daysBetween(new Date(), goal.deadline);
        const percentage = (goal.current / goal.target) * 100;
        const isCompleted = goal.current >= goal.target;
        const isOverdue = new Date() > goal.deadline && !isCompleted;

        if (isCompleted) {
          alerts.push({
            type: 'success',
            title: 'Goal Achieved!',
            message: `Congratulations! You've achieved your goal "${goal.title}"`,
            goalId: goal.id,
            goalTitle: goal.title,
          });
        } else if (isOverdue) {
          alerts.push({
            type: 'error',
            title: 'Goal Overdue',
            message: `Your goal "${goal.title}" is overdue by ${Math.abs(daysLeft)} days`,
            goalId: goal.id,
            goalTitle: goal.title,
            daysOverdue: Math.abs(daysLeft),
          });
        } else if (daysLeft <= 7 && percentage < 50) {
          alerts.push({
            type: 'warning',
            title: 'Goal Urgent',
            message: `Your goal "${goal.title}" is due in ${daysLeft} days but only ${percentage.toFixed(1)}% complete`,
            goalId: goal.id,
            goalTitle: goal.title,
            daysLeft,
            percentage,
          });
        } else if (daysLeft <= 30 && percentage < 75) {
          alerts.push({
            type: 'info',
            title: 'Goal Reminder',
            message: `Your goal "${goal.title}" is due in ${daysLeft} days and is ${percentage.toFixed(1)}% complete`,
            goalId: goal.id,
            goalTitle: goal.title,
            daysLeft,
            percentage,
          });
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting goal alerts:', error);
      throw error;
    }
  }

  // Get goals by category
  static async getGoalsByCategory(userId: string) {
    try {
      const goals = await prisma.goal.groupBy({
        by: ['category'],
        where: { userId },
        _sum: { target: true, current: true },
        _count: { id: true },
        orderBy: { _sum: { target: 'desc' } },
      });

      return goals.map(group => ({
        category: group.category,
        totalTarget: group._sum.target || 0,
        totalCurrent: group._sum.current || 0,
        goalCount: group._count.id,
        progress: (group._sum.target || 0) > 0 
          ? ((group._sum.current || 0) / (group._sum.target || 0)) * 100 
          : 0,
      }));
    } catch (error) {
      logger.error('Error getting goals by category:', error);
      throw error;
    }
  }
}
