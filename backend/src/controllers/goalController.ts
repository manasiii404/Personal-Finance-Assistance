import { Request, Response } from 'express';
import { GoalService } from '@/services/goalService';
import { asyncHandler } from '@/middleware/errorHandler';
import { CreateGoalRequest, UpdateGoalRequest, AddContributionRequest } from '@/types';
import logger from '@/utils/logger';

export class GoalController {
  // Create goal
  static createGoal = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: CreateGoalRequest = req.body;
    
    const goal = await GoalService.createGoal(userId, data);
    
    logger.info('Goal created:', { goalId: goal.id, userId });
    
    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  });

  // Get goals
  static getGoals = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const goals = await GoalService.getGoals(userId);
    
    res.json({
      success: true,
      message: 'Goals retrieved successfully',
      data: goals,
    });
  });

  // Get goal by ID
  static getGoalById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const goal = await GoalService.getGoalById(userId, id);
    
    res.json({
      success: true,
      message: 'Goal retrieved successfully',
      data: goal,
    });
  });

  // Update goal
  static updateGoal = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data: UpdateGoalRequest = req.body;
    
    const goal = await GoalService.updateGoal(userId, id, data);
    
    logger.info('Goal updated:', { goalId: id, userId });
    
    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  });

  // Add contribution to goal
  static addContribution = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const data: AddContributionRequest = req.body;
    
    const result = await GoalService.addContribution(userId, id, data);
    
    logger.info('Contribution added to goal:', { goalId: id, userId, amount: data.amount });
    
    res.json({
      success: true,
      message: 'Contribution added successfully',
      data: result,
    });
  });

  // Delete goal
  static deleteGoal = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const result = await GoalService.deleteGoal(userId, id);
    
    logger.info('Goal deleted:', { goalId: id, userId });
    
    res.json({
      success: true,
      message: result.message,
    });
  });

  // Get goal statistics
  static getGoalStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const stats = await GoalService.getGoalStats(userId);
    
    res.json({
      success: true,
      message: 'Goal statistics retrieved successfully',
      data: stats,
    });
  });

  // Get goal alerts
  static getGoalAlerts = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const alerts = await GoalService.getGoalAlerts(userId);
    
    res.json({
      success: true,
      message: 'Goal alerts retrieved successfully',
      data: alerts,
    });
  });

  // Get goals by category
  static getGoalsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const goalsByCategory = await GoalService.getGoalsByCategory(userId);
    
    res.json({
      success: true,
      message: 'Goals by category retrieved successfully',
      data: goalsByCategory,
    });
  });
}
