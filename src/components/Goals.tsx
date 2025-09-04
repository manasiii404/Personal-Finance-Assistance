import React, { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import { useAlerts } from "../contexts/AlertContext";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal } = useFinance();
  const { addAlert } = useAlerts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [contributionModal, setContributionModal] = useState<any>(null);

  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    deadline: "",
    category: "",
  });

  const [contribution, setContribution] = useState("");

  const categories = [
    "Savings",
    "Travel",
    "Technology",
    "Education",
    "Health",
    "Investment",
    "Emergency",
    "Other",
  ];

  // Calculate goal statistics
  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalGoalProgress = goals.reduce((sum, goal) => sum + goal.current, 0);
  const completedGoals = goals.filter(
    (goal) => goal.current >= goal.target
  ).length;
  const overallProgress =
    totalGoalTarget > 0 ? (totalGoalProgress / totalGoalTarget) * 100 : 0;

  const handleAddGoal = async () => {
    if (
      !newGoal.title ||
      !newGoal.target ||
      !newGoal.deadline ||
      !newGoal.category
    )
      return;

    try {
      await addGoal({
        title: newGoal.title,
        target: parseFloat(newGoal.target),
        deadline: newGoal.deadline,
        category: newGoal.category,
      });

      addAlert({
        type: "success",
        title: "Goal Created",
        message: `Your goal "${newGoal.title}" has been created successfully`,
      });

      setNewGoal({ title: "", target: "", deadline: "", category: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding goal:", error);
      // Error handling is done in the context
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    try {
      await updateGoal(editingGoal.id, {
        title: editingGoal.title,
        target: parseFloat(editingGoal.target),
        deadline: editingGoal.deadline,
        category: editingGoal.category,
      });

      addAlert({
        type: "info",
        title: "Goal Updated",
        message: `Your goal "${editingGoal.title}" has been updated`,
      });

      setEditingGoal(null);
    } catch (error) {
      console.error("Error updating goal:", error);
      // Error handling is done in the context
    }
  };

  const handleContribution = async () => {
    if (!contributionModal || !contribution) return;

    try {
      const amount = parseFloat(contribution);
      await addContribution(contributionModal.id, amount);

      // Check if goal is completed
      const updatedGoal = {
        ...contributionModal,
        current: contributionModal.current + amount,
      };

      if (updatedGoal.current >= updatedGoal.target) {
        addAlert({
          type: "success",
          title: "Goal Achieved!",
          message: `Congratulations! You've achieved your goal "${updatedGoal.title}"`,
        });
      } else {
        addAlert({
          type: "info",
          title: "Contribution Added",
          message: `$${amount.toFixed(2)} added to "${updatedGoal.title}"`,
        });
      }

      setContribution("");
      setContributionModal(null);
    } catch (error) {
      console.error("Error adding contribution:", error);
      // Error handling is done in the context
    }
  };

  const getGoalStatus = (goal: any) => {
    const percentage = (goal.current / goal.target) * 100;
    const daysLeft = Math.ceil(
      (new Date(goal.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (percentage >= 100)
      return { status: "completed", color: "green", icon: CheckCircle };
    if (daysLeft < 0)
      return { status: "overdue", color: "red", icon: AlertTriangle };
    if (daysLeft <= 30)
      return { status: "urgent", color: "yellow", icon: Clock };
    return { status: "on-track", color: "blue", icon: Target };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600 mt-1">
            Track and achieve your financial objectives
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedGoals}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  {goals.length > 0
                    ? ((completedGoals / goals.length) * 100).toFixed(1)
                    : 0}
                  % complete
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Target</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalGoalTarget.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Overall Progress
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {overallProgress.toFixed(1)}%
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">
                  ${totalGoalProgress.toFixed(2)} saved
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;
          const daysLeft = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const { status, color, icon: StatusIcon } = getGoalStatus(goal);

          const colorClasses = {
            green: "bg-green-50 border-green-200 text-green-800",
            red: "bg-red-50 border-red-200 text-red-800",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
            blue: "bg-blue-50 border-blue-200 text-blue-800",
          };

          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {goal.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status === "completed" && "Completed"}
                      {status === "overdue" && "Overdue"}
                      {status === "urgent" && "Urgent"}
                      {status === "on-track" && "On Track"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{goal.category}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setEditingGoal({
                        ...goal,
                        target: goal.target.toString(),
                      })
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        percentage >= 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Remaining: </span>
                    <span className="font-medium text-gray-900">
                      ${Math.max(0, goal.target - goal.current).toFixed(2)}
                    </span>
                  </div>

                  {percentage < 100 && (
                    <button
                      onClick={() => setContributionModal(goal)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add Funds
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Goal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGoal.target}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, target: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, deadline: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddGoal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Goal
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

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Goal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingGoal.target}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, target: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={editingGoal.deadline}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, deadline: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateGoal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Update Goal
              </button>
              <button
                onClick={() => setEditingGoal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Contribution to "{contributionModal.title}"
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Progress:</span>
                  <span className="font-medium">
                    ${contributionModal.current.toFixed(2)} / $
                    {contributionModal.target.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (contributionModal.current / contributionModal.target) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contribution Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  After this contribution, you'll have{" "}
                  <span className="font-medium">
                    $
                    {(
                      contributionModal.current +
                      (parseFloat(contribution) || 0)
                    ).toFixed(2)}
                  </span>{" "}
                  towards your goal.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleContribution}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Contribution
              </button>
              <button
                onClick={() => setContributionModal(null)}
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
