import { PrismaClient } from '@prisma/client';
import { emitToFamily } from '../websocket';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

interface GoalContribution {
    userId: string;
    userName: string;
    amount: number;
    date: Date;
}

export const familyGoalService = {
    // Create a family goal (admin/creator only)
    async createFamilyGoal(
        userId: string,
        familyId: string,
        data: {
            title: string;
            target: number;
            deadline: Date;
            category: string;
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
                throw new Error('Unauthorized: Only admins and creators can create family goals');
            }

            const goal = await prisma.goal.create({
                data: {
                    userId,
                    familyId,
                    title: data.title,
                    target: data.target,
                    current: 0,
                    deadline: data.deadline,
                    category: data.category,
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
            emitToFamily(familyId, 'family:goal-created', { goal });

            logger.info(`Family goal created: ${goal.id} for family ${familyId}`);
            return goal;
        } catch (error) {
            logger.error('Error creating family goal:', error);
            throw error;
        }
    },

    // Get all family goals with contributions
    async getFamilyGoals(userId: string, familyId: string) {
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
                throw new Error('Unauthorized: You must be a family member to view goals');
            }

            const goals = await prisma.goal.findMany({
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

            // Get contributions for each goal (stored in a separate collection or as JSON)
            // For now, we'll add a contributions field to track this
            const goalsWithContributions = goals.map(goal => ({
                ...goal,
                contributions: [], // Will be populated from a contributions tracking system
                progress: goal.target > 0 ? (goal.current / goal.target) * 100 : 0,
            }));

            return goalsWithContributions;
        } catch (error) {
            logger.error('Error getting family goals:', error);
            throw error;
        }
    },

    // Contribute to a family goal (all members)
    async contributeToGoal(
        userId: string,
        familyId: string,
        goalId: string,
        amount: number
    ) {
        try {
            // Verify user is a member
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: 'ACCEPTED',
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

            if (!membership) {
                throw new Error('Unauthorized: You must be a family member to contribute');
            }

            // Verify goal belongs to this family
            const goal = await prisma.goal.findFirst({
                where: { id: goalId, familyId },
            });

            if (!goal) {
                throw new Error('Goal not found or does not belong to this family');
            }

            // Update goal current amount
            const updatedGoal = await prisma.goal.update({
                where: { id: goalId },
                data: {
                    current: goal.current + amount,
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

            // Create contribution record for chart tracking
            await prisma.goalContribution.create({
                data: {
                    goalId,
                    userId,
                    amount,
                },
            });


            // Create a contribution record (we'll track this in transaction notes or a separate field)
            const contribution = {
                userId,
                userName: membership.user.name,
                amount,
                date: new Date(),
            };

            // Notify all family members
            emitToFamily(familyId, 'family:goal-contribution', {
                goal: updatedGoal,
                contribution,
            });

            logger.info(`Contribution to goal ${goalId}: ${amount} by user ${userId}`);
            return { goal: updatedGoal, contribution };
        } catch (error) {
            logger.error('Error contributing to goal:', error);
            throw error;
        }
    },

    // Update a family goal (admin/creator only)
    async updateFamilyGoal(
        userId: string,
        familyId: string,
        goalId: string,
        data: {
            title?: string;
            target?: number;
            deadline?: Date;
            category?: string;
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
                throw new Error('Unauthorized: Only admins and creators can update family goals');
            }

            // Verify goal belongs to this family
            const existingGoal = await prisma.goal.findFirst({
                where: { id: goalId, familyId },
            });

            if (!existingGoal) {
                throw new Error('Goal not found or does not belong to this family');
            }

            const goal = await prisma.goal.update({
                where: { id: goalId },
                data,
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
            emitToFamily(familyId, 'family:goal-updated', { goal });

            logger.info(`Family goal updated: ${goalId}`);
            return goal;
        } catch (error) {
            logger.error('Error updating family goal:', error);
            throw error;
        }
    },

    // Delete a family goal (admin/creator only)
    async deleteFamilyGoal(userId: string, familyId: string, goalId: string) {
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
                throw new Error('Unauthorized: Only admins and creators can delete family goals');
            }

            // Verify goal belongs to this family
            const existingGoal = await prisma.goal.findFirst({
                where: { id: goalId, familyId },
            });

            if (!existingGoal) {
                throw new Error('Goal not found or does not belong to this family');
            }

            await prisma.goal.delete({
                where: { id: goalId },
            });

            // Notify all family members
            emitToFamily(familyId, 'family:goal-deleted', { goalId });

            logger.info(`Family goal deleted: ${goalId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error deleting family goal:', error);
            throw error;
        }
    },
};
