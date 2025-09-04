import { Request } from 'express';
import { User } from '@prisma/client';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Transaction types
export interface CreateTransactionRequest {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
}

export interface UpdateTransactionRequest {
  date?: string;
  description?: string;
  amount?: number;
  category?: string;
  type?: 'income' | 'expense';
  source?: string;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Budget types
export interface CreateBudgetRequest {
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface UpdateBudgetRequest {
  category?: string;
  limit?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
}

// Goal types
export interface CreateGoalRequest {
  title: string;
  target: number;
  deadline: string;
  category: string;
}

export interface UpdateGoalRequest {
  title?: string;
  target?: number;
  deadline?: string;
  category?: string;
}

export interface AddContributionRequest {
  amount: number;
}

// Alert types
export interface CreateAlertRequest {
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
}

// SMS Parsing types
export interface SMSParseRequest {
  smsText: string;
}

export interface ParsedTransaction {
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
  confidence: number;
}

// Analytics types
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface FinancialInsights {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  topSpendingCategory: string;
  averageDailySpending: number;
  largestExpense: number;
  budgetAlerts: string[];
  goalProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  recommendations: string[];
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Export types
export interface ExportRequest {
  format: 'csv' | 'json' | 'pdf';
  startDate?: string;
  endDate?: string;
  type?: 'transactions' | 'budgets' | 'goals' | 'analytics';
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
