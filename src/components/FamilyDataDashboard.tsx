import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, User, Info, Eye, Edit3, Edit2, X } from 'lucide-react';
import apiService from '../services/api';
import { FamilyBudgets } from './FamilyBudgets';
import { FamilyGoals } from './FamilyGoals';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ComposedChart, Line } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
import { useSocket } from '../contexts/SocketContext';

interface FamilyDataProps {
    familyId: string;
    permissions: 'VIEW_ONLY' | 'VIEW_EDIT';
}

export const FamilyDataDashboard: React.FC<FamilyDataProps> = ({ familyId, permissions }) => {
    const [summary, setSummary] = useState<any>(null);
    const [memberTransactions, setMemberTransactions] = useState<any[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'budgets' | 'goals'>('summary');
    const [editingTransaction, setEditingTransaction] = useState<{ id: string; category: string } | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showShareConfirm, setShowShareConfirm] = useState(false);
    const loadingRef = useRef(false);
    const { formatAmount } = useCurrency();
    const { socket, isConnected } = useSocket();

    const loadFamilyData = useCallback(async () => {
        // Prevent multiple simultaneous loads
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const [summaryRes, transactionsRes] = await Promise.all([
                apiService.getFamilySummary(familyId),
                apiService.getFamilyTransactions(familyId),
            ]);

            setSummary(summaryRes.data);

            // Handle new per-member transaction structure
            const memberTxData = (transactionsRes.data as any).memberTransactions || [];
            setMemberTransactions(memberTxData);

            // Set sharing status for current user
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) setCurrentUserId(currentUser.id);

            const myDetails = memberTxData.find((m: any) => m.member.id === currentUser.id);
            if (myDetails) {
                setIsSharing(myDetails.isSharingTransactions);
            }

            // Auto-select first member if available
            if (memberTxData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(memberTxData[0].member.id);
            }
        } catch (error: any) {
            console.error('Failed to load family data:', error);
            // Don't call addAlert here to prevent infinite loop
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [familyId, selectedMemberId]); // Depend on familyId and selectedMemberId

    useEffect(() => {
        loadFamilyData();
    }, [loadFamilyData]);

    // Add WebSocket listeners for real-time updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for budget changes
        socket.on('family:budget-created', () => {
            loadFamilyData();
        });

        socket.on('family:budget-updated', () => {
            loadFamilyData();
        });

        socket.on('family:budget-deleted', () => {
            loadFamilyData();
        });

        // Listen for goal changes
        socket.on('family:goal-created', () => {
            loadFamilyData();
        });

        socket.on('family:goal-updated', () => {
            loadFamilyData();
        });

        socket.on('family:goal-deleted', () => {
            loadFamilyData();
        });

        socket.on('family:goal-contribution', () => {
            loadFamilyData();
        });

        // Listen for transaction changes (if implemented in backend)
        socket.on('family:transaction-updated', () => {
            loadFamilyData();
        });

        return () => {
            socket.off('family:budget-created');
            socket.off('family:budget-updated');
            socket.off('family:budget-deleted');
            socket.off('family:goal-created');
            socket.off('family:goal-updated');
            socket.off('family:goal-deleted');
            socket.off('family:goal-contribution');
            socket.off('family:transaction-updated');
        };
    }, [socket, isConnected, loadFamilyData]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleUpdateTransactionCategory = async () => {
        if (!editingTransaction) return;

        try {
            await apiService.updateTransaction(editingTransaction.id, { category: editingTransaction.category });
            setEditingTransaction(null);
            // Reload family data to reflect changes
            loadFamilyData();
        } catch (error: any) {
            console.error('Failed to update transaction category:', error);
        }
    };

    const handleShareToggle = () => {
        setShowShareConfirm(true);
    };

    const confirmShareAction = async () => {
        const action = isSharing ? 'hide' : 'share';
        try {
            await apiService.shareTransactions(familyId, !isSharing);
            setIsSharing(!isSharing);
            setShowShareConfirm(false);
            loadFamilyData();
        } catch (error) {
            console.error(`Failed to ${action} transactions:`, error);
            // alert(`Failed to ${action} transactions. Please try again.`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Permission Info Banner */}
            <div className={`rounded-2xl p-4 border-2 flex items-center gap-3 ${permissions === 'VIEW_EDIT'
                ? 'bg-green-50 border-green-300'
                : 'bg-blue-50 border-blue-300'
                }`}>
                <Info className={`w-5 h-5 ${permissions === 'VIEW_EDIT' ? 'text-green-600' : 'text-blue-600'}`} />
                <div>
                    <p className={`font-semibold ${permissions === 'VIEW_EDIT' ? 'text-green-800' : 'text-blue-800'}`}>
                        {permissions === 'VIEW_EDIT' ? (
                            <span className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> View & Edit Access</span>
                        ) : (
                            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> View Only Access</span>
                        )}
                    </p>
                    <p className={`text-sm ${permissions === 'VIEW_EDIT' ? 'text-green-700' : 'text-blue-700'}`}>
                        {permissions === 'VIEW_EDIT'
                            ? 'You can view and edit all family financial data'
                            : 'You can view family data but cannot make changes'}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            {activeTab === 'summary' && summary && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="w-8 h-8 text-white" />
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-green-100 text-sm mb-1">Total Income</p>
                            <p className="text-3xl font-bold text-white">{formatAmount(summary.summary.totalIncome)}</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingDown className="w-8 h-8 text-white" />
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-red-100 text-sm mb-1">Total Expenses</p>
                            <p className="text-3xl font-bold text-white">{formatAmount(summary.summary.totalExpenses)}</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <PiggyBank className="w-8 h-8 text-white" />
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                    <span className="text-white text-sm font-bold">{summary.summary.savingsRate.toFixed(1)}%</span>
                                </div>
                            </div>
                            <p className="text-blue-100 text-sm mb-1">Net Savings</p>
                            <p className="text-3xl font-bold text-white">{formatAmount(summary.summary.netIncome)}</p>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <Target className="w-8 h-8 text-white" />
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                    <span className="text-white text-sm font-bold">{summary.summary.activeGoals}</span>
                                </div>
                            </div>
                            <p className="text-purple-100 text-sm mb-1">Active Goals</p>
                            <p className="text-3xl font-bold text-white">{formatAmount(summary.summary.budgetRemaining)}</p>
                            <p className="text-purple-100 text-xs mt-1">Budget Remaining</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/50">
                <div className="flex gap-2">
                    {['summary', 'transactions', 'budgets', 'goals'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold capitalize transition-all duration-300 ${activeTab === tab
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Tab Content */}
            {activeTab === 'summary' && summary && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Spending by Category - Stacked Bar Chart */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Spending by Category</h3>
                        <p className="text-sm text-gray-600 mb-4">Member-wise spending breakdown</p>
                        {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart
                                    layout="vertical"
                                    data={summary.categoryBreakdown.map((cat: any) => {
                                        const data: any = { name: cat.category };
                                        cat.memberBreakdown.forEach((m: any) => {
                                            data[m.memberName] = m.amount;
                                        });
                                        return data;
                                    })}
                                    margin={{ top: 10, right: 40, left: 80, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(value) => formatAmount(value)}
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        stroke="#6b7280"
                                        style={{ fontSize: '13px', fontWeight: '500' }}
                                    />
                                    <Tooltip
                                        formatter={(value: any, name: string) => [formatAmount(value), name]}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '12px',
                                            border: '2px solid #e5e7eb',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '10px' }}
                                        iconType="circle"
                                    />
                                    {summary.members.map((member: any, index: number) => (
                                        <Bar
                                            key={member.userId}
                                            dataKey={member.user.name}
                                            stackId="a"
                                            fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][index % 6]}
                                            radius={index === summary.members.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
                                <TrendingDown className="w-16 h-16 text-gray-300 mb-3" />
                                <p className="font-semibold">No spending data available</p>
                                <p className="text-sm text-gray-400 mt-1">Add transactions to see category breakdown</p>
                            </div>
                        )}
                    </div>

                    {/* Member Contributions (Goal Breakdown) - Stacked Bar Chart */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Goal Contributions by Member</h3>
                        <p className="text-sm text-gray-600 mb-4">Member contributions across family goals</p>
                        {summary.goalContributionsByGoal && summary.goalContributionsByGoal.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart
                                    data={summary.goalContributionsByGoal}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="goalName"
                                        stroke="#6b7280"
                                        style={{ fontSize: '13px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => formatAmount(value)}
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => formatAmount(value)}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '12px',
                                            border: '2px solid #e5e7eb',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="line" />
                                    {/* Create a line for each member */}
                                    {summary.members && summary.members.map((member: any, index: number) => (
                                        <Line
                                            key={member.user.name}
                                            type="monotone"
                                            dataKey={member.user.name}
                                            stroke={['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'][index % 6]}
                                            strokeWidth={3}
                                            dot={{ fill: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'][index % 6], r: 5 }}
                                            activeDot={{ r: 7 }}
                                            name={member.user.name}
                                        />
                                    ))}
                                </ComposedChart>
                            </ResponsiveContainer>

                        ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
                                <User className="w-16 h-16 text-gray-300 mb-3" />
                                <p className="font-semibold">No member data available</p>
                                <p className="text-sm text-gray-400 mt-1">Members need to share their data to see contributions</p>
                            </div>
                        )}
                    </div>

                    {/* Budget Progress */}
                    {/* <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50 md:col-span-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Budget Progress</h3>
                        {summary.budgetProgress && summary.budgetProgress.length > 0 ? (
                            <div className="space-y-4">
                                {summary.budgetProgress.map((budget: any, index: number) => {
                                    const percentage = (budget.spent / budget.limit) * 100;
                                    const isOverBudget = percentage > 100;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">{budget.category}</span>
                                                <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                                                    {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                        : percentage > 80
                                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                                            : 'bg-gradient-to-r from-green-500 to-green-600'
                                                        }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{percentage.toFixed(1)}% used</span>
                                                <span>{formatAmount(budget.limit - budget.spent)} remaining</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-gray-500">
                                <p>No budget data available</p>
                            </div>
                        )}
                    </div> */}
                </div >
            )}

            {/* Transactions Tab */}
            {
                activeTab === 'transactions' && (
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h3 className="text-2xl font-bold text-gray-800">Member Transactions</h3>
                            <button
                                onClick={handleShareToggle}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${isSharing
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                    }`}
                            >
                                {isSharing ? (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Hide My Transactions
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Share My Transactions
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Member Selector Tabs */}
                        {memberTransactions.length > 0 ? (
                            <>
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                    {memberTransactions.map((memberData: any) => (
                                        <button
                                            key={memberData.member.id}
                                            onClick={() => setSelectedMemberId(memberData.member.id)}
                                            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedMemberId === memberData.member.id
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {memberData.member.name}
                                                <span className="text-xs opacity-75">
                                                    {memberData.isSharingTransactions || memberData.member.id === currentUserId ? `(${memberData.count})` : ' (Not sharing)'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Member's Transactions */}
                                {(() => {
                                    const selectedMemberData = memberTransactions.find(
                                        (m: any) => m.member.id === selectedMemberId
                                    );

                                    if (!selectedMemberData) return null;

                                    if (selectedMemberData.member.id === currentUserId && !isSharing) {
                                        return (
                                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                    <Eye className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-700 mb-2">Not Sharing Transactions</h4>
                                                <p className="text-gray-500 max-w-md text-center mb-6">
                                                    You have disabled transaction sharing. Enable it to view your history here and allow family members to see your contributions.
                                                </p>
                                                <button
                                                    onClick={handleShareToggle}
                                                    className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                                >
                                                    Share Transactions
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div>
                                            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Viewing transactions for</p>
                                                        <p className="text-lg font-bold text-gray-800">{selectedMemberData.member.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Last 50 transactions</p>
                                                        <p className="text-lg font-bold text-purple-600">{selectedMemberData.count} shown</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                                {selectedMemberData.transactions.length === 0 ? (
                                                    <p className="text-gray-600 text-center py-8">No transactions yet</p>
                                                ) : (
                                                    selectedMemberData.transactions.map((transaction: any) => (
                                                        <div
                                                            key={transaction.id}
                                                            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200 hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                                                                        }`}>
                                                                        {transaction.type === 'INCOME' ? (
                                                                            <TrendingUp className="w-6 h-6 text-green-600" />
                                                                        ) : (
                                                                            <TrendingDown className="w-6 h-6 text-red-600" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800">{transaction.description}</p>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span>{formatDate(transaction.date)}</span>
                                                                            <span className="mx-1">•</span>
                                                                            <span>{transaction.category || 'No Category'}</span>
                                                                            {permissions === 'VIEW_EDIT' && (
                                                                                <button
                                                                                    onClick={() => setEditingTransaction({ id: transaction.id, category: transaction.category || '' })}
                                                                                    className="ml-2 p-1 hover:bg-purple-100 rounded transition-colors"
                                                                                    title="Edit Category"
                                                                                >
                                                                                    <Edit2 className="w-3 h-3 text-purple-600" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                                                        }`}>
                                                                        {transaction.type === 'INCOME' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg font-semibold mb-2">No Transaction Data Available</p>
                                <p className="text-gray-500 text-sm">
                                    Members need to choose "View & Edit" permissions to share their transaction data.
                                </p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Budgets Tab */}
            {
                activeTab === 'budgets' && (
                    <FamilyBudgets familyId={familyId} permissions={permissions} />
                )
            }

            {/* Goals Tab */}
            {
                activeTab === 'goals' && (
                    <FamilyGoals familyId={familyId} permissions={permissions} />
                )
            }

            {/* Edit Transaction Category Modal */}
            {
                editingTransaction && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Edit Transaction Category</h3>
                                <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={editingTransaction.category}
                                        onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">No Category</option>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setEditingTransaction(null)}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateTransactionCategory}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {showShareConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${isSharing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {isSharing ? <Eye className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {isSharing ? 'Hide Transactions?' : 'Share Transactions?'}
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            {isSharing
                                ? 'Are you sure you want to stop sharing? Your family members will no longer be able to see your transaction history.'
                                : 'Are you sure you want to share your transactions? All family members will be able to view your transaction history.'
                            }
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowShareConfirm(false)}
                                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmShareAction}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all ${isSharing
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    }`}
                            >
                                {isSharing ? 'Yes, Hide It' : 'Yes, Share It'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
