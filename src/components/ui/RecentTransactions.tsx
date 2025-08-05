import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
              <p className="text-xs text-gray-500">{transaction.category} • {transaction.source}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold text-sm ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};