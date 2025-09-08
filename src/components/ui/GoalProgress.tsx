import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

interface GoalProgressProps {
  goals: Goal[];
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  const { formatAmount } = useCurrency();
  
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 inline-block">
          <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-900 font-bold text-sm">No goals found</p>
          <p className="text-slate-700 text-xs mt-1">Create your first goal to get started</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const percentage = (goal.current / goal.target) * 100;
        const daysLeft = Math.ceil(
          (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return (
          <div key={goal.id} className="card-glass-rose p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-rose-600" />
                <span className="font-bold text-slate-900 text-sm">{goal.title}</span>
              </div>
              <span className="text-xs text-slate-900 font-bold px-2 py-1 bg-white/30 rounded-full backdrop-blur-sm">{goal.category}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-900 font-bold">
                  {formatAmount(goal.current)} / {formatAmount(goal.target)}
                </span>
                <span className="font-bold text-gradient bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-3 border border-white/20">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center space-x-1 ${
                  daysLeft > 30 ? 'text-green-600' : daysLeft > 7 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  <span>{daysLeft} days left</span>
                </span>
                <span className="text-slate-900 font-bold">
                  {formatAmount(goal.target - goal.current)} to go
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};