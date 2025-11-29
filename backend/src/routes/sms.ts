import { Router } from 'express';
import { SMSController } from '@/controllers/smsController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// SMS webhook from mobile app
router.post('/sms-webhook',
    authenticateToken,
    SMSController.processSMS
);

// Get SMS parsing history
router.get('/sms-history',
    authenticateToken,
    SMSController.getHistory
);

export default router;
