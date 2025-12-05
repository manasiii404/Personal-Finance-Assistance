import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, X, DollarSign, Calendar, Users } from 'lucide-react';
import apiService from '../services/api';
import { useAlerts } from '../contexts/AlertContext';
import { useSocket } from '../contexts/SocketContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface Contribution {
    id: string;
    userId: string;
    amount: number;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface FamilyGoal {
    id: string;
    familyId: string;
    title: string;
    target: number;
    current: number;
    deadline: string;
    category: string;
    contributions: Contribution[];
    createdAt: string;
    updatedAt: string;
}

interface FamilyGoalsProps {
    familyId: string;
    permissions: 'VIEW_ONLY' | 'VIEW_EDIT';
}

const CATEGORY_ICONS: { [key: string]: string } = {
    'Vacation': '🏖️',
    'Emergency Fund': '🚨',
    'Home': '🏠',
    'Education': '🎓',
    'Investment': '📈',
    'Vehicle': '🚗',
    'Wedding': '💒',
    'Retirement': '🌅',
    'Other': '🎯',
};

export const FamilyGoals: React.FC<FamilyGoalsProps> = ({ familyId, permissions }) => {
    const [goals, setGoals] = useState<FamilyGoal[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<FamilyGoal | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');

    const { addAlert } = useAlerts();
    const { socket, isConnected } = useSocket();
    const { formatAmount, currencySymbol } = useCurrency();

    useEffect(() => {
        loadGoals();
    }, [familyId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('family:goal-created', () => {
            loadGoals();
        });

        socket.on('family:goal-updated', () => {
            loadGoals();
        });

        socket.on('family:goal-deleted', () => {
            loadGoals();
        });

        socket.on('family:goal-contribution', () => {
            loadGoals();
        });

        return () => {
            socket.off('family:goal-created');
            socket.off('family:goal-updated');
            socket.off('family:goal-deleted');
            socket.off('family:goal-contribution');
        };
    }, [socket, isConnected]);

    const loadGoals = async () => {
        try {
            const response = await apiService.getFamilyGoalsNew(familyId);
            setGoals(response.data || []);
        } catch (error: any) {
            console.error('Error loading family goals:', error);
        }
    };

    const handleCreateGoal = async () => {
        if (!title.trim() || !target || !deadline || !category.trim()) {
            addAlert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        try {
            await apiService.createFamilyGoal(familyId, {
                title: title.trim(),
                target: parseFloat(target),
                deadline,
                category: category.trim(),
            });
            setShowCreateModal(false);
            resetForm();
            addAlert({ type: 'success', title: 'Success', message: 'Family goal created!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to create goal' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGoal = async () => {
        if (!selectedGoal || !title.trim() || !target || !deadline || !category.trim()) {
            addAlert({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        try {
            await apiService.updateFamilyGoal(familyId, selectedGoal.id, {
                title: title.trim(),
                target: parseFloat(target),
                deadline,
                category: category.trim(),
            });
            setShowEditModal(false);
            setSelectedGoal(null);
            resetForm();
            addAlert({ type: 'success', title: 'Success', message: 'Goal updated!' });
            await loadGoals(); // Reload to get updated data
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to update goal' });
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async () => {
        if (!selectedGoal || !contributionAmount) {
            addAlert({ type: 'error', title: 'Error', message: 'Please enter an amount' });
            return;
        }

        const amount = parseFloat(contributionAmount);
        if (amount <= 0) {
            addAlert({ type: 'error', title: 'Error', message: 'Amount must be greater than 0' });
            return;
        }

        setLoading(true);
        try {
            await apiService.contributeToFamilyGoal(familyId, selectedGoal.id, amount);
            setShowContributeModal(false);
            setSelectedGoal(null);
            setContributionAmount('');
            addAlert({ type: 'success', title: 'Success', message: 'Contribution added!' });
            await loadGoals(); // Reload to get updated data
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to contribute' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        setLoading(true);
        try {
            await apiService.deleteFamilyGoal(familyId, goalId);
            addAlert({ type: 'success', title: 'Success', message: 'Goal deleted!' });
        } catch (error: any) {
            addAlert({ type: 'error', title: 'Error', message: error.message || 'Failed to delete goal' });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (goal: FamilyGoal) => {
        setSelectedGoal(goal);
        setTitle(goal.title);
        setTarget(goal.target.toString());
        setDeadline(goal.deadline.split('T')[0]);
        setCategory(goal.category);
        setShowEditModal(true);
    };

    const openContributeModal = (goal: FamilyGoal) => {
        setSelectedGoal(goal);
        setShowContributeModal(true);
    };

    const resetForm = () => {
        setTitle('');
        setTarget('');
        setDeadline('');
        setCategory('');
    };

    const getProgressPercentage = (current: number, target: number) => {
        return target > 0 ? (current / target) * 100 : 0;
    };

    const getDaysRemaining = (deadlineStr: string) => {
        const deadline = new Date(deadlineStr);
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const canEdit = permissions === 'VIEW_EDIT';

    return (
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Family Goals</h3>
                        <p className="text-sm text-gray-600">Save together for shared dreams</p>
                    </div>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Create Goal
                    </button>
                )}
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-12 h-12 text-purple-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">No Family Goals Yet</h4>
                    <p className="text-gray-600 mb-6">Create your first family goal and start saving together!</p>
                    {canEdit && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                        >
                            Create First Goal
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {goals.map((goal) => {
                        const percentage = getProgressPercentage(goal.current, goal.target);
                        const daysRemaining = getDaysRemaining(goal.deadline);
                        const categoryIcon = CATEGORY_ICONS[goal.category] || CATEGORY_ICONS['Other'];
                        const isCompleted = goal.current >= goal.target;

                        return (
                            <div
                                key={goal.id}
                                className={`group relative bg-gradient-to-br ${isCompleted ? 'from-green-50 to-emerald-50 border-green-300' : 'from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-6 border-2 hover:border-purple-400 transition-all duration-300 hover:shadow-lg`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{categoryIcon}</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">{goal.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                                            </div>
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(goal)}
                                                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Edit Goal"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Goal"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">Progress</span>
                                            <span className="text-lg font-bold text-gray-800">
                                                {formatAmount(goal.current)} / {formatAmount(goal.target)}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'} transition-all duration-500`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="absolute -top-1 right-0">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white`}>
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contributions */}
                                    {goal.contributions && goal.contributions.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {goal.contributions.length} Contribution{goal.contributions.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {goal.contributions.slice(0, 3).map((contribution) => (
                                                    <div
                                                        key={contribution.id}
                                                        className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg text-xs"
                                                    >
                                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                            {contribution.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold">{formatAmount(contribution.amount)}</span>
                                                    </div>
                                                ))}
                                                {goal.contributions.length > 3 && (
                                                    <div className="flex items-center px-3 py-1 bg-white/50 rounded-lg text-xs text-gray-600">
                                                        +{goal.contributions.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contribute Button */}
                                    {canEdit && !isCompleted && (
                                        <button
                                            onClick={() => openContributeModal(goal)}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            Contribute
                                        </button>
                                    )}

                                    {isCompleted && (
                                        <div className="bg-green-100 text-green-800 py-2 px-4 rounded-xl font-semibold text-center">
                                            🎉 Goal Achieved!
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Create Family Goal</h3>
                            <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Family Vacation"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    placeholder="5000"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g., Vacation, Emergency Fund"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCreateGoal}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Goal'}
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Goal Modal */}
            {showEditModal && selectedGoal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Edit Goal</h3>
                            <button onClick={() => { setShowEditModal(false); setSelectedGoal(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateGoal}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Goal'}
                        </button>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContributeModal && selectedGoal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Contribute to Goal</h3>
                            <button onClick={() => { setShowContributeModal(false); setSelectedGoal(null); setContributionAmount(''); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
                            <h4 className="font-bold text-gray-800 mb-2">{selectedGoal.title}</h4>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Current Progress</span>
                                <span className="font-semibold text-gray-800">
                                    {formatAmount(selectedGoal.current)} / {formatAmount(selectedGoal.target)}
                                </span>
                            </div>
                            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${Math.min(getProgressPercentage(selectedGoal.current, selectedGoal.target), 100)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contribution Amount ({currencySymbol})</label>
                            <input
                                type="number"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                placeholder="100"
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleContribute}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Contributing...' : 'Add Contribution'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
