import React, { createContext, useContext, useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAlert: (id: string) => void;
  unreadCount: number;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Budget Alert',
      message: 'You have exceeded 80% of your Food budget limit',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Savings Milestone',
      message: 'Congratulations! You saved $500 this month',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Monthly Report',
      message: 'Your monthly financial report is ready',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ]);

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const addAlert = (alertData: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const clearAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{
      alerts,
      addAlert,
      markAsRead,
      clearAlert,
      unreadCount
    }}>
      {children}
    </AlertContext.Provider>
  );
};