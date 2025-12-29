import { Router } from 'express';
import { MLController } from '@/controllers/mlController';
import { authenticateToken } from '@/middleware/auth';
import { transactionCategorizer } from '../ml/categorizer';
import { spamDetector } from '../ml/spamDetector';
import { learningService } from '../ml/learningService';

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

// SMS Parsing endpoints

router.post('/categorize', async (req, res) => {
    try {
        const { merchant, description, amount } = req.body;
        const result = transactionCategorizer.categorize(merchant, description, amount);
        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/detect-spam', async (req, res) => {
    try {
        const { message, sender } = req.body;
        const result = spamDetector.detect(message, sender);
        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/parse-sms', async (req, res) => {
    try {
        const { message, sender, parsedData } = req.body;
        const spamResult = spamDetector.detect(message, sender);

        if (spamResult.isSpam) {
            return res.json({ success: true, isSpam: true, spamConfidence: spamResult.confidence });
        }

        const categoryResult = parsedData?.merchant
            ? transactionCategorizer.categorize(parsedData.merchant, message, parsedData.amount)
            : null;

        res.json({
            success: true,
            isSpam: false,
            category: categoryResult?.category || 'Others',
            categoryConfidence: categoryResult?.confidence || 0.3
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});


router.get('/categories', async (req, res) => {
    try {
        const categories = transactionCategorizer.getCategories();
        res.json({ success: true, categories });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Learning endpoints

router.post('/learn/correction', async (req, res) => {
    try {
        const { merchant, amount, originalCategory, userCategory, description, transactionType } = req.body;
        const userId = (req as any).user.userId;

        const result = await learningService.recordCorrection({
            merchant,
            amount,
            originalCategory,
            userCategory,
            description,
            transactionType,
            userId
        });

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/learn/stats', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const stats = await learningService.getTrainingStats(userId);
        res.json({ success: true, stats });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/learn/patterns', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const patterns = await learningService.getUserPatterns(userId);
        res.json({ success: true, patterns });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/learn/retrain', async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const result = await learningService.retrainModel(userId);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
