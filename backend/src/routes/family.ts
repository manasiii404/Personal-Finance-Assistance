import { Router } from 'express';
import { familyController } from '@/controllers/familyController';
import { familyDataController } from '@/controllers/familyDataController';
import { familyFinanceController } from '@/controllers/familyFinanceController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new family room
router.post('/create', familyController.createFamily);

// Request to join a family with room code
router.post('/join', familyController.joinFamily);

// Get pending join requests (creator only)
router.get('/requests', familyController.getPendingRequests);

// Accept a join request with permissions
router.post('/requests/:memberId/accept', familyController.acceptRequest);

// Reject a join request
router.post('/requests/:memberId/reject', familyController.rejectRequest);

// Get user's family information
router.get('/my-family', familyController.getMyFamily);

// Get user's own join requests
router.get('/my-requests', familyController.getMyJoinRequests);

// Update own permissions (self-managed)
router.put('/my-permissions', familyController.updateMyPermissions);

// Update member permissions (creator only) - DEPRECATED, kept for compatibility
router.put('/members/:memberId/permissions', familyController.updatePermissions);

// Remove a member from family (creator/admin)
router.delete('/members/:memberId', familyController.removeMember);

// Promote member to admin (creator only)
router.post('/members/:memberId/promote', familyController.promoteToAdmin);

// Demote admin to member (creator only)
router.post('/members/:memberId/demote', familyController.demoteFromAdmin);

// Leave family (member only)
router.post('/leave', familyController.leaveFamily);

// Toggle transaction sharing
router.post('/:familyId/share-transactions', familyController.toggleTransactionSharing);

// Delete family (creator only)
router.delete('/:familyId', familyController.deleteFamily);

// Family data sharing routes
router.get('/:familyId/transactions', familyDataController.getFamilyTransactions);
router.get('/:familyId/budgets', familyDataController.getFamilyBudgets);
router.get('/:familyId/goals', familyDataController.getFamilyGoals);
router.get('/:familyId/summary', familyDataController.getFamilySummary);

// ===== FAMILY BUDGETS ROUTES =====
router.post('/:familyId/budgets', familyFinanceController.createFamilyBudget);
router.get('/:familyId/budgets-new', familyFinanceController.getFamilyBudgets);
router.put('/:familyId/budgets/:budgetId', familyFinanceController.updateFamilyBudget);
router.delete('/:familyId/budgets/:budgetId', familyFinanceController.deleteFamilyBudget);

// ===== FAMILY GOALS ROUTES =====
router.post('/:familyId/goals', familyFinanceController.createFamilyGoal);
router.get('/:familyId/goals-new', familyFinanceController.getFamilyGoals);
router.post('/:familyId/goals/:goalId/contribute', familyFinanceController.contributeToGoal);
router.put('/:familyId/goals/:goalId', familyFinanceController.updateFamilyGoal);
router.delete('/:familyId/goals/:goalId', familyFinanceController.deleteFamilyGoal);

export default router;
