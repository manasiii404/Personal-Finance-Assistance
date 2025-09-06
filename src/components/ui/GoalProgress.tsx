import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

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
                <span className="font-bold text-slate-800 text-sm">{goal.title}</span>
              </div>
              <span className="text-xs text-slate-600 font-medium px-2 py-1 bg-white/30 rounded-full backdrop-blur-sm">{goal.category}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">
                  ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
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
                <span className="text-slate-600 font-medium">
                  ${(goal.target - goal.current).toFixed(2)} to go
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};