'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { ProductPerformanceItem, ReportingData } from '@/lib/types';
import {
  TrendingUp,
  Package,
  Boxes,
  DollarSign,
  BarChart3,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';

export default function ProductPerformancePage() {
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReporting({
        start_date: dateRange === '7d' ? '7d' : dateRange,
      });
      const data: ReportingData = res.reporting || res;
      setReportingData(data);
    } catch (err) {
      console.error('Failed to load product performance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [dateRange]);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const products: ProductPerformanceItem[] = useMemo(() => {
    if (!reportingData?.products && !reportingData?.top_products) return [];

    if (reportingData.products && reportingData.products.length > 0) {
      return reportingData.products;
    }

    return (reportingData.top_products || []).map((tp, idx) => ({
      id: tp.id || idx,
      uuid: String(tp.id || idx),
      name: tp.name,
      sku: tp.sku,
      category: 'Catalog Item',
      stock_quantity: 50,
      is_active: true,
      retail_price: tp.gross_revenue / Math.max(1, tp.units_sold),
      units_sold: tp.units_sold,
      gross_revenue: tp.gross_revenue,
      discounts: 0,
      vouchers: 0,
      refunds: 0,
      ncs_contribution: tp.ncs_contribution,
      brand_payout: tp.brand_payout || tp.ncs_contribution * 0.5,
    }));
  }, [reportingData]);

  // Aggregate totals
  const totalUnitsSold = useMemo(
    () => products.reduce((acc, p) => acc + (p.units_sold || 0), 0),
    [products]
  );
  const totalGrossRevenue = useMemo(
    () => products.reduce((acc, p) => acc + (p.gross_revenue || 0), 0),
    [products]
  );
  const totalSettledNcs = useMemo(
    () => products.reduce((acc, p) => acc + (p.ncs_contribution || 0), 0),
    [products]
  );
  const totalBrandPayout = useMemo(
    () => products.reduce((acc, p) => acc + (p.brand_payout || 0), 0),
    [products]
  );

  const rankedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => (b.ncs_contribution || 0) - (a.ncs_contribution || 0)
    );
  }, [products]);

  const maxNcs = useMemo(() => {
    const highest = Math.max(
      ...products.map((p) => p.ncs_contribution || 0),
      1
    );
    return highest;
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>Product NCS Contribution Leaderboard</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Real-time rankings and Net Commissionable Sales (NCS) performance of your catalog items.
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

          <Link
            href="/vendor-portal/catalog/breakdown"
            className="btn btn-outline btn-primary btn-sm gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Catalog Breakdown</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Active Products
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-base-content mt-2">
            {products.length}
          </p>
          <span className="text-[11px] text-base-content/50 mt-1">Catalog items listed</span>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Units Fulfilled
            </span>
            <div className="p-2 rounded-lg bg-info/10 text-info">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-base-content mt-2">
            {totalUnitsSold.toLocaleString()}
          </p>
          <span className="text-[11px] text-base-content/50 mt-1">Items dispatched</span>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Settled NCS
            </span>
            <div className="p-2 rounded-lg bg-warning/10 text-warning-content">
              <Sparkles className="w-4 h-4 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-black text-primary mt-2">
            {formatCurrency(totalSettledNcs)}
          </p>
          <span className="text-[11px] text-base-content/50 mt-1">Net Commissionable Base</span>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-success">
              Net Brand Payout
            </span>
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-success mt-2">
            {formatCurrency(totalBrandPayout)}
          </p>
          <span className="text-[11px] text-base-content/50 mt-1">Your settlement earnings</span>
        </div>
      </div>

      {/* Visual Performance Leaderboard Chart */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-base-300 pb-3">
            <div>
              <h2 className="font-bold text-base text-base-content flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>NCS Contribution Leaderboard</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Visualizing top revenue & NCS generating items across your catalog.
              </p>
            </div>
            <span className="badge badge-primary badge-outline text-[11px] font-semibold">
              Top 10 Performers
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : rankedProducts.length === 0 ? (
            <div className="text-center py-8 text-xs text-base-content/50">
              No product analytics available for this timeframe.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {rankedProducts.slice(0, 10).map((p, idx) => {
                const pct = Math.max(5, Math.round(((p.ncs_contribution || 0) / maxNcs) * 100));
                const shareOfTotal = totalSettledNcs > 0
                  ? Math.round(((p.ncs_contribution || 0) / totalSettledNcs) * 100)
                  : 0;

                return (
                  <div key={p.id || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md font-bold flex items-center justify-center text-[11px] ${
                            idx === 0
                              ? 'bg-amber-400/20 text-amber-600 font-black'
                              : idx === 1
                              ? 'bg-slate-300/30 text-slate-600 font-black'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-800 font-black'
                              : 'bg-base-200 text-base-content/70'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-base-content">{p.name}</span>
                        {p.sku && (
                          <span className="text-[10px] font-mono text-base-content/50">
                            ({p.sku})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-semibold">
                        <span className="text-base-content/60">{p.units_sold} units</span>
                        <span className="badge badge-ghost badge-xs text-[10px] text-base-content/60">
                          {shareOfTotal}% share
                        </span>
                        <span className="text-primary font-bold">{formatCurrency(p.ncs_contribution)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Rankings Table with Navigation to Breakdown */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-100">
            <div>
              <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Leaderboard Rankings</span>
              </h3>
              <p className="text-xs text-base-content/50 mt-0.5">
                Top revenue contributors and their impact on net earnings.
              </p>
            </div>
            <Link
              href="/vendor-portal/catalog/breakdown"
              className="btn btn-ghost btn-xs text-primary gap-1 font-semibold hover:bg-primary/10"
            >
              <span>View Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/70 text-base-content/70">
                  <th className="w-12 text-center">Rank</th>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th className="text-right">Units Sold</th>
                  <th className="text-right">Gross GMV</th>
                  <th className="text-right">Settled NCS</th>
                  <th className="text-right font-bold text-success">Net Brand Payout</th>
                  <th className="text-right">NCS Share</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </td>
                  </tr>
                ) : rankedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-base-content/50">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  rankedProducts.slice(0, 10).map((item, idx) => {
                    const share = totalSettledNcs > 0
                      ? ((item.ncs_contribution / totalSettledNcs) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={item.id || idx} className="hover">
                        <td className="text-center font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950 font-black'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800 font-bold'
                                : idx === 2
                                ? 'bg-amber-700/30 text-amber-900 font-bold'
                                : 'text-base-content/60'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <div>
                            <p className="font-bold text-base-content line-clamp-1">
                              {item.name}
                            </p>
                            <span className="badge badge-ghost badge-xs text-[10px] text-base-content/60 mt-0.5">
                              {item.category || 'General'}
                            </span>
                          </div>
                        </td>
                        <td className="font-mono text-base-content/70">{item.sku || '—'}</td>
                        <td className="text-right font-bold text-base-content">
                          {item.units_sold.toLocaleString()}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(item.gross_revenue)}
                        </td>
                        <td className="text-right font-bold text-primary">
                          {formatCurrency(item.ncs_contribution)}
                        </td>
                        <td className="text-right font-black text-success">
                          {formatCurrency(item.brand_payout)}
                        </td>
                        <td className="text-right font-semibold text-base-content/80">
                          {share}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-base-300 bg-base-100 flex items-center justify-between">
            <span className="text-xs text-base-content/60">
              Showing top {Math.min(10, rankedProducts.length)} of {rankedProducts.length} items
            </span>
            <Link
              href="/vendor-portal/catalog/breakdown"
              className="btn btn-primary btn-sm text-white gap-2"
            >
              <span>Explore Complete Catalog Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
