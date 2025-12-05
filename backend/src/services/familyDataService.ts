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
                    isSharingTransactions: true,
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
                    const isSharing = (member as any).isSharingTransactions;
                    if (member.userId !== userId && !isSharing) {
                        return {
                            member: member.user,
                            permissions: member.permissions,
                            isSharingTransactions: isSharing,
                            transactions: [],
                            count: 0,
                        };
                    }

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
                        isSharingTransactions: isSharing,
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

            // Get all transactions (all time) for accurate member stats matching goal totals
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: {
                        in: memberIds,
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

            // Get active goals count and contributions
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

            // Calculate category breakdown with member-wise spending
            const categoryMemberMap = new Map<string, Map<string, number>>();
            transactions
                .filter(t => t.type === 'EXPENSE')
                .forEach(t => {
                    if (!categoryMemberMap.has(t.category)) {
                        categoryMemberMap.set(t.category, new Map());
                    }
                    const memberMap = categoryMemberMap.get(t.category)!;
                    const memberName = familyMembers.find(m => m.userId === t.userId)?.user.name || 'Unknown';
                    const current = memberMap.get(memberName) || 0;
                    memberMap.set(memberName, current + t.amount);
                });

            const categoryBreakdown = Array.from(categoryMemberMap.entries()).map(([category, memberMap]) => {
                const totalAmount = Array.from(memberMap.values()).reduce((sum, amt) => sum + amt, 0);
                const memberBreakdown = Array.from(memberMap.entries()).map(([memberName, amount]) => ({
                    memberName,
                    amount,
                }));

                return {
                    category,
                    amount: totalAmount,
                    memberBreakdown, // Per-member spending in this category
                };
            });

            // Calculate member stats for bar chart (income vs expenses)
            const memberStats = await Promise.all(
                familyMembers.map(async (member) => {
                    const memberTransactions = transactions.filter(t => t.userId === member.userId);
                    const memberIncome = memberTransactions
                        .filter(t => t.type === 'INCOME')
                        .reduce((sum, t) => sum + t.amount, 0);
                    const memberExpenses = memberTransactions
                        .filter(t => t.type === 'EXPENSE')
                        .reduce((sum, t) => sum + t.amount, 0);

                    // Get goal contributions for this member using the GoalContribution table
                    const contributions = await prisma.goalContribution.findMany({
                        where: { userId: member.userId, goal: { familyId: familyId } },
                        include: { goal: true }
                    });

                    const goalMap = new Map<string, { title: string, amount: number, target: number }>();
                    contributions.forEach(c => {
                        if (!c.goal) return;
                        if (!goalMap.has(c.goalId)) {
                            goalMap.set(c.goalId, { title: c.goal.title, amount: 0, target: c.goal.target });
                        }
                        goalMap.get(c.goalId)!.amount += c.amount;
                    });

                    let goalDetail = Array.from(goalMap.values());

                    // Calculate aggregated metrics for combo chart
                    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
                    const uniqueGoals = new Set(contributions.map(c => c.goalId));
                    const goalCount = uniqueGoals.size;

                    return {
                        memberName: member.user.name,
                        totalIncome: memberIncome,
                        totalExpenses: memberExpenses,
                        totalContributions,
                        goalCount,
                        goalDetail,
                    };
                })
            );

            // Create goal-centric data for chart (goals on X-axis, members as lines)
            // Filter to only include family goals (not personal goals)
            const familyGoalsOnly = goals.filter(g => g.familyId === familyId);

            const goalContributionsByGoal = await Promise.all(
                familyGoalsOnly.map(async (goal) => {
                    const contributions = await prisma.goalContribution.findMany({
                        where: { goalId: goal.id },
                        include: { user: true }
                    });

                    const goalData: any = { goalName: goal.title };

                    // Add contribution amount for each member
                    familyMembers.forEach(member => {
                        const memberContributions = contributions
                            .filter(c => c.userId === member.userId)
                            .reduce((sum, c) => sum + c.amount, 0);
                        goalData[member.user.name || 'Unknown'] = memberContributions;
                    });

                    return goalData;
                })
            );

            // Calculate budget progress
            const budgetProgress = budgets.map(budget => ({
                category: budget.category,
                limit: budget.limit,
                spent: budget.spent,
            }));

            // Calculate goal contributions per member (for a separate graph if needed)
            const goalContributionsByMember = familyMembers.map(member => {
                const memberGoals = goals.filter(g => g.userId === member.userId);
                const totalContributed = memberGoals.reduce((sum, g) => sum + g.current, 0);

                return {
                    memberName: member.user.name,
                    totalContributed,
                    goalCount: memberGoals.length,
                };
            });

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
                categoryBreakdown, // Now includes memberBreakdown
                memberStats, // Now includes goalContributions
                budgetProgress,
                goalContributionsByGoal, // Goal-centric data for line chart
                goalContributionsByMember, // New: goal contributions per member
            };
        } catch (error: any) {
            logger.error('Error in getFamilySummary:', error);
            throw error;
        }
    },
};
