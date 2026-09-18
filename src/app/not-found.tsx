'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  Search,
  Package,
  BarChart3,
  Receipt,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function NotFoundPage() {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
      document.title = 'VamoFlex Vendor | Page Not Found';
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex items-center justify-center p-4 sm:p-6">
      <div className="card w-full max-w-2xl bg-base-100 shadow-2xl border border-base-300 overflow-hidden relative text-center">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="card-body p-6 sm:p-10 relative z-10 flex flex-col items-center">
          {/* Brand Logo */}
          <Link href="/vendor-portal/dashboard" className="mb-6 flex items-center justify-center">
            <img
              src="/images/logo/logo.png"
              alt="VAMOFLEX"
              className="h-12 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* 404 Illustration Badge */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
              <span className="font-black text-4xl sm:text-5xl text-primary tracking-tighter">
                404
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-warning text-warning-content shadow-lg border border-warning/30 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>

          {/* Main Title & Description */}
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-md mx-auto leading-relaxed mb-4">
            The page you are looking for doesn't exist, has been moved, or the URL address was entered incorrectly.
          </p>

          {/* Invalid Path Display Banner */}
          <div className="w-full max-w-lg bg-base-200/90 rounded-xl p-3 border border-base-300 mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2 overflow-hidden w-full">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Requested URL Path
                </span>
                <span className="font-mono text-xs text-error font-semibold break-all">
                  {currentPath || pathname || '/unknown-path'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-outline btn-sm px-5 gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/vendor-portal/dashboard"
              className="btn btn-primary btn-sm px-6 text-white font-semibold shadow-md shadow-primary/20 gap-2 w-full sm:w-auto"
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