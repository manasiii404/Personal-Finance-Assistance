import Joi from 'joi';

// Transaction validation schemas
export const createTransactionSchema = Joi.object({
  date: Joi.date().iso().required(),
  description: Joi.string().min(1).max(255).required(),
  amount: Joi.number().precision(2).required(),
  category: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('income', 'expense').required(),
  source: Joi.string().min(1).max(100).required(),
});

export const updateTransactionSchema = Joi.object({
  date: Joi.date().iso().optional(),
  description: Joi.string().min(1).max(255).optional(),
  amount: Joi.number().precision(2).optional(),
  category: Joi.string().min(1).max(100).optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  source: Joi.string().min(1).max(100).optional(),
});

export const transactionFiltersSchema = Joi.object({
  search: Joi.string().optional(),
  category: Joi.string().optional(),
  type: Joi.string().valid('income', 'expense').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Budget validation schemas
export const createBudgetSchema = Joi.object({
  category: Joi.string().min(1).max(100).required(),
  limit: Joi.number().precision(2).positive().required(),
  period: Joi.string().valid('weekly', 'monthly', 'yearly').required(),
});

export const updateBudgetSchema = Joi.object({
  category: Joi.string().min(1).max(100).optional(),
  limit: Joi.number().precision(2).positive().optional(),
  period: Joi.string().valid('weekly', 'monthly', 'yearly').optional(),
});

// Goal validation schemas
export const createGoalSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  target: Joi.number().precision(2).positive().required(),
  deadline: Joi.date().iso().greater('now').required(),
  category: Joi.string().min(1).max(100).required(),
});

export const updateGoalSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  target: Joi.number().precision(2).positive().optional(),
  deadline: Joi.date().iso().optional(),
  category: Joi.string().min(1).max(100).optional(),
});

export const addContributionSchema = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
});

// Alert validation schemas
export const createAlertSchema = Joi.object({
  type: Joi.string().valid('warning', 'success', 'info', 'error').required(),
  title: Joi.string().min(1).max(255).required(),
  message: Joi.string().min(1).max(1000).required(),
  actionUrl: Joi.string().uri().optional(),
});

// Auth validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(255).optional(),
});

// SMS parsing validation
export const smsParseSchema = Joi.object({
  smsText: Joi.string().min(1).max(1000).required(),
});

// Analytics validation
export const analyticsFiltersSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('week', 'month', 'quarter', 'year').optional(),
});

// Export validation
export const exportRequestSchema = Joi.object({
  format: Joi.string().valid('csv', 'json', 'pdf').required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  type: Joi.string().valid('transactions', 'budgets', 'goals', 'analytics').optional(),
});

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
