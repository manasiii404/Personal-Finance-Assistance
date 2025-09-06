import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (in a real app, this would come from an API)
const exchangeRates: { [key: string]: number } = {
  'USD': 1,
  'EUR': 0.85,
  'GBP': 0.73,
  'INR': 83.12,
  'JPY': 149.50,
  'CAD': 1.36,
  'AUD': 1.53,
};

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
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
    return `${symbol}${Math.abs(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const convertAmount = async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];
    
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
