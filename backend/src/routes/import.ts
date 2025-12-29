import { Router } from 'express';
import { ImportController } from '@/controllers/importController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const validateImportSchema = Joi.object({
    data: Joi.string().required(),
    format: Joi.string().valid('csv', 'json').required(),
});

const importTransactionsSchema = Joi.object({
    data: Joi.string().required(),
    format: Joi.string().valid('csv', 'json').required(),
    skipDuplicates: Joi.boolean().optional().default(true),
});

// All routes require authentication
router.use(authenticateToken);

// Validate import data
router.post('/validate',
    validate(validateImportSchema),
    ImportController.validateImport
);

// Import transactions
router.post('/transactions',
    validate(importTransactionsSchema),
    ImportController.importTransactions
);

// Get import template
router.get('/template',
    ImportController.getImportTemplate
);

// Get import statistics
router.get('/stats',
    ImportController.getImportStats
);

export default router;
