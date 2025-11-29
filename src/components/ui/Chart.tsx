import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ChartData {
  name: string;
  value?: number;
  income?: number;
  expenses?: number;
  net?: number;
  budget?: number;
  actual?: number;
  remaining?: number;
}

interface ChartProps {
  data: ChartData[];
  type: 'pie' | 'bar' | 'line' | 'area';
}

export const Chart: React.FC<ChartProps> = ({ data, type }) => {
  const { formatAmount } = useCurrency();
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = ((item.value || 0) / total) * 100;
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
              <p className="text-2xl font-bold text-gradient">{formatAmount(total)}</p>
              <p className="text-sm text-slate-900 font-bold">Total</p>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-slate-900 font-bold">{item.name}</span>
              <span className="text-sm font-bold text-slate-900">
                {formatAmount(item.value || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    // Check if data has 'value' property (simple bar chart) or 'income'/'expenses' (comparison chart)
    const hasValue = data.some(item => item.value !== undefined);
    const hasIncomeExpenses = data.some(item => item.income !== undefined || item.expenses !== undefined);

    if (hasValue && !hasIncomeExpenses) {
      // Simple bar chart with single values
      const maxValue = Math.max(...data.map(item => item.value || 0));

      return (
        <div className="h-64 flex items-end justify-center space-x-4 px-4">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex flex-col items-center space-y-2 flex-1">
              <div className="flex space-x-1 items-end h-48">
                <div className="bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-md relative group min-w-[20px] shadow-lg">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${((item.value || 0) / maxValue) * 192}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 card-glass-blue text-slate-900 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    {formatAmount(item.value || 0)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-900 font-bold">{item.name}</span>
            </div>
          ))}
        </div>
      );
    }

    // Comparison bar chart with income/expenses
    const maxValue = Math.max(
      ...data.map(item => Math.max(item.income || 0, item.expenses || 0))
    );

    return (
      <div className="h-64 flex items-end justify-center space-x-4 px-4">
        {data.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex space-x-1 items-end h-48">
              {item.income && (
                <div className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md relative group min-w-[20px] shadow-lg">
                  <div
                    className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${(item.income / maxValue) * 192}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 card-glass-green text-slate-900 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    Income: {formatAmount(item.income)}
                  </div>
                </div>
              )}
              {item.expenses && (
                <div className="bg-gradient-to-t from-orange-500 to-red-400 rounded-t-md relative group min-w-[20px] shadow-lg">
                  <div
                    className="bg-gradient-to-t from-orange-500 to-red-400 rounded-t-md transition-all duration-500"
                    style={{ height: `${(item.expenses / maxValue) * 192}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 card-glass-orange text-slate-900 text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                    Expenses: {formatAmount(item.expenses)}
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-slate-900 font-bold">{item.name}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'line') {
    const maxValue = Math.max(...data.map(item => item.value || 0));
    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((item.value || 0) / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-64 flex items-center justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={width - padding}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((item.value || 0) / maxValue) * chartHeight;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#3B82F6"
                  className="hover:r-7 transition-all cursor-pointer"
                />
                <text
                  x={x}
                  y={padding + chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-900"
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === 'area') {
    const maxValue = Math.max(...data.map(item => item.value || 0));
    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((item.value || 0) / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${padding + chartHeight} ${points} ${width - padding},${padding + chartHeight}`;

    return (
      <div className="h-64 flex items-center justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={width - padding}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <polygon
            points={areaPoints}
            fill="url(#areaGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((item.value || 0) / maxValue) * chartHeight;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#10B981"
                  className="hover:r-7 transition-all cursor-pointer"
                />
                <text
                  x={x}
                  y={padding + chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-900"
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return null;
};