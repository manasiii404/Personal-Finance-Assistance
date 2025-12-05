import { PrismaClient, BudgetPeriod } from '@prisma/client';
import { emitToFamily } from '../websocket';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

export const familyBudgetService = {
    // Create a family budget (admin/creator only)
    async createFamilyBudget(
        userId: string,
        familyId: string,
        data: {
            category: string;
            limit: number;
            period: BudgetPeriod;
        }
    ) {
        try {
            // Check if user is admin or creator
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: 'ACCEPTED',
                    role: {
                        in: ['CREATOR', 'ADMIN' as any],
                    },
                },
            });

            if (!membership) {
                throw new Error('Unauthorized: Only admins and creators can create family budgets');
            }

            // Calculate spent amount from all family members' transactions
            const members = await prisma.familyMember.findMany({
                where: { familyId, status: 'ACCEPTED' },
                select: { userId: true },
            });

            const memberIds = members.map(m => m.userId);

            // Get transactions in this category from all family members
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: { in: memberIds },
                    category: data.category,
                    type: 'EXPENSE',
                    // Filter by period (this month for MONTHLY, etc.)
                    date: {
                        gte: getStartOfPeriod(data.period),
                    },
                },
            });

            const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

            // Create the budget
            const budget = await prisma.budget.create({
                data: {
                    userId,
                    familyId,
                    category: data.category,
                    limit: data.limit,
                    spent,
                    period: data.period,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Notify all family members
            emitToFamily(familyId, 'family:budget-created', { budget });

            logger.info(`Family budget created: ${budget.id} for family ${familyId}`);
            return budget;
        } catch (error) {
            logger.error('Error creating family budget:', error);
            throw error;
        }
    },

    // Get all family budgets
    async getFamilyBudgets(userId: string, familyId: string) {
        try {
            // Verify user is a member
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: 'ACCEPTED',
                },
            });

            if (!membership) {
                throw new Error('Unauthorized: You must be a family member to view budgets');
            }

            const budgets = await prisma.budget.findMany({
                where: { familyId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            // Update spent amounts for each budget
            const updatedBudgets = await Promise.all(
                budgets.map(async (budget) => {
                    const spent = await calculateBudgetSpent(familyId, budget.category, budget.period);
                    return { ...budget, spent };
                })
            );

            return updatedBudgets;
        } catch (error) {
            logger.error('Error getting family budgets:', error);
            throw error;
        }
    },

    // Update a family budget (admin/creator only)
    async updateFamilyBudget(
        userId: string,
        familyId: string,
        budgetId: string,
        data: {
            category?: string;
            limit?: number;
            period?: BudgetPeriod;
        }
    ) {
        try {
            // Check if user is admin or creator
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: 'ACCEPTED',
                    role: {
                        in: ['CREATOR', 'ADMIN' as any],
                    },
                },
            });

            if (!membership) {
                throw new Error('Unauthorized: Only admins and creators can update family budgets');
            }

            // Verify budget belongs to this family
            const existingBudget = await prisma.budget.findFirst({
                where: { id: budgetId, familyId },
            });

            if (!existingBudget) {
                throw new Error('Budget not found or does not belong to this family');
            }

            // Recalculate spent if category or period changed
            let spent = existingBudget.spent;
            if (data.category || data.period) {
                const category = data.category || existingBudget.category;
                const period = data.period || existingBudget.period;
                spent = await calculateBudgetSpent(familyId, category, period);
            }

            const budget = await prisma.budget.update({
                where: { id: budgetId },
                data: {
                    ...data,
                    spent,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Notify all family members
            emitToFamily(familyId, 'family:budget-updated', { budget });

            logger.info(`Family budget updated: ${budgetId}`);
            return budget;
        } catch (error) {
            logger.error('Error updating family budget:', error);
            throw error;
        }
    },

    // Delete a family budget (admin/creator only)
    async deleteFamilyBudget(userId: string, familyId: string, budgetId: string) {
        try {
            // Check if user is admin or creator
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: 'ACCEPTED',
                    role: {
                        in: ['CREATOR', 'ADMIN' as any],
                    },
                },
            });

            if (!membership) {
                throw new Error('Unauthorized: Only admins and creators can delete family budgets');
            }

            // Verify budget belongs to this family
            const existingBudget = await prisma.budget.findFirst({
                where: { id: budgetId, familyId },
            });

            if (!existingBudget) {
                throw new Error('Budget not found or does not belong to this family');
            }

            await prisma.budget.delete({
                where: { id: budgetId },
            });

            // Notify all family members
            emitToFamily(familyId, 'family:budget-deleted', { budgetId });

            logger.info(`Family budget deleted: ${budgetId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error deleting family budget:', error);
            throw error;
        }
    },
};

// Helper: Calculate spent amount for a budget
async function calculateBudgetSpent(
    familyId: string,
    category: string,
    period: BudgetPeriod
): Promise<number> {
    const members = await prisma.familyMember.findMany({
        where: { familyId, status: 'ACCEPTED' },
        select: { userId: true },
    });

    const memberIds = members.map(m => m.userId);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId: { in: memberIds },
            category,
            type: 'EXPENSE',
            date: {
                gte: getStartOfPeriod(period),
            },
        },
    });

    return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// Helper: Get start of period for filtering transactions
function getStartOfPeriod(period: BudgetPeriod): Date {
    const now = new Date();

    switch (period) {
        case 'WEEKLY':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return weekStart;

        case 'MONTHLY':
            return new Date(now.getFullYear(), now.getMonth(), 1);

        case 'YEARLY':
            return new Date(now.getFullYear(), 0, 1);

        default:
            return new Date(now.getFullYear(), now.getMonth(), 1);
    }
}
