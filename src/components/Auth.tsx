import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Phone, X } from "lucide-react";
import { TermsModal } from "./ui/TermsModal";

export const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!acceptedTerms) {
          throw new Error("Please accept the terms and conditions");
        }
        // Set flag BEFORE register to ensure it's there when App re-renders
        // We'll clear it if register fails
        localStorage.setItem('showSMSSetup', 'true');
        try {
          await register(formData.email, formData.password, formData.name, formData.phone);
        } catch (regError) {
          localStorage.removeItem('showSMSSetup');
          throw regError;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 animate-fade-in">
      <div className="card-premium w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-premium-gradient rounded-2xl mb-6 shadow-glow animate-bounce-subtle">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-dark-600 font-medium text-lg">
            {isLogin
              ? "Sign in to your financial dashboard"
              : "Start your premium financial journey"}
          </p>
        </div>

        {error && (
          <div className="bg-error-gradient/10 border border-error-300 rounded-xl p-4 mb-6 flex items-center space-x-3 animate-slide-down">
            <AlertCircle className="h-5 w-5 text-error-600" />
            <span className="text-error-700 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-dark-700 mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-premium w-full pl-12 pr-4 py-4 font-medium"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>

              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-dark-700 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-premium w-full pl-12 pr-4 py-4 font-medium"
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    required={!isLogin}
                  />
                </div>
                <p className="text-xs text-dark-500 mt-1 ml-1">Required - 10 digits</p>
              </div>
            </>
          )}

          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-dark-700 mb-3">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-premium w-full pl-12 pr-4 py-4 font-medium"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-dark-700 mb-3">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-premium w-full pl-12 pr-14 py-4 font-medium"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-dark-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-premium w-full pl-12 pr-4 py-4 font-medium"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>

              <div className="animate-slide-up">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-2 border-primary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    required={!isLogin}
                  />
                  <span className="text-sm text-dark-700 font-medium">
                    I accept the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-gradient font-bold hover:underline"
                    >
                      Terms & Conditions
                    </button>
                  </span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
              </div>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-dark-600 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setAcceptedTerms(false);
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  phone: "",
                  confirmPassword: "",
                });
              }}
              className="ml-2 text-gradient font-bold hover:scale-105 transition-transform"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <div className="card-glass p-3 rounded-xl">
            <p className="text-xs text-dark-600 font-medium">
              Demo credentials: demo@example.com / demo123
            </p>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTermsModal(false);
        }}
      />

    </div>
  );
};
