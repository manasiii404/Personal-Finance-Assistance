import { Router } from 'express';
import { BudgetController } from '@/controllers/budgetController';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { 
  createBudgetSchema, 
  updateBudgetSchema 
} from '@/utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Budget CRUD operations
router.post('/', 
  validate(createBudgetSchema),
  BudgetController.createBudget
);

router.get('/', 
  validateQuery(createBudgetSchema.pick({ period: true })),
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
  validateQuery(createBudgetSchema.pick({ period: true })),
  BudgetController.getBudgetStats
);

router.post('/reset-spending', 
  BudgetController.resetBudgetSpending
);

router.get('/alerts/list', 
  BudgetController.getBudgetAlerts
);

export default router;
