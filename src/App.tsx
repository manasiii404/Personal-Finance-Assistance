import React, { useState, useEffect } from "react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <FinanceProvider>
      <AlertProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="ml-64 p-6">{renderActiveComponent()}</main>
        </div>
      </AlertProvider>
    </FinanceProvider>
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
