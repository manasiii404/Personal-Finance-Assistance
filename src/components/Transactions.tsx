import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAlerts } from '../contexts/AlertContext';
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit,
  Smartphone,
  CreditCard,
  Banknote
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { addAlert } = useAlerts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSMSSimulator, setShowSMSSimulator] = useState(false);

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    source: 'Manual Entry'
  });

  // SMS Simulator state
  const [smsText, setSmsText] = useState('');

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Salary', 'Freelance', 'Investment'];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    const transactionAmount = newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    addTransaction({
      ...newTransaction,
      amount: transactionAmount,
      date: new Date().toISOString().split('T')[0]
    });

    // Add alert for large transactions
    if (Math.abs(amount) > 500) {
      addAlert({
        type: 'info',
        title: 'Large Transaction Added',
        message: `${newTransaction.type === 'income' ? 'Income' : 'Expense'} of $${amount.toFixed(2)} has been recorded`
      });
    }

    setNewTransaction({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      source: 'Manual Entry'
    });
    setShowAddModal(false);
  };

  const parseSMS = () => {
    if (!smsText.trim()) return;

    // Simple SMS parsing logic (in real app, this would be more sophisticated)
    const smsLower = smsText.toLowerCase();
    let amount = 0;
    let description = 'SMS Transaction';
    let category = 'Other';
    let type: 'income' | 'expense' = 'expense';

    // Extract amount
    const amountMatch = smsText.match(/\$?(\d+\.?\d*)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    // Determine type
    if (smsLower.includes('credit') || smsLower.includes('deposit') || smsLower.includes('salary')) {
      type = 'income';
    }

    // Extract description and category
    if (smsLower.includes('grocery') || smsLower.includes('food') || smsLower.includes('restaurant')) {
      category = 'Food';
      description = 'Grocery/Food Purchase';
    } else if (smsLower.includes('gas') || smsLower.includes('fuel') || smsLower.includes('uber')) {
      category = 'Transportation';
      description = 'Transportation Expense';
    } else if (smsLower.includes('atm') || smsLower.includes('withdrawal')) {
      category = 'Cash';
      description = 'ATM Withdrawal';
    } else if (smsLower.includes('salary') || smsLower.includes('payroll')) {
      category = 'Salary';
      description = 'Salary Credit';
      type = 'income';
    }

    if (amount > 0) {
      addTransaction({
        description,
        amount: type === 'expense' ? -amount : amount,
        category,
        type,
        source: 'SMS Parsing',
        date: new Date().toISOString().split('T')[0]
      });

      addAlert({
        type: 'success',
        title: 'SMS Transaction Parsed',
        message: `Automatically added ${type} of $${amount.toFixed(2)} from SMS`
      });

      setSmsText('');
      setShowSMSSimulator(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount', 'Type', 'Source'].join(','),
      ...filteredTransactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.category,
        t.amount.toFixed(2),
        t.type,
        t.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addAlert({
      type: 'success',
      title: 'Export Complete',
      message: 'Transactions have been exported to CSV file'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage and track all your financial transactions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSMSSimulator(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Smartphone className="h-4 w-4" />
            <span>Parse SMS</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <button
            onClick={exportTransactions}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {transaction.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1">
                        {transaction.source === 'SMS Parsing' ? (
                          <Smartphone className="h-3 w-3" />
                        ) : transaction.source.includes('Card') ? (
                          <CreditCard className="h-3 w-3" />
                        ) : (
                          <Banknote className="h-3 w-3" />
                        )}
                        <span>{transaction.source}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter transaction description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddTransaction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Transaction
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Simulator Modal */}
      {showSMSSimulator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Transaction Parser</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste your bank SMS or notification text below to automatically extract transaction details.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS Text</label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Example: Your account has been debited by $25.00 for grocery shopping at SuperMart on 01/20/2025"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Sample SMS formats:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• "Account debited by $50.00 for fuel at Gas Station"</p>
                  <p>• "Salary credit of $3000.00 received"</p>
                  <p>• "ATM withdrawal of $100.00 at Branch ATM"</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={parseSMS}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Parse SMS
              </button>
              <button
                onClick={() => setShowSMSSimulator(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};