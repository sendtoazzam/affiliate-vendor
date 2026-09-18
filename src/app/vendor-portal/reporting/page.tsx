'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { ReportingData } from '@/lib/types';
import { exportToXls, ExcelColumn } from '@/lib/export-xls';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Tag,
  RotateCcw,
  Receipt,
  Calendar,
  Layers,
  ArrowDownRight,
  Package,
  Download,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

export default function ReportingPage() {
  const [data, setData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  const fetchReporting = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReporting({
        start_date: dateRange === '7d' ? '7d' : dateRange,
      });
      const repData = res.reporting || res;
      setData(repData);
    } catch (err) {
      console.error('Failed to load reporting data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporting();
  }, [dateRange]);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const summary = {
    gross_merchandise_value: data?.summary?.gross_merchandise_value ?? (data as any)?.gross_sales_gmv ?? 0,
    total_discounts: data?.summary?.total_discounts ?? (data as any)?.discounts_total ?? 0,
    eligible_vouchers: data?.summary?.eligible_vouchers ?? (data as any)?.vouchers_total ?? 0,
    refunds: data?.summary?.refunds ?? (data as any)?.refunds_total ?? 0,
    settled_ncs: data?.summary?.settled_ncs ?? (data as any)?.settled_ncs ?? 0,
    brand_net_payout: data?.summary?.brand_net_payout ?? (data as any)?.brand_payout_amount ?? 0,
    bonus_fund_pool: data?.summary?.bonus_fund_pool ?? (data as any)?.bonus_fund_allocated ?? 0,
    platform_fee: data?.summary?.platform_fee ?? (data as any)?.vfx_platform_fee ?? 0,
  };

  const topProducts = data?.top_products || [];
  const breakdown = data?.breakdown || [];

  const handleExportXls = () => {
    const columns: ExcelColumn[] = [
      { header: 'Metric / Item', key: 'metric', width: 220, type: 'string' },
      { header: 'Amount (MYR)', key: 'amount', width: 140, type: 'currency' },
      { header: 'Description / Formula', key: 'description', width: 280, type: 'string' },
    ];

    const exportData = [
      {
        metric: '1. Gross Sales (GMV)',
        amount: summary.gross_merchandise_value,
        description: 'Total order item merchandise value',
      },
      {
        metric: '2. Member Discounts',
        amount: -summary.total_discounts,
        description: 'Item-level discounts and tier reductions',
      },
      {
        metric: '3. Eligible Vouchers',
        amount: -summary.eligible_vouchers,
        description: 'Pro-rata platform vouchers capped at ≤40%',
      },
      {
        metric: '4. Refunds & Returns',
        amount: -summary.refunds,
        description: 'Returned or cancelled order items',
      },
      {
        metric: '5. Settled NCS',
        amount: summary.settled_ncs,
        description: 'Net Commissionable Sales basis for payout',
      },
      {
        metric: '6. Net Brand Payout',
        amount: summary.brand_net_payout,
        description: 'Settlement earnings paid to vendor brand',
      },
      {
        metric: '7. Affiliate Bonus Pool',
        amount: summary.bonus_fund_pool,
        description: 'Allocated to affiliate distribution pool',
      },
      {
        metric: '8. VAMOFLEX Fee (15%)',
        amount: summary.platform_fee,
        description: 'Platform infrastructure and logistics fee',
      },
    ];

    exportToXls(
      `Sales_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}`,
      exportData,
      columns,
      'Sales & Settlement'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-primary" />
            <span>Sales & Settlement Report</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Transparent breakdown of Gross Sales, Discounts, Vouchers, Net Commissionable Sales (NCS) & Brand Payout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            className="select select-bordered select-sm text-xs font-semibold"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportXls}
            disabled={loading}
            className="btn btn-primary btn-sm text-white font-medium gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export to XLS</span>
          </button>
        </div>
      </div>

      {/* NCS Waterfall Funnel */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-base-300 pb-4">
            <div>
              <h2 className="font-bold text-base text-base-content">
                Net Commissionable Sales (NCS) Waterfall
              </h2>
              <p className="text-xs text-base-content/60">
                Formula: NCS = Gross GMV − Discounts − Eligible Vouchers (max 40%) − Refunds
              </p>
            </div>
            <span className="badge badge-primary badge-sm font-semibold">Official VAMOFLEX Model</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Gross GMV */}
            <div className="p-4 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                1. Gross Sales (GMV)
              </span>
              <p className="text-xl font-black text-base-content mt-2">
                {formatCurrency(summary.gross_merchandise_value)}
              </p>
              <p className="text-[10px] text-base-content/50 mt-1">Total items order value</p>
            </div>

            {/* 2. Discounts */}
            <div className="p-4 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-error/80">
                2. Member Discounts
              </span>
              <p className="text-xl font-black text-error mt-2">
                -{formatCurrency(summary.total_discounts)}
              </p>
              <p className="text-[10px] text-base-content/50 mt-1">Direct item markdowns</p>
            </div>

            {/* 3. Vouchers */}
            <div className="p-4 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-warning/90">
                3. Eligible Vouchers
              </span>
              <p className="text-xl font-black text-warning-content mt-2">
                -{formatCurrency(summary.eligible_vouchers)}
              </p>
              <p className="text-[10px] text-base-content/50 mt-1">Pro-rata platform vouchers (≤40%)</p>
            </div>

            {/* 4. Refunds */}
            <div className="p-4 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                4. Refunds & Returns
              </span>
              <p className="text-xl font-black text-base-content mt-2">
                -{formatCurrency(summary.refunds)}
              </p>
              <p className="text-[10px] text-base-content/50 mt-1">Returned / cancelled items</p>
            </div>

            {/* 5. Settled NCS */}
            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                5. Settled NCS
              </span>
              <p className="text-xl font-black text-primary mt-2">
                {formatCurrency(summary.settled_ncs)}
              </p>
              <p className="text-[10px] text-primary/80 mt-1">Basis for payout calculation</p>
            </div>
          </div>

          {/* Resulting Payout Breakdown */}
          <div className="p-5 rounded-xl bg-base-200 border border-base-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-success">
                  Your Net Brand Payout
                </span>
                <p className="text-2xl font-black text-success mt-1">
                  {formatCurrency(summary.brand_net_payout)}
                </p>
                <span className="text-xs text-base-content/60">
                  Calculated based on your active settlement tier
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <p className="font-semibold text-base-content/60">Affiliate Bonus Pool</p>
                  <p className="font-bold text-warning-content">{formatCurrency(summary.bonus_fund_pool)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-base-content/60">Platform Fee (15%)</p>
                  <p className="font-bold text-info-content">{formatCurrency(summary.platform_fee)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span>Top Performing Products</span>
            </h3>
            <Link
              href="/vendor-portal/insights/performance-report"
              className="btn btn-ghost btn-xs text-primary font-semibold gap-1"
            >
              <span>View Full Product Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/60 text-base-content/70">
                  <th>Product</th>
                  <th>SKU</th>
                  <th className="text-right">Units Fulfilled</th>
                  <th className="text-right">Gross GMV (MYR)</th>
                  <th className="text-right">Settled NCS (MYR)</th>
                  <th className="text-right font-bold text-success">Net Brand Payout</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-base-content/50">
                      No sales data available for this timeframe.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((item, idx) => (
                    <tr key={idx} className="hover">
                      <td className="font-semibold text-base-content">{item.name}</td>
                      <td className="font-mono text-base-content/70">{item.sku || '—'}</td>
                      <td className="text-right font-semibold">{item.units_sold}</td>
                      <td className="text-right">{formatCurrency(item.gross_revenue)}</td>
                      <td className="text-right font-bold text-primary">
                        {formatCurrency(item.ncs_contribution)}
                      </td>
                      <td className="text-right font-bold text-success">
                        {formatCurrency(item.brand_payout || item.ncs_contribution * 0.5)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

