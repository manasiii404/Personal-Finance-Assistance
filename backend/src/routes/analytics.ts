import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analyticsController';
import { authenticateToken } from '@/middleware/auth';
import { validateQuery } from '@/middleware/validation';
import { exportLimiter } from '@/middleware/rateLimiter';
import { analyticsFiltersSchema } from '@/utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics endpoints
router.get('/insights', 
  validateQuery(analyticsFiltersSchema),
  AnalyticsController.getFinancialInsights
);

router.get('/spending-analysis', 
  validateQuery(analyticsFiltersSchema),
  AnalyticsController.getSpendingAnalysis
);

router.get('/goal-recommendations', 
  AnalyticsController.getGoalRecommendations
);

router.get('/monthly-trends', 
  validateQuery(analyticsFiltersSchema.pick({ months: true })),
  AnalyticsController.getMonthlyTrends
);

router.get('/category-breakdown', 
  validateQuery(analyticsFiltersSchema),
  AnalyticsController.getCategoryBreakdown
);

// Export
router.get('/export/report', 
  exportLimiter,
  validateQuery(analyticsFiltersSchema),
  AnalyticsController.exportAnalyticsReport
);

export default router;
