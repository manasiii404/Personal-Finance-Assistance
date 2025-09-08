import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { formatAmount } = useCurrency();
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 card-glass-blue hover:card-glass-purple transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl backdrop-blur-sm border ${
              transaction.type === 'income' 
                ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-600 border-emerald-300/30' 
                : 'bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-600 border-orange-300/30'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{transaction.description}</p>
              <p className="text-xs text-slate-900 font-bold">{transaction.category} • {transaction.source}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${
              transaction.type === 'income' ? 'text-gradient-green' : 'text-gradient-warning'
            }`}>
              {transaction.type === 'income' ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
            </p>
            <p className="text-xs text-slate-900 font-bold">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};