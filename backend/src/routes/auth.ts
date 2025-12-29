import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { authLimiter } from '@/middleware/rateLimiter';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  verifyOTPSchema,
  resetPasswordSchema,
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

// Password reset routes
router.post('/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  AuthController.requestPasswordReset
);

router.post('/verify-otp',
  authLimiter,
  validate(verifyOTPSchema),
  AuthController.verifyResetOTP
);

router.post('/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected routes
router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

router.put('/profile',
  authenticateToken,
  validate(updateProfileSchema),
  AuthController.updateProfile
);

router.put('/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  AuthController.changePassword
);

router.delete('/account',
  authenticateToken,
  validate(deleteAccountSchema),
  AuthController.deleteAccount
);

router.put('/sms-setup-complete',
  authenticateToken,
  AuthController.markSMSSetupComplete
);

// Custom categories routes
router.get('/custom-categories',
  authenticateToken,
  AuthController.getCustomCategories
);

router.post('/custom-categories',
  authenticateToken,
  AuthController.addCustomCategory
);

router.delete('/custom-categories',
  authenticateToken,
  AuthController.removeCustomCategory
);

router.put('/custom-categories',
  authenticateToken,
  AuthController.updateCustomCategory
);

router.get('/custom-categories/:category/usage',
  authenticateToken,
  AuthController.checkCategoryUsage
);

export default router;
