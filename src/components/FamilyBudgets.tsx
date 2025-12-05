import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Edit3, Trash2, X, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import apiService from '../services/api';
import { useAlerts } from '../contexts/AlertContext';
import { useSocket } from '../contexts/SocketContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface FamilyBudget {
    id: string;
    familyId: string;
    category: string;
    limit: number;
    period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    spent: number;
    createdAt: string;
    updatedAt: string;
}

interface FamilyBudgetsProps {
    familyId: string;
    permissions: 'VIEW_ONLY' | 'VIEW_EDIT';
}

const CATEGORY_ICONS: { [key: string]: string } = {
    'Groceries': '🛒',
    'Utilities': '💡',
    'Entertainment': '🎬',
    'Transportation': '🚗',
    'Healthcare': '🏥',
    'Education': '📚',
    'Shopping': '🛍️',
    'Dining': '🍽️',
    'Travel': '✈️',
    'Other': '📦',
};

const PERIOD_LABELS = {
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly',
};

const SPENDING_CATEGORIES = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Other',
];

export const FamilyBudgets: React.FC<FamilyBudgetsProps> = ({ familyId, permissions }) => {
    const [budgets, setBudgets] = useState<FamilyBudget[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<FamilyBudget | null>(null);

    // Form state
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

    const { addAlert } = useAlerts();
    const { socket, isConnected } = useSocket();
    const { formatAmount, currencySymbol } = useCurrency();

    useEffect(() => {
        loadBudgets();
    }, [familyId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('family:budget-created', () => {
            loadBudgets();
        });

        socket.on('family:budget-updated', () => {
            loadBudgets();
        });

        socket.on('family:budget-deleted', () => {
            loadBudgets();
        });

        return () => {
            socket.off('family:budget-created');
            socket.off('family:budget-updated');
            socket.off('family:budget-deleted');
        };
    }, [socket, isConnected]);

    const loadBudgets = async () => {
        try {
            const response = await apiService.getFamilyBudgetsNew(familyId);
            setBudgets(response.data || []);
        } catch (error: any) {
            console.error('Error loading family budgets:', error);
        }
    };

    const handleCreateBudget = async () => {
        if (!category.trim() || !limit) {
            addAlert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        try {
            await apiService.createFamilyBudget(familyId, {
                category: category.trim(),
                limit: parseFloat(limit),
                period,
            });
            setShowCreateModal(false);
            resetForm();
            addAlert({ type: 'success', title: 'Success', message: 'Family budget created!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to create budget' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBudget = async () => {
        if (!selectedBudget || !category.trim() || !limit) {
            addAlert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        try {
            await apiService.updateFamilyBudget(familyId, selectedBudget.id, {
                category: category.trim(),
                limit: parseFloat(limit),
                period,
            });
            setShowEditModal(false);
            setSelectedBudget(null);
            resetForm();
            addAlert({ type: 'success', title: 'Success', message: 'Budget updated!' });
            await loadBudgets(); // Reload to get updated data
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to update budget' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        if (!confirm('Are you sure you want to delete this budget?')) return;

        setLoading(true);
        try {
            await apiService.deleteFamilyBudget(familyId, budgetId);
            addAlert({ type: 'success', title: 'Success', message: 'Budget deleted!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to delete budget' });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (budget: FamilyBudget) => {
        setSelectedBudget(budget);
        setCategory(budget.category);
        setLimit(budget.limit.toString());
        setPeriod(budget.period);
        setShowEditModal(true);
    };

    const resetForm = () => {
        setCategory('');
        setLimit('');
        setPeriod('MONTHLY');
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'from-red-500 to-red-600';
        if (percentage >= 75) return 'from-orange-500 to-orange-600';
        if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
        return 'from-green-500 to-green-600';
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-orange-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const canEdit = permissions === 'VIEW_EDIT';

    return (
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                        <PiggyBank className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Family Budgets</h3>
                        <p className="text-sm text-gray-600">Track shared spending limits</p>
                    </div>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Create Budget
                    </button>
                )}
            </div>

            {budgets.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PiggyBank className="w-12 h-12 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No Family Budgets Yet</h4>
                    <p className="text-gray-600 mb-6">Create your first family budget to track shared expenses</p>
                    {canEdit && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                        >
                            Create First Budget
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {budgets.map((budget) => {
                        const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                        const categoryIcon = CATEGORY_ICONS[budget.category] || CATEGORY_ICONS['Other'];

                        return (
                            <div
                                key={budget.id}
                                className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{categoryIcon}</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">{budget.category}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {PERIOD_LABELS[budget.period]}
                                            </div>
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(budget)}
                                                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit Budget"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget.id)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Budget"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Spent</span>
                                        <span className="text-lg font-bold text-gray-800">
                                            {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getProgressBarColor(percentage)} transition-all duration-500`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="absolute -top-1 right-0">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${getProgressColor(percentage)} text-white`}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Remaining</span>
                                        <span className={`font-semibold ${budget.limit - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatAmount(Math.max(budget.limit - budget.spent, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Budget Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Create Family Budget</h3>
                            <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {SPENDING_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    placeholder="500"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateBudget}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Budget'}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {showEditModal && selectedBudget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Edit Budget</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedBudget(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {SPENDING_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value as any)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="YEARLY">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateBudget}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Budget'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
