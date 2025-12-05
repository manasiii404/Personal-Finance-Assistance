import { Request, Response } from 'express';
import { aiInsightsService } from '../services/AIInsightsService';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class AIInsightsController {
  /**
   * Get AI-powered financial insights for the authenticated user
   */
  static async getInsights(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if AI insights are enabled
      if (!aiInsightsService.isEnabled()) {
        return res.status(503).json({
          success: false,
          message: 'AI insights service is not available'
        });
      }

      // Get user's transactions for current month analysis
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          createdAt: { gte: oneMonthAgo }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Generate insights using AI service
      const insights = await aiInsightsService.generateInsights(transactions);

      return res.json({
        success: true,
        data: {
          insights,
          metadata: {
            transactionCount: transactions.length,
            generatedAt: new Date().toISOString(),
            aiEnabled: true
          }
        }
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate insights'
      });
    }
  }

  /**
   * Get AI insights status and configuration
   */
  static async getStatus(req: AuthRequest, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          enabled: aiInsightsService.isEnabled(),
          features: {
            spendingAnalysis: true,
            savingsRecommendations: true,
            budgetOptimization: true,
            trendAnalysis: true
          }
        }
      });
    } catch (error) {
      console.error('Error getting AI insights status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get status'
      });
    }
  }
}
