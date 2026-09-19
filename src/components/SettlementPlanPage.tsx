'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SettlementClass } from '@/lib/types';
import {
  Layers,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  Send,
  Receipt,
  ArrowRight,
  ShieldCheck,
  History,
  Lock,
} from 'lucide-react';

export default function SettlementPlanPage() {
  const { brand, refreshBrand, vendorConfig, hasPermission } = useAuth();

  const [pendingChange, setPendingChange] = useState<any | null>(null);
  const [loadingChange, setLoadingChange] = useState(true);
  const [requestedClass, setRequestedClass] = useState<SettlementClass>('kelas_b');
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const fetchClassChangeStatus = async () => {
    try {
      setLoadingChange(true);
      const res = await vendorApi.getClassChangeStatus();
      const historyList = res.history || res.data || [];
      const historyArr = Array.isArray(historyList) ? historyList : [];

      const pending = historyArr.find((h: any) => h.status === 'pending');
      setPendingChange(pending || res.pending_request || res.request || null);
    } catch (err) {
      console.error('Failed to load class change status', err);
    } finally {
      setLoadingChange(false);
    }
  };

  const currentBrandClass = (brand?.current_class ||
    brand?.settlement_class ||
    'kelas_b') as SettlementClass;

  useEffect(() => {
    fetchClassChangeStatus();
  }, []);

  useEffect(() => {
    if (brand) {
      const cls = (brand.current_class ||
        brand.settlement_class ||
        'kelas_b') as SettlementClass;
      setRequestedClass(cls);
    }
  }, [brand]);

  const hasPendingRequest = Boolean(
    pendingChange && pendingChange.status === 'pending'
  );

  const isPlanChangeAllowed =
    vendorConfig?.allow_plan_change !== false &&
    hasPermission('vendor.settlement_plan.apply');

  const getClassName = (cls?: string) => {
    switch (cls) {
      case 'kelas_a':
        return 'Kelas A (45% Brand Share)';
      case 'kelas_c':
        return 'Kelas C (55% Brand Share)';
      case 'kelas_b':
      default:
        return 'Kelas B (50% Brand Share)';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleClassChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (hasPendingRequest) {
      setChangeError(
        'You already have a pending change request under review. New submissions are locked until the review completes.'
      );
      return;
    }

    if (!agreedToTerms) {
      setChangeError(
        'Please read and agree to the Terms & Conditions before submitting your application.'
      );
      return;
    }

    if (requestedClass === currentBrandClass) {
      setChangeError(
        `Your brand is already on ${requestedClass.replace('_', ' ').toUpperCase()}.`
      );
      return;
    }

    try {
      setSubmittingChange(true);
      await vendorApi.submitClassChange({
        requested_class: requestedClass,
        reason: changeReason,
      });
      setChangeSuccess(
        'Your settlement class change application was submitted successfully. Once approved by admin, it will take effect on the next weekly payment cycle.'
      );
      setChangeReason('');
      setAgreedToTerms(false);
      fetchClassChangeStatus();
      refreshBrand();
    } catch (err: any) {
      console.error('Failed to submit class change', err);
      const data = err.response?.data;
      let errorMsg = data?.message || err.message || 'Failed to submit class change application.';
      if (data?.errors && typeof data.errors === 'object') {
        const errorList = Object.values(data.errors).flat().join(' ');
        if (errorList) errorMsg = errorList;
      }
      setChangeError(errorMsg);
    } finally {
      setSubmittingChange(false);
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const plans = [
    {
      id: 'kelas_a',
      name: 'Kelas A',
      brandShare: 45,
      bonusFund: 40,
      platformFee: 15,
      description:
        'Maximum bonus fund allocation for aggressive affiliate distribution and fast product velocity.',
      isRecommended: false,
    },
    {
      id: 'kelas_b',
      name: 'Kelas B',
      brandShare: 50,
      bonusFund: 35,
      platformFee: 15,
      description:
        'Balanced 50/50 split between brand net margin and affiliate network growth.',
      isRecommended: true,
    },
    {
      id: 'kelas_c',
      name: 'Kelas C',
      brandShare: 55,
      bonusFund: 30,
      platformFee: 15,
      description:
        'Higher direct brand margin with solid core affiliate commission rewards.',
      isRecommended: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            <span>Settlement Plan & Tier Adjustment</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Review your net settlement tier percentage and apply for tier adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-base-100 p-2 px-3 rounded-xl border border-base-300">
            <span className="text-xs font-semibold text-base-content/70">
              Current Active Plan:
            </span>
            <span className="badge badge-primary badge-md font-bold uppercase">
              {currentBrandClass.replace('_', ' ')} (
              {brand?.brand_share_percentage ||
                (currentBrandClass === 'kelas_a' ? 45 : currentBrandClass === 'kelas_c' ? 55 : 50)}
              % Net Share)
            </span>
          </div>

          <Link
            href="/vendor-portal/commerce-hub/history"
            className="btn btn-outline btn-sm gap-1.5 text-xs font-semibold"
          >
            <History className="w-3.5 h-3.5" />
            <span>View History</span>
          </Link>
        </div>
      </div>

      {/* Pending Request Banner */}
      {hasPendingRequest && (
        <div className="card bg-warning/10 border-2 border-warning/30 shadow-sm">
          <div className="card-body p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warning/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning-content flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content flex items-center gap-2 flex-wrap">
                    <span>Class Change Application Under Review</span>
                    <span className="badge badge-warning badge-sm font-bold text-[10px] uppercase">
                      Pending Review
                    </span>
                  </h3>
                  <p className="text-xs text-base-content/70">
                    Application is currently being verified by VAMOFLEX Merchant Operations.
                  </p>
                </div>
              </div>
              <div className="text-xs text-base-content/60 font-medium">
                Submitted on:{' '}
                <strong className="text-base-content">
                  {formatDateTime(pendingChange.created_at)}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-base-100/90 p-3 rounded-xl border border-base-300 shadow-sm">
                <span className="text-base-content/60 block text-[11px] font-medium">
                  Requested Settlement Tier
                </span>
                <span className="font-bold text-sm text-primary">
                  {getClassName(pendingChange.requested_class)}
                </span>
              </div>
              <div className="bg-base-100/90 p-3 rounded-xl border border-base-300 shadow-sm">
                <span className="text-base-content/60 block text-[11px] font-medium">
                  Target Effective Date
                </span>
                <span className="font-bold text-sm text-base-content">
                  {pendingChange.effective_date
                    ? formatDate(pendingChange.effective_date)
                    : 'Next Settlement Cycle'}
                </span>
              </div>
              <div className="bg-base-100/90 p-3 rounded-xl border border-base-300 shadow-sm">
                <span className="text-base-content/60 block text-[11px] font-medium">
                  Submission Rationale
                </span>
                <span
                  className="font-medium text-xs text-base-content truncate block"
                  title={pendingChange.reason}
                >
                  {pendingChange.reason || 'No reason provided'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-base-content/70 bg-warning/5 border border-warning/20 rounded-lg p-2.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning shrink-0" />
              <span>
                Your existing settlement tier ({getClassName(pendingChange.current_class || currentBrandClass)}) remains active until this request is approved. While under review, new submissions are locked.
              </span>
            </div>
          </div>
        </div>
      )}

      {changeSuccess && (
        <div className="alert alert-success py-3 px-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{changeSuccess}</span>
        </div>
      )}

      {changeError && (
        <div className="alert alert-error py-3 px-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{changeError}</span>
        </div>
      )}

      {/* 3 Plans Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => {
          const isCurrent = currentBrandClass === p.id;
          const isPendingTarget =
            pendingChange?.status === 'pending' &&
            pendingChange?.requested_class === p.id;
          const isSelected = requestedClass === p.id;

          return (
            <div
              key={p.id}
              onClick={() => {
                if (!hasPendingRequest) {
                  setRequestedClass(p.id as SettlementClass);
                }
              }}
              className={`rounded-2xl p-5 border-2 transition-all duration-200 relative flex flex-col justify-between ${
                hasPendingRequest
                  ? isPendingTarget
                    ? 'border-warning ring-2 ring-warning/40 bg-warning/[0.04] shadow-md'
                    : isCurrent
                    ? 'border-primary/50 bg-base-100'
                    : 'border-base-300 bg-base-100 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-md -translate-y-0.5 cursor-pointer'
                  : 'border-base-300 bg-base-100 hover:border-base-content/40 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-base-content">
                      {p.name}
                    </h3>
                    {isCurrent && (
                      <span className="badge badge-neutral text-[10px] font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPendingTarget && (
                      <span className="badge badge-warning text-warning-content font-bold text-[10px] flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3" />
                        Requested
                      </span>
                    )}
                    {p.isRecommended && (
                      <span className="badge badge-warning text-warning-content font-bold text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </span>
                    )}
                    {!hasPendingRequest && isSelected && (
                      <span className="badge badge-primary text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" />
                        Selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary">
                      {p.brandShare}%
                    </span>
                    <span className="text-xs text-base-content/60 font-semibold">
                      Brand Net Payout
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-base-300/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">
                      Brand Net Share:
                    </span>
                    <span className="font-bold text-primary">
                      {p.brandShare}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">
                      Affiliate Bonus Fund:
                    </span>
                    <span className="font-bold text-base-content">
                      {p.bonusFund}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-error">
                      Platform Ops & Tech:
                    </span>
                    <span className="font-black text-error">
                      {p.platformFee}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-base-300 space-y-3">
                <div className="text-[11px] text-center font-semibold text-base-content/70">
                  RM100k NCS ={' '}
                  <strong className="text-success">
                    {formatCurrency(100000 * (p.brandShare / 100))}
                  </strong>{' '}
                  Net Payout
                </div>
                <button
                  type="button"
                  disabled={hasPendingRequest || !isPlanChangeAllowed}
                  className={`btn btn-sm w-full text-xs font-bold gap-1.5 transition-all ${
                    isPendingTarget
                      ? 'btn-warning text-warning-content shadow-sm'
                      : isCurrent
                      ? 'btn-neutral text-white/90'
                      : isSelected
                      ? 'btn-primary text-white shadow-sm'
                      : 'btn-outline border-base-300 text-base-content/70 hover:btn-primary'
                  }`}
                >
                  {isPendingTarget ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Application</span>
                    </>
                  ) : isCurrent ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Current Active Plan</span>
                    </>
                  ) : isSelected ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Selected for Application</span>
                    </>
                  ) : (
                    <span>Select {p.name}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Change Application Form */}
      <div className="card bg-base-100 border border-base-300 shadow-sm relative overflow-hidden">
        {!isPlanChangeAllowed && (
          <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-base-100/85 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-3 border border-error/20 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-base-content tracking-tight">
              Access Restricted
            </h4>
            <p className="text-xs text-base-content/70 mt-1 max-w-sm">
              Module is not available for the time being
            </p>
          </div>
        )}
        <div className="card-body p-6">
          <form onSubmit={handleClassChangeSubmit} className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-base-content">
                Submit Class Change Application
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Select your desired settlement tier and provide brief rationale for verification.
              </p>
            </div>

            {hasPendingRequest ? (
              <div className="alert alert-warning py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 border border-warning/30">
                <Clock className="w-4 h-4 text-warning shrink-0" />
                <span>
                  You have a pending application to change to{' '}
                  <strong>{getClassName(pendingChange?.requested_class)}</strong>. New submissions are disabled while this request is under review.
                </span>
              </div>
            ) : requestedClass === currentBrandClass ? (
              <div className="alert alert-warning py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 border border-warning/30">
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <span>
                  <strong>
                    {plans.find((p) => p.id === currentBrandClass)?.name || 'Kelas B'}
                  </strong>{' '}
                  is your brand's currently active settlement plan. Please select a different tier above to submit a change application.
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">
                    Target Settlement Class
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full text-xs font-semibold"
                  value={requestedClass}
                  disabled={hasPendingRequest}
                  onChange={(e) => setRequestedClass(e.target.value as SettlementClass)}
                >
                  <option value="kelas_a">
                    Kelas A (45% Brand | 40% Bonus | 15% Platform)
                  </option>
                  <option value="kelas_b">
                    Kelas B (50% Brand | 35% Bonus | 15% Platform) - Recommended
                  </option>
                  <option value="kelas_c">
                    Kelas C (55% Brand | 30% Bonus | 15% Platform)
                  </option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">
                    Reason / Growth Plan
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Scaling campaign volume with adjusted margin..."
                  className="input input-bordered input-sm w-full text-xs"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  disabled={hasPendingRequest || requestedClass === currentBrandClass}
                />
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border select-none transition-all ${
                  hasPendingRequest || requestedClass === currentBrandClass
                    ? 'bg-base-200/30 border-base-200 opacity-60 cursor-not-allowed'
                    : 'bg-base-200/50 border-base-300 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={hasPendingRequest || requestedClass === currentBrandClass}
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                />
                <span className="text-xs text-base-content/80 leading-relaxed">
                  I have reviewed and agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Terms & Conditions for Settlement Plan & Tier Adjustments
                  </button>
                  .
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-base-200">
              <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  Policy: If approved, the new rate takes effect on{' '}
                  <strong>next Wednesday's payment cycle</strong> covering the active Sunday cutoff.
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  hasPendingRequest ||
                  !agreedToTerms ||
                  submittingChange ||
                  requestedClass === currentBrandClass
                }
                className="btn btn-primary btn-sm text-white gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingChange ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {hasPendingRequest
                    ? 'Application Pending Review'
                    : requestedClass === currentBrandClass
                    ? 'Current Plan Active'
                    : 'Submit Application'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/vendor-portal/commerce-hub/history"
          className="p-5 bg-base-100 rounded-2xl border border-base-300 text-xs flex items-center justify-between gap-3 hover:border-primary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Change Request History & Records
              </h4>
              <p className="text-base-content/60 text-[11px]">
                Inspect status and administrative remarks of all past applications.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/vendor-portal/accounting"
          className="p-5 bg-base-100 rounded-2xl border border-base-300 text-xs flex items-center justify-between gap-3 hover:border-primary/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Weekly Accounting Statements
              </h4>
              <p className="text-base-content/60 text-[11px]">
                Inspect finalized weekly tax invoices and bank remittance details.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsTermsModalOpen(false)}
        >
          <div
            className="card w-full max-w-2xl bg-base-100 border border-base-300 p-6 space-y-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-base-content">
                  Terms & Conditions: Settlement Plan Adjustment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-base-content/80 max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 bg-base-200/70 rounded-xl space-y-1">
                <h4 className="font-bold text-base-content">
                  1. Weekly Cutoff & Effective Schedule
                </h4>
                <p className="leading-relaxed">
                  Submitted tier changes do not take effect immediately upon submission. Upon review and approval by VAMOFLEX Merchant Operations, the approved rate applies starting from the subsequent weekly settlement cycle (Sunday 11:59 PM cutoff).
                </p>
              </div>

              <div className="p-3 bg-base-200/70 rounded-xl space-y-1">
                <h4 className="font-bold text-base-content">
                  2. Non-Retroactive Principle
                </h4>
                <p className="leading-relaxed">
                  Orders fulfilled and recorded prior to the effective cycle date will strictly remain settled under the previously active rate tier. Retroactive recalculation of past statements is not supported.
                </p>
              </div>

              <div className="p-3 bg-base-200/70 rounded-xl space-y-1">
                <h4 className="font-bold text-base-content">
                  3. Affiliate Promotion & Commission Allocation
                </h4>
                <p className="leading-relaxed">
                  Settlement classes balance direct brand share with affiliate rewards. Choosing a higher brand share tier (e.g. Kelas C at 55%) reduces the affiliate bonus pool (to 30%), which may affect affiliate campaign promotion velocity across the network.
                </p>
              </div>

              <div className="p-3 bg-base-200/70 rounded-xl space-y-1">
                <h4 className="font-bold text-base-content">
                  4. Minimum Evaluation Period
                </h4>
                <p className="leading-relaxed">
                  Approved tier changes observe a minimum 30-day evaluation period. Subsequent upgrade or downgrade applications during this window are subject to additional account manager review.
                </p>
              </div>

              <div className="p-3 bg-base-200/70 rounded-xl space-y-1">
                <h4 className="font-bold text-base-content">
                  5. Net Cleared Sales (NCS) Accounting
                </h4>
                <p className="leading-relaxed">
                  Net Brand Payout continues to be disbursed according to the standard marketplace formula: <code>Gross Sales − Member Discounts − Eligible Platform Vouchers (pro-rata cap 40%) − Approved Customer Returns/Refunds</code>.
                </p>
              </div>
            </div>

            <div className="border-t border-base-200 pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="btn btn-ghost btn-sm text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setIsTermsModalOpen(false);
                }}
                className="btn btn-primary btn-sm text-white text-xs font-semibold gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Understand & Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
