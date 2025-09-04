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
    
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    
    logger.info('User password changed:', { userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Delete user account
  static deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { password } = req.body;
    
    if (!password) {
      throw createError('Password is required to delete account', 400);
    }
    
    const result = await AuthService.deleteAccount(userId, password);
    
    logger.info('User account deleted:', { userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });
}
