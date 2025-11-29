import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Loader2,
  DollarSign,
  Target,
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Chart } from './ui/Chart';
import apiService from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  transactionCount?: number;
}

export const Analytics: React.FC = () => {
  const { totalIncome, totalExpenses, savingsRate, budgets } = useFinance();
  const { formatAmount } = useCurrency();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedSection, setSelectedSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API data states
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<CategoryData[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryData[]>([]);

  // Calculate analytics data
  const netIncome = totalIncome - totalExpenses;

  // Calculate date range based on selected timeframe
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedTimeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Get number of months based on timeframe
  const getMonthsCount = () => {
    switch (selectedTimeframe) {
      case 'week':
        return 2;
      case 'month':
        return 6;
      case 'quarter':
        return 6;
      case 'year':
        return 12;
      default:
        return 6;
    }
  };

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = getDateRange();
        const monthsCount = getMonthsCount();

        // Fetch monthly trends
        const trendsResponse = await apiService.getMonthlyTrends(monthsCount);
        if (trendsResponse.success && trendsResponse.data) {
          setMonthlyTrends(trendsResponse.data as MonthlyTrend[]);
        }

        // Fetch spending by category with date range
        const spendingResponse = await apiService.getCategoryBreakdown(startDate, endDate, 'expense');
        if (spendingResponse.success && spendingResponse.data) {
          setSpendingByCategory(spendingResponse.data as CategoryData[]);
        }

        // Fetch income by category with date range
        const incomeResponse = await apiService.getCategoryBreakdown(startDate, endDate, 'income');
        console.log('🔍 RAW API RESPONSE:', incomeResponse);
        console.log('🔍 Request params:', { startDate, endDate, type: 'income' });

        if (incomeResponse.success && incomeResponse.data) {
          console.log('🔍 RAW INCOME DATA (NO FILTER):', incomeResponse.data);

          // TEMPORARILY REMOVED FILTER TO DEBUG
          setIncomeByCategory(incomeResponse.data as CategoryData[]);
        } else {
          console.log('❌ API call failed or returned no data:', incomeResponse);
          setIncomeByCategory([]);
        }
        setLoading(false);

        // Debug logging
        console.log('Analytics Data Loaded:', {
          monthlyTrends: trendsResponse.data,
          spendingByCategory: spendingResponse.data,
          incomeByCategory: incomeResponse.data,
          totalIncome,
          totalExpenses,
          budgets
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedTimeframe, totalIncome, totalExpenses, budgets]);

  // Calculate Financial Health Score (0-100)
  const calculateFinancialHealthScore = () => {
    let score = 0;

    // Savings rate contribution (40 points)
    score += Math.min(savingsRate * 2, 40);

    // Budget adherence (30 points)
    const budgetAdherence = budgets.length > 0
      ? budgets.filter(b => b.spent <= b.limit).length / budgets.length * 30
      : 15;
    score += budgetAdherence;

    // Income stability (15 points)
    score += totalIncome > 0 ? 15 : 0;

    // Expense control (15 points)
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 1;
    score += expenseRatio < 0.7 ? 15 : expenseRatio < 0.9 ? 10 : 5;

    return Math.round(score);
  };

  // Calculate Spending Velocity (daily average)
  const calculateSpendingVelocity = () => {
    const daysInMonth = 30;
    return totalExpenses / daysInMonth;
  };

  // Calculate Budget Adherence
  const calculateBudgetAdherence = () => {
    if (budgets.length === 0) return 0;
    const adherentBudgets = budgets.filter(b => b.spent <= b.limit).length;
    return (adherentBudgets / budgets.length) * 100;
  };

  // Calculate Savings Growth Rate
  const calculateSavingsGrowthRate = () => {
    if (monthlyTrends.length < 2) return 0;
    const currentSavings = monthlyTrends[monthlyTrends.length - 1].savings;
    const previousSavings = monthlyTrends[monthlyTrends.length - 2].savings;
    if (previousSavings === 0) return 0;
    return ((currentSavings - previousSavings) / previousSavings) * 100;
  };

  const financialHealthScore = calculateFinancialHealthScore();
  const spendingVelocity = calculateSpendingVelocity();
  const budgetAdherence = calculateBudgetAdherence();
  const savingsGrowthRate = calculateSavingsGrowthRate();

  // Convert category data for charts
  const spendingData = spendingByCategory.map(item => ({
    name: item.category,
    value: item.amount
  }));

  const incomeData = incomeByCategory.map(item => ({
    name: item.category,
    value: item.amount
  }));

  // Cash flow data (income vs expenses over time)
  const cashFlowData = monthlyTrends.map(trend => ({
    name: trend.month,
    income: trend.income,
    expenses: trend.expenses,
    net: trend.savings
  }));

  // Spending trends (expenses over time)
  const spendingTrendsData = monthlyTrends.map(trend => ({
    name: trend.month,
    value: trend.expenses
  }));

  // Income trends
  const incomeTrendsData = monthlyTrends.map(trend => ({
    name: trend.month,
    value: trend.income
  }));

  // Top 5 expenses (ensure we have data)
  const topExpenses = spendingByCategory && spendingByCategory.length > 0
    ? spendingByCategory.slice(0, 5)
    : [];

  console.log('Top Expenses Data:', topExpenses);

  // Budget vs Actual - Chart expects 'value' or 'income'/'expenses' properties
  const budgetVsActual = budgets && budgets.length > 0
    ? budgets.map(budget => ({
      name: budget.category,
      income: budget.limit,  // Using 'income' for budget limit (will show as green)
      expenses: budget.spent  // Using 'expenses' for actual spent (will show as red)
    }))
    : [];

  console.log('Budget vs Actual Data:', budgetVsActual);

  // Savings Rate Trend
  const savingsRateTrend = monthlyTrends.map(trend => ({
    name: trend.month,
    value: trend.savingsRate
  }));

  // Income vs Expenses Comparison
  const incomeVsExpenses = monthlyTrends.map(trend => ({
    name: trend.month,
    income: trend.income,
    expenses: trend.expenses
  }));

  // Budget Utilization (percentage used)
  const budgetUtilization = budgets.map(budget => ({
    name: budget.category,
    value: budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0,
    spent: budget.spent,
    limit: budget.limit
  }));

  // Category Performance (spending change over time)
  const categoryPerformance = spendingByCategory.slice(0, 6).map(cat => ({
    name: cat.category,
    amount: cat.amount,
    percentage: cat.percentage,
    count: cat.transactionCount || 0
  }));

  const exportAnalyticsReport = async () => {
    try {
      const response = await apiService.exportAnalyticsReport('json');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass-orange p-6 glow-orange">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-bold">Error Loading Analytics</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-slate-900 mt-2 text-lg font-bold">
            Comprehensive insights into your financial health
          </p>
        </div>
        <button
          onClick={exportAnalyticsReport}
          className="btn-secondary bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
        >
          <Download className="h-4 w-4 inline mr-2" />
          Export Report
        </button>
      </div>

      {/* Controls */}
      <div className="card-glass-blue p-8 glow-blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-700" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="input-premium w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="relative">
            <PieChart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-700" />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-premium w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">📊 Overview</option>
              <option value="spending">💰 Spending Analysis</option>
              <option value="income">💵 Income Analysis</option>
              <option value="budget">🎯 Budget Tracking</option>
              <option value="savings">🏆 Savings & Goals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-glass-green p-6 glow-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(totalIncome)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {monthlyTrends.length >= 2
                    ? `${((monthlyTrends[monthlyTrends.length - 1].income / monthlyTrends[monthlyTrends.length - 2].income - 1) * 100).toFixed(1)}% vs last month`
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-glass-orange p-6 glow-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatAmount(totalExpenses)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {monthlyTrends.length >= 2
                    ? `${((1 - monthlyTrends[monthlyTrends.length - 1].expenses / monthlyTrends[monthlyTrends.length - 2].expenses) * 100).toFixed(1)}% vs last month`
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl backdrop-blur-sm">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card-glass-indigo p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(netIncome)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {monthlyTrends.length >= 2
                    ? `${((monthlyTrends[monthlyTrends.length - 1].savings / monthlyTrends[monthlyTrends.length - 2].savings - 1) * 100).toFixed(1)}% vs last month`
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-glass-purple p-6 glow-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {monthlyTrends.length >= 2
                    ? `${(monthlyTrends[monthlyTrends.length - 1].savingsRate - monthlyTrends[monthlyTrends.length - 2].savingsRate).toFixed(1)}% vs last month`
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {selectedSection === 'overview' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-blue p-8 glow-blue">
              <h3 className="text-xl font-bold text-gradient-blue mb-6">Cash Flow Analysis</h3>
              <Chart data={cashFlowData} type="bar" />
            </div>

            <div className="card-glass-green p-8 glow-green">
              <h3 className="text-xl font-bold text-gradient-green mb-6">Savings Rate Trend</h3>
              <Chart data={savingsRateTrend} type="area" />
            </div>
          </div>

          {/* Monthly Comparison Table */}
          <div className="card-ultra-glass p-8">
            <h3 className="text-2xl font-bold text-gradient mb-6">Monthly Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-bold text-slate-900">Month</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900">Income</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900">Expenses</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900">Savings</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900">Savings Rate</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((month, index) => (
                    <tr key={month.month} className={index === monthlyTrends.length - 1 ? 'bg-blue-500/10' : ''}>
                      <td className="py-3 px-4 font-bold text-slate-900">{month.month}</td>
                      <td className="text-right py-3 px-4 text-green-600 font-bold">
                        {formatAmount(month.income)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 font-bold">
                        {formatAmount(month.expenses)}
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-slate-900">
                        {formatAmount(month.savings)}
                      </td>
                      <td className="text-right py-3 px-4 font-bold text-slate-900">
                        {month.savingsRate.toFixed(1)}%
                      </td>
                      <td className="text-right py-3 px-4">
                        {month.savings > 0 ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Positive</span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Deficit</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'spending' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-purple p-8 glow-purple">
              <h3 className="text-xl font-bold text-gradient-purple mb-6">Spending by Category</h3>
              <Chart data={spendingData} type="pie" />
            </div>

            <div className="card-glass-blue p-8 glow-blue">
              <h3 className="text-xl font-bold text-gradient-blue mb-6">Spending Trends</h3>
              <Chart data={spendingTrendsData} type="line" />
            </div>

            <div className="card-glass-orange p-8 glow-orange">
              <h3 className="text-xl font-bold text-gradient-warning mb-6">Top 5 Expenses</h3>
              {topExpenses.length > 0 ? (
                <Chart data={topExpenses.map(e => ({ name: e.category, value: e.amount }))} type="bar" />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-600">
                  <p>No expense data available</p>
                </div>
              )}
            </div>

            <div className="card-glass-indigo p-8">
              <h3 className="text-xl font-bold text-gradient mb-6">Category Performance</h3>
              <div className="space-y-3">
                {categoryPerformance.map((cat, index) => (
                  <div key={index} className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{cat.name}</h4>
                        <p className="text-sm text-slate-700 font-medium">{cat.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatAmount(cat.amount)}</p>
                        <p className="text-sm text-slate-700 font-medium">{cat.percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'income' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-green p-8 glow-green">
              <h3 className="text-xl font-bold text-gradient-green mb-6">Income Sources</h3>
              <Chart data={incomeData} type="pie" />
            </div>

            <div className="card-glass-blue p-8 glow-blue">
              <h3 className="text-xl font-bold text-gradient-blue mb-6">Income Trends</h3>
              <Chart data={incomeTrendsData} type="line" />
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="card-ultra-glass p-8 overflow-hidden">
            <h3 className="text-2xl font-bold text-gradient-green mb-6">Income Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeByCategory.length > 0 ? incomeByCategory.map((cat, index) => (
                <div key={index} className="card-glass-green p-6">
                  <h4 className="font-bold text-slate-900 mb-2 truncate" title={cat.category}>{cat.category}</h4>
                  <p className="text-2xl font-bold text-green-600">{formatAmount(cat.amount)}</p>
                  <p className="text-sm text-slate-700 font-medium mt-1">{cat.percentage.toFixed(1)}% of total income</p>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-slate-600">
                  <p>No income data available. Income categories will appear here.</p>
                </div>
              )}
            </div>

            {/* DEBUG SECTION - REMOVE LATER */}
            <div className="mt-8 p-4 bg-slate-900 text-green-400 rounded-lg overflow-auto max-h-60 text-xs font-mono">
              <p className="font-bold mb-2">DEBUG DATA (Income Categories):</p>
              <pre>{JSON.stringify(incomeByCategory, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'budget' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-purple p-8 glow-purple">
              <h3 className="text-xl font-bold text-gradient-purple mb-6">Budget vs Actual</h3>
              {budgetVsActual.length > 0 ? (
                <Chart data={budgetVsActual} type="bar" />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-600">
                  <p>No budget data available</p>
                </div>
              )}
            </div>

            <div className="card-glass-blue p-8 glow-blue">
              <h3 className="text-xl font-bold text-gradient-blue mb-6">Budget Utilization</h3>
              <div className="space-y-3">
                {budgetUtilization.length > 0 ? budgetUtilization.map((item, index) => (
                  <div key={index} className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className={`text-sm font-bold ${item.value > 100 ? 'text-red-600' :
                        item.value > 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                        {item.value.toFixed(1)}% used
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${item.value > 100 ? 'bg-red-500' :
                          item.value > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(item.value, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-700 font-medium mt-1">
                      <span>Spent: {formatAmount(item.spent)}</span>
                      <span>Budget: {formatAmount(item.limit)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-600">
                    <p>No budget data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSection === 'savings' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-purple p-8 glow-purple">
              <h3 className="text-xl font-bold text-gradient-purple mb-6">Income vs Expenses</h3>
              <Chart data={incomeVsExpenses} type="bar" />
            </div>

            <div className="card-glass-blue p-8 glow-blue">
              <h3 className="text-xl font-bold text-gradient-blue mb-6">Financial Health Score</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-6 w-6 text-blue-600" />
                    <span className="font-bold text-slate-900">Your Score</span>
                  </div>
                  <span className="text-4xl font-bold text-blue-600">{financialHealthScore}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${financialHealthScore >= 80 ? 'bg-green-500' :
                      financialHealthScore >= 60 ? 'bg-yellow-500' :
                        financialHealthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${financialHealthScore}%` }}
                  />
                </div>
                <p className="text-sm text-slate-700 font-medium mt-3">
                  {financialHealthScore >= 80 ? '🎉 Excellent! Your finances are in great shape.' :
                    financialHealthScore >= 60 ? '👍 Good! Keep improving your financial habits.' :
                      financialHealthScore >= 40 ? '⚠️ Fair. Focus on increasing savings and reducing expenses.' :
                        '❗ Needs attention. Consider reviewing your budget and spending.'}
                </p>
              </div>
            </div>
          </div>

          {/* Savings Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass-orange p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Spending Velocity</p>
                  <p className="text-xs text-slate-600 font-medium">Average daily spending</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatAmount(spendingVelocity)}/day</p>
            </div>

            <div className="card-glass-green p-6 glow-green">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Budget Adherence</p>
                  <p className="text-xs text-slate-600 font-medium">Budgets within limit</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{budgetAdherence.toFixed(0)}%</p>
            </div>

            <div className="card-glass-purple p-6 glow-purple">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Savings Growth</p>
                  <p className="text-xs text-slate-600 font-medium">Month-over-month</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${savingsGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {savingsGrowthRate >= 0 ? '+' : ''}{savingsGrowthRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};