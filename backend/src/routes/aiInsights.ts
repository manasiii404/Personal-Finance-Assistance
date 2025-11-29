import { Router } from 'express';
import { AIInsightsController } from '../controllers/aiInsightsController';
import { authenticateToken } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for AI insights (more restrictive due to API costs)
const aiInsightsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many AI insight requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authenticateToken);

// Get AI insights for user's financial data
router.get('/', aiInsightsRateLimit, AIInsightsController.getInsights);

// Get AI insights service status
router.get('/status', AIInsightsController.getStatus);

export default router;
