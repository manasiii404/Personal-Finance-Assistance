import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { Transaction } from '@prisma/client';

interface AnonymizedFinancialData {
  totalsByCategory: Record<string, number>;
  monthlyTrends: {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
  }[];
  spendingPatterns: {
    avgDailySpending: number;
    avgMonthlyIncome: number;
    avgMonthlyExpenses: number;
    savingsRate: number;
    topCategories: string[];
  };
  timeframe: {
    totalMonths: number;
    totalTransactions: number;
  };
}

interface AIInsight {
  category: 'spending' | 'saving' | 'budgeting' | 'general';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export class AIInsightsService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.geminiApiKey && config.aiInsightsEnabled) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    }
  }

  /**
   * Anonymize transaction data for AI analysis
   * Only includes aggregated, non-identifiable information
   */
  private anonymizeTransactionData(transactions: Transaction[]): AnonymizedFinancialData {
    if (!transactions || transactions.length === 0) {
      return {
        totalsByCategory: {},
        monthlyTrends: [],
        spendingPatterns: {
          avgDailySpending: 0,
          avgMonthlyIncome: 0,
          avgMonthlyExpenses: 0,
          savingsRate: 0,
          topCategories: []
        },
        timeframe: {
          totalMonths: 0,
          totalTransactions: 0
        }
      };
    }

    // Aggregate spending by category (expenses only)
    const totalsByCategory: Record<string, number> = {};
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      totalsByCategory[category] = (totalsByCategory[category] || 0) + Math.abs(transaction.amount);
    });

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
        return transactionMonthKey === monthKey;
      });
      
      const totalIncome = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      monthlyTrends.push({
        month: monthName,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses
      });
    }

    // Calculate spending patterns
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const avgMonthlyIncome = totalIncome / Math.max(monthlyTrends.length, 1);
    const avgMonthlyExpenses = totalExpenses / Math.max(monthlyTrends.length, 1);
    const avgDailySpending = totalExpenses / Math.max(transactions.length / 30, 1);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    const topCategories = Object.entries(totalsByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return {
      totalsByCategory,
      monthlyTrends,
      spendingPatterns: {
        avgDailySpending,
        avgMonthlyIncome,
        avgMonthlyExpenses,
        savingsRate,
        topCategories
      },
      timeframe: {
        totalMonths: monthlyTrends.length,
        totalTransactions: transactions.length
      }
    };
  }

  /**
   * Generate AI insights using Gemini API
   */
  async generateInsights(transactions: Transaction[]): Promise<AIInsight[]> {
    if (!this.genAI || !config.aiInsightsEnabled) {
      return this.getFallbackInsights();
    }

    try {
      const anonymizedData = this.anonymizeTransactionData(transactions);
      
      // Don't generate insights if no meaningful data
      if (anonymizedData.timeframe.totalTransactions === 0) {
        return this.getFallbackInsights();
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildInsightPrompt(anonymizedData);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Build prompt for AI analysis with anonymized data
   */
  private buildInsightPrompt(data: AnonymizedFinancialData): string {
    return `
As a financial advisor AI, analyze this anonymized spending data and provide 3-4 actionable insights:

SPENDING BY CATEGORY:
${Object.entries(data.totalsByCategory)
  .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
  .join('\n')}

MONTHLY TRENDS (last 6 months):
${data.monthlyTrends
  .map(m => `- ${m.month}: Income $${m.totalIncome.toFixed(2)}, Expenses $${m.totalExpenses.toFixed(2)}, Net $${m.netIncome.toFixed(2)}`)
  .join('\n')}

PATTERNS:
- Average monthly income: $${data.spendingPatterns.avgMonthlyIncome.toFixed(2)}
- Average monthly expenses: $${data.spendingPatterns.avgMonthlyExpenses.toFixed(2)}
- Savings rate: ${data.spendingPatterns.savingsRate.toFixed(1)}%
- Top spending categories: ${data.spendingPatterns.topCategories.join(', ')}

Provide insights in this JSON format:
[
  {
    "category": "spending|saving|budgeting|general",
    "title": "Brief insight title",
    "message": "Actionable advice (max 100 words)",
    "priority": "high|medium|low",
    "actionable": true|false
  }
]

Focus on:
1. Spending optimization opportunities
2. Savings improvement suggestions
3. Budget allocation recommendations
4. Financial health observations

Keep advice practical and specific to the data patterns.
`;
  }

  /**
   * Parse AI response into structured insights
   */
  private parseAIResponse(response: string): AIInsight[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const insights = JSON.parse(jsonMatch[0]) as AIInsight[];
      
      // Validate and sanitize insights
      return insights
        .filter(insight => insight.title && insight.message)
        .slice(0, 4) // Limit to 4 insights
        .map(insight => ({
          category: ['spending', 'saving', 'budgeting', 'general'].includes(insight.category) 
            ? insight.category as AIInsight['category'] 
            : 'general',
          title: insight.title.substring(0, 50),
          message: insight.message.substring(0, 200),
          priority: ['high', 'medium', 'low'].includes(insight.priority) 
            ? insight.priority as AIInsight['priority'] 
            : 'medium',
          actionable: Boolean(insight.actionable)
        }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Fallback insights when AI is unavailable
   */
  private getFallbackInsights(): AIInsight[] {
    return [
      {
        category: 'general',
        title: 'Track Your Spending',
        message: 'Regular transaction tracking helps identify spending patterns and opportunities for savings.',
        priority: 'medium',
        actionable: true
      },
      {
        category: 'budgeting',
        title: 'Set Monthly Budgets',
        message: 'Create category-based budgets to better control your expenses and reach financial goals.',
        priority: 'high',
        actionable: true
      },
      {
        category: 'saving',
        title: 'Emergency Fund',
        message: 'Build an emergency fund covering 3-6 months of expenses for financial security.',
        priority: 'high',
        actionable: true
      }
    ];
  }

  /**
   * Check if AI insights are enabled and configured
   */
  isEnabled(): boolean {
    return Boolean(this.genAI && config.aiInsightsEnabled);
  }
}

export const aiInsightsService = new AIInsightsService();
