import prisma from '@/config/database';
import logger from '@/utils/logger';

export const familyDataService = {
    // Get transactions grouped by family member (last 50 per member)
    async getFamilyTransactions(userId: string, familyId: string) {
        try {
            // Verify user is a member of this family
            const membership = await prisma.familyMember.findFirst({
                where: {
                    familyId,
                    userId,
                    status: 'ACCEPTED',
                },
            });

            if (!membership) {
                throw new Error('You are not a member of this family');
            }

            // Get all accepted family members with VIEW_EDIT permission
            const familyMembers = await prisma.familyMember.findMany({
                where: {
                    familyId,
                    status: 'ACCEPTED',
                    permissions: 'VIEW_EDIT', // Only members who chose to share
                },
                select: {
                    userId: true,
                    permissions: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Get last 50 transactions for each member
            const memberTransactions = await Promise.all(
                familyMembers.map(async (member) => {
                    const transactions = await prisma.transaction.findMany({
                        where: {
                            userId: member.userId,
                        },
                        orderBy: {
                            date: 'desc',
                        },
                        take: 50, // Last 50 transactions per member
                    });

                    return {
                        member: member.user,
                        permissions: member.permissions,
                        transactions,
                        count: transactions.length,
                    };
                })
            );

            return {
                memberTransactions,
                totalMembers: familyMembers.length,
            };
        } catch (error: any) {
            logger.error('Error in getFamilyTransactions:', error);
            throw error;
        }
    },

    // Get all family members' budgets
    async getFamilyBudgets(userId: string, familyId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    familyId,
                    userId,
                    status: 'ACCEPTED',
                },
            });

            if (!membership) {
                throw new Error('You are not a member of this family');
            }

            const familyMembers = await prisma.familyMember.findMany({
                where: {
                    familyId,
                    status: 'ACCEPTED',
                },
                select: {
                    userId: true,
                },
            });

            const memberIds = familyMembers.map(m => m.userId);

            const budgets = await prisma.budget.findMany({
                where: {
                    userId: {
                        in: memberIds,
                    },
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
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return budgets;
        } catch (error: any) {
            logger.error('Error in getFamilyBudgets:', error);
            throw error;
        }
    },

    // Get all family members' goals
    async getFamilyGoals(userId: string, familyId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    familyId,
                    userId,
                    status: 'ACCEPTED',
                },
            });

            if (!membership) {
                throw new Error('You are not a member of this family');
            }

            const familyMembers = await prisma.familyMember.findMany({
                where: {
                    familyId,
                    status: 'ACCEPTED',
                },
                select: {
                    userId: true,
                },
            });

            const memberIds = familyMembers.map(m => m.userId);

            const goals = await prisma.goal.findMany({
                where: {
                    userId: {
                        in: memberIds,
                    },
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
                orderBy: {
                    deadline: 'asc',
                },
            });

            return goals;
        } catch (error: any) {
            logger.error('Error in getFamilyGoals:', error);
            throw error;
        }
    },

    // Get family financial summary
    async getFamilySummary(userId: string, familyId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    familyId,
                    userId,
                    status: 'ACCEPTED',
                },
            });

            if (!membership) {
                throw new Error('You are not a member of this family');
            }

            const familyMembers = await prisma.familyMember.findMany({
                where: {
                    familyId,
                    status: 'ACCEPTED',
                },
                select: {
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            const memberIds = familyMembers.map(m => m.userId);

            // Get current month's date range
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Get all transactions for current month
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: {
                        in: memberIds,
                    },
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });

            // Calculate totals
            const totalIncome = transactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpenses = transactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);

            // Get active goals count
            const goals = await prisma.goal.findMany({
                where: {
                    userId: {
                        in: memberIds,
                    },
                },
            });

            const activeGoals = goals.filter(g => g.current < g.target).length;

            // Get budgets
            const budgets = await prisma.budget.findMany({
                where: {
                    userId: {
                        in: memberIds,
                    },
                },
            });

            const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

            return {
                members: familyMembers,
                summary: {
                    totalIncome,
                    totalExpenses,
                    netIncome: totalIncome - totalExpenses,
                    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
                    activeGoals,
                    totalBudget,
                    totalSpent,
                    budgetRemaining: totalBudget - totalSpent,
                },
            };
        } catch (error: any) {
            logger.error('Error in getFamilySummary:', error);
            throw error;
        }
    },
};
