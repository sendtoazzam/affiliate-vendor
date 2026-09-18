'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';

export interface SessionExpiredModalProps {
  isOpen: boolean;
  onRedirectNow?: () => void;
  redirectSeconds?: number;
}

export default function SessionExpiredModal({
  isOpen,
  onRedirectNow,
  redirectSeconds = 15,
}: SessionExpiredModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectSeconds);

  const handleRedirect = () => {
    if (onRedirectNow) {
      onRedirectNow();
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCountdown(redirectSeconds);
      return;
    }

    setCountdown(redirectSeconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, redirectSeconds]);

  if (!isOpen) return null;

  const progressPct = Math.max(
    0,
    Math.min(100, ((redirectSeconds - countdown) / redirectSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-6 sm:p-7 animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Icon Ring */}
        <div className="mx-auto mb-4 relative flex items-center justify-center">
          <span className="absolute inset-0 w-16 h-16 rounded-full bg-error/15 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center relative z-10 border border-error/20">
            <ShieldAlert className="w-8 h-8 text-error" />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-black text-base-content tracking-tight mb-2">
          You Have Been Logged Out
        </h3>
        <p className="text-xs text-base-content/70 leading-relaxed max-w-sm mx-auto mb-5">
          Your session token is invalid or has expired. For your account security, you have been automatically signed out.
        </p>

        {/* Countdown Box & Progress Bar */}
        <div className="bg-base-200/80 rounded-2xl p-4 border border-base-300/80 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/80">
            <span className="flex items-center gap-1.5 text-base-content/60">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Auto Redirecting
            </span>
            <span className="badge badge-primary badge-sm font-bold font-mono">
              {countdown}s
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[11px] text-base-content/50 text-left">
            You will be redirected to the login page once the timer expires.
          </p>
        </div>

        {/* Direct Action Button */}
        <button
          type="button"
          onClick={handleRedirect}
          className="btn btn-primary w-full text-white font-bold gap-2 shadow-md shadow-primary/25"
        >
          <span>Log In Again Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}