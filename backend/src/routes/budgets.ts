import { Router } from 'express';
import { BudgetController } from '@/controllers/budgetController';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { 
  createBudgetSchema, 
  updateBudgetSchema 
} from '@/utils/validation';
import Joi from 'joi';

// Create a separate schema for query validation
const budgetPeriodSchema = Joi.object({
  period: Joi.string().valid('weekly', 'monthly', 'quarterly', 'yearly').optional()
});

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Budget CRUD operations
router.post('/', 
  validate(createBudgetSchema),
  BudgetController.createBudget
);

router.get('/', 
  validateQuery(budgetPeriodSchema),
  BudgetController.getBudgets
);

router.get('/:id', 
  BudgetController.getBudgetById
);

router.put('/:id', 
  validate(updateBudgetSchema),
  BudgetController.updateBudget
);

router.delete('/:id', 
  BudgetController.deleteBudget
);

// Statistics and management
router.get('/stats/overview', 
  validateQuery(budgetPeriodSchema),
  BudgetController.getBudgetStats
);

router.post('/reset-spending', 
  BudgetController.resetBudgetSpending
);

router.get('/alerts/list', 
  BudgetController.getBudgetAlerts
);

export default router;
