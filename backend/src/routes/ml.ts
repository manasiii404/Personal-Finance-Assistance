import { Router } from 'express';
import { MLController } from '@/controllers/mlController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Training endpoints
router.post('/train/categorizer', MLController.trainCategorizer);
router.post('/train/forecaster', MLController.trainForecaster);
router.post('/train/all', MLController.trainAllModels);

// Prediction endpoints
router.post('/categorize/predict', MLController.predictCategory);
router.get('/forecast', MLController.getForecast);
router.get('/forecast/next-month', MLController.getNextMonthForecast);

// Status endpoint
router.get('/status', MLController.getModelStatus);

export default router;
