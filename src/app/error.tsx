'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertOctagon,
  RotateCcw,
  Home,
  ArrowLeft,
  Package,
  BarChart3,
  Receipt,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
    }
    console.error('Vendor Portal Error:', error);
  }, [error, pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4 sm:p-6">
      <div className="card w-full max-w-2xl bg-base-100 shadow-2xl border border-base-300 overflow-hidden relative text-center">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-error/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="card-body p-6 sm:p-10 relative z-10 flex flex-col items-center">
          {/* Brand Logo */}
          <Link href="/" className="mb-6 flex items-center justify-center">
            <img
              src="/images/logo/logo.png"
              alt="VAMOFLEX"
              className="h-12 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* 500 Illustration Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-error/10 via-error/5 to-primary/10 border-2 border-error/20 flex items-center justify-center shadow-inner">
              <span className="font-black text-4xl sm:text-5xl text-error tracking-tighter">
                500
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-error text-error-content shadow-lg border border-error/30 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>

          {/* Main Title & Description */}
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mb-2">
            System Error Occurred
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-md mx-auto leading-relaxed mb-4">
            We encountered an unexpected error while processing your request. Our technical team has been alerted.
          </p>

          {/* Invalid Path Display Banner */}
          <div className="w-full max-w-lg bg-base-200/90 rounded-xl p-3 border border-base-300 mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <ShieldAlert className="w-4 h-4 text-error shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Error Target URL Path
                </span>
                <span className="font-mono text-xs text-error font-semibold break-all">
                  {currentPath || pathname || '/unknown-path'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message Snippet */}
          {error?.message && (
            <div className="w-full max-w-lg bg-error/5 border border-error/20 rounded-xl p-3 mb-6 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-error mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>Error Details</span>
              </div>
              <p className="font-mono text-[11px] text-error/80 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-primary btn-sm px-6 text-white font-semibold shadow-md shadow-primary/20 gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="btn btn-outline btn-sm px-5 gap-2 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="w-full border-t border-base-300 pt-6">
            <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-3">
              Popular Portal Destinations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <Link
                href="/vendor-portal/catalog/manage-product"
                className="p-3 rounded-xl bg-base-200/60 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2 font-semibold border border-base-300/60 text-base-content/80"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Manage Products</span>
              </Link>

              <Link
                href="/vendor-portal/insights/sales-report"
                className="p-3 rounded-xl bg-base-200/60 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2 font-semibold border border-base-300/60 text-base-content/80"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Sales Report</span>
              </Link>

              <Link
                href="/vendor-portal/accounting"
                className="p-3 rounded-xl bg-base-200/60 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2 font-semibold border border-base-300/60 text-base-content/80"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Accounting</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}