import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAlerts } from '../contexts/AlertContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Bell,
  Target,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MetricCard } from './ui/MetricCard';
import { Chart } from './ui/Chart';
import { RecentTransactions } from './ui/RecentTransactions';
import { BudgetOverview } from './ui/BudgetOverview';
import { GoalProgress } from './ui/GoalProgress';

interface AIInsight {
  category: 'spending' | 'saving' | 'budgeting' | 'general';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export const Dashboard: React.FC = () => {
  const { transactions, totalIncome, totalExpenses, savingsRate, budgets, goals } = useFinance();
  const { unreadCount } = useAlerts();
  const { formatAmount } = useCurrency();

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(false);

  // Fetch AI insights on component mount and when transactions change
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setInsightsLoading(true);

        // Check if we have cached insights from today
        const cachedData = localStorage.getItem('ai_insights_cache');
        const today = new Date().toDateString();

        if (cachedData) {
          const { insights, date, transactionCount } = JSON.parse(cachedData);

          // Use cache if it's from today and transaction count hasn't changed
          if (date === today && transactionCount === transactions.length) {
            setAiInsights(insights);
            setInsightsLoading(false);
            return;
          }
        }

        const response: any = await api.getAIInsights();
        console.log('📥 AI Insights Response:', response);

        if (response.success && response.data?.insights) {
          console.log('✅ AI Insights loaded:', response.data.insights.length, 'insights');
          setAiInsights(response.data.insights);
          setInsightsError(false);
        } else {
          throw new Error('No insights in response');
        }
      } catch (error: any) {
        setInsightsError(true);
        setAiInsights([
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
          }
        ]);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchAIInsights();
  }, [transactions.length]); // Re-fetch when transaction count changes

  // Manual refresh function
  const refreshInsights = async () => {
    setInsightsLoading(true);

    // Clear cache to force fresh fetch
    localStorage.removeItem('ai_insights_cache');

    try {
      const response: any = await api.getAIInsights();

      if (response.success && response.data?.insights) {
        setAiInsights(response.data.insights);
        setInsightsError(false);

        // Cache the new insights
        const today = new Date().toDateString();
        localStorage.setItem('ai_insights_cache', JSON.stringify({
          insights: response.data.insights,
          date: today,
          transactionCount: transactions.length
        }));
      }
    } catch (error: any) {
      // Error handled silently
    } finally {
      setInsightsLoading(false);
    }
  };

  // Format insight message by adding currency symbols to numbers
  const formatInsightMessage = (message: string) => {
    // Replace standalone numbers with formatted currency
    // Matches numbers like: 8120, 812, 67.67, etc.
    return message.replace(/\b(\d{1,3}(?:,?\d{3})*(?:\.\d{1,2})?)\b/g, (match) => {
      const num = parseFloat(match.replace(/,/g, ''));
      // Only format if it's a reasonable currency amount (> 1)
      if (num > 1) {
        return formatAmount(num);
      }
      return match;
    });
  };

  // Get color for insight category
  const getInsightColor = (category: string) => {
    switch (category) {
      case 'spending': return 'orange';
      case 'saving': return 'green';
      case 'budgeting': return 'blue';
      default: return 'purple';
    }
  };

  // Get icon for priority
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const currentBalance = totalIncome - totalExpenses;
  const monthlyIncome = totalIncome;
  const monthlyExpenses = totalExpenses;

  // Calculate savings opportunities
  const potentialSavings = budgets.reduce((sum, budget) => {
    const remaining = budget.limit - budget.spent;
    return sum + (remaining > 0 ? remaining * 0.1 : 0); // 10% of unused budget
  }, 0);

  // Get recent transactions (last 7 days)
  const recentTransactions = transactions.slice(0, 5);

  // Calculate spending by category for chart
  const categorySpending = transactions
    .filter(t => t.amount < 0) // Expenses are negative
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }));

  // Monthly trend data for bar chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    // Calculate income and expenses for this month
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(monthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    return {
      name: monthName,
      income,
      expenses
    };
  }).reverse();

  // Calculate trend percentages with real data
  const previousMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return transactionDate.getMonth() === lastMonth.getMonth();
  });

  const previousMonthIncome = previousMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthExpenses = Math.abs(previousMonthTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));

  // Calculate trend percentages
  const balanceTrend = currentBalance > 0 ? 'up' : 'down';
  const incomeTrend = monthlyIncome >= previousMonthIncome ? 'up' : 'down';
  const expenseTrend = monthlyExpenses <= previousMonthExpenses ? 'up' : 'down';
  const savingsTrend = savingsRate > 0 ? 'up' : 'down';

  // Calculate trend values
  const incomeChange = previousMonthIncome > 0 ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome * 100) : 0;
  const expenseChange = previousMonthExpenses > 0 ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses * 100) : 0;

  const balanceTrendValue = `${Math.abs(savingsRate).toFixed(1)}%`;
  const incomeTrendValue = `${Math.abs(incomeChange).toFixed(1)}%`;
  const expenseTrendValue = `${Math.abs(expenseChange).toFixed(1)}%`;
  const savingsTrendValue = `${savingsRate.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-900 mt-2 text-lg font-bold">Welcome back! Here's your financial overview.</p>
        </div>
        {unreadCount > 0 && (
          <div className="card-glass-orange p-4 glow-orange animate-bounce">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-bold text-orange-700">{unreadCount} new alerts</span>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Balance"
          value={formatAmount(currentBalance)}
          icon={DollarSign}
          trend={currentBalance > 0 ? 'up' : 'down'}
          trendValue={`${savingsRate.toFixed(1)}%`}
          color="blue"
        />
        <MetricCard
          title="Monthly Income"
          value={formatAmount(monthlyIncome)}
          icon={TrendingUp}
          trend={incomeTrend}
          trendValue={incomeTrendValue}
          color="green"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatAmount(monthlyExpenses)}
          icon={TrendingDown}
          trend={expenseTrend}
          trendValue={expenseTrendValue}
          color="red"
        />
        <MetricCard
          title="Savings Rate"
          value={savingsTrendValue}
          icon={PiggyBank}
          trend={savingsTrend}
          trendValue={savingsTrendValue}
          color="purple"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass-purple p-8 glow-purple">
          <h3 className="text-xl font-bold text-gradient-purple mb-6">Spending by Category</h3>
          <Chart data={chartData} type="pie" />
        </div>

        <div className="card-glass-blue p-8 glow-blue">
          <h3 className="text-xl font-bold text-gradient-blue mb-6">Monthly Trend</h3>
          <Chart data={last6Months} type="bar" />
        </div>
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="card-glass-indigo p-4 glow-blue flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Recent Transactions</h3>
            <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-96 pr-2">
            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>

        {/* Budget Overview */}
        <div className="card-glass-green p-4 glow-green flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gradient-green">Budget Status</h3>
            <div className="p-2 bg-emerald-500/20 rounded-xl backdrop-blur-sm">
              <PiggyBank className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          {/* Budget Summary Stats */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="card-glass-white p-3 text-center">
              <div className="text-lg font-bold text-emerald-600">
                {budgets.filter(b => (b.spent / b.limit) <= 0.8).length}
              </div>
              <div className="text-xs text-slate-600 font-medium">On Track</div>
            </div>
            <div className="card-glass-white p-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {budgets.filter(b => (b.spent / b.limit) > 1).length}
              </div>
              <div className="text-xs text-slate-600 font-medium">Over Budget</div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80 pr-2">
            <BudgetOverview budgets={budgets} />
          </div>


        </div>

        {/* Goal Progress */}
        <div className="card-glass-rose p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Goals Progress</h3>
            <div className="p-2 bg-rose-500/20 rounded-xl backdrop-blur-sm">
              <Target className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-96 pr-2">
            <GoalProgress goals={goals} />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card-ultra-glass p-8 glow-purple">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl backdrop-blur-sm border border-blue-300/30 floating-element">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gradient mb-2">AI Financial Insights</h3>
              <p className="text-slate-600 text-sm">
                {insightsError
                  ? 'Using fallback insights'
                  : 'Powered by Gemini 2.0 Flash • Updates daily & when transactions change'}
              </p>
            </div>
          </div>
          <button
            onClick={refreshInsights}
            disabled={insightsLoading}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw className={`h-5 w-5 text-purple-600 ${insightsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {insightsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-slate-700 font-medium">Analyzing your finances...</span>
          </div>
        ) : insightsError || aiInsights.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Welcome! Let's Get Started</h3>
            <p className="text-slate-700 font-medium mb-4 max-w-md mx-auto">
              AI insights will appear here once you have some financial data. Start by:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">💰</span>
                  <span className="font-bold text-slate-900 text-sm">Add Transactions</span>
                </div>
                <p className="text-xs text-slate-700">Record your income and expenses</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">🎯</span>
                  <span className="font-bold text-slate-900 text-sm">Set Budgets</span>
                </div>
                <p className="text-xs text-slate-700">Create spending limits by category</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">🏆</span>
                  <span className="font-bold text-slate-900 text-sm">Create Goals</span>
                </div>
                <p className="text-xs text-slate-700">Set financial targets to achieve</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-4">
              💡 Tip: Add at least a few transactions to get personalized AI-powered insights!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`card-glass-${getInsightColor(insight.category)} p-6`}>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getPriorityIcon(insight.priority)}</span>
                  <div className="flex-1">
                    <h4 className={`font-bold text-gradient-${getInsightColor(insight.category)} text-lg mb-2`}>
                      {insight.title}
                    </h4>
                    <p className="text-slate-700 font-medium">
                      {formatInsightMessage(insight.message)}
                    </p>
                    {insight.actionable && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/50 text-slate-700">
                          ✓ Actionable
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {aiInsights.length === 0 && (
              <div className="text-center py-8 text-slate-600">
                <p>No insights available at the moment. Add more transactions to get personalized recommendations!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};