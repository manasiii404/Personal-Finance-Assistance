import { Router } from 'express';
import { GoalController } from '@/controllers/goalController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { 
  createGoalSchema, 
  updateGoalSchema,
  addContributionSchema 
} from '@/utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Goal CRUD operations
router.post('/', 
  validate(createGoalSchema),
  GoalController.createGoal
);

router.get('/', 
  GoalController.getGoals
);

router.get('/:id', 
  GoalController.getGoalById
);

router.put('/:id', 
  validate(updateGoalSchema),
  GoalController.updateGoal
);

router.delete('/:id', 
  GoalController.deleteGoal
);

// Goal management
router.post('/:id/contribute', 
  validate(addContributionSchema),
  GoalController.addContribution
);

// Statistics and analytics
router.get('/stats/overview', 
  GoalController.getGoalStats
);

router.get('/alerts/list', 
  GoalController.getGoalAlerts
);

router.get('/analytics/categories', 
  GoalController.getGoalsByCategory
);

export default router;
