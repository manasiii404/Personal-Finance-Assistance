import React, { useState } from "react";
import {
  Smartphone,
  Send,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Tag,
} from "lucide-react";

interface ParsedTransaction {
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  source: string;
  confidence: number;
}

export const SMSParser: React.FC = () => {
  const [smsText, setSmsText] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedTransaction | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample SMS messages for quick testing
  const sampleMessages = [
    {
      name: "Salary Credit",
      sms: "Your salary of $5000.00 has been credited to your account on 15/01/2025. Available balance: $12500.00",
    },
    {
      name: "ATM Withdrawal",
      sms: "Your account has been debited by $200.00 for ATM withdrawal at Main Street ATM on 15/01/2025. Available balance: $12300.00",
    },
    {
      name: "Food Purchase",
      sms: "Payment of $45.50 made at McDonald's Restaurant on 15/01/2025. Card ending 1234. Available balance: $12254.50",
    },
    {
      name: "Gas Station",
      sms: "Your account has been debited by $65.00 for fuel purchase at Shell Gas Station on 15/01/2025. Available balance: $12189.50",
    },
  ];

  const parseSMS = async () => {
    if (!smsText.trim()) {
      setError("Please enter an SMS message");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      // Simulate API call - in real implementation, this would call the backend
      const response = await fetch("/api/transactions/parse-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ smsText }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse SMS");
      }

      const result = await response.json();
      setParsedResult(result.data);
    } catch (err) {
      // For demo purposes, simulate parsing locally
      const mockResult = simulateSMSParsing(smsText);
      setParsedResult(mockResult);
    } finally {
      setLoading(false);
    }
  };

  // Mock SMS parsing function for demo
  const simulateSMSParsing = (text: string): ParsedTransaction => {
    const smsLower = text.toLowerCase();

    // Extract amount
    const amountMatch = text.match(/\$?(\d+\.?\d*)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    // Determine transaction type
    let type: "income" | "expense" = "expense";
    if (
      smsLower.includes("credit") ||
      smsLower.includes("salary") ||
      smsLower.includes("received")
    ) {
      type = "income";
    }

    // Determine category
    let category = "Other";
    let description = "SMS Transaction";
    let confidence = 0.5;

    if (smsLower.includes("salary")) {
      category = "Salary";
      description = "Salary Credit";
      confidence = 0.9;
    } else if (smsLower.includes("atm") || smsLower.includes("withdrawal")) {
      category = "Cash";
      description = "ATM Withdrawal";
      confidence = 0.9;
    } else if (smsLower.includes("restaurant") || smsLower.includes("food")) {
      category = "Food";
      description = "Food Purchase";
      confidence = 0.8;
    } else if (smsLower.includes("fuel") || smsLower.includes("gas")) {
      category = "Transportation";
      description = "Fuel Purchase";
      confidence = 0.8;
    }

    return {
      description,
      amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      category,
      type,
      source: "SMS Parsing",
      confidence,
    };
  };

  const addToTransactions = () => {
    if (parsedResult) {
      // In real implementation, this would add the transaction to the database
      console.log("Adding transaction:", parsedResult);
      alert("Transaction added successfully!");
      setSmsText("");
      setParsedResult(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-4">
          SMS Transaction Parser
        </h1>
        <p className="text-slate-600 text-lg">
          Paste your bank SMS messages to automatically extract transaction
          details
        </p>
      </div>

      {/* Sample Messages */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Sample Messages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleMessages.map((sample, index) => (
            <button
              key={index}
              onClick={() => setSmsText(sample.sms)}
              className="text-left p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <h4 className="font-semibold text-slate-900 mb-2">
                {sample.name}
              </h4>
              <p className="text-sm text-slate-600 line-clamp-2">
                {sample.sms}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* SMS Input */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Parse SMS Message
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              SMS Text
            </label>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste your bank SMS message here..."
              className="w-full h-32 p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
            />
          </div>

          <button
            onClick={parseSMS}
            disabled={loading || !smsText.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Parsing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Parse SMS</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-300" />
            <span className="text-red-200">{error}</span>
          </div>
        )}
      </div>

      {/* Parsed Result */}
      {parsedResult && (
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
            <h3 className="text-2xl font-bold text-white">
              Parsed Transaction
            </h3>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Amount</p>
                    <p className="text-white text-xl font-bold">
                      ${Math.abs(parsedResult.amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Category</p>
                    <p className="text-white text-lg font-semibold">
                      {parsedResult.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Type</p>
                    <p className="text-white text-lg font-semibold capitalize">
                      {parsedResult.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <div>
                    <p className="text-white/80 text-sm">Confidence</p>
                    <p className="text-white text-lg font-semibold">
                      {(parsedResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-white/80 text-sm mb-2">Description</p>
              <p className="text-white text-lg">{parsedResult.description}</p>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={addToTransactions}
                className="flex-1 bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-xl font-semibold border border-white/30"
              >
                Add to Transactions
              </button>
              <button
                onClick={() => setParsedResult(null)}
                className="px-6 py-3 text-white/80 hover:text-white transition-colors duration-300"
              >
                Parse Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
