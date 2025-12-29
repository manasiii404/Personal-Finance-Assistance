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
  spent: Joi.number().precision(2).min(0).optional(),
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

export const alertFiltersSchema = Joi.object({
  unreadOnly: Joi.boolean().optional(),
  type: Joi.string().valid('warning', 'success', 'info', 'error').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
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

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required().messages({
    'string.empty': 'Current password is required',
    'string.min': 'Current password must be at least 6 characters',
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters',
      'any.required': 'New password is required',
      'any.invalid': 'New password must be different from current password',
    }),
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required to delete account',
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required to delete account',
  }),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Phone number must be a valid international format',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update',
});

// Password reset validation schemas
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.empty': 'OTP is required',
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.empty': 'OTP is required',
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters',
    'any.required': 'New password is required',
  }),
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
  type: Joi.string().valid('income', 'expense').optional(),  // Added for category breakdown
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
