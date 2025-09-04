import { Prisma, AlertType } from '@prisma/client';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { CreateAlertRequest } from '@/types';
import logger from '@/utils/logger';

export class AlertService {
  // Create alert
  static async createAlert(userId: string, data: CreateAlertRequest) {
    try {
      const alert = await prisma.alert.create({
        data: {
          userId,
          type: data.type.toUpperCase() as AlertType,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
        },
      });

      logger.info('Alert created:', { 
        alertId: alert.id, 
        userId, 
        type: data.type,
        title: data.title 
      });

      return alert;
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  // Get alerts
  static async getAlerts(userId: string, unreadOnly: boolean = false) {
    try {
      const where: Prisma.AlertWhereInput = {
        userId,
        ...(unreadOnly && { read: false }),
      };

      const alerts = await prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return alerts;
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      throw error;
    }
  }

  // Get alert by ID
  static async getAlertById(userId: string, alertId: string) {
    try {
      const alert = await prisma.alert.findFirst({
        where: {
          id: alertId,
          userId,
        },
      });

      if (!alert) {
        throw createError('Alert not found', 404);
      }

      return alert;
    } catch (error) {
      throw error;
    }
  }

  // Mark alert as read
  static async markAsRead(userId: string, alertId: string) {
    try {
      const alert = await prisma.alert.findFirst({
        where: {
          id: alertId,
          userId,
        },
      });

      if (!alert) {
        throw createError('Alert not found', 404);
      }

      const updatedAlert = await prisma.alert.update({
        where: { id: alertId },
        data: { read: true },
      });

      logger.info('Alert marked as read:', { alertId, userId });

      return updatedAlert;
    } catch (error) {
      logger.error('Error marking alert as read:', error);
      throw error;
    }
  }

  // Mark all alerts as read
  static async markAllAsRead(userId: string) {
    try {
      await prisma.alert.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });

      logger.info('All alerts marked as read:', { userId });

      return { message: 'All alerts marked as read' };
    } catch (error) {
      logger.error('Error marking all alerts as read:', error);
      throw error;
    }
  }

  // Delete alert
  static async deleteAlert(userId: string, alertId: string) {
    try {
      const alert = await prisma.alert.findFirst({
        where: {
          id: alertId,
          userId,
        },
      });

      if (!alert) {
        throw createError('Alert not found', 404);
      }

      await prisma.alert.delete({
        where: { id: alertId },
      });

      logger.info('Alert deleted:', { alertId, userId });

      return { message: 'Alert deleted successfully' };
    } catch (error) {
      logger.error('Error deleting alert:', error);
      throw error;
    }
  }

  // Clear all alerts
  static async clearAllAlerts(userId: string) {
    try {
      await prisma.alert.deleteMany({
        where: { userId },
      });

      logger.info('All alerts cleared:', { userId });

      return { message: 'All alerts cleared' };
    } catch (error) {
      logger.error('Error clearing all alerts:', error);
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.alert.count({
        where: {
          userId,
          read: false,
        },
      });

      return { unreadCount: count };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Create budget alert
  static async createBudgetAlert(
    userId: string, 
    category: string, 
    type: 'exceeded' | 'warning' | 'near-limit',
    details: any
  ) {
    try {
      let title = '';
      let message = '';

      switch (type) {
        case 'exceeded':
          title = 'Budget Exceeded';
          message = `Your ${category} budget has been exceeded by $${details.overAmount.toFixed(2)}`;
          break;
        case 'warning':
          title = 'Budget Warning';
          message = `Your ${category} budget is at ${details.percentage.toFixed(1)}% of the limit`;
          break;
        case 'near-limit':
          title = 'Budget Alert';
          message = `Your ${category} budget is approaching the limit (${details.percentage.toFixed(1)}%)`;
          break;
      }

      return await this.createAlert(userId, {
        type: type === 'exceeded' ? 'error' : 'warning',
        title,
        message,
        actionUrl: `/budget?category=${encodeURIComponent(category)}`,
      });
    } catch (error) {
      logger.error('Error creating budget alert:', error);
      throw error;
    }
  }

  // Create goal alert
  static async createGoalAlert(
    userId: string,
    goalId: string,
    goalTitle: string,
    type: 'achieved' | 'overdue' | 'urgent' | 'reminder',
    details: any
  ) {
    try {
      let title = '';
      let message = '';

      switch (type) {
        case 'achieved':
          title = 'Goal Achieved!';
          message = `Congratulations! You've achieved your goal "${goalTitle}"`;
          break;
        case 'overdue':
          title = 'Goal Overdue';
          message = `Your goal "${goalTitle}" is overdue by ${details.daysOverdue} days`;
          break;
        case 'urgent':
          title = 'Goal Urgent';
          message = `Your goal "${goalTitle}" is due in ${details.daysLeft} days but only ${details.percentage.toFixed(1)}% complete`;
          break;
        case 'reminder':
          title = 'Goal Reminder';
          message = `Your goal "${goalTitle}" is due in ${details.daysLeft} days and is ${details.percentage.toFixed(1)}% complete`;
          break;
      }

      return await this.createAlert(userId, {
        type: type === 'achieved' ? 'success' : type === 'overdue' ? 'error' : 'warning',
        title,
        message,
        actionUrl: `/goals?id=${goalId}`,
      });
    } catch (error) {
      logger.error('Error creating goal alert:', error);
      throw error;
    }
  }

  // Create transaction alert
  static async createTransactionAlert(
    userId: string,
    type: 'large-expense' | 'large-income' | 'unusual-spending',
    details: any
  ) {
    try {
      let title = '';
      let message = '';

      switch (type) {
        case 'large-expense':
          title = 'Large Expense';
          message = `A large expense of $${details.amount.toFixed(2)} has been recorded for ${details.category}`;
          break;
        case 'large-income':
          title = 'Large Income';
          message = `A large income of $${details.amount.toFixed(2)} has been recorded from ${details.source}`;
          break;
        case 'unusual-spending':
          title = 'Unusual Spending Pattern';
          message = `Unusual spending detected: ${details.message}`;
          break;
      }

      return await this.createAlert(userId, {
        type: 'info',
        title,
        message,
        actionUrl: '/transactions',
      });
    } catch (error) {
      logger.error('Error creating transaction alert:', error);
      throw error;
    }
  }

  // Create savings milestone alert
  static async createSavingsMilestoneAlert(userId: string, milestone: string, amount: number) {
    try {
      return await this.createAlert(userId, {
        type: 'success',
        title: 'Savings Milestone',
        message: `Congratulations! You've reached a savings milestone: ${milestone} ($${amount.toFixed(2)})`,
        actionUrl: '/analytics',
      });
    } catch (error) {
      logger.error('Error creating savings milestone alert:', error);
      throw error;
    }
  }
}
