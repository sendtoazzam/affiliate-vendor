"use client";

import React, { useState } from "react";
import Link from "next/link";
import { vendorApi } from "@/lib/api";
import {
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordForm() {
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "VF Vendor | Forgot Password";
    }
  }, []);

  const handleMethodChange = (method: "email" | "username") => {
    setLoginMethod(method);
    setIdentifier("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(
        `Please enter your ${loginMethod === "email" ? "email address" : "username"}`,
      );
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await vendorApi.forgotPassword({
        identifier: identifier.trim(),
        login_type: loginMethod,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Something went wrong.");
      }

      setSuccessMessage(
        response?.message || "Password reset link has been sent to your email.",
      );
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "User not found or connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-md py-4 sm:py-8"
    >
      <div
        suppressHydrationWarning
        className="card w-full bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300/80 rounded-3xl overflow-hidden relative"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
        <div suppressHydrationWarning className="card-body p-7 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/images/logo/logo.png"
              alt="VAMOFLEX"
              className="h-20 sm:h-18 w-auto object-contain mb-2"
            />
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
              Vendor Partner Portal
            </span>
            <h1 className="text-xl font-bold text-base-content mt-3">
              Forgot Password
            </h1>
            <p className="text-xs text-base-content/60 mt-1">
              Enter your details to recover your account
            </p>
          </div>

          {successMessage ? (
            <div className="space-y-4">
              <div className="alert alert-success alert-soft text-sm p-4 rounded-xl flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <p className="font-semibold text-base-content">
                  {successMessage}
                </p>
                <p className="text-xs text-base-content/60">
                  Please check your inbox (and spam folder) for instructions to
                  reset your password.
                </p>
              </div>

              <Link
                href="/login"
                className="btn btn-primary w-full text-white font-medium shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
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
                      placeholder={
                        loginMethod === "email"
                          ? "vendor@brand.com"
                          : "Enter your username"
                      }
                      className="grow bg-transparent min-h-0 h-auto border-0 p-0 focus:outline-none text-sm"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete={
                        loginMethod === "email" ? "email" : "username"
                      }
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full text-white font-medium shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="btn btn-link btn-sm text-xs text-base-content/70 hover:text-primary no-underline gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            </>
          )}

          <div className="divider my-4 text-xs text-base-content/40">
            Hausflex Platform
          </div>
          <p
            suppressHydrationWarning
            className="text-center text-[11px] text-base-content/45"
          >
            &copy; {new Date().getFullYear()} · VAMOFLEX Vendor Hub
          </p>
        </div>
      </div>
    </div>
  );
}
