import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAlerts } from '../contexts/AlertContext';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Bell,
  Target,
  AlertTriangle
} from 'lucide-react';
import { MetricCard } from './ui/MetricCard';
import { Chart } from './ui/Chart';
import { RecentTransactions } from './ui/RecentTransactions';
import { BudgetOverview } from './ui/BudgetOverview';
import { GoalProgress } from './ui/GoalProgress';

export const Dashboard: React.FC = () => {
  const { transactions, totalIncome, totalExpenses, savingsRate, budgets, goals } = useFinance();
  const { unreadCount } = useAlerts();
  const { formatAmount } = useCurrency();

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
    .sort(([,a], [,b]) => b - a)
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
        <div className="card-glass-indigo p-6 glow-blue">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Recent Transactions</h3>
            <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </div>

        {/* Budget Overview */}
        <div className="card-glass-green p-6 glow-green">
          <div className="flex items-center justify-between mb-6">
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
          
          <BudgetOverview budgets={budgets.slice(0, 3)} />
          
          {budgets.length > 3 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-slate-600 font-medium">
                +{budgets.length - 3} more budgets
              </span>
            </div>
          )}
        </div>

        {/* Goal Progress */}
        <div className="card-glass-rose p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Goals Progress</h3>
            <div className="p-2 bg-rose-500/20 rounded-xl backdrop-blur-sm">
              <Target className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <GoalProgress goals={goals} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="card-ultra-glass p-8 glow-purple">
        <div className="flex items-start space-x-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl backdrop-blur-sm border border-blue-300/30 floating-element">
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gradient mb-6">AI Financial Insights</h3>
            <div className="space-y-4">
              <div className="card-glass-green p-6">
                <h4 className="font-bold text-gradient-green text-lg mb-2">💰 Savings Opportunity</h4>
                <p className="text-slate-700 font-medium">
                  You could save an additional {formatAmount(potentialSavings)} by optimizing your food and entertainment spending.
                </p>
              </div>
              <div className="card-glass-orange p-6">
                <h4 className="font-bold text-gradient-warning text-lg mb-2">⚠️ Budget Alert</h4>
                <p className="text-slate-700 font-medium">
                  Your food category spending is at 85% of the monthly limit. Consider meal planning to stay within budget.
                </p>
              </div>
              <div className="card-glass-blue p-6">
                <h4 className="font-bold text-gradient-blue text-lg mb-2">🎯 Goal Recommendation</h4>
                <p className="text-slate-700 font-medium">
                  You're on track to meet your laptop goal 2 weeks early. Consider increasing your emergency fund contribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};