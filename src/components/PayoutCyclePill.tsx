'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { vendorApi } from '@/lib/api';
import { SettlementStatement } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function PayoutCyclePill() {
  const { hasPermission } = useAuth();
  const [latestStatement, setLatestStatement] = useState<SettlementStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate day-of-week and dynamic countdown
  const { daysRemaining, isPayoutDay } = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 3 = Wednesday, ..., 6 = Saturday

    // Target payout day is Wednesday (3)
    let diff = (3 - currentDay + 7) % 7;
    const isTodayPayout = diff === 0;

    return {
      daysRemaining: diff,
      isPayoutDay: isTodayPayout,
    };
  }, []);

  // Fetch recent statement status to check if finance has released payout
  useEffect(() => {
    let isMounted = true;

    if (!hasPermission('vendor.accounting.view')) {
      setIsLoading(false);
      return;
    }

    const checkSettlementStatus = async () => {
      try {
        const res = await vendorApi.getStatements({ per_page: 1 });
        const list = res.data || res.statements || (Array.isArray(res) ? res : []);
        if (isMounted && list && list.length > 0) {
          setLatestStatement(list[0]);
        }
      } catch {
        // Silently fallback to standard payout countdown
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSettlementStatus();
    const interval = setInterval(checkSettlementStatus, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Determine if settlement is released / ready
  const isSettlementReady = useMemo(() => {
    if (!latestStatement) return false;

    const status = latestStatement.status?.toLowerCase();
    const isApprovedOrPaid = status === 'approved' || status === 'paid' || status === 'completed';

    if (!isApprovedOrPaid) return false;

    // If today is Wednesday (payout day) or Thursday, or if statement was created recently within 6 days
    const statementDate = new Date(latestStatement.paid_at || latestStatement.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - statementDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return isApprovedOrPaid && (isPayoutDay || diffDays <= 6);
  }, [latestStatement, isPayoutDay]);

  // If settlement is ready and released by finance: Show CTA to Accounting page
  if (isSettlementReady) {
    return (
      <Link
        href="/vendor-portal/accounting"
        className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-emerald-500/20 transition-all duration-200 shadow-sm group"
        title="Payout settlement has been released by finance. Click to view statement."
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
        <span>Payout Settlement Ready</span>
        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    );
  }

  // Formatting countdown text
  const countdownText =
    daysRemaining === 0
      ? 'Today'
      : daysRemaining === 1
      ? '1 day to next payout'
      : `${daysRemaining} days to next payout`;

  return (
    <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-medium transition-all">
      <Calendar className="w-3.5 h-3.5 shrink-0" />
      <span>
        Next Payout: <strong className="font-bold">Wednesday</strong> (Sunday Cutoff • {countdownText})
      </span>
    </div>
  );
}
