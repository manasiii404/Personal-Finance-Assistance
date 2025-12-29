import { Parser } from 'json2csv';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

export interface ExportOptions {
    userId: string;
    format: 'csv' | 'json';
    dataType: 'transactions' | 'budgets' | 'goals' | 'all';
    startDate?: Date;
    endDate?: Date;
    category?: string;
    type?: 'INCOME' | 'EXPENSE';
}

export class ExportService {
    /**
     * Export user data in specified format
     */
    static async exportData(options: ExportOptions): Promise<{ data: string; filename: string; mimeType: string }> {
        try {
            const { userId, format, dataType, startDate, endDate, category, type } = options;

            let exportData: any = {};
            let filename = '';

            // Fetch data based on type
            switch (dataType) {
                case 'transactions':
                    exportData = await this.getTransactions(userId, { startDate, endDate, category, type });
                    filename = `transactions_${new Date().toISOString().split('T')[0]}`;
                    break;

                case 'budgets':
                    exportData = await this.getBudgets(userId);
                    filename = `budgets_${new Date().toISOString().split('T')[0]}`;
                    break;

                case 'goals':
                    exportData = await this.getGoals(userId);
                    filename = `goals_${new Date().toISOString().split('T')[0]}`;
                    break;

                case 'all':
                    exportData = {
                        transactions: await this.getTransactions(userId, { startDate, endDate }),
                        budgets: await this.getBudgets(userId),
                        goals: await this.getGoals(userId),
                    };
                    filename = `financial_data_${new Date().toISOString().split('T')[0]}`;
                    break;

                default:
                    throw createError('Invalid data type for export', 400);
            }

            // Format data based on requested format
            if (format === 'csv') {
                return this.generateCSV(exportData, filename, dataType);
            } else if (format === 'json') {
                return this.generateJSON(exportData, filename);
            } else {
                throw createError('Invalid export format', 400);
            }
        } catch (error) {
            logger.error('Export data error:', error);
            throw error;
        }
    }

    /**
     * Get transactions for export
     */
    private static async getTransactions(
        userId: string,
        filters: { startDate?: Date; endDate?: Date; category?: string; type?: 'INCOME' | 'EXPENSE' }
    ) {
        const where: any = { userId };

        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate) where.date.gte = filters.startDate;
            if (filters.endDate) where.date.lte = filters.endDate;
        }

        if (filters.category) {
            where.category = filters.category;
        }

        if (filters.type) {
            where.type = filters.type;
        }

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            select: {
                id: true,
                date: true,
                description: true,
                amount: true,
                category: true,
                type: true,
                source: true,
                createdAt: true,
            },
        });

        return transactions.map(t => ({
            id: t.id,
            date: t.date.toISOString().split('T')[0],
            description: t.description,
            amount: t.amount,
            category: t.category,
            type: t.type,
            source: t.source,
            createdAt: t.createdAt.toISOString(),
        }));
    }

    /**
     * Get budgets for export
     */
    private static async getBudgets(userId: string) {
        const budgets = await prisma.budget.findMany({
            where: { userId },
            select: {
                id: true,
                category: true,
                limit: true,
                spent: true,
                period: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return budgets.map(b => ({
            id: b.id,
            category: b.category,
            limit: b.limit,
            spent: b.spent,
            period: b.period,
            remaining: b.limit - b.spent,
            percentageUsed: ((b.spent / b.limit) * 100).toFixed(2),
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
        }));
    }

    /**
     * Get goals for export
     */
    private static async getGoals(userId: string) {
        const goals = await prisma.goal.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                target: true,
                current: true,
                deadline: true,
                category: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return goals.map(g => ({
            id: g.id,
            title: g.title,
            target: g.target,
            current: g.current,
            deadline: g.deadline.toISOString().split('T')[0],
            category: g.category,
            remaining: g.target - g.current,
            percentageComplete: ((g.current / g.target) * 100).toFixed(2),
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
        }));
    }

    /**
     * Generate CSV format
     */
    private static generateCSV(data: any, filename: string, dataType: string): { data: string; filename: string; mimeType: string } {
        try {
            let csvData: string;

            if (dataType === 'all') {
                // For 'all', create separate sections
                const sections = [];

                if (data.transactions && data.transactions.length > 0) {
                    const transactionsParser = new Parser({ fields: Object.keys(data.transactions[0]) });
                    sections.push('TRANSACTIONS\n' + transactionsParser.parse(data.transactions));
                }

                if (data.budgets && data.budgets.length > 0) {
                    const budgetsParser = new Parser({ fields: Object.keys(data.budgets[0]) });
                    sections.push('\n\nBUDGETS\n' + budgetsParser.parse(data.budgets));
                }

                if (data.goals && data.goals.length > 0) {
                    const goalsParser = new Parser({ fields: Object.keys(data.goals[0]) });
                    sections.push('\n\nGOALS\n' + goalsParser.parse(data.goals));
                }

                csvData = sections.join('\n');
            } else {
                // Single data type
                if (!Array.isArray(data) || data.length === 0) {
                    throw createError('No data available to export', 404);
                }

                const parser = new Parser({ fields: Object.keys(data[0]) });
                csvData = parser.parse(data);
            }

            return {
                data: csvData,
                filename: `${filename}.csv`,
                mimeType: 'text/csv',
            };
        } catch (error) {
            logger.error('CSV generation error:', error);
            throw createError('Failed to generate CSV', 500);
        }
    }

    /**
     * Generate JSON format
     */
    private static generateJSON(data: any, filename: string): { data: string; filename: string; mimeType: string } {
        try {
            const jsonData = JSON.stringify(
                {
                    exportDate: new Date().toISOString(),
                    data,
                },
                null,
                2
            );

            return {
                data: jsonData,
                filename: `${filename}.json`,
                mimeType: 'application/json',
            };
        } catch (error) {
            logger.error('JSON generation error:', error);
            throw createError('Failed to generate JSON', 500);
        }
    }

    /**
     * Get export summary (for preview)
     */
    static async getExportSummary(userId: string, options: Partial<ExportOptions>): Promise<any> {
        const { dataType = 'all', startDate, endDate, category, type } = options;

        const summary: any = {};

        if (dataType === 'transactions' || dataType === 'all') {
            const transactionCount = await prisma.transaction.count({
                where: {
                    userId,
                    ...(startDate || endDate ? {
                        date: {
                            ...(startDate && { gte: startDate }),
                            ...(endDate && { lte: endDate }),
                        }
                    } : {}),
                    ...(category && { category }),
                    ...(type && { type }),
                },
            });
            summary.transactions = transactionCount;
        }

        if (dataType === 'budgets' || dataType === 'all') {
            const budgetCount = await prisma.budget.count({ where: { userId } });
            summary.budgets = budgetCount;
        }

        if (dataType === 'goals' || dataType === 'all') {
            const goalCount = await prisma.goal.count({ where: { userId } });
            summary.goals = goalCount;
        }

        return summary;
    }
}
