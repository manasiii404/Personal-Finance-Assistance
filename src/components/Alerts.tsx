import React, { useState } from 'react';
import { useAlerts } from '../contexts/AlertContext';
import { useFinance } from '../contexts/FinanceContext';
import { Bell, BellRing, CheckCircle, AlertTriangle, Info, X, Settings, Mail, MessageSquare, Smartphone, Plus, ToggleLeft as Toggle } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { alerts, markAsRead, clearAlert, addAlert } = useAlerts();
  const { budgets } = useFinance();
  const [showSettings, setShowSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    budgetAlerts: true,
    goalAlerts: true,
    largeTransactions: true,
    savingsOpportunities: true,
    monthlyReports: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    whatsappNotifications: false
  });

  const alertIcons = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
    error: AlertTriangle
  };

  const alertColors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconColors = {
    warning: 'text-yellow-600',
    success: 'text-green-600',
    info: 'text-blue-600',
    error: 'text-red-600'
  };

  const handleMarkAsRead = (alertId: string) => {
    markAsRead(alertId);
  };

  const handleClearAlert = (alertId: string) => {
    clearAlert(alertId);
  };

  const handleSettingToggle = (setting: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const createTestAlert = (type: 'warning' | 'success' | 'info' | 'error') => {
    const testAlerts = {
      warning: {
        title: 'Budget Warning',
        message: 'Your Food budget is approaching the limit'
      },
      success: {
        title: 'Goal Achievement',
        message: 'Congratulations! You reached your savings goal'
      },
      info: {
        title: 'Monthly Report',
        message: 'Your financial report for January is ready'
      },
      error: {
        title: 'Payment Failed',
        message: 'Automatic payment for Netflix subscription failed'
      }
    };

    addAlert({
      type,
      ...testAlerts[type]
    });
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);
  const readAlerts = alerts.filter(alert => alert.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay informed about your financial activities and opportunities
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <BellRing className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgets.filter(b => (b.spent / b.limit) > 0.8).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Channels</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(alertSettings).filter(Boolean).length - 4}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Test Alerts (Demo) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Alert System</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => createTestAlert('warning')}
            className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200 text-sm"
          >
            Test Warning
          </button>
          <button
            onClick={() => createTestAlert('success')}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm"
          >
            Test Success
          </button>
          <button
            onClick={() => createTestAlert('info')}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm"
          >
            Test Info
          </button>
          <button
            onClick={() => createTestAlert('error')}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
          >
            Test Error
          </button>
        </div>
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Unread Alerts ({unreadAlerts.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {unreadAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className={`rounded-lg border p-4 ${alertColors[alert.type]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${iconColors[alert.type]}`} />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{alert.title}</h4>
                          <p className="text-sm opacity-90">{alert.message}</p>
                          <p className="text-xs opacity-75 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors duration-200"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleClearAlert(alert.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors duration-200"
                          title="Clear alert"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts ({readAlerts.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {readAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              return (
                <div key={alert.id} className="p-6 opacity-70 hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${iconColors[alert.type]}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-600">{alert.title}</h4>
                        <p className="text-sm text-gray-500">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClearAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                      title="Clear alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Alert Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alert Types */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Alert Types</h4>
                <div className="space-y-3">
                  {[
                    { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits' },
                    { key: 'goalAlerts', label: 'Goal Alerts', description: 'Updates on financial goal progress' },
                    { key: 'largeTransactions', label: 'Large Transactions', description: 'Alerts for transactions over $500' },
                    { key: 'savingsOpportunities', label: 'Savings Opportunities', description: 'AI-powered savings recommendations' },
                    { key: 'monthlyReports', label: 'Monthly Reports', description: 'Comprehensive monthly financial summaries' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{label}</h5>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <button
                        onClick={() => handleSettingToggle(key as keyof typeof alertSettings)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          alertSettings[key as keyof typeof alertSettings] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            alertSettings[key as keyof typeof alertSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Channels */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h4>
                <div className="space-y-3">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive alerts via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', icon: Smartphone, description: 'Get text message alerts' },
                    { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Browser push notifications' },
                    { key: 'whatsappNotifications', label: 'WhatsApp Notifications', icon: MessageSquare, description: 'WhatsApp message alerts' }
                  ].map(({ key, label, icon: Icon, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{label}</h5>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSettingToggle(key as keyof typeof alertSettings)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          alertSettings[key as keyof typeof alertSettings] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            alertSettings[key as keyof typeof alertSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MCP Settings */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">MCP Automation Settings</h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">Multi-Channel Protocol</h5>
                      <p className="text-sm text-blue-700 mb-3">
                        Our MCP system automatically monitors your financial activities and triggers intelligent alerts
                        based on spending patterns, budget limits, and savings opportunities.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Real-time Transaction Monitoring</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Pattern Recognition</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Predictive Alerts</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};