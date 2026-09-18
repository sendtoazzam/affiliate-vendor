'use client';

import React, { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SettlementStatement, ClassChangeRequest, SettlementClass } from '@/lib/types';
import {
  Receipt,
  Download,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  Send
} from 'lucide-react';

export default function AccountingPage() {
  const { brand, refreshBrand } = useAuth();

  const [statements, setStatements] = useState<SettlementStatement[]>([]);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState<SettlementStatement | null>(null);

  // Class change
  const [pendingChange, setPendingChange] = useState<ClassChangeRequest | null>(null);
  const [loadingChange, setLoadingChange] = useState(true);
  const [requestedClass, setRequestedClass] = useState<SettlementClass>('kelas_b');
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);

  const fetchStatements = async () => {
    try {
      setLoadingStatements(true);
      const res = await vendorApi.getStatements();
      const list = res.data || res.statements || res || [];
      setStatements(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load statements', err);
    } finally {
      setLoadingStatements(false);
    }
  };

  const fetchClassChangeStatus = async () => {
    try {
      setLoadingChange(true);
      const res = await vendorApi.getClassChangeStatus();
      if (res.pending_request || res.request) {
        setPendingChange(res.pending_request || res.request);
      }
    } catch (err) {
      console.error('Failed to load class change status', err);
    } finally {
      setLoadingChange(false);
    }
  };

  useEffect(() => {
    fetchStatements();
    fetchClassChangeStatus();
  }, []);

  const handleClassChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (requestedClass === brand?.settlement_class) {
      setChangeError(`Your brand is already on ${requestedClass.replace('_', ' ').toUpperCase()}.`);
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
      fetchClassChangeStatus();
      refreshBrand();
    } catch (err: any) {
      console.error('Failed to submit class change', err);
      setChangeError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit class change application.'
      );
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
      description: 'Maximum bonus fund allocation for aggressive affiliate distribution.',
      isRecommended: false,
    },
    {
      id: 'kelas_b',
      name: 'Kelas B',
      brandShare: 50,
      bonusFund: 35,
      platformFee: 15,
      description: 'Balanced 50/50 split between brand net margin and network growth.',
      isRecommended: true,
    },
    {
      id: 'kelas_c',
      name: 'Kelas C',
      brandShare: 55,
      bonusFund: 30,
      platformFee: 15,
      description: 'Higher direct brand margin with core affiliate bonus rewards.',
      isRecommended: false,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          <span>Accounting, Statements & Payouts</span>
        </h1>
        <p className="text-sm text-base-content/60 mt-0.5">
          Access your finalized weekly settlement tax invoices and manage your settlement plan tier.
        </p>
      </div>

      {/* Weekly Statements List */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Weekly Settlement Statements</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Generated every Wednesday covering Sunday 11:59 PM weekly cutoffs.
              </p>
            </div>
            <button
              onClick={fetchStatements}
              className="btn btn-outline btn-xs gap-1"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/60 text-base-content/70">
                  <th>Statement #</th>
                  <th>Cycle Period</th>
                  <th>Payout Date</th>
                  <th>Plan Tier</th>
                  <th className="text-right">Settled NCS</th>
                  <th className="text-right">Brand Net Payout</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingStatements ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <p className="text-xs text-base-content/60 mt-2">Loading statements...</p>
                    </td>
                  </tr>
                ) : statements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-base-content/50">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-sm text-base-content">No settlement statements yet</p>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        Statements will appear here automatically on Wednesday after your first sales cycle cutoff.
                      </p>
                    </td>
                  </tr>
                ) : (
                  statements.map((st) => (
                    <tr key={st.id} className="hover">
                      <td className="font-mono font-bold text-primary">
                        {st.statement_number}
                      </td>
                      <td>
                        <div className="font-medium text-base-content">
                          {st.cycle_name || 'Weekly Cycle'}
                        </div>
                        <span className="text-[10px] text-base-content/50">
                          {st.cycle_start_date} to {st.cycle_end_date}
                        </span>
                      </td>
                      <td className="font-medium">{st.payout_date}</td>
                      <td>
                        <span className="badge badge-sm badge-ghost font-semibold uppercase">
                          {st.settlement_class?.replace('_', ' ')} ({st.brand_share_percentage}%)
                        </span>
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(st.settled_ncs)}
                      </td>
                      <td className="text-right font-black text-success">
                        {formatCurrency(st.brand_net_payout)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold capitalize ${
                            st.status === 'paid'
                              ? 'badge-success text-white'
                              : st.status === 'approved'
                              ? 'badge-info text-white'
                              : 'badge-warning'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setSelectedStatement(st)}
                          className="btn btn-primary btn-xs text-white gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Class Change Section */}
      <div id="change-class" className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-base-300 pb-4">
            <div>
              <h2 className="font-bold text-lg text-base-content flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>Settlement Plan & Class Change Application</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Choose the net settlement tier that matches your brand distribution economics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-base-content/70">Current Active Plan:</span>
              <span className="badge badge-primary badge-md font-bold uppercase">
                {brand?.settlement_class?.replace('_', ' ') || 'Kelas B'} ({brand?.brand_share_percentage || 50}%)
              </span>
            </div>
          </div>

          {/* Pending Request Alert */}
          {pendingChange && pendingChange.status === 'pending' && (
            <div className="alert alert-info py-3 px-4 rounded-xl text-xs flex items-center gap-3">
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <strong className="font-bold">Change Application Pending Review:</strong> You have requested to change to{' '}
                <span className="font-bold">{pendingChange.requested_class_name}</span>. Upon admin approval, it will take effect starting on next Wednesday's settlement cycle.
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
                    isCurrent
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                      : isSelected
                      ? 'border-primary/60 bg-base-200'
                      : 'border-base-300 bg-base-100 hover:border-base-content/30'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg text-base-content">{p.name}</h3>
                      {p.isRecommended && (
                        <span className="badge badge-warning text-warning-content font-bold text-[10px] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                      {isCurrent && (
                        <span className="badge badge-primary font-bold text-[10px]">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-primary">{p.brandShare}%</span>
                        <span className="text-xs text-base-content/60 font-semibold">Brand Net Payout</span>
                      </div>
                      <p className="text-xs text-base-content/70 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-base-300/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Brand Share:</span>
                        <span className="font-bold text-primary">{p.brandShare}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Bonus Fund:</span>
                        <span className="font-bold text-warning-content">{p.bonusFund}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Platform Fee:</span>
                        <span className="font-bold text-info-content">{p.platformFee}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-base-300">
                    <div className="text-[11px] text-center font-semibold text-base-content/70">
                      RM100k NCS = <strong className="text-success">{formatCurrency(100000 * (p.brandShare / 100))}</strong> Net Payout
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Change Application Form */}
          <form onSubmit={handleClassChangeSubmit} className="p-5 rounded-2xl bg-base-200 border border-base-300 space-y-4">
            <h3 className="font-bold text-sm text-base-content">
              Submit Class Change Application
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Target Settlement Class</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full text-xs font-semibold"
                  value={requestedClass}
                  onChange={(e) => setRequestedClass(e.target.value as SettlementClass)}
                >
                  <option value="kelas_a">Kelas A (45% Brand | 40% Bonus | 15% Platform)</option>
                  <option value="kelas_b">Kelas B (50% Brand | 35% Bonus | 15% Platform) - Recommended</option>
                  <option value="kelas_c">Kelas C (55% Brand | 30% Bonus | 15% Platform)</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Reason / Growth Plan</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Scaling campaign volume with adjusted margin..."
                  className="input input-bordered input-sm w-full text-xs"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  Policy: If changed today, the new rate will take effect on <strong>next Wednesday's payment cycle</strong> after admin approval.
                </span>
              </div>

              <button
                type="submit"
                disabled={submittingChange || requestedClass === brand?.settlement_class}
                className="btn btn-primary btn-sm text-white gap-2"
              >
                {submittingChange ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Application</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Statement / Tax Invoice Detail Modal */}
      {selectedStatement && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100 border border-base-300 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-base-300 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">VAMOFLEX Marketplace Tax Invoice</span>
                <h3 className="text-xl font-black text-base-content">{selectedStatement.statement_number}</h3>
              </div>
              <button
                onClick={() => setSelectedStatement(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-base-content/50 font-medium">Brand Partner:</span>
                <p className="font-bold text-sm text-base-content">{brand?.name || 'Partner Brand'}</p>
                <p className="text-base-content/70 font-mono mt-0.5">Bank: {brand?.bank_name || 'Maybank'} - {brand?.bank_account_no || '***'}</p>
              </div>
              <div className="text-right">
                <span className="text-base-content/50 font-medium">Cycle Period:</span>
                <p className="font-bold text-base-content">{selectedStatement.cycle_start_date} to {selectedStatement.cycle_end_date}</p>
                <p className="text-primary font-bold mt-0.5">Payout Date: {selectedStatement.payout_date}</p>
              </div>
            </div>

            <div className="rounded-xl bg-base-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Gross Merchandise Value (GMV):</span>
                <span className="font-semibold">{formatCurrency(selectedStatement.gross_merchandise_value)}</span>
              </div>
              <div className="flex justify-between text-error">
                <span>Member Discounts:</span>
                <span>-{formatCurrency(selectedStatement.total_discounts)}</span>
              </div>
              <div className="flex justify-between text-warning-content">
                <span>Eligible Vouchers (pro-rata, max 40%):</span>
                <span>-{formatCurrency(selectedStatement.eligible_vouchers)}</span>
              </div>
              <div className="flex justify-between text-base-content/70">
                <span>Refunds / Returns:</span>
                <span>-{formatCurrency(selectedStatement.refunds_deductions)}</span>
              </div>
              <div className="divider my-1"></div>
              <div className="flex justify-between font-bold text-sm text-primary">
                <span>Settled NCS:</span>
                <span>{formatCurrency(selectedStatement.settled_ncs)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-success uppercase tracking-wider">
                  Final Net Brand Payout ({selectedStatement.brand_share_percentage}%)
                </span>
                <p className="text-2xl font-black text-success mt-0.5">
                  {formatCurrency(selectedStatement.brand_net_payout)}
                </p>
              </div>
              <span className="badge badge-success text-white font-bold capitalize">
                {selectedStatement.status}
              </span>
            </div>

            <div className="modal-action">
              <button
                onClick={() => window.print()}
                className="btn btn-outline btn-sm gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setSelectedStatement(null)}
                className="btn btn-primary btn-sm text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
