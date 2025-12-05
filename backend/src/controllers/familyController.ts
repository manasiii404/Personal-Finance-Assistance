import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
import { familyService } from '@/services/familyService';
import { FamilyPermission } from '@prisma/client';
import logger from '@/utils/logger';

export const familyController = {
    // Create a new family room
    async createFamily(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { name } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Family name is required',
                });
            }

            const family = await familyService.createFamily(userId, name.trim());

            res.status(201).json({
                success: true,
                message: 'Family room created successfully',
                data: family,
            });
        } catch (error: any) {
            logger.error('Error in createFamily controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create family room',
            });
        }
    },

    // Request to join a family
    async joinFamily(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { roomCode, permissions } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            if (!roomCode || typeof roomCode !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Room code is required',
                });
            }

            if (!permissions || !Object.values(FamilyPermission).includes(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid permissions are required (VIEW_ONLY or VIEW_EDIT)',
                });
            }

            const member = await familyService.requestToJoin(userId, roomCode.toUpperCase(), permissions);

            res.status(200).json({
                success: true,
                message: 'Join request sent successfully',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in joinFamily controller:', error);

            if (error.message.includes('Invalid room code')) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid room code',
                });
            }

            if (error.message.includes('already')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to join family',
            });
        }
    },

    // Get pending join requests (creator only)
    async getPendingRequests(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const requests = await familyService.getPendingRequests(userId);

            res.status(200).json({
                success: true,
                data: requests,
            });
        } catch (error: any) {
            logger.error('Error in getPendingRequests controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get pending requests',
            });
        }
    },

    // Accept a join request
    async acceptRequest(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const member = await familyService.acceptRequest(userId, memberId);

            res.status(200).json({
                success: true,
                message: 'Join request accepted',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in acceptRequest controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to accept request',
            });
        }
    },

    // Reject a join request
    async rejectRequest(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            await familyService.rejectRequest(userId, memberId);

            res.status(200).json({
                success: true,
                message: 'Join request rejected',
            });
        } catch (error: any) {
            logger.error('Error in rejectRequest controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to reject request',
            });
        }
    },

    // Get user's families
    async getMyFamily(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const families = await familyService.getUserFamily(userId);

            res.status(200).json({
                success: true,
                data: { families }, // Return as { families: [...] }
            });
        } catch (error: any) {
            logger.error('Error in getMyFamily controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get family',
            });
        }
    },

    // Get user's own join requests
    async getMyJoinRequests(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const requests = await (familyService as any).getMyJoinRequests(userId);

            res.status(200).json({
                success: true,
                data: requests,
            });
        } catch (error: any) {
            logger.error('Error in getMyJoinRequests controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get join requests',
            });
        }
    },

    // Update own permissions (self-managed)
    async updateMyPermissions(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { permissions } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            if (!permissions || !Object.values(FamilyPermission).includes(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid permissions are required (VIEW_ONLY or VIEW_EDIT)',
                });
            }

            const member = await familyService.updateMyPermissions(userId, permissions);

            res.status(200).json({
                success: true,
                message: 'Your permissions updated successfully',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in updateMyPermissions controller:', error);

            if (error.message.includes('not a member')) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update permissions',
            });
        }
    },

    // Update member permissions
    async updatePermissions(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;
            const { permissions } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            if (!permissions || !Object.values(FamilyPermission).includes(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid permissions are required (VIEW_ONLY or VIEW_EDIT)',
                });
            }

            const member = await familyService.updatePermissions(userId, memberId, permissions);

            res.status(200).json({
                success: true,
                message: 'Permissions updated successfully',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in updatePermissions controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update permissions',
            });
        }
    },

    // Remove member from family
    async removeMember(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            await familyService.removeMember(userId, memberId);

            res.status(200).json({
                success: true,
                message: 'Member removed successfully',
            });
        } catch (error: any) {
            logger.error('Error in removeMember controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to remove member',
            });
        }
    },

    // Leave family
    async leaveFamily(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            if (!familyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Family ID is required',
                });
            }

            await familyService.leaveFamily(userId, familyId);

            res.status(200).json({
                success: true,
                message: 'Left family successfully',
            });
        } catch (error: any) {
            logger.error('Error in leaveFamily controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to leave family',
            });
        }
    },

    // Toggle transaction sharing
    async toggleTransactionSharing(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params; // Using params instead of body to match route convention
            const { isSharing } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (typeof isSharing !== 'boolean') {
                return res.status(400).json({ success: false, message: 'isSharing must be a boolean' });
            }

            const member = await familyService.toggleTransactionSharing(userId, familyId, isSharing);

            res.status(200).json({
                success: true,
                message: isSharing ? 'Transactions shared with family' : 'Transactions hidden from family',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in toggleTransactionSharing controller:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to toggle transaction sharing',
            });
        }
    },

    // Delete family
    async deleteFamily(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { familyId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            await familyService.deleteFamily(userId, familyId);

            res.status(200).json({
                success: true,
                message: 'Family deleted successfully',
            });
        } catch (error: any) {
            logger.error('Error in deleteFamily controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete family',
            });
        }
    },

    // Promote member to admin (creator only)
    async promoteToAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const member = await familyService.promoteToAdmin(userId, memberId);

            res.status(200).json({
                success: true,
                message: 'Member promoted to admin',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in promoteToAdmin controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to promote member',
            });
        }
    },

    // Demote admin to member (creator only)
    async demoteFromAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { memberId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const member = await familyService.demoteFromAdmin(userId, memberId);

            res.status(200).json({
                success: true,
                message: 'Admin demoted to member',
                data: member,
            });
        } catch (error: any) {
            logger.error('Error in demoteFromAdmin controller:', error);

            if (error.message.includes('Unauthorized')) {
                return res.status(403).json({
                    success: false,
                    message: error.message,
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Failed to demote admin',
            });
        }
    },
};
