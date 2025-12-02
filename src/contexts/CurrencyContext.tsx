import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates - All rates are FROM INR (1 INR = X currency)
// Database stores all amounts in INR, we convert for display
const exchangeRates: { [key: string]: number } = {
  'INR': 1,           // Base currency
  'USD': 0.0112,      // 1 INR = 0.0112 USD (₹89.5 per USD)
  'EUR': 0.0097,      // 1 INR = 0.0097 EUR (₹103.2 per EUR)
  'GBP': 0.0085,      // 1 INR = 0.0085 GBP (₹118.3 per GBP)
  'CAD': 0.0158,      // 1 INR = 0.0158 CAD (₹63.5 per CAD)
};

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'CAD': 'C$',
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>('INR');

  useEffect(() => {
    // Load currency from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  const formatAmount = (amount: number): string => {
    const symbol = currencySymbols[currency] || '₹';

    // Convert from INR (database storage) to selected currency
    const convertedAmount = amount * exchangeRates[currency];

    return `${symbol}${Math.abs(convertedAmount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const convertAmount = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
    if (fromCurrency === toCurrency) return amount;

    // Convert from source currency to INR first
    const inrAmount = amount / exchangeRates[fromCurrency];

    // Then convert from INR to target currency
    const convertedAmount = inrAmount * exchangeRates[toCurrency];

    return convertedAmount;
  };

  const currencySymbol = currencySymbols[currency] || '₹';

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencySymbol,
      setCurrency,
      formatAmount,
      convertAmount,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
