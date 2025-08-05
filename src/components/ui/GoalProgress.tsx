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
          <div key={goal.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900 text-sm">{goal.title}</span>
              </div>
              <span className="text-xs text-gray-500">{goal.category}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
                </span>
                <span className="font-medium text-blue-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
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
                <span className="text-gray-500">
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