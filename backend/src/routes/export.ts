import { Router } from 'express';
import { ExportController } from '@/controllers/exportController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import Joi from 'joi';

const router = Router();

// Validation schemas
const exportDataSchema = Joi.object({
    format: Joi.string().valid('csv', 'json').required(),
    dataType: Joi.string().valid('transactions', 'budgets', 'goals', 'all').required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    category: Joi.string().optional(),
    type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
});

const exportPreviewSchema = Joi.object({
    dataType: Joi.string().valid('transactions', 'budgets', 'goals', 'all').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    category: Joi.string().optional(),
    type: Joi.string().valid('INCOME', 'EXPENSE').optional(),
});

// All routes require authentication
router.use(authenticateToken);

// Export data
router.post('/data',
    validate(exportDataSchema),
    ExportController.exportData
);

// Get export preview
router.post('/preview',
    validate(exportPreviewSchema),
    ExportController.getExportPreview
);

export default router;
