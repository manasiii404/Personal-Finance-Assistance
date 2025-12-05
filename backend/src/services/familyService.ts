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
                            role: FamilyRole.ADMIN, // Creator becomes admin
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

    // Get pending join requests (creator and admins)
    async getPendingRequests(userId: string) {
        try {
            // Find families where user is creator or admin
            const memberships = await prisma.familyMember.findMany({
                where: {
                    userId,
                    status: MemberStatus.ACCEPTED,
                    role: {
                        in: [FamilyRole.CREATOR, 'ADMIN' as any],
                    },
                },
            });

            const familyIds = memberships.map(m => m.familyId);

            const families = await prisma.family.findMany({
                where: {
                    id: { in: familyIds },
                },
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
        userId: string,
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

            // Check if user is creator or admin
            const isAuthorized = await this.isAdminOrCreator(userId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only creators and admins can accept requests');
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

    // Reject a join request (creator and admins)
    async rejectRequest(userId: string, memberId: string) {
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

            // Check if user is creator or admin
            const isAuthorized = await this.isAdminOrCreator(userId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only creators and admins can reject requests');
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

    // Get user's families (all of them)
    async getUserFamily(userId: string) {
        try {
            const memberships = await prisma.familyMember.findMany({
                where: {
                    userId,
                    status: MemberStatus.ACCEPTED,
                },
                orderBy: {
                    joinedAt: 'desc', // Most recent first
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

            // Return array of families
            return memberships.map(m => m.family);
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

            // Check if user is an admin or creator
            const isAuthorized = await this.isAdminOrCreator(creatorId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only admins can update permissions');
            }

            // Cannot change admin or creator permissions
            if (member.role === FamilyRole.CREATOR || (member.role as string) === 'ADMIN') {
                throw new Error('Cannot change admin permissions');
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

    // Remove member from family (creator and admins)
    async removeMember(userId: string, memberId: string) {
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

            // Check if user is creator or admin
            const isAuthorized = await this.isAdminOrCreator(userId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only creators and admins can remove members');
            }

            // Cannot remove the creator
            if (member.role === FamilyRole.CREATOR) {
                throw new Error('Cannot remove the creator');
            }

            // Only creator can remove admins
            if ((member.role as string) === 'ADMIN' && member.family.creatorId !== userId) {
                throw new Error('Only the creator can remove admins');
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



    // Toggle transaction sharing for a member
    async toggleTransactionSharing(userId: string, familyId: string, isSharing: boolean) {
        try {
            const membership = await prisma.familyMember.findUnique({
                where: {
                    familyId_userId: {
                        familyId,
                        userId,
                    },
                },
            });

            if (!membership) {
                throw new Error('Family membership not found');
            }

            const updatedMembership = await prisma.familyMember.update({
                where: {
                    familyId_userId: {
                        familyId,
                        userId,
                    },
                },
                data: {
                    isSharingTransactions: isSharing,
                },
            });

            logger.info(`User ${userId} toggled transaction sharing to ${isSharing} in family ${familyId}`);
            return updatedMembership;
        } catch (error) {
            logger.error('Error toggling transaction sharing:', error);
            throw error;
        }
    },
    // Leave family (member only)
    async leaveFamily(userId: string, familyId: string) {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
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
                throw new Error('You are not a member of this family');
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

            // Check if user is an admin or creator
            const isAuthorized = await this.isAdminOrCreator(userId, familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only admins can delete the family');
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

    // Helper: Check if user is admin or creator of a family
    async isAdminOrCreator(userId: string, familyId: string): Promise<boolean> {
        try {
            const membership = await prisma.familyMember.findFirst({
                where: {
                    userId,
                    familyId,
                    status: MemberStatus.ACCEPTED,
                    role: {
                        in: [FamilyRole.CREATOR, 'ADMIN' as any], // Temporary until Prisma regenerates
                    },
                },
            });

            return !!membership;
        } catch (error) {
            logger.error('Error checking admin status:', error);
            return false;
        }
    },

    // Promote member to admin (creator only)
    async promoteToAdmin(userId: string, memberId: string) {
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

            // Check if user is an admin or creator
            const isAuthorized = await this.isAdminOrCreator(userId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only admins can promote members to admin');
            }

            if ((member.role as string) === 'ADMIN') {
                throw new Error('Member is already an admin');
            }

            if (member.status !== MemberStatus.ACCEPTED) {
                throw new Error('Cannot promote pending members');
            }

            // Promote to admin and set VIEW_EDIT permissions
            const updatedMember = await prisma.familyMember.update({
                where: { id: memberId },
                data: {
                    role: 'ADMIN' as any,
                    permissions: FamilyPermission.VIEW_EDIT // Admins always have full access
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

            // Notify the promoted member
            emitToUser(member.userId, 'family:promoted-to-admin', {
                familyId: member.familyId,
                familyName: member.family.name,
            });

            // Notify all family members
            emitToFamily(member.familyId, 'family:member-updated', {
                member: updatedMember,
            });

            logger.info(`Member promoted to admin: ${memberId} in family ${member.familyId}`);
            return updatedMember;
        } catch (error) {
            logger.error('Error promoting to admin:', error);
            throw error;
        }
    },

    // Demote admin to member (creator only)
    async demoteFromAdmin(userId: string, memberId: string) {
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

            // Check if user is an admin or creator
            const isAuthorized = await this.isAdminOrCreator(userId, member.familyId);
            if (!isAuthorized) {
                throw new Error('Unauthorized: Only admins can demote other admins');
            }

            // Prevent self-demotion
            if (member.userId === userId) {
                throw new Error('You cannot demote yourself');
            }

            if ((member.role as string) !== 'ADMIN') {
                throw new Error('Member is not an admin');
            }

            // Demote to regular member
            const updatedMember = await prisma.familyMember.update({
                where: { id: memberId },
                data: { role: FamilyRole.MEMBER },
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

            // Notify the demoted member
            emitToUser(member.userId, 'family:demoted-from-admin', {
                familyId: member.familyId,
                familyName: member.family.name,
            });

            // Notify all family members
            emitToFamily(member.familyId, 'family:member-updated', {
                member: updatedMember,
            });

            logger.info(`Admin demoted to member: ${memberId} in family ${member.familyId}`);
            return updatedMember;
        } catch (error) {
            logger.error('Error demoting from admin:', error);
            throw error;
        }
    },
};
