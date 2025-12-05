import { Request, Response } from 'express';
import { TransactionService } from '@/services/transactionService';
import { SMSService } from '@/services/smsService';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  SMSParseRequest
} from '@/types';
import prisma from '@/config/database';
import logger from '@/utils/logger';

export class TransactionController {
  // Create transaction
  static createTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: CreateTransactionRequest = req.body;

    const transaction = await TransactionService.createTransaction(userId, data);

    logger.info('Transaction created:', { transactionId: transaction.id, userId });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  });

  // Get transactions with filters
  static getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const filters: TransactionFilters = req.query;

    const result = await TransactionService.getTransactions(userId, filters);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get transaction by ID
  static getTransactionById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const transaction = await TransactionService.getTransactionById(userId, id);

    res.json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction,
    });
  });

  // Update transaction
  static updateTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data: UpdateTransactionRequest = req.body;

    const transaction = await TransactionService.updateTransaction(userId, id, data);

    logger.info('Transaction updated:', { transactionId: id, userId });

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  });

  // Delete transaction
  static deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await TransactionService.deleteTransaction(userId, id);

    logger.info('Transaction deleted:', { transactionId: id, userId });

    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get transaction statistics
  static getTransactionStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    const stats = await TransactionService.getTransactionStats(
      userId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: stats,
    });
  });

  // Get spending by category
  static getSpendingByCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    const spending = await TransactionService.getSpendingByCategory(
      userId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      message: 'Spending by category retrieved successfully',
      data: spending,
    });
  });

  // Parse SMS transaction
  static parseSMS = asyncHandler(async (req: Request, res: Response) => {
    const data: SMSParseRequest = req.body;

    // Validate SMS format
    if (!SMSService.validateSMSFormat(data.smsText)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SMS format. Please provide a valid bank SMS or transaction notification.',
      });
    }

    const parsedTransaction = await SMSService.parseSMS(data);

    logger.info('SMS parsed successfully:', {
      confidence: parsedTransaction.confidence,
      type: parsedTransaction.type,
      amount: parsedTransaction.amount
    });

    return res.json({
      success: true,
      message: 'SMS parsed successfully',
      data: parsedTransaction,
    });
  });

  // Create transaction from SMS
  static createFromSMS = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: SMSParseRequest = req.body;

    // Parse SMS
    const parsedTransaction = await SMSService.parseSMS(data);

    // Create transaction
    const transaction = await TransactionService.createTransaction(userId, {
      date: new Date().toISOString().split('T')[0],
      description: parsedTransaction.description,
      amount: parsedTransaction.amount,
      category: parsedTransaction.category,
      type: parsedTransaction.type,
      source: parsedTransaction.source,
    });

    logger.info('Transaction created from SMS:', {
      transactionId: transaction.id,
      userId,
      confidence: parsedTransaction.confidence
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created from SMS successfully',
      data: {
        transaction,
        confidence: parsedTransaction.confidence,
      },
    });
  });

  // Export all user data (transactions, budgets, goals)
  static exportTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { format = 'json' } = req.query;

    try {
      // Fetch all user data
      const [transactions, budgets, goals] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' }
        }),
        prisma.budget.findMany({
          where: { userId },
          orderBy: { category: 'asc' }
        }),
        prisma.goal.findMany({
          where: { userId },
          orderBy: { deadline: 'asc' }
        })
      ]);

      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        // JSON export with all data and detailed information
        const exportData = {
          exportDate: new Date().toISOString(),
          exportVersion: '1.0',
          user: { id: userId },
          data: {
            transactions: transactions.map(t => ({
              id: t.id,
              date: t.date,
              description: t.description,
              amount: t.amount,
              category: t.category,
              type: t.type,
              source: t.source,
              createdAt: t.createdAt,
              updatedAt: t.updatedAt
            })),
            budgets: budgets.map(b => ({
              id: b.id,
              category: b.category,
              limit: b.limit,
              spent: b.spent,
              remaining: b.limit - b.spent,
              percentageUsed: b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(2) : 0,
              period: b.period,
              status: b.spent > b.limit ? 'over' : b.spent > b.limit * 0.8 ? 'warning' : 'ok',
              createdAt: b.createdAt,
              updatedAt: b.updatedAt
            })),
            goals: goals.map(g => ({
              id: g.id,
              title: g.title,
              target: g.target,
              current: g.current,
              remaining: g.target - g.current,
              percentageComplete: g.target > 0 ? ((g.current / g.target) * 100).toFixed(2) : 0,
              deadline: g.deadline,
              daysRemaining: Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
              category: g.category,
              status: g.current >= g.target ? 'completed' : new Date(g.deadline) < new Date() ? 'overdue' : 'in-progress',
              createdAt: g.createdAt,
              updatedAt: g.updatedAt
            }))
          },
          summary: {
            totalTransactions: transactions.length,
            totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Math.abs(t.amount), 0),
            netBalance: transactions.reduce((sum, t) => sum + t.amount, 0),
            totalBudgets: budgets.length,
            budgetsOverLimit: budgets.filter(b => b.spent > b.limit).length,
            totalBudgetLimit: budgets.reduce((sum, b) => sum + b.limit, 0),
            totalBudgetSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
            totalGoals: goals.length,
            goalsCompleted: goals.filter(g => g.current >= g.target).length,
            totalGoalTarget: goals.reduce((sum, g) => sum + g.target, 0),
            totalGoalProgress: goals.reduce((sum, g) => sum + g.current, 0)
          }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="financial-data-${timestamp}.json"`);
        return res.json(exportData);
      } else {
        // CSV export - create separate sections with detailed data
        const csvLines: string[] = [];

        // Summary section
        csvLines.push('EXPORT SUMMARY');
        csvLines.push(`Export Date,${new Date().toISOString()}`);
        csvLines.push(`Total Transactions,${transactions.length}`);
        csvLines.push(`Total Income,${transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)}`);
        csvLines.push(`Total Expenses,${transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Math.abs(t.amount), 0)}`);
        csvLines.push(`Net Balance,${transactions.reduce((sum, t) => sum + t.amount, 0)}`);
        csvLines.push(`Total Budgets,${budgets.length}`);
        csvLines.push(`Total Goals,${goals.length}`);
        csvLines.push('');

        // Transactions section
        csvLines.push('TRANSACTIONS');
        csvLines.push('Date,Description,Amount,Category,Type,Source,Created At');
        transactions.forEach(t => {
          csvLines.push(`${t.date},"${t.description}",${t.amount},${t.category},${t.type},${t.source},${t.createdAt.toISOString()}`);
        });
        csvLines.push('');

        // Budgets section
        csvLines.push('BUDGETS');
        csvLines.push('Category,Limit,Spent,Remaining,% Used,Period,Status');
        budgets.forEach(b => {
          const remaining = b.limit - b.spent;
          const percentageUsed = b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(2) : '0';
          const status = b.spent > b.limit ? 'OVER' : b.spent > b.limit * 0.8 ? 'WARNING' : 'OK';
          csvLines.push(`${b.category},${b.limit},${b.spent},${remaining},${percentageUsed}%,${b.period},${status}`);
        });
        csvLines.push('');

        // Goals section
        csvLines.push('GOALS');
        csvLines.push('Title,Target,Current,Remaining,% Complete,Deadline,Days Remaining,Category,Status');
        goals.forEach(g => {
          const remaining = g.target - g.current;
          const percentageComplete = g.target > 0 ? ((g.current / g.target) * 100).toFixed(2) : '0';
          const daysRemaining = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const status = g.current >= g.target ? 'COMPLETED' : new Date(g.deadline) < new Date() ? 'OVERDUE' : 'IN-PROGRESS';
          csvLines.push(`"${g.title}",${g.target},${g.current},${remaining},${percentageComplete}%,${g.deadline},${daysRemaining},${g.category},${status}`);
        });

        const csvContent = csvLines.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="financial-data-${timestamp}.csv"`);
        return res.send(csvContent);
      }
    } catch (error) {
      logger.error('Export error:', error);
      throw error;
    }
  });

  // Get supported SMS patterns
  static getSupportedSMSPatterns = asyncHandler(async (req: Request, res: Response) => {
    const patterns = SMSService.getSupportedPatterns();

    res.json({
      success: true,
      message: 'Supported SMS patterns retrieved successfully',
      data: patterns,
    });
  });
}
