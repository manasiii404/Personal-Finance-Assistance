import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAlerts } from '../contexts/AlertContext';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  PiggyBank,
  Target
} from 'lucide-react';

export const Budget: React.FC = () => {
  const { budgets, updateBudget, transactions } = useFinance();
  const { addAlert } = useAlerts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

  // Calculate budget insights
  const totalBudget = budgets.filter(b => b.period === selectedPeriod).reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.filter(b => b.period === selectedPeriod).reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  // Get overspent budgets
  const overspentBudgets = budgets.filter(b => b.spent > b.limit && b.period === selectedPeriod);

  // Get budgets near limit (>80%)
  const nearLimitBudgets = budgets.filter(b => {
    const percentage = (b.spent / b.limit) * 100;
    return percentage > 80 && percentage <= 100 && b.period === selectedPeriod;
  });

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;

    const budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      limit: parseFloat(newBudget.limit),
      spent: 0,
      period: newBudget.period
    };

    updateBudget(budget);
    
    addAlert({
      type: 'success',
      title: 'Budget Created',
      message: `${newBudget.category} budget of $${newBudget.limit} has been set`
    });

    setNewBudget({ category: '', limit: '', period: 'monthly' });
    setShowAddModal(false);
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget({...budget, limit: budget.limit.toString()});
  };

  const handleUpdateBudget = () => {
    if (!editingBudget) return;

    const updatedBudget = {
      ...editingBudget,
      limit: parseFloat(editingBudget.limit)
    };

    updateBudget(updatedBudget);
    
    addAlert({
      type: 'info',
      title: 'Budget Updated',
      message: `${editingBudget.category} budget has been updated`
    });

    setEditingBudget(null);
  };

  const filteredBudgets = budgets.filter(b => b.period === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">Set limits and track your spending across categories</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Budget Period:</span>
          <div className="flex space-x-2">
            {(['monthly', 'weekly', 'yearly'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === period
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">
                  {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
                </span>
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
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remainingBudget.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {remainingBudget >= 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <PiggyBank className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(overspentBudgets.length > 0 || nearLimitBudgets.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Budget Alerts</h3>
              <div className="space-y-2">
                {overspentBudgets.map(budget => (
                  <div key={budget.id} className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>{budget.category}</strong> is over budget by ${(budget.spent - budget.limit).toFixed(2)}
                    </p>
                  </div>
                ))}
                {nearLimitBudgets.map(budget => (
                  <div key={budget.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>{budget.category}</strong> is at {((budget.spent / budget.limit) * 100).toFixed(1)}% of budget limit
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Budgets
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBudgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;
            
            return (
              <div key={budget.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-900">{budget.category}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isOverBudget 
                        ? 'bg-red-100 text-red-800' 
                        : isNearLimit 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {percentage.toFixed(1)}% used
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${(budget.limit - budget.spent).toFixed(2)} remaining
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isOverBudget 
                          ? 'bg-red-500' 
                          : isNearLimit 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <div className="absolute -top-1 right-0 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({...newBudget, period: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddBudget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Budget
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Budget</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingBudget.category}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBudget.limit}
                  onChange={(e) => setEditingBudget({...editingBudget, limit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Spent</label>
                <input
                  type="text"
                  value={`$${editingBudget.spent.toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateBudget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Update Budget
              </button>
              <button
                onClick={() => setEditingBudget(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};