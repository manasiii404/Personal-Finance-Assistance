import { Request, Response } from 'express';
import { BudgetService } from '@/services/budgetService';
import { asyncHandler } from '@/middleware/errorHandler';
import { CreateBudgetRequest, UpdateBudgetRequest } from '@/types';
import logger from '@/utils/logger';

export class BudgetController {
  // Create budget
  static createBudget = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: CreateBudgetRequest = req.body;
    
    const budget = await BudgetService.createBudget(userId, data);
    
    logger.info('Budget created:', { budgetId: budget.id, userId });
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget,
    });
  });

  // Get budgets
  static getBudgets = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { period } = req.query;
    
    const budgets = await BudgetService.getBudgets(userId, period as string);
    
    res.json({
      success: true,
      message: 'Budgets retrieved successfully',
      data: budgets,
    });
  });

  // Get budget by ID
  static getBudgetById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const budget = await BudgetService.getBudgetById(userId, id);
    
    res.json({
      success: true,
      message: 'Budget retrieved successfully',
      data: budget,
    });
  });

  // Update budget
  static updateBudget = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data: UpdateBudgetRequest = req.body;
    
    const budget = await BudgetService.updateBudget(userId, id, data);
    
    logger.info('Budget updated:', { budgetId: id, userId });
    
    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  });

  // Delete budget
  static deleteBudget = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const result = await BudgetService.deleteBudget(userId, id);
    
    logger.info('Budget deleted:', { budgetId: id, userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get budget statistics
  static getBudgetStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { period } = req.query;
    
    const stats = await BudgetService.getBudgetStats(userId, period as string);
    
    res.json({
      success: true,
      message: 'Budget statistics retrieved successfully',
      data: stats,
    });
  });

  // Reset budget spending
  static resetBudgetSpending = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { period } = req.body;
    
    const result = await BudgetService.resetBudgetSpending(userId, period);
    
    logger.info('Budget spending reset:', { userId, period });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get budget alerts
  static getBudgetAlerts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const alerts = await BudgetService.getBudgetAlerts(userId);
    
    res.json({
      success: true,
      message: 'Budget alerts retrieved successfully',
      data: alerts,
    });
  });
}
