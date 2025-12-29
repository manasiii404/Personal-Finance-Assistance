import React, { useState, useEffect } from 'react';
import {
    FileText,
    TrendingUp,
    Calendar,
    Download,
    Loader2,
    BarChart3,
    PieChart,
    Lightbulb,
    Target,
    DollarSign,
    AlertCircle,
} from 'lucide-react';
import { Chart } from './ui/Chart';
import apiService from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';

type ReportType = 'monthly' | 'category' | 'trends' | 'ai-insights';

export const Reports: React.FC = () => {
    const { formatAmount } = useCurrency();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<ReportType>('monthly');
    const [reportData, setReportData] = useState<any>(null);

    // Date selection for reports
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        loadReport();
    }, [selectedReport, selectedMonth, selectedYear]);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            switch (selectedReport) {
                case 'monthly':
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                            },
                        }
                    );
                    break;
                case 'category':
                    const endDate = new Date(selectedYear, selectedMonth, 0);
                    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/category?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                            },
                        }
                    );
                    break;
                case 'trends':
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/trends?months=6`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                            },
                        }
                    );
                    break;
                case 'ai-insights':
                    response = await fetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reports/ai-insights?period=month`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                            },
                        }
                    );
                    break;
            }

            const data = await response.json();
            if (data.success) {
                setReportData(data.data);
            } else {
                setError(data.message || 'Failed to load report');
            }
        } catch (err: any) {
            console.error('Error loading report:', err);
            setError(err.message || 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        { id: 'monthly' as ReportType, label: 'Monthly Report', icon: Calendar },
        { id: 'category' as ReportType, label: 'Category Analysis', icon: PieChart },
        { id: 'trends' as ReportType, label: 'Trends', icon: TrendingUp },
        { id: 'ai-insights' as ReportType, label: 'AI Insights', icon: Lightbulb },
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Financial Reports
                    </h1>
                    <p className="text-slate-900 mt-2 text-lg font-bold">
                        Comprehensive insights and AI-powered recommendations
                    </p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="btn-secondary bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
                >
                    <Download className="h-4 w-4 inline mr-2" />
                    Export Report
                </button>
            </div>

            {/* Report Type Selector */}
            <div className="card-glass-blue p-6 glow-blue">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedReport(type.id)}
                                className={`p-4 rounded-xl transition-all ${selectedReport === type.id
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                                        : 'bg-white/50 text-slate-700 hover:bg-white/80'
                                    }`}
                            >
                                <Icon className={`h-6 w-6 mx-auto mb-2 ${selectedReport === type.id ? 'text-white' : 'text-blue-600'}`} />
                                <p className="text-sm font-semibold">{type.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Date Selector */}
                {(selectedReport === 'monthly' || selectedReport === 'category') && (
                    <div className="mt-4 flex gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="input-premium px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl"
                        >
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="input-premium px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-700 font-medium">Loading report...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="card-glass-orange p-6 glow-orange">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <h3 className="text-red-800 font-bold">Error Loading Report</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Content */}
            {!loading && !error && reportData && (
                <>
                    {selectedReport === 'monthly' && (
                        <MonthlyReportView data={reportData} formatAmount={formatAmount} />
                    )}
                    {selectedReport === 'category' && (
                        <CategoryReportView data={reportData} formatAmount={formatAmount} />
                    )}
                    {selectedReport === 'trends' && (
                        <TrendsReportView data={reportData} formatAmount={formatAmount} />
                    )}
                    {selectedReport === 'ai-insights' && (
                        <AIInsightsView data={reportData} formatAmount={formatAmount} />
                    )}
                </>
            )}
        </div>
    );
};

// Monthly Report View
const MonthlyReportView: React.FC<{ data: any; formatAmount: (n: number) => string }> = ({ data, formatAmount }) => (
    <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass-green p-6 glow-green">
                <p className="text-sm font-bold text-slate-700">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatAmount(data.summary.totalIncome)}</p>
                <p className="text-sm text-slate-600 mt-1">
                    {data.comparison.incomeChange >= 0 ? '+' : ''}{data.comparison.incomeChange.toFixed(1)}% vs last month
                </p>
            </div>
            <div className="card-glass-orange p-6 glow-orange">
                <p className="text-sm font-bold text-slate-700">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatAmount(data.summary.totalExpenses)}</p>
                <p className="text-sm text-slate-600 mt-1">
                    {data.comparison.expenseChange >= 0 ? '+' : ''}{data.comparison.expenseChange.toFixed(1)}% vs last month
                </p>
            </div>
            <div className="card-glass-blue p-6 glow-blue">
                <p className="text-sm font-bold text-slate-700">Net Savings</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatAmount(data.summary.netIncome)}</p>
                <p className="text-sm text-slate-600 mt-1">{data.summary.savingsRate.toFixed(1)}% savings rate</p>
            </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="card-glass-purple p-8 glow-purple">
            <h3 className="text-xl font-bold text-gradient-purple mb-6">Spending by Category</h3>
            <Chart data={data.categoryBreakdown.map((c: any) => ({ name: c.category, value: c.amount }))} type="pie" />
        </div>

        {/* AI Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
            <div className="card-ultra-glass p-8">
                <h3 className="text-2xl font-bold text-gradient mb-6">💡 AI Recommendations</h3>
                <div className="space-y-3">
                    {data.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="card-glass-blue p-4">
                            <p className="text-slate-700 font-medium">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// Category Report View
const CategoryReportView: React.FC<{ data: any; formatAmount: (n: number) => string }> = ({ data, formatAmount }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glass-purple p-8 glow-purple">
                <h3 className="text-xl font-bold text-gradient-purple mb-6">Category Distribution</h3>
                <Chart data={data.categories.map((c: any) => ({ name: c.category, value: c.amount }))} type="pie" />
            </div>
            <div className="card-glass-blue p-8 glow-blue">
                <h3 className="text-xl font-bold text-gradient-blue mb-6">Top Categories</h3>
                <div className="space-y-3">
                    {data.topCategories.map((cat: any, index: number) => (
                        <div key={index} className="bg-white/30 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">{cat.category}</span>
                                <span className="text-lg font-bold text-blue-600">{formatAmount(cat.amount)}</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{cat.percentage.toFixed(1)}% of total</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {data.insights && data.insights.length > 0 && (
            <div className="card-ultra-glass p-8">
                <h3 className="text-2xl font-bold text-gradient mb-6">💡 Category Insights</h3>
                <div className="space-y-3">
                    {data.insights.map((insight: string, index: number) => (
                        <div key={index} className="card-glass-green p-4">
                            <p className="text-slate-700 font-medium">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// Trends Report View
const TrendsReportView: React.FC<{ data: any; formatAmount: (n: number) => string }> = ({ data, formatAmount }) => (
    <div className="space-y-6">
        <div className="card-glass-blue p-8 glow-blue">
            <h3 className="text-xl font-bold text-gradient-blue mb-6">Income & Expense Trends</h3>
            <Chart data={data.trends.map((t: any) => ({ name: t.month, income: t.income, expenses: t.expenses }))} type="bar" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass-green p-6">
                <p className="text-sm font-bold text-slate-700">Average Income</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatAmount(data.analysis.averageIncome)}</p>
            </div>
            <div className="card-glass-orange p-6">
                <p className="text-sm font-bold text-slate-700">Average Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatAmount(data.analysis.averageExpenses)}</p>
            </div>
            <div className="card-glass-purple p-6">
                <p className="text-sm font-bold text-slate-700">Average Savings</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatAmount(data.analysis.averageSavings)}</p>
            </div>
        </div>

        <div className="card-ultra-glass p-8">
            <h3 className="text-2xl font-bold text-gradient mb-6">📈 Predictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glass-blue p-4">
                    <p className="text-sm text-slate-700 font-medium">Next Month Income</p>
                    <p className="text-xl font-bold text-blue-600">{formatAmount(data.predictions.nextMonthIncome)}</p>
                </div>
                <div className="card-glass-orange p-4">
                    <p className="text-sm text-slate-700 font-medium">Next Month Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatAmount(data.predictions.nextMonthExpenses)}</p>
                </div>
                <div className="card-glass-green p-4">
                    <p className="text-sm text-slate-700 font-medium">Expected Savings</p>
                    <p className="text-xl font-bold text-green-600">{formatAmount(data.predictions.nextMonthSavings)}</p>
                </div>
            </div>
        </div>
    </div>
);

// AI Insights View
const AIInsightsView: React.FC<{ data: any; formatAmount: (n: number) => string }> = ({ data, formatAmount }) => (
    <div className="space-y-6">
        {/* Financial Health Score */}
        <div className="card-glass-purple p-8 glow-purple">
            <h3 className="text-2xl font-bold text-gradient-purple mb-6">Financial Health Score</h3>
            <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            strokeDasharray={`${data.financialHealthScore * 2.83} 283`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gradient">{data.financialHealthScore}</p>
                            <p className="text-sm text-slate-600 font-medium">out of 100</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Recommendations */}
        {data.spendingRecommendations && data.spendingRecommendations.length > 0 && (
            <div className="card-ultra-glass p-8">
                <h3 className="text-2xl font-bold text-gradient mb-6">💰 Spending Recommendations</h3>
                <div className="space-y-3">
                    {data.spendingRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="card-glass-orange p-4">
                            <p className="text-slate-700 font-medium">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {data.budgetSuggestions && data.budgetSuggestions.length > 0 && (
            <div className="card-ultra-glass p-8">
                <h3 className="text-2xl font-bold text-gradient mb-6">🎯 Budget Suggestions</h3>
                <div className="space-y-3">
                    {data.budgetSuggestions.map((sug: string, index: number) => (
                        <div key={index} className="card-glass-blue p-4">
                            <p className="text-slate-700 font-medium">{sug}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {data.goalStrategies && data.goalStrategies.length > 0 && (
            <div className="card-ultra-glass p-8">
                <h3 className="text-2xl font-bold text-gradient mb-6">🏆 Goal Strategies</h3>
                <div className="space-y-3">
                    {data.goalStrategies.map((strategy: string, index: number) => (
                        <div key={index} className="card-glass-green p-4">
                            <p className="text-slate-700 font-medium">{strategy}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);
