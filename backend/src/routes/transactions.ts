import { Router } from 'express';
import { TransactionController } from '@/controllers/transactionController';
import { authenticateToken } from '@/middleware/auth';
import { validate, validateQuery } from '@/middleware/validation';
import { smsLimiter, exportLimiter } from '@/middleware/rateLimiter';
import { 
  createTransactionSchema, 
  updateTransactionSchema,
  transactionFiltersSchema,
  smsParseSchema 
} from '@/utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Transaction CRUD operations
router.post('/', 
  validate(createTransactionSchema),
  TransactionController.createTransaction
);

router.get('/', 
  validateQuery(transactionFiltersSchema),
  TransactionController.getTransactions
);

router.get('/:id', 
  TransactionController.getTransactionById
);

router.put('/:id', 
  validate(updateTransactionSchema),
  TransactionController.updateTransaction
);

router.delete('/:id', 
  TransactionController.deleteTransaction
);

// Statistics and analytics
router.get('/stats/overview', 
  TransactionController.getTransactionStats
);

router.get('/stats/categories', 
  TransactionController.getSpendingByCategory
);

// SMS parsing
router.post('/parse-sms', 
  smsLimiter,
  validate(smsParseSchema),
  TransactionController.parseSMS
);

router.post('/create-from-sms', 
  smsLimiter,
  validate(smsParseSchema),
  TransactionController.createFromSMS
);

// Export
router.get('/export/data', 
  exportLimiter,
  TransactionController.exportTransactions
);

// Utility
router.get('/sms/patterns', 
  TransactionController.getSupportedSMSPatterns
);

export default router;
