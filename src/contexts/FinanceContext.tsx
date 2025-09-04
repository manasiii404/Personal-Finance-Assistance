import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  source: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "weekly" | "yearly";
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
  daysLeft?: number;
  percentage?: number;
  isCompleted?: boolean;
  isOverdue?: boolean;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Omit<Transaction, "id">>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (
    id: string,
    budget: Partial<Omit<Budget, "id">>
  ) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Omit<Goal, "id">>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number) => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
    }
  }, [isAuthenticated]);

  const refreshData = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        apiService.getTransactions({ limit: 100 }),
        apiService.getBudgets(),
        apiService.getGoals(),
      ]);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
      }

      if (budgetsRes.success) {
        setBudgets(budgetsRes.data || []);
      }

      if (goalsRes.success) {
        setGoals(goalsRes.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const response = await apiService.createTransaction(transaction);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to create transaction");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transaction"
      );
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Omit<Transaction, "id">>
  ) => {
    try {
      const response = await apiService.updateTransaction(id, transaction);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to update transaction");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update transaction"
      );
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await apiService.deleteTransaction(id);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to delete transaction");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction"
      );
      throw err;
    }
  };

  const addBudget = async (budget: Omit<Budget, "id">) => {
    try {
      const response = await apiService.createBudget(budget);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to create budget");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget");
      throw err;
    }
  };

  const updateBudget = async (
    id: string,
    budget: Partial<Omit<Budget, "id">>
  ) => {
    try {
      const response = await apiService.updateBudget(id, budget);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to update budget");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update budget");
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const response = await apiService.deleteBudget(id);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to delete budget");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete budget");
      throw err;
    }
  };

  const addGoal = async (goal: Omit<Goal, "id">) => {
    try {
      const response = await apiService.createGoal(goal);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to create goal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
      throw err;
    }
  };

  const updateGoal = async (id: string, goal: Partial<Omit<Goal, "id">>) => {
    try {
      const response = await apiService.updateGoal(id, goal);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to update goal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal");
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const response = await apiService.deleteGoal(id);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to delete goal");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
      throw err;
    }
  };

  const addContribution = async (goalId: string, amount: number) => {
    try {
      const response = await apiService.addContribution(goalId, amount);
      if (response.success) {
        await refreshData();
      } else {
        throw new Error(response.message || "Failed to add contribution");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add contribution"
      );
      throw err;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addContribution,
        totalIncome,
        totalExpenses,
        savingsRate,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
