import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Calendar, User, Info, Eye, Edit3 } from 'lucide-react';
import apiService from '../services/api';
import { useAlerts } from '../contexts/AlertContext';

interface FamilyDataProps {
    familyId: string;
    permissions: 'VIEW_ONLY' | 'VIEW_EDIT';
}

export const FamilyDataDashboard: React.FC<FamilyDataProps> = ({ familyId, permissions }) => {
    const [summary, setSummary] = useState<any>(null);
    const [memberTransactions, setMemberTransactions] = useState<any[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'budgets' | 'goals'>('summary');
    const { addAlert } = useAlerts();
    const loadingRef = useRef(false);

    const loadFamilyData = useCallback(async () => {
        // Prevent multiple simultaneous loads
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const [summaryRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
                apiService.getFamilySummary(familyId),
                apiService.getFamilyTransactions(familyId),
                apiService.getFamilyBudgets(familyId),
                apiService.getFamilyGoals(familyId),
            ]);

            setSummary(summaryRes.data);

            // Handle new per-member transaction structure
            const memberTxData = (transactionsRes.data as any).memberTransactions || [];
            setMemberTransactions(memberTxData);

            // Auto-select first member if available
            if (memberTxData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(memberTxData[0].member.id);
            }

            setBudgets(budgetsRes.data || []);
            setGoals(goalsRes.data || []);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.summary.totalIncome)}</p>
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
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.summary.totalExpenses)}</p>
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
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.summary.netIncome)}</p>
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
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.summary.budgetRemaining)}</p>
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

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Member Transactions</h3>

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
                                            <span className="text-xs opacity-75">({memberData.count})</span>
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
                                                                        {transaction.category && (
                                                                            <>
                                                                                <span className="mx-1">•</span>
                                                                                <span>{transaction.category}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
            )}

            {/* Budgets Tab */}
            {activeTab === 'budgets' && (
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Family Budgets</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {budgets.length === 0 ? (
                            <p className="text-gray-600 text-center py-8 col-span-2">No budgets set</p>
                        ) : (
                            budgets.map((budget) => {
                                const percentage = (budget.spent / budget.limit) * 100;
                                return (
                                    <div key={budget.id} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{budget.category}</p>
                                                <p className="text-sm text-gray-600">{budget.user.name} • {budget.period}</p>
                                            </div>
                                            <PiggyBank className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Spent</span>
                                                <span className="font-semibold">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-600 text-right">{percentage.toFixed(1)}% used</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/50">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Family Goals</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {goals.length === 0 ? (
                            <p className="text-gray-600 text-center py-8 col-span-2">No goals set</p>
                        ) : (
                            goals.map((goal) => {
                                const percentage = (goal.current / goal.target) * 100;
                                return (
                                    <div key={goal.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{goal.title}</p>
                                                <p className="text-sm text-gray-600">{goal.user.name} • {goal.category}</p>
                                            </div>
                                            <Target className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-semibold">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600">
                                                <span>{percentage.toFixed(1)}% complete</span>
                                                <span>Due: {formatDate(goal.deadline)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
