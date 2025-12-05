import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Trash2,
  PiggyBank,
} from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { useAlerts } from "../contexts/AlertContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Chart } from "./ui/Chart";

export const Budget: React.FC = () => {
  const { budgets, updateBudget, addBudget, transactions, isLoading } = useFinance();
  const { addAlert } = useAlerts();
  const { formatAmount } = useCurrency();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "monthly" | "weekly" | "yearly"
  >("monthly");
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);


  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: "",
    period: "monthly" as "monthly" | "weekly" | "yearly",
  });

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Bills",
    "Healthcare",
    "Other",
  ];

  // Budget spending is automatically updated by the backend when transactions are created/updated/deleted
  // The backend's TransactionService.updateBudgetSpending() handles this in real-time
  // No need for frontend to manually calculate and update

  /* COMMENTED OUT - Backend handles budget updates automatically
  useEffect(() => {
    if (budgets.length === 0 || transactions.length === 0) return;
    
    budgets.forEach(budget => {
      const categoryExpenses = transactions
        .filter(t => t.category === budget.category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Only update if there's a significant difference to avoid infinite loops
      if (Math.abs(categoryExpenses - budget.spent) > 0.01) {
        updateBudget(budget.id, { spent: categoryExpenses });
      }
    });
  }, [transactions]);
  */

  // Calculate budget insights
  const totalBudget = budgets
    .filter((b) => b.period?.toLowerCase() === selectedPeriod)
    .reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets
    .filter((b) => b.period?.toLowerCase() === selectedPeriod)
    .reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  // Budget chart data - remove duplicates
  const budgetChartData = budgets
    .filter(b => b.period?.toLowerCase() === selectedPeriod)
    .reduce((acc, budget) => {
      // Check if category already exists
      const existing = acc.find(item => item.name === budget.category);
      if (!existing) {
        acc.push({
          name: budget.category,
          value: budget.spent
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

  // Get overspent budgets
  const overspentBudgets = budgets.filter(
    (b) => b.spent > b.limit && b.period?.toLowerCase() === selectedPeriod
  );

  // Get budgets near limit (>80%)
  const nearLimitBudgets = budgets.filter((b) => {
    const percentage = (b.spent / b.limit) * 100;
    return percentage > 80 && percentage <= 100 && b.period?.toLowerCase() === selectedPeriod;
  });

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return;

    // Check if budget already exists for this category and period
    const existingBudget = budgets.find(
      b => b.category === newBudget.category && b.period.toLowerCase() === newBudget.period
    );

    if (existingBudget) {
      addAlert({
        type: "error",
        title: "Budget Already Exists",
        message: `A ${newBudget.period} budget for ${newBudget.category} already exists. Please edit the existing budget or choose a different category.`,
      });
      return;
    }

    setIsAddingBudget(true);
    try {
      await addBudget({
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        period: newBudget.period,
        spent: 0,
      });

      addAlert({
        type: "success",
        title: "Budget Created",
        message: `${newBudget.category} budget of ${formatAmount(parseFloat(newBudget.limit))} has been set`,
      });

      setNewBudget({ category: "", limit: "", period: "monthly" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding budget:", error);
      addAlert({
        type: "error",
        title: "Failed to Create Budget",
        message: "There was an error creating the budget. Please try again.",
      });
    } finally {
      setIsAddingBudget(false);
    }
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget({ ...budget, limit: budget.limit.toString() });
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    setIsUpdatingBudget(true);
    try {
      // Prepare update data with proper validation
      const updateData: any = {
        limit: parseFloat(editingBudget.limit)
      };

      // Include category if it exists
      if (editingBudget.category) {
        updateData.category = editingBudget.category;
      }

      // Always include the period in the update - backend expects exact case
      updateData.period = (editingBudget.period || 'monthly').toLowerCase();


      await updateBudget(editingBudget.id, updateData);

      addAlert({
        type: "info",
        title: "Budget Updated",
        message: `${editingBudget.category} budget has been updated`,
      });

      setEditingBudget(null);
    } catch (error) {
      console.error("Error updating budget:", error);
      addAlert({
        type: "error",
        title: "Update Failed",
        message: error instanceof Error ? error.message : "Failed to update budget"
      });
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const filteredBudgets = budgets.filter((b) => b.period?.toLowerCase() === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Budget Management
          </h1>
          <p className="text-slate-900 mt-2 text-lg font-bold">
            Set limits and track your spending across categories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Period Filter */}
      <div className="card-glass-purple p-6 glow-purple">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-slate-900">
            Budget Period:
          </span>
          <div className="flex space-x-2">
            {(["monthly", "weekly", "yearly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedPeriod === period
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg glow-purple"
                  : "bg-white/20 backdrop-blur-sm text-slate-900 border border-white/20"
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
        <div className="card-glass-blue p-6 glow-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Total Budget</p>
              <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {formatAmount(totalBudget)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30 glow-blue">
              <Target className="h-7 w-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-glass-orange p-6 glow-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Total Spent</p>
              <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {formatAmount(totalSpent)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-600 font-bold">
                  {totalBudget > 0
                    ? ((totalSpent / totalBudget) * 100).toFixed(1)
                    : 0}
                  % of budget
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30 glow-red">
              <TrendingDown className="h-7 w-7 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card-glass-green p-6 glow-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Remaining</p>
              <p
                className={`text-3xl font-bold text-gradient ${remainingBudget >= 0 ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-red-400 to-pink-400"
                  } bg-clip-text text-transparent`}
              >
                {formatAmount(remainingBudget)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {remainingBudget >= 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                )}
                <span
                  className={`text-sm font-semibold ${remainingBudget >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                >
                  {remainingBudget >= 0 ? "Under budget" : "Over budget"}
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-xl backdrop-blur-sm border ${remainingBudget >= 0 ? "bg-green-500/20 border-green-400/30 glow-green" : "bg-red-500/20 border-red-400/30 glow-red"
                }`}
            >
              <PiggyBank
                className={`h-7 w-7 ${remainingBudget >= 0 ? "text-green-400" : "text-red-400"
                  }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(overspentBudgets.length > 0 || nearLimitBudgets.length > 0) && (
        <div className="card-glass-orange p-6 glow-orange border border-orange-400/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-7 w-7 text-orange-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-3">
                Budget Alerts
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {overspentBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-400/30 glow-red"
                  >
                    <p className="text-sm text-red-900 font-bold">
                      <strong>{budget.category}</strong> is over budget by {formatAmount(budget.spent - budget.limit)}
                    </p>
                  </div>
                ))}
                {nearLimitBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30 glow-orange"
                  >
                    <p className="text-sm text-orange-900 font-bold">
                      <strong>{budget.category}</strong> is at{" "}
                      {((budget.spent / budget.limit) * 100).toFixed(1)}% of
                      budget limit
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass-purple p-8 glow-purple">
          <h3 className="text-xl font-bold text-gradient-purple mb-6">Budget Spending Distribution</h3>
          <div className="h-80">
            <Chart data={budgetChartData} type="pie" />
          </div>
        </div>

        <div className="card-glass-blue p-8 glow-blue">
          <h3 className="text-xl font-bold text-gradient-blue mb-6">Budget vs Spending</h3>
          <div className="h-80">
            <Chart
              data={budgets
                .filter(b => b.period?.toLowerCase() === selectedPeriod)
                .reduce((acc, budget) => {
                  const existing = acc.find(item => item.name === budget.category);
                  if (!existing) {
                    acc.push({
                      name: budget.category,
                      income: budget.limit,
                      expenses: budget.spent
                    });
                  }
                  return acc;
                }, [] as Array<{ name: string; income: number; expenses: number }>)}
              type="bar"
            />
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="card-glass-indigo glow-indigo">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}{" "}
            Budgets
          </h3>
        </div>

        <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
          {filteredBudgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;

            return (
              <div
                key={budget.id}
                className="p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-xl font-bold text-gradient bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent truncate max-w-xs">
                      {budget.category}
                    </h4>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${isOverBudget
                        ? "bg-red-500/20 text-red-900 border-red-400/30 glow-red"
                        : isNearLimit
                          ? "bg-orange-500/20 text-orange-900 border-orange-400/30 glow-orange"
                          : "bg-green-500/20 text-green-900 border-green-400/30 glow-green"
                        }`}
                    >
                      {percentage.toFixed(1)}% used
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-900 font-bold">
                        {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                      </p>
                      <p className="text-xs text-slate-800 font-bold">
                        {formatAmount(budget.limit - budget.spent)} remaining
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="p-2 text-slate-400 rounded-xl backdrop-blur-sm border border-white/20"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4 border border-white/30">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 shadow-lg ${isOverBudget
                        ? "bg-gradient-to-r from-red-500 to-pink-500 glow-red"
                        : isNearLimit
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 glow-orange"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 glow-green"
                        }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <div className="absolute -top-1 right-0 w-4 h-4 bg-red-500 rounded-full animate-pulse glow-red" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-ultra-glass p-8 w-full max-w-md mx-4 glow-blue">
            <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Add New Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Category
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, category: e.target.value })
                  }
                  className="input-glass w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Budget Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBudget.limit}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, limit: e.target.value })
                  }
                  className="input-glass w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      period: e.target.value as "monthly" | "weekly" | "yearly",
                    })
                  }
                  className="input-glass w-full"
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
                disabled={isAddingBudget}
                className="btn-primary flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAddingBudget ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add Budget"
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-ultra-glass p-8 w-full max-w-md mx-4 glow-purple">
            <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              Edit Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editingBudget.category}
                  disabled
                  className="input-glass w-full opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Budget Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingBudget.limit}
                  onChange={(e) =>
                    setEditingBudget({
                      ...editingBudget,
                      limit: e.target.value,
                    })
                  }
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Current Spent
                </label>
                <input
                  type="text"
                  value={formatAmount(editingBudget.spent)}
                  disabled
                  className="input-glass w-full opacity-60"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateBudget}
                disabled={isUpdatingBudget}
                className="btn-primary flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUpdatingBudget ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Budget"
                )}
              </button>
              <button
                onClick={() => setEditingBudget(null)}
                className="btn-secondary flex-1 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
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
