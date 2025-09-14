import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: 'blue' | 'green' | 'red' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color
}) => {
  const cardClasses = {
    blue: 'card-glass-blue glow-blue',
    green: 'card-glass-green glow-green',
    red: 'card-glass-orange glow-orange',
    purple: 'card-glass-purple glow-purple'
  };

  const iconClasses = {
    blue: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-600 border border-blue-300/30',
    green: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-600 border border-emerald-300/30',
    red: 'bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-600 border border-orange-300/30',
    purple: 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-600 border border-purple-300/30'
  };

  const textGradients = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  const trendColors = {
    up: 'text-green-600 bg-green-100 border border-green-200',
    down: 'text-red-600 bg-red-100 border border-red-200'
  };

  return (
    <div className={`${cardClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold ${textGradients[color]} mb-3`}>{value}</p>
          {trend && trendValue && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full backdrop-blur-sm ${trendColors[trend]}`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-bold">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl backdrop-blur-sm ${iconClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};