import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Budget } from "./components/Budget";
import { Analytics } from "./components/Analytics";
import { Alerts } from "./components/Alerts";
import { Goals } from "./components/Goals";
import { Settings } from "./components/Settings";
import { Navigation } from "./components/Navigation";
import { Auth } from "./components/Auth";
import { AlertProvider } from "./contexts/AlertContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "budget":
        return <Budget />;
      case "analytics":
        return <Analytics />;
      case "alerts":
        return <Alerts />;
      case "goals":
        return <Goals />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-glow" />
          <h2 className="text-2xl font-display font-semibold text-gradient mb-2">Loading</h2>
          <p className="text-dark-600 font-medium">Preparing your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <CurrencyProvider>
      <FinanceProvider>
        <AlertProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="ml-64 p-8 animate-fade-in">{renderActiveComponent()}</main>
          </div>
        </AlertProvider>
      </FinanceProvider>
    </CurrencyProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
