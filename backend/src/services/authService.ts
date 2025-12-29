import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { config } from '@/config/env';
import prisma from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import logger from '@/utils/logger';

export class AuthService {
  // Register new user
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          ...(data.phone && { phone: data.phone }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          smsSetupComplete: true,
          resetToken: true,
          resetTokenExpiry: true,
          customCategories: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      logger.info('User registered successfully:', { userId: user.id, email: user.email });

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw createError('User with this email already exists', 409);
        }
      }
      throw error;
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      logger.info('Login attempt:', { email: data.email });

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        logger.warn('Login failed - user not found:', { email: data.email });
        throw createError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        logger.warn('Login failed - invalid password:', { email: data.email });
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      logger.info('User logged in successfully:', { userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          smsSetupComplete: user.smsSetupComplete,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry,
          customCategories: user.customCategories,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error details:', { code: error.code, message: error.message });
        throw createError('Database operation failed', 500);
      }
      throw error;
    }
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw createError('Token expired', 401);
      }
      throw createError('Token verification failed', 401);
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          smsSetupComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string }) {
    try {
      // Check if email is already taken by another user
      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          throw createError('Email is already taken', 409);
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          smsSetupComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info('User profile updated:', { userId, updates: data });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw createError('Email is already taken', 409);
        }
      }
      throw error;
    }
  }



  // Mark SMS setup as complete
  static async markSMSSetupComplete(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { smsSetupComplete: true },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          smsSetupComplete: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info('SMS setup marked as complete:', { userId });

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Request password reset - Generate OTP and send email
  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        logger.warn('Password reset requested for non-existent email:', { email });
        return { message: 'If the email exists, a password reset code has been sent.' };
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiry to 10 minutes from now
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);

      // Save OTP and expiry to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: otp,
          resetTokenExpiry: expiryTime,
        },
      });

      // Import and send email
      try {
        const { EmailService } = await import('./emailService');
        await EmailService.sendPasswordResetEmail(email, otp);
        logger.info('Password reset OTP sent via email:', { email, expiresAt: expiryTime });
      } catch (emailError) {
        // If email fails, log OTP to console for testing
        logger.warn('Failed to send email, logging OTP to console:', { email, emailError });
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║              📧 PASSWORD RESET OTP (EMAIL FAILED)          ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`📧 Email: ${email}`);
        console.log(`🔐 OTP Code: ${otp}`);
        console.log(`⏰ Expires: ${expiryTime.toLocaleString()}`);
        console.log('');
        console.log('⚠️  Email sending failed. Use the OTP above for testing.');
        console.log('⚠️  Configure SMTP in .env to enable email delivery.');
        console.log('');
        console.log('════════════════════════════════════════════════════════════');
        console.log('');
      }

      return { message: 'If the email exists, a password reset code has been sent.' };
    } catch (error) {
      logger.error('Error in requestPasswordReset:', error);
      throw createError('Failed to process password reset request', 500);
    }
  }

  // Verify reset OTP
  static async verifyResetOTP(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.resetToken || !user.resetTokenExpiry) {
        logger.warn('OTP verification failed - no reset token:', { email });
        return { valid: false, message: 'Invalid or expired reset code.' };
      }

      // Check if OTP matches
      if (user.resetToken !== otp) {
        logger.warn('OTP verification failed - incorrect code:', { email });
        return { valid: false, message: 'Invalid reset code.' };
      }

      // Check if OTP is expired
      if (new Date() > user.resetTokenExpiry) {
        logger.warn('OTP verification failed - expired:', { email });
        return { valid: false, message: 'Reset code has expired. Please request a new one.' };
      }

      logger.info('OTP verified successfully:', { email });
      return { valid: true, message: 'Reset code verified successfully.' };
    } catch (error) {
      logger.error('Error in verifyResetOTP:', error);
      throw createError('Failed to verify reset code', 500);
    }
  }

  // Reset password with OTP
  static async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      // First verify the OTP
      const verification = await this.verifyResetOTP(email, otp);
      if (!verification.valid) {
        throw createError(verification.message, 400);
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      logger.info('Password reset successfully:', { email });

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      logger.error('Error in resetPassword:', error);
      throw error;
    }
  }

  // Add custom category
  static async addCustomCategory(userId: string, category: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customCategories: true },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Check if category already exists
      if (user.customCategories.includes(category)) {
        return user.customCategories;
      }

      // Add new category
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          customCategories: {
            push: category,
          },
        },
        select: { customCategories: true },
      });

      logger.info('Custom category added:', { userId, category });
      return updatedUser.customCategories;
    } catch (error) {
      logger.error('Error adding custom category:', error);
      throw error;
    }
  }

  // Get custom categories
  static async getCustomCategories(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customCategories: true },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      return user.customCategories || [];
    } catch (error) {
      logger.error('Error fetching custom categories:', error);
      throw error;
    }
  }

  // Remove custom category
  static async removeCustomCategory(userId: string, category: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customCategories: true },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      const updatedCategories = user.customCategories.filter(c => c !== category);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          customCategories: updatedCategories,
        },
        select: { customCategories: true },
      });

      logger.info('Custom category removed:', { userId, category });
      return updatedUser.customCategories;
    } catch (error) {
      logger.error('Error removing custom category:', error);
      throw error;
    }
  }

  static async updateCustomCategory(userId: string, oldName: string, newName: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { customCategories: true },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      if (!user.customCategories.includes(oldName)) {
        throw createError('Category not found', 404);
      }

      if (user.customCategories.includes(newName)) {
        throw createError('Category with new name already exists', 400);
      }

      const updatedCategories = user.customCategories.map(c => c === oldName ? newName : c);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          customCategories: updatedCategories,
        },
        select: { customCategories: true },
      });

      logger.info('Custom category updated:', { userId, oldName, newName });
      return updatedUser.customCategories;
    } catch (error) {
      logger.error('Error updating custom category:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw createError('Current password is incorrect', 401);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info('Password changed successfully:', { userId });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  // Delete account
  static async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError('Password is incorrect', 401);
      }

      // Delete all user data in transaction
      await prisma.$transaction(async (tx) => {
        // Delete transactions
        await tx.transaction.deleteMany({ where: { userId } });

        // Delete budgets
        await tx.budget.deleteMany({ where: { userId } });

        // Delete goals
        await tx.goal.deleteMany({ where: { userId } });

        // Delete family memberships
        await tx.familyMember.deleteMany({ where: { userId } });

        // Delete families where user is admin
        await tx.family.deleteMany({ where: { creatorId: userId } });

        // Finally delete user
        await tx.user.delete({ where: { id: userId } });
      });

      logger.info('Account deleted successfully:', { userId });
    } catch (error) {
      logger.error('Error deleting account:', error);
      throw error;
    }
  }
}
