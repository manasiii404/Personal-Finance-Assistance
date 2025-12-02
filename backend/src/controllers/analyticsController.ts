import { Request, Response } from 'express';
import { TransactionService } from '@/services/transactionService';
import { BudgetService } from '@/services/budgetService';
import { GoalService } from '@/services/goalService';
import { AIService } from '@/services/aiService';
import { asyncHandler } from '@/middleware/errorHandler';
import { AnalyticsFilters } from '@/types';
import { getDateRange } from '@/utils/helpers';
import logger from '@/utils/logger';

export class AnalyticsController {
  // Get financial insights
  static getFinancialInsights = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { period = 'month' } = req.query;

    // Get date range based on period
    const { start, end } = getDateRange(period as any);

    // Get transaction statistics
    const transactionStats = await TransactionService.getTransactionStats(
      userId,
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );

    // Get spending by category
    const spendingByCategory = await TransactionService.getSpendingByCategory(
      userId,
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );

    // Get budget alerts
    const budgetAlerts = await BudgetService.getBudgetAlerts(userId);

    // Get goal progress
    const goalStats = await GoalService.getGoalStats(userId);

    // Generate monthly trends (mock data for now)
    const monthlyTrends = [
      {
        month: 'Oct 2024',
        income: 4500,
        expenses: 3200,
        savings: 1300,
        savingsRate: 28.9,
      },
      {
        month: 'Nov 2024',
        income: 4800,
        expenses: 3500,
        savings: 1300,
        savingsRate: 27.1,
      },
      {
        month: 'Dec 2024',
        income: 5200,
        expenses: 3800,
        savings: 1400,
        savingsRate: 26.9,
      },
      {
        month: 'Jan 2025',
        income: transactionStats.totalIncome,
        expenses: transactionStats.totalExpenses,
        savings: transactionStats.netIncome,
        savingsRate: transactionStats.savingsRate,
      },
    ];

    // Generate AI insights
    const insights = await AIService.generateInsights(
      transactionStats.totalIncome,
      transactionStats.totalExpenses,
      spendingByCategory,
      monthlyTrends,
      budgetAlerts.map(alert => alert.message),
      {
        completed: goalStats.completedGoals,
        total: goalStats.totalGoals,
        percentage: goalStats.overallProgress,
      }
    );

    res.json({
      success: true,
      message: 'Financial insights retrieved successfully',
      data: insights,
    });
  });

  // Get spending analysis
  static getSpendingAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate } = req.query;

    const spendingByCategory = await TransactionService.getSpendingByCategory(
      userId,
      startDate as string,
      endDate as string
    );

    // Generate AI analysis
    const analysis = await AIService.analyzeSpendingPatterns(spendingByCategory);

    res.json({
      success: true,
      message: 'Spending analysis retrieved successfully',
      data: {
        spendingByCategory,
        analysis,
      },
    });
  });

  // Get goal recommendations
  static getGoalRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const goals = await GoalService.getGoals(userId);

    // Generate AI recommendations
    const recommendations = await AIService.generateGoalRecommendations(goals);

    res.json({
      success: true,
      message: 'Goal recommendations retrieved successfully',
      data: {
        goals,
        recommendations,
      },
    });
  });

  // Get monthly trends
  static getMonthlyTrends = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { months = 6 } = req.query;
    const monthsCount = parseInt(months as string);

    const trends = [];
    const currentDate = new Date();

    // Fetch all transactions for the time period
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsCount + 1, 1);
    const allTransactions = await TransactionService.getTransactions(userId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: currentDate.toISOString().split('T')[0],
      page: 1,
      limit: 10000,
    });

    // Group transactions by month
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      // Filter transactions for this month
      const monthTransactions = allTransactions.data.filter((t: any) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      // Calculate income and expenses for this month
      const income = monthTransactions
        .filter((t: any) => t.type.toUpperCase() === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const expenses = Math.abs(monthTransactions
        .filter((t: any) => t.type.toUpperCase() === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0));

      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      trends.push({
        month: monthName,
        income,
        expenses,
        savings,
        savingsRate,
      });
    }

    logger.info(`Monthly trends calculated for user ${userId}: ${trends.length} months`);

    res.json({
      success: true,
      message: 'Monthly trends retrieved successfully',
      data: trends,
    });
  });

  // Get category breakdown
  static getCategoryBreakdown = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { startDate, endDate, type } = req.query;

    let spendingByCategory;
    const isIncome = type && (type as string).toLowerCase() === 'income';

    if (isIncome) {
      // Get income by category
      const transactions = await TransactionService.getTransactions(userId, {
        startDate: startDate as string,
        endDate: endDate as string,
        type: 'income',  // Lowercase - TransactionService converts to uppercase internally
        page: 1,
        limit: 1000,
      });

      const incomeByCategory = transactions.data.reduce((acc: any, transaction: any) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = { amount: 0, count: 0 };
        }
        acc[transaction.category].amount += transaction.amount;
        acc[transaction.category].count += 1;
        return acc;
      }, {});

      spendingByCategory = Object.entries(incomeByCategory).map(([category, data]: [string, any]) => ({
        category,
        amount: data.amount,
        percentage: 0, // Will be calculated
        transactionCount: data.count,
      }));
    } else {
      spendingByCategory = await TransactionService.getSpendingByCategory(
        userId,
        startDate as string,
        endDate as string
      );
    }

    // Calculate percentages
    const total = spendingByCategory.reduce((sum, item) => sum + item.amount, 0);
    spendingByCategory.forEach(item => {
      item.percentage = total > 0 ? (item.amount / total) * 100 : 0;
    });

    res.json({
      success: true,
      message: 'Category breakdown retrieved successfully',
      data: spendingByCategory,
    });
  });

  // Export analytics report
  static exportAnalyticsReport = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { format = 'json', startDate, endDate } = req.query;

    // Get comprehensive analytics data
    const transactionStats = await TransactionService.getTransactionStats(
      userId,
      startDate as string,
      endDate as string
    );

    const spendingByCategory = await TransactionService.getSpendingByCategory(
      userId,
      startDate as string,
      endDate as string
    );

    const budgetStats = await BudgetService.getBudgetStats(userId);
    const goalStats = await GoalService.getGoalStats(userId);

    const reportData = {
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
      },
      summary: transactionStats,
      spendingByCategory,
      budgetStats,
      goalStats,
      generatedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(reportData);
    } else {
      // For CSV format, we'd need to flatten the data
      res.status(400).json({
        success: false,
        message: 'CSV format not supported for analytics reports. Use JSON format.',
      });
    }
  });
}
