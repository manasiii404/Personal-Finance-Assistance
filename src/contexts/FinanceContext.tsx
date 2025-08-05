import React, { createContext, useContext, useState, useEffect } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteTransaction: (id: string) => void;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025-01-20',
      description: 'Salary Credit',
      amount: 5000,
      category: 'Salary',
      type: 'income',
      source: 'Bank SMS'
    },
    {
      id: '2',
      date: '2025-01-19',
      description: 'Grocery Shopping',
      amount: -120,
      category: 'Food',
      type: 'expense',
      source: 'Card Transaction'
    },
    {
      id: '3',
      date: '2025-01-18',
      description: 'Coffee Shop',
      amount: -8.50,
      category: 'Food',
      type: 'expense',
      source: 'Mobile Payment'
    },
    {
      id: '4',
      date: '2025-01-17',
      description: 'Gas Station',
      amount: -45,
      category: 'Transportation',
      type: 'expense',
      source: 'Card Transaction'
    },
    {
      id: '5',
      date: '2025-01-16',
      description: 'Freelance Project',
      amount: 800,
      category: 'Freelance',
      type: 'income',
      source: 'Bank Transfer'
    },
    {
      id: '6',
      date: '2025-01-15',
      description: 'Netflix Subscription',
      amount: -15.99,
      category: 'Entertainment',
      type: 'expense',
      source: 'Auto-debit'
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    { id: '1', category: 'Food', limit: 500, spent: 128.50, period: 'monthly' },
    { id: '2', category: 'Transportation', limit: 200, spent: 45, period: 'monthly' },
    { id: '3', category: 'Entertainment', limit: 100, spent: 15.99, period: 'monthly' },
    { id: '4', category: 'Shopping', limit: 300, spent: 0, period: 'monthly' }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      target: 10000,
      current: 3500,
      deadline: '2025-12-31',
      category: 'Savings'
    },
    {
      id: '2',
      title: 'Vacation Fund',
      target: 2000,
      current: 450,
      deadline: '2025-06-30',
      category: 'Travel'
    },
    {
      id: '3',
      title: 'New Laptop',
      target: 1500,
      current: 800,
      deadline: '2025-03-31',
      category: 'Technology'
    }
  ]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update budget if it's an expense
    if (transaction.type === 'expense') {
      setBudgets(prev => prev.map(budget => 
        budget.category === transaction.category
          ? { ...budget, spent: budget.spent + Math.abs(transaction.amount) }
          : budget
      ));
    }
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === updatedBudget.id ? updatedBudget : budget
    ));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      goals,
      addTransaction,
      updateBudget,
      addGoal,
      updateGoal,
      deleteTransaction,
      totalIncome,
      totalExpenses,
      savingsRate
    }}>
      {children}
    </FinanceContext.Provider>
  );
};