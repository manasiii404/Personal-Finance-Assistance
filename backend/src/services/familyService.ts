import { PrismaClient, FamilyRole, FamilyPermission, MemberStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import { emitToUser, emitToFamily } from '../websocket';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

// Generate unique 6-character room code
const generateRoomCode = async (): Promise<string> => {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
        // Generate uppercase alphanumeric code
        code = nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Ensure it's exactly 6 characters
        if (code.length !== 6) {
            continue;
        }

        // Check if code already exists
        const existing = await prisma.family.findUnique({
            where: { roomCode: code },
        });

        if (!existing) {
            isUnique = true;
            return code;
        }
    }

    throw new Error('Failed to generate unique room code');
};

export const familyService = {
    // Create a new family room
    async createFamily(userId: string, name: string) {
        try {
            const roomCode = await generateRoomCode();

            const family = await prisma.family.create({
                data: {
                    name,
                    roomCode,
                    creatorId: userId,
                    members: {
                        create: {
                            userId,
                            role: FamilyRole.CREATOR,
                            permissions: FamilyPermission.VIEW_EDIT,
                            status: MemberStatus.ACCEPTED,
                        },
                    },
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            logger.info(`Family created: ${family.id} by user ${userId}`);
            return family;
        } catch (error) {
            logger.error('Error creating family:', error);
            throw error;
        }
    },

    // Request to join a family using room code
    async requestToJoin(userId: string, roomCode: string, permissions: FamilyPermission) {
        try {
            // Find family by room code
            const family = await prisma.family.findUnique({
                where: { roomCode },
                include: {
                    creator: true,
                    members: true,
                },
            });

            if (!family) {
                throw new Error('Invalid room code');
            }

            if (!family.isActive) {
                throw new Error('This family room is no longer active');
            }

            // Check if user is already a member
            const existingMember = await prisma.familyMember.findUnique({
                where: {
                    familyId_userId: {
                        familyId: family.id,
                        userId,
                    },
                },
            });

            if (existingMember) {
                if (existingMember.status === MemberStatus.PENDING) {
                    throw new Error('You already have a pending request for this family');
                }
                if (existingMember.status === MemberStatus.ACCEPTED) {
                    throw new Error('You are already a member of this family');
                }
                if (existingMember.status === MemberStatus.REJECTED) {
                    // Allow re-requesting after rejection
                    const updated = await prisma.familyMember.update({
                        where: { id: existingMember.id },
                        data: {
                            status: MemberStatus.PENDING,
                            permissions, // Update permissions on re-request
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

                    // Notify creator
                    emitToUser(family.creatorId, 'family:join-request', {
                        familyId: family.id,
                        member: updated,
                    });

                    return updated;
                }
            }

            // Create new join request
            const member = await prisma.familyMember.create({
                data: {
                    familyId: family.id,
                    userId,
                    role: FamilyRole.MEMBER,
                    status: MemberStatus.PENDING,
                    permissions, // Store user-selected permissions
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

            // Notify creator in real-time
            emitToUser(family.creatorId, 'family:join-request', {
                familyId: family.id,
                member,
            });

            logger.info(`Join request created: User ${userId} -> Family ${family.id}`);
            return member;
        } catch (error) {
            logger.error('Error requesting to join family:', error);
            throw error;
        }
    },

    // Get pending join requests (creator only)
    async getPendingRequests(userId: string) {
        try {
            const families = await prisma.family.findMany({
                where: { creatorId: userId },
                include: {
                    members: {
                        where: { status: MemberStatus.PENDING },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            const pendingRequests = families.flatMap((family) =>
                family.members.map((member) => ({
                    ...member,
                    familyName: family.name,
                    familyId: family.id,
                }))
            );

            return pendingRequests;
        } catch (error) {
            logger.error('Error getting pending requests:', error);
            throw error;
        }
    },

    // Accept a join request (permissions already set by user)
    async acceptRequest(
        creatorId: string,
        memberId: string
    ) {
        try {
            const member = await prisma.familyMember.findUnique({
                where: { id: memberId },
                include: {
                    family: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!member) {
                throw new Error('Member not found');
            }

            if (member.family.creatorId !== creatorId) {
                throw new Error('Unauthorized: Only the creator can accept requests');
            }

            if (member.status !== MemberStatus.PENDING) {
                throw new Error('This request has already been processed');
            }

            // Update member status only (permissions already set by user)
            const updatedMember = await prisma.familyMember.update({
                where: { id: memberId },
                data: {
                    status: MemberStatus.ACCEPTED,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    family: true,
                },
            });

            // Notify the user who requested to join
            emitToUser(member.userId, 'family:request-accepted', {
                familyId: member.familyId,
                family: member.family,
                permissions: member.permissions, // Use existing permissions
            });

            // Notify all family members
            emitToFamily(member.familyId, 'family:member-joined', {
                member: updatedMember,
            });

            logger.info(`Join request accepted: Member ${memberId} with ${member.permissions} permissions`);
            return updatedMember;
        } catch (error) {
            logger.error('Error accepting request:', error);
            throw error;
        }
    },

    // Reject a join request
    async rejectRequest(creatorId: string, memberId: string) {
        try {
            const member = await prisma.familyMember.findUnique({
                where: { id: memberId },
                include: {
                    family: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!member) {
                throw new Error('Member not found');
            }

            if (member.family.creatorId !== creatorId) {
                throw new Error('Unauthorized: Only the creator can reject requests');
            }

            if (member.status !== MemberStatus.PENDING) {
                throw new Error('This request has already been processed');
            }

            // Update member status
            const updatedMember = await prisma.familyMember.update({
                where: { id: memberId },
                data: { status: MemberStatus.REJECTED },
            });

            // Notify the user who requested to join
            emitToUser(member.userId, 'family:request-rejected', {
                familyId: member.familyId,
                familyName: member.family.name,
            });

            logger.info(`Join request rejected: Member ${memberId}`);
            return updatedMember;
        } catch (error) {
            logger.error('Error rejecting request:', error);
            throw error;
        }
    },

    // Get user's family
    async getUserFamily(userId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    status: MemberStatus.ACCEPTED,
                },
                include: {
                    family: {
                        include: {
                            creator: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            members: {
                                where: { status: MemberStatus.ACCEPTED },
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            return membership;
        } catch (error) {
            logger.error('Error getting user family:', error);
            throw error;
        }
    },

    // Get user's own join requests
    async getMyJoinRequests(userId: string) {
        try {
            const requests = await prisma.familyMember.findMany({
                where: {
                    userId,
                },
                include: {
                    family: {
                        select: {
                            id: true,
                            name: true,
                            roomCode: true,
                            creatorId: true,
                        },
                    },
                },
            });

            return requests;
        } catch (error) {
            logger.error('Error getting user join requests:', error);
            throw error;
        }
    },

    // Update own permissions (self-managed)
    async updateMyPermissions(userId: string, permissions: FamilyPermission) {
        try {
            // Find user's membership
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    status: MemberStatus.ACCEPTED,
                },
                include: {
                    family: true,
                },
            });

            if (!membership) {
                throw new Error('You are not a member of any family');
            }

            if (membership.role === FamilyRole.CREATOR) {
                throw new Error('Creator permissions cannot be changed');
            }

            // Update own permissions
            const updatedMember = await prisma.familyMember.update({
                where: { id: membership.id },
                data: { permissions },
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

            // Notify all family members about permission change
            emitToFamily(membership.familyId, 'family:member-updated', {
                member: updatedMember,
            });

            logger.info(`User ${userId} updated own permissions to ${permissions}`);
            return updatedMember;
        } catch (error) {
            logger.error('Error updating own permissions:', error);
            throw error;
        }
    },

    // Update member permissions (creator only) - DEPRECATED
    async updatePermissions(
        creatorId: string,
        memberId: string,
        permissions: FamilyPermission
    ) {
        try {
            const member = await prisma.familyMember.findUnique({
                where: { id: memberId },
                include: {
                    family: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!member) {
                throw new Error('Member not found');
            }

            if (member.family.creatorId !== creatorId) {
                throw new Error('Unauthorized: Only the creator can update permissions');
            }

            if (member.role === FamilyRole.CREATOR) {
                throw new Error('Cannot change creator permissions');
            }

            // Update permissions
            const updatedMember = await prisma.familyMember.update({
                where: { id: memberId },
                data: { permissions },
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

            // Notify the member in real-time
            emitToUser(member.userId, 'family:permission-changed', {
                familyId: member.familyId,
                permissions,
            });

            // Notify all family members
            emitToFamily(member.familyId, 'family:member-updated', {
                member: updatedMember,
            });

            logger.info(`Permissions updated: Member ${memberId} -> ${permissions}`);
            return updatedMember;
        } catch (error) {
            logger.error('Error updating permissions:', error);
            throw error;
        }
    },

    // Remove member from family (creator only)
    async removeMember(creatorId: string, memberId: string) {
        try {
            const member = await prisma.familyMember.findUnique({
                where: { id: memberId },
                include: {
                    family: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!member) {
                throw new Error('Member not found');
            }

            if (member.family.creatorId !== creatorId) {
                throw new Error('Unauthorized: Only the creator can remove members');
            }

            if (member.role === FamilyRole.CREATOR) {
                throw new Error('Cannot remove the creator');
            }

            // Delete member
            await prisma.familyMember.delete({
                where: { id: memberId },
            });

            // Notify the removed member
            emitToUser(member.userId, 'family:removed', {
                familyId: member.familyId,
                familyName: member.family.name,
            });

            // Notify all remaining family members
            emitToFamily(member.familyId, 'family:member-left', {
                userId: member.userId,
                userName: member.user.name,
            });

            logger.info(`Member removed: ${memberId} from family ${member.familyId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error removing member:', error);
            throw error;
        }
    },

    // Leave family (member only)
    async leaveFamily(userId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    status: MemberStatus.ACCEPTED,
                },
                include: {
                    family: true,
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
                throw new Error('You are not a member of any family');
            }

            if (membership.role === FamilyRole.CREATOR) {
                throw new Error('Creator cannot leave the family. Delete the family instead.');
            }

            // Delete membership
            await prisma.familyMember.delete({
                where: { id: membership.id },
            });

            // Notify all family members
            emitToFamily(membership.familyId, 'family:member-left', {
                userId,
                userName: membership.user.name,
            });

            logger.info(`User ${userId} left family ${membership.familyId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error leaving family:', error);
            throw error;
        }
    },

    // Delete family (creator only)
    async deleteFamily(userId: string, familyId: string) {
        try {
            const family = await prisma.family.findUnique({
                where: { id: familyId },
                include: {
                    members: {
                        where: { status: MemberStatus.ACCEPTED },
                    },
                },
            });

            if (!family) {
                throw new Error('Family not found');
            }

            if (family.creatorId !== userId) {
                throw new Error('Unauthorized: Only the creator can delete the family');
            }

            // Notify all members before deletion
            family.members.forEach((member) => {
                if (member.userId !== userId) {
                    emitToUser(member.userId, 'family:deleted', {
                        familyId,
                        familyName: family.name,
                    });
                }
            });

            // Delete family (cascade will delete members)
            await prisma.family.delete({
                where: { id: familyId },
            });

            logger.info(`Family deleted: ${familyId} by user ${userId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error deleting family:', error);
            throw error;
        }
    },
};
