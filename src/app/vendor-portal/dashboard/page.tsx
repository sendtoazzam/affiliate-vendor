'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardData, ReportingData } from '@/lib/types';
import ProductSalesLineChart from '@/components/ProductSalesLineChart';
import ProductStockBalanceBarChart from '@/components/ProductStockBalanceBarChart';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Receipt,
  BarChart3,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Boxes,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  CheckCircle2,
  Percent,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { brand } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('now');

  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [dashRes, repRes, prodRes] = await Promise.allSettled([
        vendorApi.getDashboard(),
        vendorApi.getReporting({ start_date: timeRange }),
        vendorApi.getProducts({ per_page: 50 }),
      ]);

      if (dashRes.status === 'fulfilled') {
        setData(dashRes.value?.dashboard || dashRes.value?.data || dashRes.value);
      }

      if (repRes.status === 'fulfilled') {
        const rData = repRes.value?.reporting || repRes.value?.data || repRes.value;
        setReportingData(rData || null);
      }

      if (prodRes.status === 'fulfilled') {
        const pList =
          prodRes.value?.products?.data ||
          prodRes.value?.products ||
          prodRes.value?.data ||
          [];
        setProductsList(Array.isArray(pList) ? pList : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Live Monitoring: auto-refresh metrics every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const handleTimeRangeChange = async (range: string) => {
    setTimeRange(range);
    try {
      setChartLoading(true);
      const repRes = await vendorApi.getReporting({ start_date: range });
      const rData = repRes?.reporting || repRes?.data || repRes;
      if (rData) {
        setReportingData(rData);
      }
    } catch (err) {
      console.error('Failed to reload reporting range', err);
    } finally {
      setChartLoading(false);
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const getKelasInfo = (cls?: string) => {
    switch (cls) {
      case 'kelas_a':
        return {
          name: 'Kelas A',
          share: '45%',
          badge: 'badge-info',
          bg: 'bg-info/10 text-info border-info/20',
        };
      case 'kelas_c':
        return {
          name: 'Kelas C',
          share: '55%',
          badge: 'badge-accent',
          bg: 'bg-accent/10 text-accent border-accent/20',
        };
      case 'kelas_b':
      default:
        return {
          name: 'Kelas B',
          share: '50%',
          badge: 'badge-primary',
          bg: 'bg-primary/10 text-primary border-primary/20',
        };
    }
  };

  const activeClass = brand?.settlement_class || data?.active_class?.code || 'kelas_b';
  const kelasInfo = getKelasInfo(activeClass);

  const reportingSummary = reportingData?.summary;
  const stats = {
    grossSales:
      data?.stats?.gross_sales ?? reportingSummary?.gross_merchandise_value ?? 0,
    settledNcs: data?.stats?.settled_ncs ?? reportingSummary?.settled_ncs ?? 0,
    estimatedPayout:
      data?.stats?.estimated_brand_payout ?? reportingSummary?.brand_net_payout ?? 0,
    itemsSold:
      data?.stats?.total_items_sold ??
      reportingSummary?.items_sold ??
      reportingSummary?.order_count ??
      0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Live Preloader Status Bar */}
      {loading && (
        <div className="w-full bg-base-100 rounded-2xl p-3.5 border border-base-300/80 shadow-sm flex items-center gap-3.5 animate-fade-in">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
          <span className="text-xs font-semibold text-base-content/80">
            Synchronizing live vendor metrics & settlements...
          </span>
          <div className="flex-1 h-1.5 bg-base-200 rounded-full overflow-hidden ml-2">
            <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent preloader-bar-indeterminate rounded-full w-1/3" />
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary to-primary/85 text-primary-content shadow-xl overflow-hidden relative border border-primary/20">
        <div className="card-body p-6 sm:p-8 relative z-[1]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>Partner Brand Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {brand?.name || 'Partner Brand Hub'}
              </h1>
              <p className="text-sm text-primary-content/80 max-w-xl">
                Real-time sales performance, transparent weekly settlement metrics, and direct
                catalog management.
              </p>
            </div>

            {/* Current Settlement Tier Pill */}
            <Link
              href="/vendor-portal/settlement-plan"
              className="bg-base-100/10 hover:bg-white/20 transition-colors backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[240px] block"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold text-primary-content/75 uppercase tracking-wider">
                  Active Settlement Tier
                </p>
                <span className="text-[10px] font-bold text-secondary uppercase underline">
                  View Plans →
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">{kelasInfo.name}</span>
                <span className="badge badge-secondary font-bold text-xs px-2.5 py-1">
                  {kelasInfo.share} Net Share
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-primary-content/80">
                <span>Next Weekly Payout:</span>
                <strong className="text-white">Wednesday</strong>
              </div>
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/60">Gross Sales (GMV)</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  formatCurrency(stats.grossSales)
                )}
              </h3>
              <p className="text-[11px] text-base-content/50 mt-1">Total customer order value</p>
            </div>
          </div>
        </div>

        {/* Settled NCS */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/60">Settled NCS</span>
              <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  formatCurrency(stats.settledNcs)
                )}
              </h3>
              <p className="text-[11px] text-base-content/50 mt-1">
                Net cleared after vouchers & refunds
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Payout */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/60">
                Estimated Brand Payout
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary/20 text-primary flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  formatCurrency(stats.estimatedPayout)
                )}
              </h3>
              <p className="text-[11px] text-base-content/50 mt-1">
                Estimated {kelasInfo.share} net share
              </p>
            </div>
          </div>
        </div>

        {/* Volume / Items Sold */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/60">Items Fulfilled</span>
              <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  stats.itemsSold.toLocaleString()
                )}
              </h3>
              <p className="text-[11px] text-base-content/50 mt-1">Via Central Logistics Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* 70/30 Analytics & Inventory Velocity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">
        {/* Left 70%: Product Sales Chart (Line Chart) */}
        <div className="lg:col-span-7 h-[450px]">
          <ProductSalesLineChart
            timeline={reportingData?.breakdown || []}
            loading={loading || chartLoading}
            selectedRange={timeRange}
            onRangeChange={handleTimeRangeChange}
            brandSharePct={
              brand?.brand_share_percentage ??
              (activeClass === 'kelas_a' ? 45 : activeClass === 'kelas_c' ? 55 : 50)
            }
          />
        </div>

        {/* Right 30%: Product Quantity Balance & Total Sold (Bar Chart) */}
        <div className="lg:col-span-3 h-[450px]">
          <ProductStockBalanceBarChart
            products={productsList}
            topProducts={reportingData?.top_products || reportingData?.products || []}
            loading={loading}
          />
        </div>
      </div>

      {/* Fast Action Navigation Hub */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-base-content flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          <span>Vendor Hub Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Catalog Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Package className="w-4 h-4" />
                  <span>Catalog</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Manage inventory listings, create new products, and track product level velocity.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/catalog/manage-product"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5" /> Manage Products
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/add-product"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Add New Product
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/performance"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> NCS Leaderboard
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/breakdown"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Catalog Breakdown
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Insights Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>Insights & Analytics</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Detailed sales reports, NCS contribution breakdown, and XLS export for accounting.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/insights/sales-report"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" /> Sales Report & Breakdown
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/insights/performance-report"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Performance Report (XLS)
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Accounting Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Receipt className="w-4 h-4" />
                  <span>Accounting & Settlements</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Inspect weekly statements, verify bank details, or apply for a higher settlement class.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/accounting"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> Payout Statements
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/settlement-plan"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Settlement Plan & Tiers
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Settlement Explainer Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-base-content">
              Transparent Weekly Settlement Lifecycle
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-base-content/75">
            <div className="p-3 bg-base-200/60 rounded-xl space-y-1 border border-base-300/40">
              <span className="font-bold text-primary block">1. Net Cleared Sales (NCS)</span>
              <p className="text-[11px] leading-relaxed">
                Calculated strictly as <strong>GMV − Member Discounts − Eligible Platform Vouchers (≤40% cap) − Refunds</strong>.
              </p>
            </div>
            <div className="p-3 bg-base-200/60 rounded-xl space-y-1 border border-base-300/40">
              <span className="font-bold text-primary block">2. Predictable Weekly Payout</span>
              <p className="text-[11px] leading-relaxed">
                Sunday midnight cutoff; settlement statements approved and transferred to your bank account every <strong>Wednesday</strong>.
              </p>
            </div>
            <div className="p-3 bg-base-200/60 rounded-xl space-y-1 border border-base-300/40">
              <span className="font-bold text-primary block">3. Single Hub Fulfillment</span>
              <p className="text-[11px] leading-relaxed">
                Customer deliveries are handled directly via VAMOFLEX Central Logistics with end-to-end tracking and customer support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}