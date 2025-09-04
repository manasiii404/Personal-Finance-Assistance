import React, { useState } from "react";
import { useAlerts } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  CreditCard,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export const Settings: React.FC = () => {
  const { addAlert } = useAlerts();
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    currency: "USD",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: true,
    monthlyReports: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    biometricAuth: true,
    sessionTimeout: "30",
  });

  // Integration settings
  const [integrations, setIntegrations] = useState({
    bankSync: true,
    smsParser: true,
    autoCategories: true,
    realTimeAlerts: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Smartphone },
    { id: "data", label: "Data Management", icon: Database },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
      });

      addAlert({
        type: "success",
        title: "Profile Updated",
        message: "Your profile settings have been saved successfully",
      });
    } catch (error) {
      addAlert({
        type: "error",
        title: "Update Failed",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    addAlert({
      type: "success",
      title: "Notification Settings Updated",
      message: "Your notification preferences have been saved",
    });
  };

  const handleSaveSecurity = async () => {
    if (
      security.newPassword &&
      security.newPassword !== security.confirmPassword
    ) {
      addAlert({
        type: "error",
        title: "Password Mismatch",
        message: "New password and confirmation do not match",
      });
      return;
    }

    if (security.newPassword) {
      setLoading(true);
      try {
        await changePassword(security.currentPassword, security.newPassword);

        addAlert({
          type: "success",
          title: "Password Updated",
          message: "Your password has been updated successfully",
        });

        setSecurity({
          ...security,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        addAlert({
          type: "error",
          title: "Password Update Failed",
          message:
            "Failed to update password. Please check your current password.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      addAlert({
        type: "success",
        title: "Security Settings Updated",
        message: "Your security settings have been updated successfully",
      });
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile,
      notifications,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-ai-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    addAlert({
      type: "success",
      title: "Data Exported",
      message: "Your settings have been exported successfully",
    });
  };

  const handleDeleteAccount = async () => {
    const password = prompt(
      "Please enter your password to confirm account deletion:"
    );
    if (!password) return;

    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteAccount(password);
      addAlert({
        type: "success",
        title: "Account Deleted",
        message: "Your account has been permanently deleted",
      });
    } catch (error) {
      addAlert({
        type: "error",
        title: "Deletion Failed",
        message:
          "Failed to delete account. Please check your password and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      setProfile({ ...profile, timezone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) =>
                      setProfile({ ...profile, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Channels
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "email",
                    label: "Email Notifications",
                    icon: Mail,
                    description: "Receive notifications via email",
                  },
                  {
                    key: "sms",
                    label: "SMS Notifications",
                    icon: Smartphone,
                    description: "Get text message alerts",
                  },
                  {
                    key: "push",
                    label: "Push Notifications",
                    icon: Bell,
                    description: "Browser push notifications",
                  },
                  {
                    key: "whatsapp",
                    label: "WhatsApp Notifications",
                    icon: MessageSquare,
                    description: "WhatsApp message alerts",
                  },
                ].map(({ key, label, icon: Icon, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
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
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [key]:
                            !notifications[key as keyof typeof notifications],
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notifications[key as keyof typeof notifications]
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          notifications[key as keyof typeof notifications]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Alert Types
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "budgetAlerts",
                    label: "Budget Alerts",
                    description: "Get notified when approaching budget limits",
                  },
                  {
                    key: "goalReminders",
                    label: "Goal Reminders",
                    description: "Regular updates on goal progress",
                  },
                  {
                    key: "weeklyReports",
                    label: "Weekly Reports",
                    description: "Weekly spending summaries",
                  },
                  {
                    key: "monthlyReports",
                    label: "Monthly Reports",
                    description: "Comprehensive monthly reports",
                  },
                ].map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h5 className="font-medium text-gray-900">{label}</h5>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [key]:
                            !notifications[key as keyof typeof notifications],
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        notifications[key as keyof typeof notifications]
                          ? "bg-blue-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          notifications[key as keyof typeof notifications]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) =>
                        setSecurity({
                          ...security,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) =>
                      setSecurity({ ...security, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Authentication Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </h5>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security with 2FA
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSecurity({
                        ...security,
                        twoFactorAuth: !security.twoFactorAuth,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      security.twoFactorAuth ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        security.twoFactorAuth
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      Biometric Authentication
                    </h5>
                    <p className="text-sm text-gray-600">
                      Use fingerprint or face recognition
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSecurity({
                        ...security,
                        biometricAuth: !security.biometricAuth,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      security.biometricAuth ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        security.biometricAuth
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSecurity}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? "Updating..." : "Update Security"}</span>
              </button>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                MCP Integration Settings
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">
                  Multi-Channel Protocol (MCP)
                </h4>
                <p className="text-sm text-blue-700">
                  MCP enables real-time financial monitoring and intelligent
                  automation across multiple channels.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "bankSync",
                    label: "Bank Account Sync",
                    description:
                      "Automatically sync transactions from bank accounts",
                  },
                  {
                    key: "smsParser",
                    label: "SMS Transaction Parser",
                    description:
                      "Parse bank SMS notifications for transactions",
                  },
                  {
                    key: "autoCategories",
                    label: "Auto-Categorization",
                    description:
                      "Automatically categorize transactions using AI",
                  },
                  {
                    key: "realTimeAlerts",
                    label: "Real-time Alerts",
                    description:
                      "Instant notifications for financial activities",
                  },
                ].map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h5 className="font-medium text-gray-900">{label}</h5>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          integrations[key as keyof typeof integrations]
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {integrations[key as keyof typeof integrations]
                          ? "Active"
                          : "Inactive"}
                      </span>
                      <button
                        onClick={() =>
                          setIntegrations({
                            ...integrations,
                            [key]:
                              !integrations[key as keyof typeof integrations],
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          integrations[key as keyof typeof integrations]
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            integrations[key as keyof typeof integrations]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Connected Accounts
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: "Chase Bank",
                    type: "Checking",
                    status: "Connected",
                    lastSync: "2 minutes ago",
                  },
                  {
                    name: "Wells Fargo",
                    type: "Savings",
                    status: "Connected",
                    lastSync: "5 minutes ago",
                  },
                  {
                    name: "American Express",
                    type: "Credit Card",
                    status: "Connected",
                    lastSync: "1 hour ago",
                  },
                ].map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {account.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {account.type} • Last sync: {account.lastSync}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {account.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Export & Import
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Download className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">
                      Export Data
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download all your financial data in JSON format
                    </p>
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Export All Data
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">
                      Import Data
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Import financial data from a backup file
                    </p>
                    <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      Import Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <Database className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-900">
                        Data Retention
                      </h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your financial data is stored securely and retained
                        according to your preferences. You can configure
                        retention periods for different types of data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-red-900">
                        Delete Account
                      </h5>
                      <p className="text-sm text-red-700 mt-1 mb-3">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Privacy & Compliance
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">
                  Data Protection
                </h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    • All financial data is encrypted at rest and in transit
                  </p>
                  <p>
                    • MCP protocols ensure secure multi-channel communication
                  </p>
                  <p>• Regular security audits and compliance checks</p>
                  <p>• GDPR and CCPA compliant data handling</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and system configuration
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Settings Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};
