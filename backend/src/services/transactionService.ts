import { Prisma, TransactionType } from '@prisma/client';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  PaginatedResponse
} from '@/types';
import { calculatePagination } from '@/utils/helpers';
import logger from '@/utils/logger';
import { MLService } from './mlService';

export class TransactionService {
  // Create transaction
  static async createTransaction(userId: string, data: CreateTransactionRequest) {
    try {
      // Try ML categorization if category not provided or low confidence
      let finalCategory = data.category;
      let mlConfidence = 0;

      if (!data.category || data.category === 'Other') {
        try {
          const mlPrediction = await MLService.predictCategory(userId, {
            description: data.description,
            amount: data.amount,
            date: data.date
          });

          if (mlPrediction && mlPrediction.confidence > 0.6) {
            finalCategory = mlPrediction.category;
            mlConfidence = mlPrediction.confidence;
            logger.info('ML categorization applied:', {
              category: finalCategory,
              confidence: mlConfidence
            });
          }
        } catch (error) {
          logger.warn('ML categorization failed, using provided category:', error);
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          date: new Date(data.date),
          description: data.description,
          amount: data.amount,
          category: finalCategory || data.category,
          type: data.type.toUpperCase() as TransactionType,
          source: data.source,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Update budget if it's an expense
      if (data.type === 'expense') {
        await this.updateBudgetSpending(userId, finalCategory || data.category, Math.abs(data.amount));
      }

      logger.info('Transaction created:', {
        transactionId: transaction.id,
        userId,
        amount: data.amount,
        type: data.type,
        mlCategorized: mlConfidence > 0
      });

      return transaction;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get transactions with filters and pagination
  static async getTransactions(
    userId: string,
    filters: TransactionFilters
  ): Promise<PaginatedResponse<any>> {
    try {
      const { page = 1, limit = 999999, search, category, type, startDate, endDate } = filters;
      const { offset } = calculatePagination(page, limit, 0);

      logger.info('📊 Transaction query params:', { page, limit, offset, filters });

      // Build where clause
      const where: Prisma.TransactionWhereInput = {
        userId,
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(category && { category }),
        ...(type && { type: type.toUpperCase() as TransactionType }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      // Get total count
      const total = await prisma.transaction.count({ where });
      logger.info('📈 Total transactions in DB:', { total, limit, willReturn: Math.min(total, limit) });

      // Get transactions - fetch ALL without pagination
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      logger.info('✅ Returning transactions:', { count: transactions.length, total });

      const pagination = calculatePagination(page, limit, total);

      return {
        data: transactions,
        pagination,
      };
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get transaction by ID
  static async getTransactionById(userId: string, transactionId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!transaction) {
        throw createError('Transaction not found', 404);
      }

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  // Update transaction
  static async updateTransaction(
    userId: string,
    transactionId: string,
    data: UpdateTransactionRequest
  ) {
    try {
      // Get existing transaction
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!existingTransaction) {
        throw createError('Transaction not found', 404);
      }

      // Update transaction
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...(data.date && { date: new Date(data.date) }),
          ...(data.description && { description: data.description }),
          ...(data.amount && { amount: data.amount }),
          ...(data.category && { category: data.category }),
          ...(data.type && { type: data.type.toUpperCase() as TransactionType }),
          ...(data.source && { source: data.source }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Update budget if category or amount changed
      if (data.category || data.amount) {
        const oldAmount = existingTransaction.amount;
        const newAmount = data.amount || oldAmount;
        const oldCategory = existingTransaction.category;
        const newCategory = data.category || oldCategory;

        // Revert old budget spending
        if (existingTransaction.type === 'EXPENSE') {
          await this.updateBudgetSpending(userId, oldCategory, -Math.abs(oldAmount));
        }

        // Apply new budget spending
        if (data.type === 'expense' || (data.type === undefined && existingTransaction.type === 'EXPENSE')) {
          await this.updateBudgetSpending(userId, newCategory, Math.abs(newAmount));
        }
      }

      logger.info('Transaction updated:', { transactionId, userId, updates: data });

      return transaction;
    } catch (error) {
      logger.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete transaction
  static async deleteTransaction(userId: string, transactionId: string) {
    try {
      // Get existing transaction
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!existingTransaction) {
        throw createError('Transaction not found', 404);
      }

      // Delete transaction
      await prisma.transaction.delete({
        where: { id: transactionId },
      });

      // Revert budget spending if it was an expense
      if (existingTransaction.type === 'EXPENSE') {
        const amount = existingTransaction.amount;
        await this.updateBudgetSpending(userId, existingTransaction.category, -Math.abs(amount));
      }

      logger.info('Transaction deleted:', { transactionId, userId });

      return { message: 'Transaction deleted successfully' };
    } catch (error) {
      logger.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transaction statistics
  static async getTransactionStats(userId: string, startDate?: string, endDate?: string) {
    try {
      const where: Prisma.TransactionWhereInput = {
        userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [totalIncome, totalExpenses, transactionCount] = await Promise.all([
        prisma.transaction.aggregate({
          where: { ...where, type: 'INCOME' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...where, type: 'EXPENSE' },
          _sum: { amount: true },
        }),
        prisma.transaction.count({ where }),
      ]);

      const income = totalIncome._sum.amount || 0;
      const expenses = Math.abs(totalExpenses._sum.amount || 0);
      const netIncome = income - expenses;
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      return {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        savingsRate,
        transactionCount,
      };
    } catch (error) {
      logger.error('Error getting transaction stats:', error);
      throw error;
    }
  }

  // Get spending by category
  static async getSpendingByCategory(userId: string, startDate?: string, endDate?: string) {
    try {
      const where: Prisma.TransactionWhereInput = {
        userId,
        type: 'EXPENSE',
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const categorySpending = await prisma.transaction.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
      });

      const totalExpenses = categorySpending.reduce(
        (sum, item) => sum + Math.abs(item._sum.amount || 0),
        0
      );

      return categorySpending.map(item => ({
        category: item.category,
        amount: Math.abs(item._sum.amount || 0),
        percentage: totalExpenses > 0
          ? (Math.abs(item._sum.amount || 0) / totalExpenses) * 100
          : 0,
        transactionCount: item._count.id,
      }));
    } catch (error) {
      logger.error('Error getting spending by category:', error);
      throw error;
    }
  }

  // Export transactions
  static async exportTransactions(userId: string, format: 'csv' | 'json', filters?: TransactionFilters) {
    try {
      const { data: transactions } = await this.getTransactions(userId, {
        ...filters,
        page: 1,
        limit: 10000, // Large limit for export
      });

      if (format === 'csv') {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Source'];
        const csvData = transactions.map(transaction => [
          transaction.date.toISOString().split('T')[0],
          transaction.description,
          transaction.category,
          transaction.amount.toString(),
          transaction.type.toLowerCase(),
          transaction.source,
        ]);

        return {
          headers,
          data: csvData,
          filename: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
        };
      }

      return {
        data: transactions,
        filename: `transactions-${new Date().toISOString().split('T')[0]}.json`,
      };
    } catch (error) {
      logger.error('Error exporting transactions:', error);
      throw error;
    }
  }

  // Helper method to update budget spending
  private static async updateBudgetSpending(userId: string, category: string, amount: number) {
    try {
      await prisma.budget.updateMany({
        where: {
          userId,
          category,
        },
        data: {
          spent: {
            increment: amount,
          },
        },
      });
    } catch (error) {
      logger.error('Error updating budget spending:', error);
      // Don't throw error here as it's a side effect
    }
  }

  // Bulk update category for all transactions
  static async bulkUpdateCategory(userId: string, oldCategory: string, newCategory: string) {
    try {
      const result = await prisma.transaction.updateMany({
        where: {
          userId,
          category: oldCategory,
        },
        data: {
          category: newCategory,
        },
      });

      logger.info('Bulk category update completed:', { userId, oldCategory, newCategory, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Error bulk updating category:', error);
      throw error;
    }
  }

  // Count transactions by category
  static async countByCategory(userId: string, category: string): Promise<number> {
    try {
      const count = await prisma.transaction.count({
        where: {
          userId,
          category,
        },
      });

      return count;
    } catch (error) {
      logger.error('Error counting transactions by category:', error);
      throw error;
    }
  }

  // Get unique category count
  static async getCategoryCount(userId: string, startDate?: string, endDate?: string): Promise<number> {
    try {
      const where: Prisma.TransactionWhereInput = {
        userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const categories = await prisma.transaction.findMany({
        where,
        select: {
          category: true,
        },
        distinct: ['category'],
      });

      return categories.length;
    } catch (error) {
      logger.error('Error getting category count:', error);
      throw error;
    }
  }

  // Get monthly trends with real data
  static async getMonthlyTrends(userId: string, months: number = 6) {
    try {
      const trends = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const stats = await this.getTransactionStats(
          userId,
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0]
        );

        trends.push({
          month: monthName,
          income: stats.totalIncome,
          expenses: stats.totalExpenses,
          savings: stats.netIncome,
          savingsRate: stats.savingsRate,
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error getting monthly trends:', error);
      throw error;
    }
  }
}
