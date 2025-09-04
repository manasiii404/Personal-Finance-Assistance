import OpenAI from 'openai';
import { config } from '@/config/env';
import { FinancialInsights, SpendingByCategory, MonthlyTrend } from '@/types';
import logger from '@/utils/logger';

export class AIService {
  private static openai: OpenAI | null = null;

  // Initialize OpenAI client
  private static getOpenAI(): OpenAI | null {
    if (!config.openaiApiKey) {
      logger.warn('OpenAI API key not configured');
      return null;
    }

    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }

    return this.openai;
  }

  // Generate financial insights
  static async generateInsights(
    totalIncome: number,
    totalExpenses: number,
    spendingByCategory: SpendingByCategory[],
    monthlyTrends: MonthlyTrend[],
    budgetAlerts: string[],
    goalProgress: any
  ): Promise<FinancialInsights> {
    try {
      const openai = this.getOpenAI();
      
      if (!openai) {
        return this.generateBasicInsights(
          totalIncome,
          totalExpenses,
          spendingByCategory,
          monthlyTrends,
          budgetAlerts,
          goalProgress
        );
      }

      const prompt = this.buildInsightsPrompt(
        totalIncome,
        totalExpenses,
        spendingByCategory,
        monthlyTrends,
        budgetAlerts,
        goalProgress
      );

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor AI. Provide helpful, actionable financial insights and recommendations based on the user\'s financial data. Be concise and practical.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      const recommendations = this.parseAIResponse(aiResponse);

      return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
        topSpendingCategory: spendingByCategory[0]?.category || 'N/A',
        averageDailySpending: totalExpenses / 30,
        largestExpense: Math.max(...spendingByCategory.map(c => c.amount)),
        budgetAlerts,
        goalProgress,
        recommendations,
      };
    } catch (error) {
      logger.error('Error generating AI insights:', error);
      return this.generateBasicInsights(
        totalIncome,
        totalExpenses,
        spendingByCategory,
        monthlyTrends,
        budgetAlerts,
        goalProgress
      );
    }
  }

  // Generate basic insights without AI
  private static generateBasicInsights(
    totalIncome: number,
    totalExpenses: number,
    spendingByCategory: SpendingByCategory[],
    monthlyTrends: MonthlyTrend[],
    budgetAlerts: string[],
    goalProgress: any
  ): FinancialInsights {
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    const recommendations = [];

    // Savings rate recommendations
    if (savingsRate < 10) {
      recommendations.push('Consider increasing your savings rate to at least 10% of your income');
    } else if (savingsRate > 20) {
      recommendations.push('Great job! You have a healthy savings rate');
    }

    // Spending category recommendations
    const topCategory = spendingByCategory[0];
    if (topCategory && topCategory.percentage > 40) {
      recommendations.push(`Consider reducing spending in ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of expenses)`);
    }

    // Budget alerts
    if (budgetAlerts.length > 0) {
      recommendations.push('Review your budget alerts and consider adjusting spending limits');
    }

    // Goal progress
    if (goalProgress.percentage < 50) {
      recommendations.push('Consider increasing contributions to your financial goals');
    }

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topSpendingCategory: topCategory?.category || 'N/A',
      averageDailySpending: totalExpenses / 30,
      largestExpense: Math.max(...spendingByCategory.map(c => c.amount), 0),
      budgetAlerts,
      goalProgress,
      recommendations,
    };
  }

  // Build prompt for AI
  private static buildInsightsPrompt(
    totalIncome: number,
    totalExpenses: number,
    spendingByCategory: SpendingByCategory[],
    monthlyTrends: MonthlyTrend[],
    budgetAlerts: string[],
    goalProgress: any
  ): string {
    return `
Financial Data Analysis:

Income: $${totalIncome.toFixed(2)}
Expenses: $${totalExpenses.toFixed(2)}
Net Income: $${(totalIncome - totalExpenses).toFixed(2)}
Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%

Top Spending Categories:
${spendingByCategory.slice(0, 5).map(c => `- ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`).join('\n')}

Monthly Trends:
${monthlyTrends.slice(-3).map(t => `- ${t.month}: Income $${t.income.toFixed(2)}, Expenses $${t.expenses.toFixed(2)}, Savings $${t.savings.toFixed(2)}`).join('\n')}

Budget Alerts: ${budgetAlerts.length > 0 ? budgetAlerts.join(', ') : 'None'}

Goal Progress: ${goalProgress.percentage.toFixed(1)}% complete (${goalProgress.completed}/${goalProgress.total} goals)

Please provide 3-5 actionable financial recommendations based on this data.
    `.trim();
  }

  // Parse AI response into recommendations array
  private static parseAIResponse(response: string): string[] {
    const recommendations = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.?\s*$/))
      .map(line => line.replace(/^\d+\.?\s*/, ''))
      .slice(0, 5);

    return recommendations.length > 0 ? recommendations : [
      'Review your spending patterns regularly',
      'Consider setting up automatic savings transfers',
      'Track your financial goals monthly',
    ];
  }

  // Generate spending analysis
  static async analyzeSpendingPatterns(spendingByCategory: SpendingByCategory[]): Promise<string[]> {
    try {
      const openai = this.getOpenAI();
      
      if (!openai) {
        return this.generateBasicSpendingAnalysis(spendingByCategory);
      }

      const prompt = `
Analyze these spending patterns and provide insights:

${spendingByCategory.map(c => `${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`).join('\n')}

Provide 3-4 specific insights about spending patterns and potential optimizations.
      `.trim();

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst. Provide specific, actionable insights about spending patterns.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return this.parseAIResponse(response.choices[0]?.message?.content || '');
    } catch (error) {
      logger.error('Error analyzing spending patterns:', error);
      return this.generateBasicSpendingAnalysis(spendingByCategory);
    }
  }

  // Generate basic spending analysis
  private static generateBasicSpendingAnalysis(spendingByCategory: SpendingByCategory[]): string[] {
    const insights = [];
    const topCategory = spendingByCategory[0];

    if (topCategory && topCategory.percentage > 30) {
      insights.push(`${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your spending - consider if this is necessary`);
    }

    const foodSpending = spendingByCategory.find(c => c.category.toLowerCase().includes('food'));
    if (foodSpending && foodSpending.percentage > 25) {
      insights.push('Food spending is high - consider meal planning or cooking at home more often');
    }

    const entertainmentSpending = spendingByCategory.find(c => c.category.toLowerCase().includes('entertainment'));
    if (entertainmentSpending && entertainmentSpending.percentage > 15) {
      insights.push('Entertainment spending could be optimized - look for free or low-cost alternatives');
    }

    if (insights.length === 0) {
      insights.push('Your spending appears well-distributed across categories');
    }

    return insights;
  }

  // Generate goal recommendations
  static async generateGoalRecommendations(goals: any[]): Promise<string[]> {
    try {
      const openai = this.getOpenAI();
      
      if (!openai) {
        return this.generateBasicGoalRecommendations(goals);
      }

      const prompt = `
Analyze these financial goals and provide recommendations:

${goals.map(g => `${g.title}: $${g.current.toFixed(2)} / $${g.target.toFixed(2)} (${g.percentage.toFixed(1)}%) - Due: ${g.deadline}`).join('\n')}

Provide 3-4 specific recommendations for achieving these goals.
      `.trim();

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial planner. Provide specific, actionable recommendations for achieving financial goals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return this.parseAIResponse(response.choices[0]?.message?.content || '');
    } catch (error) {
      logger.error('Error generating goal recommendations:', error);
      return this.generateBasicGoalRecommendations(goals);
    }
  }

  // Generate basic goal recommendations
  private static generateBasicGoalRecommendations(goals: any[]): string[] {
    const recommendations = [];
    const overdueGoals = goals.filter(g => g.isOverdue);
    const urgentGoals = goals.filter(g => g.daysLeft <= 30 && g.percentage < 50);

    if (overdueGoals.length > 0) {
      recommendations.push('Focus on completing overdue goals or adjust their deadlines');
    }

    if (urgentGoals.length > 0) {
      recommendations.push('Increase contributions to urgent goals that are due soon');
    }

    const lowProgressGoals = goals.filter(g => g.percentage < 25);
    if (lowProgressGoals.length > 0) {
      recommendations.push('Consider breaking down large goals into smaller, achievable milestones');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up the good work on your financial goals');
    }

    return recommendations;
  }
}
