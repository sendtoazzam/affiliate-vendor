"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { vendorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";
import MaintenanceModal, { MaintenanceData } from "@/components/MaintenanceModal";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [isRefreshingMaintenance, setIsRefreshingMaintenance] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const checkMaintenance = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshingMaintenance(true);
    try {
      const status = await vendorApi.getMaintenanceStatus("shop");
      if (status && status.active) {
        setMaintenanceData(status);
      } else {
        setMaintenanceData(null);
      }
    } catch {
      // ignore
    } finally {
      if (!isSilent) setIsRefreshingMaintenance(false);
    }
  }, []);

  useEffect(() => {
    checkMaintenance(true);
    const interval = setInterval(() => {
      checkMaintenance(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [checkMaintenance]);

  const handleRefreshMaintenance = async () => {
    await checkMaintenance(false);
  };

  const isMaintenanceActive = Boolean(maintenanceData?.active);

  const handleMethodChange = (method: "email" | "username") => {
    setLoginMethod(method);
    setIdentifier("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMaintenanceActive) return;
    setError(null);

    if (!identifier.trim()) {
      setError(
        loginMethod === "email"
          ? "Please enter your email address."
          : "Please enter your username.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        loginMethod === "email" || identifier.includes("@")
          ? { email: identifier.trim(), password }
          : { username: identifier.trim(), password };

      const response = await vendorApi.login(payload);

      const token = response.access_token || response.token;
      const user = response.user || {};
      const brand = response.brand || null;

      if (!token) {
        throw new Error("Authentication succeeded but no token was returned.");
      }

      login(token, user, brand);
      router.push("/vendor-portal/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 503 || err.response?.data?.code === "maintenance") {
        await checkMaintenance(false);
      }
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/images/logo/logo.png"
              alt="VAMOFLEX"
              className="h-20 sm:h-18 w-auto object-contain mb-2"
            />
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
              Vendor Partner Portal
            </span>
            <p className="text-xs text-base-content/60 mt-2">
              Sign in to manage your brand products, settlements & reporting
            </p>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2 px-3 mb-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div
              role="tablist"
              className="tabs p-0 tabs-box w-full bg-base-200/50 rounded-xl border border-base-300/25"
            >
              <button
                type="button"
                role="tab"
                disabled={isMaintenanceActive || loading}
                className={`tab flex-1 gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 border border-transparent rounded-l-lg ${
                  loginMethod === "email"
                    ? "tab-active bg-primary text-primary-content shadow-sm"
                    : "text-base-content/55 hover:text-base-content hover:bg-base-100/70"
                }`}
                onClick={() => handleMethodChange("email")}
              >
                <Mail className="w-4 h-4 shrink-0" />
                Email
              </button>
              <button
                type="button"
                role="tab"
                disabled={isMaintenanceActive || loading}
                className={`tab flex-1 gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 border border-transparent rounded-r-lg ${
                  loginMethod === "username"
                    ? "tab-active bg-primary text-primary-content shadow-sm"
                    : "text-base-content/55 hover:text-base-content hover:bg-base-100/70"
                }`}
                onClick={() => handleMethodChange("username")}
              >
                <User className="w-4 h-4 shrink-0" />
                Username
              </button>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-xs">
                  {loginMethod === "email" ? "Email Address" : "Username"}{" "}
                  <span className="text-error">*</span>
                </span>
              </label>
              <label className="input input-bordered w-full flex items-center gap-2 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                {loginMethod === "email" ? (
                  <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-base-content/40 shrink-0" />
                )}
                <input
                  type={loginMethod === "email" ? "email" : "text"}
                  disabled={isMaintenanceActive || loading}
                  placeholder={
                    loginMethod === "email"
                      ? "vendor@brand.com"
                      : "Enter your username"
                  }
                  className="grow bg-transparent min-h-0 h-auto border-0 p-0 focus:outline-none text-sm disabled:opacity-50"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete={loginMethod === "email" ? "email" : "username"}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium text-xs">
                  Password <span className="text-error">*</span>
                </span>
              </label>
              <label className="input input-bordered w-full flex items-center gap-2 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={isMaintenanceActive || loading}
                  placeholder="••••••••"
                  className="grow bg-transparent min-h-0 h-auto border-0 p-0 focus:outline-none text-sm disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  disabled={isMaintenanceActive || loading}
                  className="btn btn-ghost btn-xs shrink-0 font-medium"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="label cursor-pointer gap-2 p-0">
                <input
                  type="checkbox"
                  disabled={isMaintenanceActive || loading}
                  className="checkbox checkbox-primary checkbox-xs"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                />
                <span className="label-text text-xs text-base-content/70">
                  Keep me logged in
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="link link-primary font-medium hover:underline text-xs"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || isMaintenanceActive}
                className="btn btn-primary w-full text-white font-medium shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <span>Sign In to Vendor Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="divider my-4 text-xs text-base-content/40">
            Marketplace Settlement Policy
          </div>
          <div className="rounded-xl bg-base-200/60 p-3 text-xs text-base-content/70 space-y-1">
            <div className="flex justify-between font-medium">
              <span>Standard Settlement:</span>
              <span className="text-primary font-bold">
                Kelas B (50% Payout)
              </span>
            </div>
            <div className="flex justify-between text-base-content/60">
              <span>Weekly Payout Cutoff:</span>
              <span>Sunday 11:59 PM (Wed Payout)</span>
            </div>
          </div>

          <div className="divider my-4 text-xs text-base-content/30" />
          <p className="text-center text-[11px] text-base-content/50">
            &copy; {new Date().getFullYear()} VAMOFLEX. All rights reserved.
          </p>
        </div>
      </div>

      <MaintenanceModal
        isOpen={isMaintenanceActive}
        maintenanceData={maintenanceData}
        onRefresh={handleRefreshMaintenance}
        isRefreshing={isRefreshingMaintenance}
      />
    </div>
  );
}

