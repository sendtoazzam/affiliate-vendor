'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface MaintenanceData {
  active: boolean;
  message?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  window?: {
    name?: string;
    message?: string;
    starts_at?: string;
    ends_at?: string;
  } | null;
  source?: string | null;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  maintenanceData: MaintenanceData | null;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export default function MaintenanceModal({
  isOpen,
  maintenanceData,
  onRefresh,
  isRefreshing = false,
}: MaintenanceModalProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  const [progress, setProgress] = useState<number>(0);

  const endsAtStr = maintenanceData?.ends_at || maintenanceData?.window?.ends_at;
  const startsAtStr = maintenanceData?.starts_at || maintenanceData?.window?.starts_at;
  const message =
    maintenanceData?.message ||
    maintenanceData?.window?.message ||
    'We are currently performing essential system maintenance and server upgrades. The vendor portal will be back online shortly.';
  const windowName = maintenanceData?.window?.name || 'Scheduled System Maintenance';

  useEffect(() => {
    if (!isOpen || !endsAtStr) {
      return;
    }

    const calculateTime = () => {
      const target = new Date(endsAtStr).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({ hours, minutes, seconds, totalSeconds: diff });

      if (startsAtStr) {
        const start = new Date(startsAtStr).getTime();
        const totalDuration = Math.max(1, target - start);
        const elapsed = Math.max(0, now - start);
        const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        setProgress(pct);
      } else {
        setProgress(diff === 0 ? 100 : 65);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen, endsAtStr, startsAtStr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="card w-full max-w-lg bg-base-100 shadow-2xl border-2 border-primary/30 p-6 sm:p-8 animate-scale-in text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Construction / Gear Illustration */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/15 to-primary/10 border border-primary/20 flex items-center justify-center relative shadow-inner">
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 text-primary"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Rotating Gear Behind */}
              <g className="animate-spin origin-center" style={{ animationDuration: '10s' }}>
                <circle
                  cx="50"
                  cy="50"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="8 6"
                  opacity="0.35"
                />
              </g>

              {/* Smaller Counter-Rotating Gear */}
              <g
                className="animate-spin origin-center"
                style={{
                  animationDuration: '6s',
                  animationDirection: 'reverse',
                  transformOrigin: '68px 32px',
                }}
              >
                <circle
                  cx="68"
                  cy="32"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="5 4"
                  opacity="0.45"
                />
              </g>

              {/* Animated Construction Barrier / Crane & Wrench */}
              <path
                d="M30 68L70 68"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="text-secondary"
              />
              <path
                d="M36 68L36 78M64 68L64 78"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M40 68L48 54M52 68L60 54"
                stroke="#D4AF37"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Swinging Hammer / Wrench Animation */}
              <g
                className="origin-bottom-left"
                style={{
                  transformOrigin: '40px 48px',
                  animation: 'pulseGlow 2.5s infinite ease-in-out',
                }}
              >
                <path
                  d="M42 48 L62 28 M58 24 L66 32"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="62" cy="28" r="4" fill="currentColor" />
              </g>

              {/* Sparkles / Activity Pulse */}
              <circle cx="70" cy="20" r="2.5" fill="#D4AF37" className="animate-ping" />
              <circle cx="28" cy="40" r="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>

          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/15 border border-warning/30 text-warning text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Under Maintenance</span>
          </div>
        </div>

        {/* Title and Message */}
        <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tight mb-2">
          {windowName}
        </h2>
        <p className="text-xs sm:text-sm text-base-content/70 max-w-md mx-auto leading-relaxed mb-6">
          {message}
        </p>

        {/* Countdown Timer (If ends_at is available) */}
        {endsAtStr && timeLeft.totalSeconds > 0 ? (
          <div className="bg-base-200/80 rounded-2xl p-4 border border-base-300 mb-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-base-content/60">
              <Clock className="w-4 h-4 text-primary" />
              <span>Estimated Completion In</span>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <div className="bg-base-100 rounded-xl p-2.5 border border-base-300 shadow-sm">
                <span className="font-mono text-2xl font-black text-primary block">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-base-content/50">Hours</span>
              </div>

              <div className="bg-base-100 rounded-xl p-2.5 border border-base-300 shadow-sm">
                <span className="font-mono text-2xl font-black text-primary block">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-base-content/50">Mins</span>
              </div>

              <div className="bg-base-100 rounded-xl p-2.5 border border-base-300 shadow-sm">
                <span className="font-mono text-2xl font-black text-primary block">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-bold text-base-content/50">Secs</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-base-content/50 font-medium">
                <span>System Update Progress</span>
                <span>{progress}% Completed</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-base-200/80 rounded-xl p-3 border border-base-300 mb-6 flex items-center justify-center gap-2 text-xs text-base-content/70">
            <span className="loading loading-ring loading-sm text-primary" />
            <span>Upgrades in progress. Automatic access will resume once complete.</span>
          </div>
        )}

        {/* Refresh & Check Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-primary btn-sm px-6 text-white font-semibold shadow-md shadow-primary/20 gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking System Status...' : 'Check Status Now'}</span>
          </button>
        </div>

        <p className="text-[11px] text-base-content/40 mt-4">
          Status auto-checks every 30 seconds
        </p>
      </div>
    </div>
  );
}
