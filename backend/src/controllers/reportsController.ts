import { Request, Response } from 'express';
import { TransactionService } from '@/services/transactionService';
import { BudgetService } from '@/services/budgetService';
import { GoalService } from '@/services/goalService';
import { AIService } from '@/services/aiService';
import { asyncHandler } from '@/middleware/errorHandler';
import { getDateRange } from '@/utils/helpers';
import logger from '@/utils/logger';

export class ReportsController {
    // Generate monthly report
    static generateMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { month, year } = req.query;

        // Calculate date range for the month
        const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();
        const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        // Get comprehensive data for the month
        const [stats, categoryBreakdown, budgets, goals] = await Promise.all([
            TransactionService.getTransactionStats(
                userId,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            ),
            TransactionService.getSpendingByCategory(
                userId,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            ),
            BudgetService.getBudgets(userId),
            GoalService.getGoals(userId),
        ]);

        // Get previous month for comparison
        const prevStartDate = new Date(targetYear, targetMonth - 1, 1);
        const prevEndDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const prevStats = await TransactionService.getTransactionStats(
            userId,
            prevStartDate.toISOString().split('T')[0],
            prevEndDate.toISOString().split('T')[0]
        );

        // Calculate changes
        const incomeChange = prevStats.totalIncome > 0
            ? ((stats.totalIncome - prevStats.totalIncome) / prevStats.totalIncome) * 100
            : 0;
        const expenseChange = prevStats.totalExpenses > 0
            ? ((stats.totalExpenses - prevStats.totalExpenses) / prevStats.totalExpenses) * 100
            : 0;

        // Generate AI recommendations for the month
        const recommendations = await AIService.generateMonthlyRecommendations(
            stats,
            categoryBreakdown,
            budgets,
            goals
        );

        res.json({
            success: true,
            message: 'Monthly report generated successfully',
            data: {
                period: {
                    month: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                },
                summary: {
                    totalIncome: stats.totalIncome,
                    totalExpenses: stats.totalExpenses,
                    netIncome: stats.netIncome,
                    savingsRate: stats.savingsRate,
                    transactionCount: stats.transactionCount,
                },
                comparison: {
                    incomeChange,
                    expenseChange,
                    savingsChange: stats.netIncome - prevStats.netIncome,
                },
                categoryBreakdown,
                budgetPerformance: budgets.map(budget => ({
                    category: budget.category,
                    limit: budget.limit,
                    spent: budget.spent,
                    remaining: budget.limit - budget.spent,
                    percentage: (budget.spent / budget.limit) * 100,
                    status: budget.spent > budget.limit ? 'over' : budget.spent > budget.limit * 0.8 ? 'warning' : 'good',
                })),
                goalProgress: goals.map(goal => ({
                    title: goal.title,
                    target: goal.target,
                    current: goal.current,
                    percentage: (goal.current / goal.target) * 100,
                    deadline: goal.deadline,
                    onTrack: goal.current >= goal.target * 0.5, // Simple heuristic
                })),
                recommendations,
            },
        });
    });

    // Generate category analysis report
    static generateCategoryReport = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { startDate, endDate, category } = req.query;

        const categoryData = await TransactionService.getSpendingByCategory(
            userId,
            startDate as string,
            endDate as string
        );

        // Get AI insights for category spending
        const insights = await AIService.generateCategoryInsights(categoryData);

        res.json({
            success: true,
            message: 'Category report generated successfully',
            data: {
                period: { startDate, endDate },
                categories: categoryData,
                insights,
                topCategories: categoryData.slice(0, 5),
                totalSpending: categoryData.reduce((sum, cat) => sum + cat.amount, 0),
            },
        });
    });

    // Generate trend analysis report
    static generateTrendReport = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { months = 6 } = req.query;

        const trends = await TransactionService.getMonthlyTrends(userId, parseInt(months as string));

        // Calculate trend direction
        const recentTrends = trends.slice(-3);
        const avgIncome = recentTrends.reduce((sum, t) => sum + t.income, 0) / recentTrends.length;
        const avgExpenses = recentTrends.reduce((sum, t) => sum + t.expenses, 0) / recentTrends.length;

        res.json({
            success: true,
            message: 'Trend analysis generated successfully',
            data: {
                trends,
                analysis: {
                    averageIncome: avgIncome,
                    averageExpenses: avgExpenses,
                    averageSavings: avgIncome - avgExpenses,
                    averageSavingsRate: avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0,
                },
                predictions: {
                    nextMonthIncome: avgIncome, // Simple prediction, can be enhanced
                    nextMonthExpenses: avgExpenses,
                    nextMonthSavings: avgIncome - avgExpenses,
                },
            },
        });
    });

    // Generate AI-powered insights and recommendations
    static generateAIReport = asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const { period = 'month' } = req.query;

        const { start, end } = getDateRange(period as any);

        const [stats, categoryData, budgets, goals] = await Promise.all([
            TransactionService.getTransactionStats(
                userId,
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            ),
            TransactionService.getSpendingByCategory(
                userId,
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            ),
            BudgetService.getBudgets(userId),
            GoalService.getGoals(userId),
        ]);

        // Generate comprehensive AI recommendations
        const [
            spendingRecommendations,
            budgetSuggestions,
            goalStrategies,
        ] = await Promise.all([
            AIService.analyzeSpendingPatterns(categoryData),
            AIService.generateBudgetSuggestions(stats, categoryData, budgets),
            AIService.generateGoalRecommendations(goals),
        ]);

        res.json({
            success: true,
            message: 'AI insights generated successfully',
            data: {
                period: {
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0],
                },
                spendingRecommendations,
                budgetSuggestions,
                goalStrategies,
                financialHealthScore: calculateFinancialHealthScore(stats, budgets, goals),
            },
        });
    });
}

// Helper function to calculate financial health score
function calculateFinancialHealthScore(stats: any, budgets: any[], goals: any[]): number {
    let score = 0;

    // Savings rate (40 points)
    score += Math.min(stats.savingsRate * 2, 40);

    // Budget adherence (30 points)
    const budgetAdherence = budgets.length > 0
        ? budgets.filter(b => b.spent <= b.limit).length / budgets.length * 30
        : 15;
    score += budgetAdherence;

    // Income stability (15 points)
    score += stats.totalIncome > 0 ? 15 : 0;

    // Expense control (15 points)
    const expenseRatio = stats.totalIncome > 0 ? (stats.totalExpenses / stats.totalIncome) : 1;
    score += expenseRatio < 0.7 ? 15 : expenseRatio < 0.9 ? 10 : 5;

    return Math.round(score);
}
