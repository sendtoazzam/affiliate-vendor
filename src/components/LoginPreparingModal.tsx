"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Sparkles, Store, Zap } from "lucide-react";

interface LoginPreparingModalProps {
  isOpen: boolean;
  brandName?: string | null;
  userName?: string | null;
  onComplete?: () => void;
}

export default function LoginPreparingModal({
  isOpen,
  brandName,
  userName,
  onComplete,
}: LoginPreparingModalProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    setProgress(0);

    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds duration for smooth 0 - 100 progress

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(rawPct);

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const getStageText = (pct: number) => {
    if (pct < 25) return "Verifying merchant security token...";
    if (pct < 55) return "Loading brand catalog & settlement tier...";
    if (pct < 85) return "Synchronizing logistics & performance matrices...";
    if (pct < 100) return "Finalizing vendor workspace...";
    return "Workspace ready! Launching portal...";
  };

  const displayName = brandName || userName || "Vendor Partner";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="card w-full max-w-md bg-base-100 shadow-2xl border border-primary/30 p-6 sm:p-8 text-center relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient lighting glows */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Center Animated Ring with Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-5 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circular Progress Meter */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-base-300/80"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#modalProgressGrad)"
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-75 ease-out"
              />
              <defs>
                <linearGradient id="modalProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--p))" />
                  <stop offset="100%" stopColor="hsl(var(--s, var(--p)))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Centered Brand Icon */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-base-100 shadow-md border border-base-200 flex items-center justify-center">
              {progress >= 100 ? (
                <CheckCircle2 className="w-8 h-8 text-success animate-bounce" />
              ) : (
                <img
                  src="/images/logo/preloader_icon.png"
                  alt="VAMOFLEX"
                  className="w-10 h-10 object-contain drop-shadow-sm animate-pulse"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Preparing Workspace</span>
          </div>
        </div>

        {/* Title and Welcome */}
        <h2 className="text-lg sm:text-xl font-bold text-base-content tracking-tight mb-1">
          Welcome, <span className="text-primary">{displayName}</span>
        </h2>
        <p className="text-xs text-base-content/60 mb-5">
          Setting up your vendor dashboard environment
        </p>

        {/* Progress Display Bar and Percentage */}
        <div className="bg-base-200/80 rounded-2xl p-4 border border-base-300 space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/70 font-medium truncate max-w-[240px] text-left">
              {getStageText(progress)}
            </span>
            <span className="font-mono font-bold text-primary text-sm shrink-0 ml-2">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-base-300 h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-primary via-primary to-secondary h-full rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Security / System Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-base-content/50 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Secure Auth</span>
          </span>
          <span className="flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-primary" />
            <span>Brand Sync</span>
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-warning" />
            <span>Fast Load</span>
          </span>
        </div>
      </div>
    </div>
  );
}
