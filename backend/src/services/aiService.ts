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

  // Generate monthly recommendations (privacy-preserving)
  static async generateMonthlyRecommendations(
    stats: any,
    categoryData: any[],
    budgets: any[],
    goals: any[]
  ): Promise<string[]> {
    try {
      const openai = this.getOpenAI();

      if (!openai) {
        return this.generateBasicMonthlyRecommendations(stats, categoryData, budgets);
      }

      // Privacy: Send only aggregated, anonymized data
      const anonymizedData = {
        savingsRate: stats.savingsRate.toFixed(1),
        topCategories: categoryData.slice(0, 3).map(c => ({
          category: c.category,
          percentage: c.percentage.toFixed(1)
        })),
        budgetStatus: budgets.length > 0 ? {
          onTrack: budgets.filter(b => b.spent <= b.limit).length,
          total: budgets.length,
        } : null,
        goalProgress: goals.length > 0 ? {
          completed: goals.filter(g => g.percentage >= 100).length,
          total: goals.length,
        } : null,
      };

      const prompt = `
Based on this monthly financial summary, provide 3-4 actionable recommendations:

Savings Rate: ${anonymizedData.savingsRate}%
Top Spending: ${anonymizedData.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}
Budget Performance: ${anonymizedData.budgetStatus ? `${anonymizedData.budgetStatus.onTrack}/${anonymizedData.budgetStatus.total} on track` : 'No budgets set'}
Goal Progress: ${anonymizedData.goalProgress ? `${anonymizedData.goalProgress.completed}/${anonymizedData.goalProgress.total} completed` : 'No goals set'}

Provide specific, actionable recommendations for next month.
      `.trim();

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor. Provide concise, actionable monthly financial recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      return this.parseAIResponse(response.choices[0]?.message?.content || '');
    } catch (error) {
      logger.error('Error generating monthly recommendations:', error);
      return this.generateBasicMonthlyRecommendations(stats, categoryData, budgets);
    }
  }

  // Generate basic monthly recommendations
  private static generateBasicMonthlyRecommendations(
    stats: any,
    categoryData: any[],
    budgets: any[]
  ): string[] {
    const recommendations = [];

    if (stats.savingsRate < 10) {
      recommendations.push('Aim to save at least 10% of your income next month');
    } else if (stats.savingsRate > 20) {
      recommendations.push('Excellent savings rate! Consider investing surplus funds');
    }

    const topCategory = categoryData[0];
    if (topCategory && topCategory.percentage > 35) {
      recommendations.push(`Review ${topCategory.category} spending - it's ${topCategory.percentage.toFixed(1)}% of your expenses`);
    }

    const overBudget = budgets.filter(b => b.spent > b.limit);
    if (overBudget.length > 0) {
      recommendations.push(`${overBudget.length} budget(s) exceeded - adjust limits or reduce spending`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep maintaining your current financial habits');
    }

    return recommendations;
  }

  // Generate category-specific insights (privacy-preserving)
  static async generateCategoryInsights(categoryData: any[]): Promise<string[]> {
    try {
      const openai = this.getOpenAI();

      if (!openai) {
        return this.generateBasicCategoryInsights(categoryData);
      }

      // Privacy: Send only percentages, not absolute amounts
      const anonymizedCategories = categoryData.slice(0, 5).map(c => ({
        category: c.category,
        percentage: c.percentage.toFixed(1),
        transactionCount: c.transactionCount
      }));

      const prompt = `
Analyze these spending categories and provide insights:

${anonymizedCategories.map(c => `${c.category}: ${c.percentage}% (${c.transactionCount} transactions)`).join('\n')}

Provide 3-4 specific insights about spending distribution and optimization opportunities.
      `.trim();

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst. Analyze spending categories and provide actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      return this.parseAIResponse(response.choices[0]?.message?.content || '');
    } catch (error) {
      logger.error('Error generating category insights:', error);
      return this.generateBasicCategoryInsights(categoryData);
    }
  }

  // Generate basic category insights
  private static generateBasicCategoryInsights(categoryData: any[]): string[] {
    const insights = [];
    const topThree = categoryData.slice(0, 3);

    if (topThree.length > 0) {
      insights.push(`Top 3 categories account for ${topThree.reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}% of spending`);
    }

    const highFrequency = categoryData.find(c => c.transactionCount > 20);
    if (highFrequency) {
      insights.push(`${highFrequency.category} has frequent transactions - consider consolidating or automating`);
    }

    const diversified = categoryData.length > 8;
    if (diversified) {
      insights.push('Spending is well-diversified across categories');
    } else if (categoryData.length < 4) {
      insights.push('Consider tracking more specific categories for better insights');
    }

    return insights.length > 0 ? insights : ['Track spending regularly to identify patterns'];
  }

  // Generate budget suggestions (privacy-preserving)
  static async generateBudgetSuggestions(
    stats: any,
    categoryData: any[],
    budgets: any[]
  ): Promise<string[]> {
    try {
      const openai = this.getOpenAI();

      if (!openai) {
        return this.generateBasicBudgetSuggestions(stats, categoryData, budgets);
      }

      // Privacy: Use normalized data (percentage of income)
      const normalizedData = {
        savingsRate: stats.savingsRate.toFixed(1),
        topSpending: categoryData.slice(0, 3).map(c => ({
          category: c.category,
          percentageOfTotal: c.percentage.toFixed(1)
        })),
        budgetCoverage: budgets.length > 0 ? {
          categoriesBudgeted: budgets.length,
          totalCategories: categoryData.length,
        } : null,
      };

      const prompt = `
Based on this spending data, suggest budget improvements:

Savings Rate: ${normalizedData.savingsRate}%
Top Spending: ${normalizedData.topSpending.map(c => `${c.category} (${c.percentageOfTotal}%)`).join(', ')}
Budget Coverage: ${normalizedData.budgetCoverage ? `${normalizedData.budgetCoverage.categoriesBudgeted}/${normalizedData.budgetCoverage.totalCategories} categories` : 'No budgets set'}

Provide 3-4 specific budget recommendations.
      `.trim();

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a budgeting expert. Provide specific, practical budget recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      return this.parseAIResponse(response.choices[0]?.message?.content || '');
    } catch (error) {
      logger.error('Error generating budget suggestions:', error);
      return this.generateBasicBudgetSuggestions(stats, categoryData, budgets);
    }
  }

  // Generate basic budget suggestions
  private static generateBasicBudgetSuggestions(
    stats: any,
    categoryData: any[],
    budgets: any[]
  ): string[] {
    const suggestions = [];

    const unbudgetedCategories = categoryData.filter(
      c => !budgets.some(b => b.category === c.category)
    );

    if (unbudgetedCategories.length > 0) {
      suggestions.push(`Set budgets for ${unbudgetedCategories.slice(0, 2).map(c => c.category).join(' and ')}`);
    }

    const topCategory = categoryData[0];
    if (topCategory && topCategory.percentage > 30) {
      suggestions.push(`Consider setting a stricter budget for ${topCategory.category} to reduce overspending`);
    }

    if (stats.savingsRate < 15) {
      suggestions.push('Allocate at least 15% of income to savings before setting other budgets');
    }

    return suggestions.length > 0 ? suggestions : ['Review and adjust budgets monthly based on actual spending'];
  }
}

