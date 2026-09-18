'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { ProductPerformanceItem, ReportingData } from '@/lib/types';
import { exportToXls, ExcelColumn } from '@/lib/export-xls';
import {
  FileSpreadsheet,
  Package,
  TrendingUp,
  Download,
  Search,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  ArrowDownRight,
  Boxes,
  PieChart,
  ArrowRight
} from 'lucide-react';

export default function ProductReportPage() {
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchReporting = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReporting({
        start_date: dateRange === '7d' ? '7d' : dateRange,
      });
      const data: ReportingData = res.reporting || res;
      setReportingData(data);
    } catch (err) {
      console.error('Failed to load product report', err);
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalNcs = useMemo(
    () => products.reduce((acc, p) => acc + (p.ncs_contribution || 0), 0),
    [products]
  );
  const totalUnits = useMemo(
    () => products.reduce((acc, p) => acc + (p.units_sold || 0), 0),
    [products]
  );
  const totalPayout = useMemo(
    () => products.reduce((acc, p) => acc + (p.brand_payout || 0), 0),
    [products]
  );

  const handleExportXls = () => {
    const columns: ExcelColumn[] = [
      { header: 'Product Name', key: 'name', width: 220, type: 'string' },
      { header: 'SKU Code', key: 'sku', width: 120, type: 'string' },
      { header: 'Category', key: 'category', width: 140, type: 'string' },
      { header: 'Unit Price', key: 'retail_price', width: 110, type: 'currency' },
      { header: 'Units Sold', key: 'units_sold', width: 100, type: 'number' },
      { header: 'Gross Revenue (GMV)', key: 'gross_revenue', width: 140, type: 'currency' },
      { header: 'Discounts', key: 'discounts', width: 110, type: 'currency' },
      { header: 'Vouchers', key: 'vouchers', width: 110, type: 'currency' },
      { header: 'Refunds', key: 'refunds', width: 110, type: 'currency' },
      { header: 'Settled NCS', key: 'ncs_contribution', width: 140, type: 'currency' },
      { header: 'NCS Share (%)', key: 'ncs_share', width: 110, type: 'percent' },
      { header: 'Net Brand Payout', key: 'brand_payout', width: 140, type: 'currency' },
    ];

    const exportData = filteredProducts.map((p) => ({
      ...p,
      ncs_share: totalNcs > 0 ? (p.ncs_contribution / totalNcs) * 100 : 0,
    }));

    exportToXls(
      `Product_Report_${dateRange}_${new Date().toISOString().slice(0, 10)}`,
      exportData,
      columns,
      'Product Report'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
            <span>Product Insights & Performance Report</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Comprehensive financial reporting by catalog product, discount deductions, settled NCS and brand payout.
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
            disabled={loading || filteredProducts.length === 0}
            className="btn btn-primary btn-sm text-white font-medium gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export to XLS</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
            Total Units Fulfilled
          </span>
          <p className="text-2xl font-black text-base-content mt-1">
            {totalUnits.toLocaleString()} units
          </p>
          <span className="text-[11px] text-base-content/50 mt-0.5">Across all catalog products</span>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Total Settled NCS
          </span>
          <p className="text-2xl font-black text-primary mt-1">
            {formatCurrency(totalNcs)}
          </p>
          <span className="text-[11px] text-base-content/50 mt-0.5">Net commissionable basis</span>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-success">
            Total Net Brand Payout
          </span>
          <p className="text-2xl font-black text-success mt-1">
            {formatCurrency(totalPayout)}
          </p>
          <span className="text-[11px] text-base-content/50 mt-0.5">Net vendor earnings</span>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              className="input input-bordered input-sm w-full pl-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {categories.length > 0 && (
              <select
                className="select select-bordered select-sm text-xs"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <Link
              href="/vendor-portal/catalog/performance"
              className="btn btn-outline btn-primary btn-sm text-xs font-semibold gap-1.5"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Product Report Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-100">
            <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>Product Settlement Breakdown ({filteredProducts.length} Products)</span>
            </h3>
            <span className="badge badge-primary badge-outline text-[10px] font-bold">
              Official Statement Data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/70 text-base-content/70">
                  <th>Product</th>
                  <th>SKU</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Gross GMV</th>
                  <th className="text-right">Discounts</th>
                  <th className="text-right">Vouchers</th>
                  <th className="text-right">Refunds</th>
                  <th className="text-right">Settled NCS</th>
                  <th className="text-right">NCS Share</th>
                  <th className="text-right font-bold text-success">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-base-content/50">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item, idx) => {
                    const sharePct = totalNcs > 0 ? (item.ncs_contribution / totalNcs) * 100 : 0;
                    return (
                      <tr key={item.id || idx} className="hover">
                        <td>
                          <div>
                            <p className="font-bold text-base-content line-clamp-1">
                              {item.name}
                            </p>
                            <span className="text-[10px] text-base-content/50">
                              {item.category || 'General'}
                            </span>
                          </div>
                        </td>
                        <td className="font-mono text-base-content/70">{item.sku || '—'}</td>
                        <td className="text-right font-bold">{item.units_sold}</td>
                        <td className="text-right font-medium">
                          {formatCurrency(item.gross_revenue)}
                        </td>
                        <td className="text-right text-error">
                          {item.discounts > 0 ? `-${formatCurrency(item.discounts)}` : '—'}
                        </td>
                        <td className="text-right text-warning-content">
                          {item.vouchers > 0 ? `-${formatCurrency(item.vouchers)}` : '—'}
                        </td>
                        <td className="text-right text-base-content/60">
                          {item.refunds > 0 ? `-${formatCurrency(item.refunds)}` : '—'}
                        </td>
                        <td className="text-right font-bold text-primary">
                          {formatCurrency(item.ncs_contribution)}
                        </td>
                        <td className="text-right font-mono text-base-content/70">
                          {sharePct.toFixed(1)}%
                        </td>
                        <td className="text-right font-black text-success">
                          {formatCurrency(item.brand_payout)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
