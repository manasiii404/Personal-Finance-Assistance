import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

interface BudgetOverviewProps {
  budgets: Budget[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = (budget.spent / budget.limit) * 100;
        const isOverBudget = percentage > 100;
        const isNearLimit = percentage > 80;
        
        return (
          <div key={budget.id} className="card-glass-green p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800 text-sm">{budget.category}</span>
                {isOverBudget ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : percentage > 50 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : null}
              </div>
              <span className="text-xs text-slate-600 font-medium">
                ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-3 border border-white/20">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                    isOverBudget 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : isNearLimit 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse glow-orange" />
              )}
            </div>
            
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${
                isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {percentage.toFixed(1)}% used
              </span>
              <span className="text-slate-600 font-medium">
                ${(budget.limit - budget.spent).toFixed(2)} remaining
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};