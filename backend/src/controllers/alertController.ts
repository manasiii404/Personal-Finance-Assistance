import { Request, Response } from 'express';
import { AlertService } from '@/services/alertService';
import { asyncHandler } from '@/middleware/errorHandler';
import { CreateAlertRequest } from '@/types';
import logger from '@/utils/logger';

export class AlertController {
  // Create alert
  static createAlert = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: CreateAlertRequest = req.body;
    
    const alert = await AlertService.createAlert(userId, data);
    
    logger.info('Alert created:', { alertId: alert.id, userId });
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert,
    });
  });

  // Get alerts
  static getAlerts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { unreadOnly } = req.query;
    
    const alerts = await AlertService.getAlerts(userId, unreadOnly === 'true');
    
    res.json({
      success: true,
      message: 'Alerts retrieved successfully',
      data: alerts,
    });
  });

  // Get alert by ID
  static getAlertById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const alert = await AlertService.getAlertById(userId, id);
    
    res.json({
      success: true,
      message: 'Alert retrieved successfully',
      data: alert,
    });
  });

  // Mark alert as read
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const alert = await AlertService.markAsRead(userId, id);
    
    logger.info('Alert marked as read:', { alertId: id, userId });
    
    res.json({
      success: true,
      message: 'Alert marked as read',
      data: alert,
    });
  });

  // Mark all alerts as read
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const result = await AlertService.markAllAsRead(userId);
    
    logger.info('All alerts marked as read:', { userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Delete alert
  static deleteAlert = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const result = await AlertService.deleteAlert(userId, id);
    
    logger.info('Alert deleted:', { alertId: id, userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Clear all alerts
  static clearAllAlerts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const result = await AlertService.clearAllAlerts(userId);
    
    logger.info('All alerts cleared:', { userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get unread count
  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const result = await AlertService.getUnreadCount(userId);
    
    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: result,
    });
  });
}
