import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  smsSetupComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: { name?: string; email?: string; phone?: string }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  markSMSSetupComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      const response = await apiService.register({ email, password, name, phone });
      if (response.success && response.data) {
        setUser(response.data.user);
        apiService.setToken(response.data.token);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.setToken(null);
  };

  const updateProfile = async (userData: { name?: string; email?: string }) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await apiService.changePassword({
        currentPassword,
        newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || "Password change failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const response = await apiService.deleteAccount(password);
      if (response.success) {
        logout();
      } else {
        throw new Error(response.message || "Account deletion failed");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      throw error;
    }
  };

  const markSMSSetupComplete = async () => {
    try {
      const response = await apiService.markSMSSetupComplete();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.message || "SMS setup completion failed");
      }
    } catch (error) {
      console.error("SMS setup completion error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        markSMSSetupComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
