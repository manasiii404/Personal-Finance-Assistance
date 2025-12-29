import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { createError } from '@/middleware/errorHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { LoginRequest, RegisterRequest } from '@/types';
import logger from '@/utils/logger';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterRequest = req.body;

    const result = await AuthService.register(data);

    logger.info('User registered successfully:', { email: data.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response) => {
    const data: LoginRequest = req.body;

    const result = await AuthService.login(data);

    logger.info('User logged in successfully:', { email: data.email });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  // Get current user profile
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const user = await AuthService.getUserById(userId);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  });

  // Update user profile
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data = req.body;

    const user = await AuthService.updateProfile(userId, data);

    logger.info('User profile updated:', { userId, updates: data });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  // Change password
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('New password must be at least 8 characters long', 400);
    }

    await AuthService.changePassword(userId, currentPassword, newPassword);

    logger.info('User password changed:', { userId });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  // Delete user account
  static deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { password } = req.body;

    if (!password) {
      throw createError('Password is required to delete account', 400);
    }

    await AuthService.deleteAccount(userId, password);

    logger.info('User account deleted:', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  });

  // Mark SMS setup as complete
  static markSMSSetupComplete = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const user = await AuthService.markSMSSetupComplete(userId);

    logger.info('SMS setup marked as complete:', { userId });

    res.json({
      success: true,
      message: 'SMS setup marked as complete',
      data: user,
    });
  });

  // Request password reset
  static requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    const result = await AuthService.requestPasswordReset(email);

    logger.info('Password reset requested:', { email });

    res.json({
      success: true,
      message: result.message,
    });
  });

  // Verify reset OTP
  static verifyResetOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    const result = await AuthService.verifyResetOTP(email, otp);

    if (!result.valid) {
      throw createError(result.message, 400);
    }

    logger.info('Reset OTP verified:', { email });

    res.json({
      success: true,
      message: result.message,
    });
  });

  // Reset password
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw createError('Email, OTP, and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    const result = await AuthService.resetPassword(email, otp, newPassword);

    logger.info('Password reset completed:', { email });

    res.json({
      success: true,
      message: result.message,
    });
  });

  // Add custom category
  static addCustomCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { category } = req.body;

    if (!category || typeof category !== 'string') {
      throw createError('Category name is required', 400);
    }

    const categories = await AuthService.addCustomCategory(userId, category.trim());

    res.json({
      success: true,
      message: 'Custom category added successfully',
      data: categories,
    });
  });

  // Get custom categories
  static getCustomCategories = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const categories = await AuthService.getCustomCategories(userId);

    res.json({
      success: true,
      message: 'Custom categories retrieved successfully',
      data: categories,
    });
  });

  // Remove custom category
  static removeCustomCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { category } = req.body;

    if (!category || typeof category !== 'string') {
      throw createError('Category name is required', 400);
    }

    const categories = await AuthService.removeCustomCategory(userId, category);

    res.json({
      success: true,
      message: 'Custom category removed successfully',
      data: categories,
    });
  });

  // Update custom category (rename)
  static updateCustomCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      throw createError('Both old and new category names are required', 400);
    }

    const categories = await AuthService.updateCustomCategory(userId, oldName.trim(), newName.trim());

    res.json({
      success: true,
      message: 'Custom category updated successfully',
      data: categories,
    });
  });

  // Check category usage
  static checkCategoryUsage = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { category } = req.params;

    const { TransactionService } = await import('../services/transactionService');
    const count = await TransactionService.countByCategory(userId, category);

    res.json({
      success: true,
      data: { category, transactionCount: count },
    });
  });
}
