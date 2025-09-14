const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
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

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const { method, headers, body } = config;
      const response = await fetch(url, {
        method,
        headers,
        ...(body && { body }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 
                            data.error || 
                            `HTTP error ${response.status}`;
        const error = new Error(errorMessage);
        
        // Attach additional error details
        (error as any).status = response.status;
        (error as any).response = data;
        
        
        throw error;
      }

      return data;
    } catch (error) {
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Auth endpoints
  async register(userData: { email: string; password: string; name?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: { name?: string; email?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount(password: string) {
    return this.request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  // Transaction endpoints
  async getTransactions(filters?: {
    search?: string;
    category?: string;
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`);
  }

  async createTransaction(transaction: {
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    source: string;
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: {
    date?: string;
    description?: string;
    amount?: number;
    category?: string;
    type?: 'income' | 'expense';
    source?: string;
  }) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getTransactionStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return this.request(`/transactions/stats/overview${queryString ? `?${queryString}` : ''}`);
  }

  async getSpendingByCategory(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return this.request(`/transactions/stats/categories${queryString ? `?${queryString}` : ''}`);
  }

  async parseSMS(smsText: string) {
    return this.request('/transactions/parse-sms', {
      method: 'POST',
      body: JSON.stringify({ smsText }),
    });
  }

  async createFromSMS(smsText: string) {
    return this.request('/transactions/create-from-sms', {
      method: 'POST',
      body: JSON.stringify({ smsText }),
    });
  }

  async exportTransactions(format: 'csv' | 'json' = 'csv', startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${this.baseURL}/transactions/export/data?${params.toString()}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response;
  }

  async getSupportedSMSPatterns() {
    return this.request('/transactions/sms/patterns');
  }

  // Budget endpoints
  async getBudgets(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const queryString = params.toString();
    return this.request(`/budgets${queryString ? `?${queryString}` : ''}`);
  }

  async getBudget(id: string) {
    return this.request(`/budgets/${id}`);
  }

  async createBudget(budget: {
    category: string;
    limit: number;
    period: 'weekly' | 'monthly' | 'yearly';
  }) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  async updateBudget(id: string, budget: {
    category?: string;
    limit?: number;
    period?: 'weekly' | 'monthly' | 'yearly';
  }) {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  async deleteBudget(id: string) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  async getBudgetStats(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const queryString = params.toString();
    return this.request(`/budgets/stats/overview${queryString ? `?${queryString}` : ''}`);
  }

  async resetBudgetSpending(period?: string) {
    return this.request('/budgets/reset-spending', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  }

  async getBudgetAlerts() {
    return this.request('/budgets/alerts/list');
  }

  // Goal endpoints
  async getGoals() {
    return this.request('/goals');
  }

  async getGoal(id: string) {
    return this.request(`/goals/${id}`);
  }

  async createGoal(goal: {
    title: string;
    target: number;
    deadline: string;
    category: string;
  }) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  async updateGoal(id: string, goal: {
    title?: string;
    target?: number;
    deadline?: string;
    category?: string;
  }) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  async deleteGoal(id: string) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async addContribution(goalId: string, amount: number) {
    return this.request(`/goals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getGoalStats() {
    return this.request('/goals/stats/overview');
  }

  async getGoalAlerts() {
    return this.request('/goals/alerts/list');
  }

  async getGoalsByCategory() {
    return this.request('/goals/analytics/categories');
  }

  // Alert endpoints
  async getAlerts(unreadOnly?: boolean) {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    const queryString = params.toString();
    return this.request(`/alerts${queryString ? `?${queryString}` : ''}`);
  }

  async getAlert(id: string) {
    return this.request(`/alerts/${id}`);
  }

  async markAsRead(id: string) {
    return this.request(`/alerts/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead() {
    return this.request('/alerts/read-all', {
      method: 'PUT',
    });
  }

  async deleteAlert(id: string) {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async clearAllAlerts() {
    return this.request('/alerts/clear-all', {
      method: 'DELETE',
    });
  }

  async getUnreadCount() {
    return this.request('/alerts/stats/unread-count');
  }

  // Analytics endpoints
  async getFinancialInsights(period?: string) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const queryString = params.toString();
    return this.request(`/analytics/insights${queryString ? `?${queryString}` : ''}`);
  }

  async getSpendingAnalysis(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return this.request(`/analytics/spending-analysis${queryString ? `?${queryString}` : ''}`);
  }

  async getGoalRecommendations() {
    return this.request('/analytics/goal-recommendations');
  }

  async getMonthlyTrends(months?: number) {
    const params = new URLSearchParams();
    if (months) params.append('months', months.toString());
    
    const queryString = params.toString();
    return this.request(`/analytics/monthly-trends${queryString ? `?${queryString}` : ''}`);
  }

  async getCategoryBreakdown(startDate?: string, endDate?: string, type?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    return this.request(`/analytics/category-breakdown${queryString ? `?${queryString}` : ''}`);
  }

  async exportAnalyticsReport(format: 'json' | 'csv' = 'json', startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${this.baseURL}/analytics/export/report?${params.toString()}`, {
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response;
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
