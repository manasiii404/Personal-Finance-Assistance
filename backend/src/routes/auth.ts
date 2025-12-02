import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { authLimiter } from '@/middleware/rateLimiter';
import {
  loginSchema,
  registerSchema
} from '@/utils/validation';

const router = Router();

// Public routes
router.post('/register',
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

router.post('/login',
  authLimiter,
  validate(loginSchema),
  AuthController.login
);

// Protected routes
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

router.put('/profile',
  authenticateToken,
  AuthController.updateProfile
);

router.put('/change-password',
  authenticateToken,
  AuthController.changePassword
);

router.delete('/account',
  authenticateToken,
  AuthController.deleteAccount
);

router.put('/sms-setup-complete',
  authenticateToken,
  AuthController.markSMSSetupComplete
);

export default router;
