import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone
} from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { useAlerts } from "../contexts/AlertContext";
import { useCurrency } from "../contexts/CurrencyContext";

export const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { addAlert } = useAlerts();
  const { formatAmount } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSMSSimulator, setShowSMSSimulator] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isParsingSMS, setIsParsingSMS] = useState(false);
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false);

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
    source: "Manual Entry",
  });


  // SMS Simulator state
  const [smsText, setSmsText] = useState("");

  // Edit transaction form state
  const [editTransaction, setEditTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
  });

  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Groceries",
    "Rent",
    "Insurance",
    "Salary",
    "Freelance",
    "Investment",
    "Business",
    "Gifts",
    "Other",
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || transaction.category === filterCategory;
    const matchesType = filterType === "all" || transaction.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddTransaction = async () => {
    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.category
    ) {
      addAlert({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields",
      });
      return;
    }

    setIsAddingTransaction(true);
    try {
      const amount = parseFloat(newTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        addAlert({
          type: "error",
          title: "Invalid Amount",
          message: "Please enter a valid positive amount",
        });
        return;
      }

      // Ensure correct sign based on transaction type
      const transactionAmount = newTransaction.type === "income" ? Math.abs(amount) : -Math.abs(amount);

      await addTransaction({
        ...newTransaction,
        amount: transactionAmount,
        date: new Date().toISOString().split("T")[0],
      });

      // Add alert for large transactions
      if (Math.abs(amount) > 5000) {
        addAlert({
          type: "info",
          title: "Large Transaction Added",
          message: `${
            newTransaction.type === "income" ? "Income" : "Expense"
          } of ${formatAmount(amount)} has been recorded`,
        });
      }

      addAlert({
        type: "success",
        title: "Transaction Added",
        message: `${newTransaction.type === "income" ? "Income" : "Expense"} of ${formatAmount(amount)} added successfully`,
      });

      setNewTransaction({
        description: "",
        amount: "",
        category: "",
        type: "expense",
        source: "Manual Entry",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
      addAlert({
        type: "error",
        title: "Transaction Failed",
        message: "Failed to add transaction. Please try again.",
      });
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const parseSMS = async () => {
    if (!smsText.trim()) {
      addAlert({
        type: "error",
        title: "Empty SMS",
        message: "Please enter SMS text to parse",
      });
      return;
    }

    setIsParsingSMS(true);
    try {
      // Simple SMS parsing logic for demo
      const smsLower = smsText.toLowerCase();
      let amount = 0;
      let type: "income" | "expense" = "expense";
      let description = "SMS Transaction";
      let category = "Other";
      
      // Extract amount using regex
      const amountMatch = smsText.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i) || 
                         smsText.match(/([0-9,]+(?:\.[0-9]{2})?)\s*(?:rs\.?|inr|₹)/i);
      
      if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      }
      
      // Determine transaction type
      if (smsLower.includes('credited') || smsLower.includes('received') || smsLower.includes('deposit')) {
        type = "income";
      } else if (smsLower.includes('debited') || smsLower.includes('spent') || smsLower.includes('paid')) {
        type = "expense";
      }
      
      // Determine category based on keywords
      if (smsLower.includes('atm') || smsLower.includes('withdrawal')) {
        category = "Other";
        description = "ATM Withdrawal";
      } else if (smsLower.includes('grocery') || smsLower.includes('supermarket')) {
        category = "Groceries";
        description = "Grocery Purchase";
      } else if (smsLower.includes('fuel') || smsLower.includes('petrol') || smsLower.includes('gas')) {
        category = "Transportation";
        description = "Fuel Purchase";
      } else if (smsLower.includes('restaurant') || smsLower.includes('food')) {
        category = "Food & Dining";
        description = "Restaurant/Food";
      } else if (smsLower.includes('salary') || smsLower.includes('payroll')) {
        category = "Salary";
        description = "Salary Credit";
        type = "income";
      }
      
      if (amount > 0) {
        const transactionAmount = type === "income" ? Math.abs(amount) : -Math.abs(amount);
        
        await addTransaction({
          description,
          amount: transactionAmount,
          category,
          type,
          source: "SMS Parser",
          date: new Date().toISOString().split("T")[0],
        });

        addAlert({
          type: "success",
          title: "SMS Transaction Parsed",
          message: `Automatically added ${type} of ₹${amount.toFixed(2)} from SMS`,
        });

        setSmsText("");
        setShowSMSSimulator(false);
      } else {
        addAlert({
          type: "warning",
          title: "Amount Not Found",
          message: "Could not extract amount from SMS. Please add manually.",
        });
      }
    } catch (error) {
      console.error("Error parsing SMS:", error);
      addAlert({
        type: "error",
        title: "SMS Parsing Failed",
        message: "Could not parse the SMS text. Please try again or add manually.",
      });
    } finally {
      setIsParsingSMS(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Amount", "Type", "Source"].join(","),
      ...filteredTransactions.map((t) =>
        [
          t.date,
          `"${t.description}"`,
          t.category,
          t.amount.toFixed(2),
          t.type,
          t.source,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addAlert({
      type: "success",
      title: "Export Complete",
      message: "Transactions have been exported to CSV file",
    });
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditTransaction({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      type: transaction.amount > 0 ? "income" : "expense",
    });
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!editTransaction.description || !editTransaction.amount || !editTransaction.category) {
      addAlert({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields",
      });
      return;
    }

    setIsUpdatingTransaction(true);
    try {
      const amount = parseFloat(editTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        addAlert({
          type: "error",
          title: "Invalid Amount",
          message: "Please enter a valid positive amount",
        });
        return;
      }

      const transactionAmount = editTransaction.type === "income" ? Math.abs(amount) : -Math.abs(amount);

      // Since we don't have updateTransaction in context, we'll delete and add
      await deleteTransaction(editingTransaction.id);
      await addTransaction({
        ...editTransaction,
        amount: transactionAmount,
        date: editingTransaction.date,
        source: editingTransaction.source,
      });

      addAlert({
        type: "success",
        title: "Transaction Updated",
        message: `Transaction updated successfully`,
      });

      setShowEditModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
      addAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update transaction. Please try again.",
      });
    } finally {
      setIsUpdatingTransaction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Transactions</h1>
          <p className="text-slate-900 mt-2 text-lg font-bold">
            Manage and track all your financial transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSMSSimulator(true)}
            className="btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Smartphone className="h-4 w-4" />
            <span>Parse SMS</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-glass-blue p-8 glow-blue">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-700" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-premium px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-premium px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <button
            onClick={exportTransactions}
            className="btn-secondary bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card-ultra-glass glow-purple">
        <div className="p-8 border-b border-white/20">
          <h3 className="text-2xl font-bold text-gradient">
            Recent Transactions ({filteredTransactions.length})
          </h3>
        </div>

        <div className="divide-y divide-white/20">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-6 card-glass-indigo mx-4 my-2 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-6 rounded-2xl border-2 ${
                      transaction.amount > 0
                        ? "card-glass-green border-green-300/50"
                        : "card-glass-orange border-red-300/50"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {transaction.description}
                      </h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/30 backdrop-blur-sm text-slate-900 border border-white/20">
                        {transaction.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-900">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      <Tag className="h-4 w-4 ml-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.amount > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {transaction.category}
                      </span>
                      <CreditCard className="h-4 w-4 ml-4" />
                      <span className="text-xs text-slate-900 font-bold">{transaction.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : "-"} {formatAmount(Math.abs(transaction.amount))}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditTransaction(transaction)}
                      className="p-3 text-slate-800 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="p-3 text-slate-800 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20"
                    >
                      <Trash2 className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-ultra-glass p-8 w-full max-w-md mx-4 glow-blue">
            <h3 className="text-2xl font-bold text-gradient mb-6">
              Add New Transaction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter transaction description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: e.target.value,
                    })
                  }
                  className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddTransaction}
                disabled={isAddingTransaction}
                className="btn-primary flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAddingTransaction ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add Transaction"
                )}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary flex-1 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-ultra-glass p-8 w-full max-w-md mx-4 glow-purple">
            <h3 className="text-2xl font-bold text-gradient mb-6">
              Edit Transaction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editTransaction.description}
                  onChange={(e) =>
                    setEditTransaction({
                      ...editTransaction,
                      description: e.target.value,
                    })
                  }
                  className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter transaction description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTransaction.amount}
                    onChange={(e) =>
                      setEditTransaction({
                        ...editTransaction,
                        amount: e.target.value,
                      })
                    }
                    className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={editTransaction.type}
                    onChange={(e) =>
                      setEditTransaction({
                        ...editTransaction,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={editTransaction.category}
                  onChange={(e) =>
                    setEditTransaction({
                      ...editTransaction,
                      category: e.target.value,
                    })
                  }
                  className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateTransaction}
                disabled={isUpdatingTransaction}
                className="btn-primary flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUpdatingTransaction ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Transaction"
                )}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary flex-1 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Simulator Modal */}
      {showSMSSimulator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-ultra-glass p-8 w-full max-w-md mx-4 glow-green">
            <h3 className="text-2xl font-bold text-gradient-green mb-6">
              SMS Transaction Parser
            </h3>
            <p className="text-sm text-slate-600 font-medium mb-6">
              Paste your bank SMS or notification text below to automatically
              extract transaction details.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  SMS Text
                </label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={4}
                  className="input-premium w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Example: Your account has been debited by $25.00 for grocery shopping at SuperMart on 01/20/2025"
                />
              </div>

              <div className="card-glass-green p-4">
                <h4 className="text-sm font-bold text-emerald-800 mb-3">
                  Sample SMS formats:
                </h4>
                <div className="text-xs text-emerald-700 font-medium space-y-1">
                  <p>• "Account debited by $50.00 for fuel at Gas Station"</p>
                  <p>• "Salary credit of $3000.00 received"</p>
                  <p>• "ATM withdrawal of $100.00 at Branch ATM"</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={parseSMS}
                disabled={isParsingSMS}
                className="btn-primary flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isParsingSMS ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Parsing...
                  </>
                ) : (
                  "Parse SMS"
                )}
              </button>
              <button
                onClick={() => setShowSMSSimulator(false)}
                className="btn-secondary flex-1 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-3 px-6 rounded-xl border border-white/30 shadow-lg"
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
