import React from 'react';

interface ChartData {
  name: string;
  value?: number;
  income?: number;
  expenses?: number;
}

interface ChartProps {
  data: ChartData[];
  type: 'pie' | 'bar';
}

export const Chart: React.FC<ChartProps> = ({ data, type }) => {
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = ((item.value || 0) / total) * 100;
              const angle = (percentage / 100) * 360;
              const radius = 80;
              const circumference = 2 * Math.PI * radius;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = index === 0 ? 0 : 
                -data.slice(0, index).reduce((sum, prev) => 
                  sum + ((prev.value || 0) / total) * circumference, 0
                );
              
              return (
                <circle
                  key={item.name}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  opacity="0.8"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">${total.toFixed(0)}</p>
              <p className="text-sm text-slate-600 font-medium">Total</p>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-slate-700 font-medium">{item.name}</span>
              <span className="text-sm font-bold text-slate-800">
                ${(item.value || 0).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(
      ...data.map(item => Math.max(item.income || 0, item.expenses || 0))
    );

    return (
      <div className="h-64 flex items-end justify-center space-x-4 px-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex space-x-1 items-end h-48">
              {item.income && (
                <div className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md relative group min-w-[20px] shadow-lg">
                  <div 
                    className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${(item.income / maxValue) * 192}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 card-glass-green text-slate-800 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    Income: ${item.income.toFixed(0)}
                  </div>
                </div>
              )}
              {item.expenses && (
                <div className="bg-gradient-to-t from-orange-500 to-red-400 rounded-t-md relative group min-w-[20px] shadow-lg">
                  <div 
                    className="bg-gradient-to-t from-orange-500 to-red-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${(item.expenses / maxValue) * 192}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 card-glass-orange text-slate-800 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    Expenses: ${item.expenses.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-700 font-bold">{item.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};