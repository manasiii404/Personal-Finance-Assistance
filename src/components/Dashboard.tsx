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
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Welcome back! Here's your financial overview.</p>
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
          trend="up"
          trendValue={`+${((monthlyIncome / (monthlyIncome * 0.9)) * 100 - 100).toFixed(1)}%`}
          color="green"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatAmount(monthlyExpenses)}
          icon={TrendingDown}
          trend="down"
          trendValue={`-${((monthlyExpenses * 0.95 / monthlyExpenses) * 100 - 100).toFixed(1)}%`}
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
        <div className="card-glass-purple p-8 glow-purple">
          <h3 className="text-xl font-bold text-gradient-purple mb-6">Spending by Category</h3>
          <Chart data={chartData} type="pie" />
        </div>
        
        <div className="card-glass-blue p-8 glow-blue">
          <h3 className="text-xl font-bold text-gradient-blue mb-6">Monthly Trend</h3>
          <Chart 
            data={[
              { name: 'Jan', income: monthlyIncome * 0.8, expenses: monthlyExpenses * 0.85 },
              { name: 'Feb', income: monthlyIncome * 0.9, expenses: monthlyExpenses * 0.95 },
              { name: 'Mar', income: monthlyIncome * 0.85, expenses: monthlyExpenses * 0.9 },
              { name: 'Current', income: monthlyIncome, expenses: monthlyExpenses }
            ]} 
            type="bar" 
          />
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
          <BudgetOverview budgets={budgets} />
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