"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { vendorApi } from "@/lib/api";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function FirstTimeSetupPage() {
  const { user, brand, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const router = useRouter();

  // OTP State
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password State
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle countdown cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Request OTP function
  const handleSendOtp = useCallback(async (isInitial = false) => {
    if (cooldown > 0 && !isInitial) return;
    setIsSendingOtp(true);
    setError(null);
    setOtpMessage(null);

    try {
      const res = await vendorApi.sendFirstTimeOtp();
      setOtpSent(true);
      setCooldown(60);
      setOtpMessage(res.message || "A 6-digit verification code has been sent to your email.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification code. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  }, [cooldown]);

  // Auto send OTP on page mount
  const hasAutoSent = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !hasAutoSent.current) {
      hasAutoSent.current = true;
      handleSendOtp(true);
    }
  }, [isAuthenticated, handleSendOtp]);

  // OTP Box Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    const pastedArray = pasteData.split("").slice(0, 6);
    setOtpDigits(pastedArray);
    otpInputRefs.current[5]?.focus();
  };

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const passwordsMatch = password && password === passwordConfirmation;
  const isFormValid =
    otpDigits.join("").length === 6 &&
    hasMinLength &&
    hasNumber &&
    hasLower &&
    hasUpper &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (!isFormValid) {
      setError("Please ensure your new password meets all security criteria.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await vendorApi.updateFirstTimePassword({
        otp: fullOtp,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
      if (res.user) {
        updateUser(res.user);
      }

      // Smooth transition to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push("/vendor-portal/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update password. Please verify the code and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = brand?.name || user?.first_name || user?.name || "Partner";
  const userEmail = user?.email || "your registered email";

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4 sm:p-6">
      <div className="card w-full max-w-xl bg-base-100 shadow-2xl border border-base-300 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-primary/10 border-b border-primary/20 px-8 py-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/30 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">
            First-Time Account Setup
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1 max-w-md mx-auto">
            Welcome, <span className="font-semibold text-primary">{displayName}</span>. For your security, please verify your email and set your permanent password.
          </p>
        </div>

        <div className="card-body p-6 sm:p-8 space-y-6">
          {/* Error Message Alert */}
          {error && (
            <div role="alert" className="alert alert-error shadow-sm text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {success && (
            <div role="alert" className="alert alert-success shadow-sm text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Password updated successfully! Redirecting to your Vendor Dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Email OTP Section */}
            <div className="bg-base-200/60 rounded-2xl p-5 border border-base-300 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email Verification Code</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendOtp(false)}
                  disabled={cooldown > 0 || isSendingOtp}
                  className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1.5 self-start sm:self-auto font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                </button>
              </div>

              <p className="text-xs text-base-content/60">
                A 6-digit OTP code was sent to <span className="font-medium text-base-content">{userEmail}</span>.
              </p>

              {/* OTP Digits Input Group */}
              <div className="flex justify-between gap-2 sm:gap-3 max-w-sm mx-auto">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-base-100 border-2 border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {otpMessage && (
                <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {otpMessage}
                </p>
              )}
            </div>

            {/* Step 2: New Password Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Create Permanent Password</span>
              </div>

              {/* New Password Field */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="input input-bordered w-full pl-10 pr-10 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Confirm New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="input input-bordered w-full pl-10 pr-10 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Live Checklist */}
              <div className="bg-base-200/40 rounded-xl p-3.5 border border-base-300/80 text-xs space-y-1.5">
                <span className="font-semibold text-base-content/70 block mb-1">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-success font-medium" : "text-base-content/50"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-success font-medium" : "text-base-content/50"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Contains a number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower && hasUpper ? "text-success font-medium" : "text-base-content/50"}`}>
                    {hasLower && hasUpper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Upper & lowercase letters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-success font-medium" : "text-base-content/50"}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || success}
              className="btn btn-primary w-full rounded-xl gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span>Verifying & Setting Password...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Success! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Save Password & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60">
            <button
              type="button"
              onClick={logout}
              className="hover:text-error inline-flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out / Switch account</span>
            </button>
            <span>Vamoflex Partner Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
