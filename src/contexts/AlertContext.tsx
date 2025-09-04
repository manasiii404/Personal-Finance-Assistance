import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";
import { useAuth } from "./AuthContext";

interface Alert {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface AlertContextType {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  addAlert: (alert: Omit<Alert, "id" | "timestamp" | "read">) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAlert: (id: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  unreadCount: number;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load alerts when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAlerts();
    } else {
      setAlerts([]);
    }
  }, [isAuthenticated]);

  const refreshAlerts = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getAlerts();
      if (response.success) {
        setAlerts(response.data || []);
      } else {
        throw new Error(response.message || "Failed to load alerts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
      console.error("Error loading alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const addAlert = async (
    alertData: Omit<Alert, "id" | "timestamp" | "read">
  ) => {
    try {
      const response = await apiService.createAlert(alertData);
      if (response.success) {
        await refreshAlerts();
      } else {
        throw new Error(response.message || "Failed to create alert");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert");
      throw err;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await apiService.markAsRead(id);
      if (response.success) {
        await refreshAlerts();
      } else {
        throw new Error(response.message || "Failed to mark alert as read");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark alert as read"
      );
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllAsRead();
      if (response.success) {
        await refreshAlerts();
      } else {
        throw new Error(
          response.message || "Failed to mark all alerts as read"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark all alerts as read"
      );
      throw err;
    }
  };

  const clearAlert = async (id: string) => {
    try {
      const response = await apiService.deleteAlert(id);
      if (response.success) {
        await refreshAlerts();
      } else {
        throw new Error(response.message || "Failed to delete alert");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete alert");
      throw err;
    }
  };

  const clearAllAlerts = async () => {
    try {
      const response = await apiService.clearAllAlerts();
      if (response.success) {
        await refreshAlerts();
      } else {
        throw new Error(response.message || "Failed to clear all alerts");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear all alerts"
      );
      throw err;
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        isLoading,
        error,
        addAlert,
        markAsRead,
        markAllAsRead,
        clearAlert,
        clearAllAlerts,
        unreadCount,
        refreshAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
