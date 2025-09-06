import React from "react";
import { useAlerts } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  BarChart3,
  Bell,
  Target,
  Settings,
  Wallet,
  LogOut,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { unreadCount } = useAlerts();
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: CreditCard },
    { id: "budget", label: "Budget", icon: PiggyBank },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "alerts", label: "Alerts", icon: Bell, badge: unreadCount },
    { id: "goals", label: "Goals", icon: Target },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 sidebar-glass z-50 animate-slide-down">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-gradient">Finance AI</h1>
            <p className="text-sm text-slate-600 font-medium">Smart Financial Planning</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 p-4 card-glass">
            <p className="text-sm font-semibold text-slate-800">
              {user.name || "User"}
            </p>
            <p className="text-xs text-slate-600 font-medium">{user.email}</p>
          </div>
        )}
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
                      : "text-slate-700 :bg-white/50 hover:text-slate-900 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold shadow-lg animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-700 hover:bg-white/50 hover:text-red-600 transition-all duration-300 transform hover:scale-105"
        >
          <LogOut className="h-5 w-5 text-slate-500" />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
