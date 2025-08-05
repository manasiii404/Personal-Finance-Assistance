import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAlerts } from '../contexts/AlertContext';
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
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(categorySpending).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">{unreadCount} new alerts</span>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Balance"
          value={`$${currentBalance.toFixed(2)}`}
          icon={DollarSign}
          trend={currentBalance > 0 ? 'up' : 'down'}
          trendValue={`${savingsRate.toFixed(1)}%`}
          color="blue"
        />
        <MetricCard
          title="Monthly Income"
          value={`$${monthlyIncome.toFixed(2)}`}
          icon={TrendingUp}
          trend="up"
          trendValue="+12.5%"
          color="green"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toFixed(2)}`}
          icon={TrendingDown}
          trend="down"
          trendValue="-5.2%"
          color="red"
        />
        <MetricCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          trend={savingsRate > 20 ? 'up' : 'down'}
          trendValue={`${savingsRate > 20 ? '+' : ''}${(savingsRate - 20).toFixed(1)}%`}
          color="purple"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <Chart data={chartData} type="pie" />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <Chart 
            data={[
              { name: 'Jan', income: 4800, expenses: 3200 },
              { name: 'Feb', income: 5200, expenses: 3800 },
              { name: 'Mar', income: 5000, expenses: 3500 },
              { name: 'Current', income: monthlyIncome, expenses: monthlyExpenses }
            ]} 
            type="bar" 
          />
        </div>
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <RecentTransactions transactions={recentTransactions} />
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget Status</h3>
            <PiggyBank className="h-5 w-5 text-gray-400" />
          </div>
          <BudgetOverview budgets={budgets} />
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Goals Progress</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <GoalProgress goals={goals} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Financial Insights</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-1">Savings Opportunity</h4>
                <p className="text-sm text-gray-600">
                  You could save an additional ${potentialSavings.toFixed(2)} by optimizing your food and entertainment spending.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-1">Budget Alert</h4>
                <p className="text-sm text-gray-600">
                  Your food category spending is at 85% of the monthly limit. Consider meal planning to stay within budget.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-medium text-gray-900 mb-1">Goal Recommendation</h4>
                <p className="text-sm text-gray-600">
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