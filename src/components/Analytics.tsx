import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import { Chart } from './ui/Chart';

export const Analytics: React.FC = () => {
  const { transactions, totalIncome, totalExpenses, savingsRate } = useFinance();
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedChart, setSelectedChart] = useState('spending');

  // Calculate analytics data
  const netIncome = totalIncome - totalExpenses;
  
  // Monthly trends (mock data for demonstration)
  const monthlyData = [
    { name: 'Oct', income: 4500, expenses: 3200, savings: 1300 },
    { name: 'Nov', income: 4800, expenses: 3500, savings: 1300 },
    { name: 'Dec', income: 5200, expenses: 3800, savings: 1400 },
    { name: 'Jan', income: totalIncome, expenses: totalExpenses, savings: netIncome }
  ];

  // Category spending analysis
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const spendingData = Object.entries(categorySpending).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Income sources analysis
  const incomeBySource = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeData = Object.entries(incomeBySource).map(([source, amount]) => ({
    name: source,
    value: amount
  }));

  // Weekly spending trend
  const weeklySpending = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 32 },
    { name: 'Wed', value: 78 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 120 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 45 }
  ];

  const exportAnalyticsReport = () => {
    const reportData = {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        savingsRate
      },
      categorySpending,
      incomeBySource,
      monthlyTrends: monthlyData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-1">Deep insights into your spending patterns and trends</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportAnalyticsReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Chart Type:</span>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="spending">Spending by Category</option>
                <option value="income">Income Sources</option>
                <option value="trends">Monthly Trends</option>
                <option value="weekly">Weekly Pattern</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+12.5% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">-5.2% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netIncome.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+18.3% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+2.1% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedChart === 'spending' && 'Spending by Category'}
            {selectedChart === 'income' && 'Income Sources'}
            {selectedChart === 'trends' && 'Monthly Trends'}
            {selectedChart === 'weekly' && 'Weekly Spending Pattern'}
          </h3>
          
          {selectedChart === 'spending' && <Chart data={spendingData} type="pie" />}
          {selectedChart === 'income' && <Chart data={incomeData} type="pie" />}
          {selectedChart === 'trends' && (
            <Chart 
              data={monthlyData.map(d => ({
                name: d.name,
                income: d.income,
                expenses: d.expenses
              }))} 
              type="bar" 
            />
          )}
          {selectedChart === 'weekly' && <Chart data={weeklySpending} type="pie" />}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Top Spending Category</h4>
              <p className="text-sm text-blue-700">
                Food accounts for {spendingData.length > 0 ? ((spendingData.find(d => d.name === 'Food')?.value || 0) / totalExpenses * 100).toFixed(1) : 0}% 
                of your total expenses this month
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Savings Opportunity</h4>
              <p className="text-sm text-green-700">
                You could save $150/month by reducing restaurant spending by 30%
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Spending Pattern</h4>
              <p className="text-sm text-yellow-700">
                Your highest spending days are Fridays and Saturdays
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Average Daily Spending</span>
              <span className="text-sm font-bold text-gray-900">
                ${(totalExpenses / 30).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Largest Single Expense</span>
              <span className="text-sm font-bold text-gray-900">
                ${Math.max(...transactions.filter(t => t.type === 'expense').map(t => Math.abs(t.amount))).toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Most Frequent Category</span>
              <span className="text-sm font-bold text-gray-900">
                {Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Transaction Count</span>
              <span className="text-sm font-bold text-gray-900">
                {transactions.length} this month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Income</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Expenses</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Savings</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Savings Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr key={month.name} className={index === monthlyData.length - 1 ? 'bg-blue-50' : ''}>
                  <td className="py-3 px-4 font-medium">{month.name} 2025</td>
                  <td className="text-right py-3 px-4 text-green-600 font-medium">
                    ${month.income.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-red-600 font-medium">
                    ${month.expenses.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 font-medium">
                    ${month.savings.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 font-medium">
                    {((month.savings / month.income) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};