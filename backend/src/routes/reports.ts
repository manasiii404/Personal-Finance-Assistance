import { Router } from 'express';
import { ReportsController } from '@/controllers/reportsController';
import { authenticateToken } from '@/middleware/auth';
import { exportLimiter } from '@/middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Report generation endpoints
router.get('/monthly', ReportsController.generateMonthlyReport);
router.get('/category', ReportsController.generateCategoryReport);
router.get('/trends', ReportsController.generateTrendReport);
router.get('/ai-insights', exportLimiter, ReportsController.generateAIReport);

export default router;
