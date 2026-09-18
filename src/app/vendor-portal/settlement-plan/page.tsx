"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { vendorApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ClassChangeRequest, SettlementClass } from "@/lib/types";
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
  Percent,
} from "lucide-react";

export default function SettlementPlanPage() {
  const { brand, refreshBrand } = useAuth();

  const [pendingChange, setPendingChange] = useState<ClassChangeRequest | null>(
    null,
  );
  const [loadingChange, setLoadingChange] = useState(true);
  const [requestedClass, setRequestedClass] =
    useState<SettlementClass>("kelas_b");
  const [changeReason, setChangeReason] = useState("");
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
      const pending = Array.isArray(historyList)
        ? historyList.find((h: any) => h.status === "pending")
        : null;
      setPendingChange(pending || res.pending_request || res.request || null);
    } catch (err) {
      console.error("Failed to load class change status", err);
    } finally {
      setLoadingChange(false);
    }
  };

  useEffect(() => {
    fetchClassChangeStatus();
  }, []);

  useEffect(() => {
    if (brand?.settlement_class) {
      setRequestedClass(brand.settlement_class as SettlementClass);
    }
  }, [brand]);

  const handleClassChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (!agreedToTerms) {
      setChangeError(
        "Please read and agree to the Terms & Conditions before submitting your application."
      );
      return;
    }

    if (requestedClass === brand?.settlement_class) {
      setChangeError(
        `Your brand is already on ${requestedClass.replace("_", " ").toUpperCase()}.`
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
        "Your settlement class change application was submitted successfully. Once approved by admin, it will take effect on the next weekly payment cycle."
      );
      setChangeReason("");
      setAgreedToTerms(false);
      fetchClassChangeStatus();
      refreshBrand();
    } catch (err: any) {
      console.error("Failed to submit class change", err);
      setChangeError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit class change application."
      );
    } finally {
      setSubmittingChange(false);
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const plans = [
    {
      id: "kelas_a",
      name: "Kelas A",
      brandShare: 45,
      bonusFund: 40,
      platformFee: 15,
      description:
        "Maximum bonus fund allocation for aggressive affiliate distribution and fast product velocity.",
      isRecommended: false,
    },
    {
      id: "kelas_b",
      name: "Kelas B",
      brandShare: 50,
      bonusFund: 35,
      platformFee: 15,
      description:
        "Balanced 50/50 split between brand net margin and affiliate network growth.",
      isRecommended: true,
    },
    {
      id: "kelas_c",
      name: "Kelas C",
      brandShare: 55,
      bonusFund: 30,
      platformFee: 15,
      description:
        "Higher direct brand margin with solid core affiliate commission rewards.",
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
            <span>Settlement Plan & Class Change</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Review your net settlement tier percentage and apply for settlement
            class adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-base-content/70">
            Current Active Plan:
          </span>
          <span className="badge badge-primary badge-md font-bold uppercase py-2.5 px-3">
            {brand?.settlement_class?.replace("_", " ") || "Kelas B"} (
            {brand?.brand_share_percentage || 50}% Net Share)
          </span>
        </div>
      </div>

      {/* Pending Request Alert */}
      {pendingChange && pendingChange.status === "pending" && (
        <div className="alert alert-info py-3 px-4 rounded-xl text-xs flex items-center gap-3">
          <Clock className="w-5 h-5 shrink-0" />
          <div>
            <strong className="font-bold">
              Change Application Pending Review:
            </strong>{" "}
            You have requested to change to{" "}
            <span className="font-bold">
              {pendingChange.requested_class_name}
            </span>
            . Upon admin approval, it will take effect starting on next
            Wednesday's settlement cycle.
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
          const isCurrent = brand?.settlement_class === p.id;
          const isSelected = requestedClass === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setRequestedClass(p.id as SettlementClass)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-md -translate-y-0.5"
                  : "border-base-300 bg-base-100 hover:border-base-content/40 hover:shadow-sm"
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
                    {p.isRecommended && (
                      <span className="badge badge-warning text-warning-content font-bold text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </span>
                    )}
                    {isSelected && (
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
                  RM100k NCS ={" "}
                  <strong className="text-success">
                    {formatCurrency(100000 * (p.brandShare / 100))}
                  </strong>{" "}
                  Net Payout
                </div>
                <button
                  type="button"
                  className={`btn btn-sm w-full text-xs font-bold gap-1.5 transition-all ${
                    isCurrent
                      ? "btn-neutral text-white/90"
                      : isSelected
                      ? "btn-primary text-white shadow-sm"
                      : "btn-outline border-base-300 text-base-content/70 hover:btn-primary"
                  }`}
                >
                  {isCurrent ? (
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
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <form onSubmit={handleClassChangeSubmit} className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-base-content">
                Submit Class Change Application
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Select your desired settlement tier and provide brief rationale
                for verification.
              </p>
            </div>

            {requestedClass === (brand?.settlement_class || "kelas_b") && (
              <div className="alert alert-warning py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 border border-warning/30">
                <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                <span>
                  <strong>
                    {plans.find((p) => p.id === (brand?.settlement_class || "kelas_b"))?.name || "Kelas B"}
                  </strong>{" "}
                  is your brand's currently active settlement plan. Please select a different tier above to submit a change application.
                </span>
              </div>
            )}

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
                  onChange={(e) =>
                    setRequestedClass(e.target.value as SettlementClass)
                  }
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
                  disabled={requestedClass === (brand?.settlement_class || "kelas_b")}
                />
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border select-none transition-all ${
                  requestedClass === (brand?.settlement_class || "kelas_b")
                    ? "bg-base-200/30 border-base-200 opacity-60 cursor-not-allowed"
                    : "bg-base-200/50 border-base-300 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={requestedClass === (brand?.settlement_class || "kelas_b")}
                  className="checkbox checkbox-primary checkbox-sm mt-0.5"
                />
                <span className="text-xs text-base-content/80 leading-relaxed">
                  I have reviewed and agree to the{" "}
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
                  Policy: If approved, the new rate takes effect on{" "}
                  <strong>next Wednesday's payment cycle</strong> covering the
                  active Sunday cutoff.
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  !agreedToTerms ||
                  submittingChange ||
                  requestedClass === (brand?.settlement_class || "kelas_b")
                }
                className="btn btn-primary btn-sm text-white gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingChange ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {requestedClass === (brand?.settlement_class || "kelas_b")
                    ? "Current Plan Active"
                    : "Submit Application"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cross-link to Accounting */}
      <div className="p-5 bg-base-100 rounded-2xl border border-base-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-base-content">
              Looking for past payout statements?
            </h4>
            <p className="text-base-content/60 text-[11px]">
              Inspect finalized weekly tax invoices and bank remittance details.
            </p>
          </div>
        </div>
        <Link
          href="/vendor-portal/accounting"
          className="btn btn-outline btn-primary btn-sm gap-2 text-xs font-semibold shrink-0"
        >
          <span>View Accounting Statements</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
