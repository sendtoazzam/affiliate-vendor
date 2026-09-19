'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

interface IdleCheckerProps {
  /** Idle timeout before showing warning modal in milliseconds (default: 15 minutes = 900,000ms) */
  idleTimeoutMs?: number;
  /** Countdown duration in seconds once warning modal opens (default: 60 seconds) */
  warningCountdownSeconds?: number;
}

const STORAGE_KEY_LAST_ACTIVITY = 'vf_vendor_last_activity';
const STORAGE_KEY_REMEMBER_ME = 'vf_vendor_remember_me';
const BROADCAST_CHANNEL_NAME = 'vf_vendor_idle_sync';

export default function IdleChecker({
  idleTimeoutMs = 15 * 60 * 1000, // 15 minutes
  warningCountdownSeconds = 60, // 60 seconds warning
}: IdleCheckerProps) {
  const { isAuthenticated, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(warningCountdownSeconds);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningActiveRef = useRef<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearCountdownInterval = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Post message to other tabs if BroadcastChannel is supported
  const broadcast = useCallback((message: any) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage(message);
      }
    } catch {
      // Ignore broadcast errors in unsupported environments
    }
  }, []);

  const handleAutoLogout = useCallback((fromBroadcast = false) => {
    clearIdleTimer();
    clearCountdownInterval();
    setShowModal(false);
    isWarningActiveRef.current = false;

    if (!fromBroadcast) {
      broadcast({ type: 'LOGOUT' });
    }

    logout();
  }, [clearIdleTimer, clearCountdownInterval, broadcast, logout]);

  const handleStayLoggedIn = useCallback((fromBroadcast = false) => {
    clearCountdownInterval();
    setShowModal(false);
    isWarningActiveRef.current = false;

    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
    } catch {
      // ignore
    }

    if (!fromBroadcast) {
      broadcast({ type: 'STAY_LOGGED_IN', timestamp: now });
    }

    startIdleTimer();
  }, [clearCountdownInterval, broadcast]);

  const triggerIdleWarning = useCallback((initialRemainingSeconds = warningCountdownSeconds, fromBroadcast = false) => {
    const rememberMe = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_REMEMBER_ME) : null;
    if (rememberMe === 'true') {
      return;
    }

    isWarningActiveRef.current = true;
    setShowModal(true);
    setCountdown(initialRemainingSeconds);

    if (!fromBroadcast) {
      broadcast({
        type: 'IDLE_WARNING_OPENED',
        remainingSeconds: initialRemainingSeconds,
        timestamp: Date.now(),
      });
    }

    clearCountdownInterval();
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdownInterval();
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningCountdownSeconds, broadcast, clearCountdownInterval, handleAutoLogout]);

  const checkIdleStatus = useCallback(() => {
    if (!isAuthenticated) return;

    const rememberMe = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_REMEMBER_ME) : null;
    if (rememberMe === 'true') {
      clearIdleTimer();
      clearCountdownInterval();
      setShowModal(false);
      isWarningActiveRef.current = false;
      return;
    }

    const storedLastActivity = typeof window !== 'undefined'
      ? parseInt(localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY) || `${Date.now()}`, 10)
      : Date.now();

    const elapsed = Date.now() - storedLastActivity;
    const warningDurationMs = warningCountdownSeconds * 1000;
    const totalMaxIdleMs = idleTimeoutMs + warningDurationMs;

    if (elapsed >= totalMaxIdleMs) {
      // User was idle past both idle timeout and countdown in all tabs
      handleAutoLogout();
    } else if (elapsed >= idleTimeoutMs) {
      // In warning phase
      const remainingSeconds = Math.max(1, Math.round((totalMaxIdleMs - elapsed) / 1000));
      if (!isWarningActiveRef.current) {
        triggerIdleWarning(remainingSeconds);
      }
    } else {
      // Still active (or user was active in another tab)
      if (isWarningActiveRef.current) {
        // Dismiss modal because activity occurred in another tab
        clearCountdownInterval();
        setShowModal(false);
        isWarningActiveRef.current = false;
      }

      clearIdleTimer();
      const remainingIdleMs = idleTimeoutMs - elapsed;
      idleTimerRef.current = setTimeout(() => {
        triggerIdleWarning();
      }, remainingIdleMs);
    }
  }, [
    isAuthenticated,
    idleTimeoutMs,
    warningCountdownSeconds,
    clearIdleTimer,
    clearCountdownInterval,
    triggerIdleWarning,
    handleAutoLogout,
  ]);

  const startIdleTimer = useCallback(() => {
    checkIdleStatus();
  }, [checkIdleStatus]);

  // Record activity and notify other tabs
  const recordActivity = useCallback(() => {
    if (!isAuthenticated || isWarningActiveRef.current) return;

    const now = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
    } catch {
      // ignore
    }

    broadcast({ type: 'USER_ACTIVITY', timestamp: now });
    startIdleTimer();
  }, [isAuthenticated, broadcast, startIdleTimer]);

  // Set up BroadcastChannel and cross-tab storage listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize BroadcastChannel if supported
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        switch (data.type) {
          case 'USER_ACTIVITY':
          case 'STAY_LOGGED_IN':
            if (isWarningActiveRef.current) {
              clearCountdownInterval();
              setShowModal(false);
              isWarningActiveRef.current = false;
            }
            startIdleTimer();
            break;
          case 'IDLE_WARNING_OPENED':
            if (!isWarningActiveRef.current) {
              triggerIdleWarning(data.remainingSeconds || warningCountdownSeconds, true);
            }
            break;
          case 'LOGOUT':
            handleAutoLogout(true);
            break;
        }
      };
    }

    // Storage event listener fallback (for browsers or cross-tab sync)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_LAST_ACTIVITY && e.newValue) {
        if (isWarningActiveRef.current) {
          clearCountdownInterval();
          setShowModal(false);
          isWarningActiveRef.current = false;
        }
        startIdleTimer();
      } else if (e.key === 'vf_vendor_token' && !e.newValue) {
        // Token cleared in another tab
        handleAutoLogout(true);
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [
    startIdleTimer,
    triggerIdleWarning,
    handleAutoLogout,
    clearCountdownInterval,
    warningCountdownSeconds,
  ]);

  // Tab visibility change and periodic sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkIdleStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Periodic check every 5 seconds to prevent background throttle drift
    const periodicCheck = setInterval(() => {
      checkIdleStatus();
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(periodicCheck);
    };
  }, [isAuthenticated, checkIdleStatus]);

  // Activity event listeners with debounce
  useEffect(() => {
    if (!isAuthenticated) {
      clearIdleTimer();
      clearCountdownInterval();
      setShowModal(false);
      isWarningActiveRef.current = false;
      return;
    }

    // Set initial last activity if not present
    if (!localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY)) {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, Date.now().toString());
    }

    let debounceTimeout: NodeJS.Timeout | null = null;
    let lastEventTime = 0;

    const onUserActivity = () => {
      if (isWarningActiveRef.current) return;

      const now = Date.now();
      if (now - lastEventTime > 500) {
        lastEventTime = now;
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          recordActivity();
        }, 300);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    startIdleTimer();

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onUserActivity);
      });
      if (debounceTimeout) clearTimeout(debounceTimeout);
      clearIdleTimer();
      clearCountdownInterval();
    };
  }, [
    isAuthenticated,
    recordActivity,
    startIdleTimer,
    clearIdleTimer,
    clearCountdownInterval,
  ]);

  if (!showModal) return null;

  const progressPct = Math.max(
    0,
    Math.min(100, ((warningCountdownSeconds - countdown) / warningCountdownSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 p-6 sm:p-7 animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Icon */}
        <div className="mx-auto mb-4 relative flex items-center justify-center">
          <span className="absolute inset-0 w-16 h-16 rounded-full bg-warning/20 animate-ping" />
          <div className="w-16 h-16 rounded-full bg-warning/10 text-warning flex items-center justify-center relative z-10 border border-warning/30">
            <ShieldAlert className="w-8 h-8 text-warning" />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-base-content tracking-tight mb-2">
          Session Inactivity Warning
        </h3>
        <p className="text-xs text-base-content/70 leading-relaxed max-w-sm mx-auto mb-5">
          You have been idle for a while. For your account security, you will be automatically signed out in:
        </p>

        {/* Countdown Box & Progress Bar */}
        <div className="bg-base-200/80 rounded-2xl p-4 border border-base-300/80 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/80">
            <span className="flex items-center gap-1.5 text-base-content/60">
              <Clock className="w-3.5 h-3.5 text-warning" />
              Auto Logout In
            </span>
            <span className="badge badge-warning badge-sm font-bold font-mono">
              {countdown}s
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-warning h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[11px] text-base-content/50 text-left">
            Click &ldquo;Stay Logged In&rdquo; to extend your session across all open tabs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => handleAutoLogout(false)}
            className="btn btn-sm btn-ghost text-xs font-semibold text-base-content/70 hover:bg-base-200"
          >
            <LogOut className="w-4 h-4 mr-1.5 text-error" />
            Logout Now
          </button>
          <button
            type="button"
            onClick={() => handleStayLoggedIn(false)}
            className="btn btn-sm btn-primary text-xs font-semibold text-white shadow-md shadow-primary/20"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
