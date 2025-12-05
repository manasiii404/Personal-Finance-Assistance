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
    console.log('🔍 AI Insights Service - Checking configuration...');
    console.log('   - Has Gemini API Key:', !!config.geminiApiKey);
    console.log('   - Key length:', config.geminiApiKey?.length || 0);
    console.log('   - AI Insights Enabled:', config.aiInsightsEnabled);

    if (config.geminiApiKey && config.aiInsightsEnabled) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      console.log('✅ Google Gemini AI initialized successfully!');
    } else {
      console.log('❌ AI Insights using fallback mode');
      if (!config.geminiApiKey) console.log('   Reason: No API key');
      if (!config.aiInsightsEnabled) console.log('   Reason: Not enabled in config');
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
      .sort(([, a], [, b]) => b - a)
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

      console.log('🚀 Calling Gemini API...');
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
   * prompt for AI analysis with anonymized data
   */
  private buildInsightPrompt(data: AnonymizedFinancialData): string {
    const topCategory = data.spendingPatterns.topCategories[0] || 'Unknown';
    const topCategoryAmount = data.totalsByCategory[topCategory] || 0;

    return `
You are a professional financial advisor analyzing a client's spending patterns for the current month. Provide 3-4 highly personalized, data-driven insights.

📊 CURRENT MONTH FINANCIAL DATA:

SPENDING BY CATEGORY:
${Object.entries(data.totalsByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amount]) => `- ${cat}: ${amount.toFixed(2)}`)
        .join('\n')}

MONTHLY TRENDS (Last 6 Months):
${data.monthlyTrends
        .map(m => `- ${m.month}: Income ${m.totalIncome.toFixed(2)}, Expenses ${m.totalExpenses.toFixed(2)}, Savings ${m.netIncome.toFixed(2)}`)
        .join('\n')}

KEY METRICS:
- Average monthly income: ${data.spendingPatterns.avgMonthlyIncome.toFixed(2)}
- Average monthly expenses: ${data.spendingPatterns.avgMonthlyExpenses.toFixed(2)}
- Current savings rate: ${data.spendingPatterns.savingsRate.toFixed(1)}%
- Highest spending: ${topCategory} (${topCategoryAmount.toFixed(2)})

🎯 YOUR TASK:
Generate 3-4 insights that are:
1. SPECIFIC to this user's actual data (use exact numbers)
2. ACTIONABLE with clear, practical steps
3. IMPACTFUL focusing on highest-value opportunities
4. REALISTIC with achievable targets

📋 INSIGHT REQUIREMENTS:

**Priority Levels:**
- HIGH: Urgent issues (overspending, low savings rate <15%, budget overruns)
- MEDIUM: Optimization opportunities (reduce top category, improve savings)
- LOW: General improvements (minor optimizations, positive reinforcement)

**Content Guidelines:**
- Titles: 8-12 words, action-oriented (e.g., "Reduce Food Spending by 20% This Month")
- Messages: 2-3 sentences with specific numbers and clear action steps
- Always include: current amount, target amount, potential savings
- Calculate both monthly AND annual impact when relevant

**Example Quality Standards:**

✅ GOOD:
"${topCategory} spending at ${topCategoryAmount.toFixed(0)} is your highest expense. By reducing discretionary ${topCategory.toLowerCase()} purchases by 15%, you could save ${(topCategoryAmount * 0.15).toFixed(0)} monthly (${(topCategoryAmount * 0.15 * 12).toFixed(0)} annually). Try the 24-hour rule for non-essential purchases."

❌ BAD:
"You should try to spend less on ${topCategory}."

✅ GOOD:
"Your savings rate of ${data.spendingPatterns.savingsRate.toFixed(1)}% is below the recommended 20%. Redirect ${((data.spendingPatterns.avgMonthlyIncome * 0.20) - (data.spendingPatterns.avgMonthlyIncome * data.spendingPatterns.savingsRate / 100)).toFixed(0)} monthly from ${topCategory} to reach 20% savings rate."

❌ BAD:
"Try to save more money each month."

🔢 FORMATTING RULES:
- Use ONLY plain numbers (2292, 450, 15.5)
- NO currency symbols ($, ₹, €, £, ¥)
- Include decimals for precision (15.5%, 450.75)
- Always show both monthly and annual savings when suggesting reductions

📤 OUTPUT FORMAT:
Return ONLY valid JSON array with 3-4 insights:

[
  {
    "category": "spending|saving|budgeting|general",
    "title": "Action-oriented title with specific target",
    "message": "Detailed message with current amount, target, savings potential, and clear action steps.",
    "priority": "high|medium|low",
    "actionable": true
  }
]

🎯 FOCUS AREAS (in priority order):
1. If savings rate < 15%: HIGH priority to improve it
2. Highest spending category: Specific reduction strategies
3. Month-over-month trends: Highlight improvements or concerns
4. Quick wins: Easy optimizations with high impact

Generate insights now:
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
        .slice(0, 10)
        .map(insight => ({
          category: ['spending', 'saving', 'budgeting', 'general'].includes(insight.category)
            ? insight.category as AIInsight['category']
            : 'general',
          title: insight.title, // No truncation - AI will keep it brief
          message: insight.message, // No truncation - AI will keep it concise
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
