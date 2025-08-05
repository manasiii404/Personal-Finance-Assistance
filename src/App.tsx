import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Budget } from './components/Budget';
import { Analytics } from './components/Analytics';
import { Alerts } from './components/Alerts';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import { AlertProvider } from './contexts/AlertContext';
import { FinanceProvider } from './contexts/FinanceContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'budget':
        return <Budget />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinanceProvider>
      <AlertProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="ml-64 p-6">
            {renderActiveComponent()}
          </main>
        </div>
      </AlertProvider>
    </FinanceProvider>
  );
}

export default App;