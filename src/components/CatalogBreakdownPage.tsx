'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { vendorApi } from '@/lib/api';
import { ProductPerformanceItem, ReportingData } from '@/lib/types';
import { exportToXls, ExcelColumn } from '@/lib/export-xls';
import {
  Boxes,
  Package,
  Download,
  Search,
  Filter,
  BarChart3,
  Sparkles,
  Edit,
  ArrowUpDown,
  TrendingUp,
  Layers,
} from 'lucide-react';

export default function CatalogBreakdownPage() {
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'ncs' | 'units' | 'revenue' | 'payout' | 'stock'>('ncs');

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getReporting({
        start_date: dateRange === '7d' ? '7d' : dateRange,
      });
      const data: ReportingData = res.reporting || res;
      setReportingData(data);
    } catch (err) {
      console.error('Failed to load catalog breakdown', err);
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'ncs') return b.ncs_contribution - a.ncs_contribution;
        if (sortBy === 'units') return b.units_sold - a.units_sold;
        if (sortBy === 'revenue') return b.gross_revenue - a.gross_revenue;
        if (sortBy === 'payout') return b.brand_payout - a.brand_payout;
        if (sortBy === 'stock') return b.stock_quantity - a.stock_quantity;
        return 0;
      });
  }, [products, searchQuery, categoryFilter, sortBy]);

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

  const handleExportXls = () => {
    const columns: ExcelColumn[] = [
      { header: 'Product Name', key: 'name', width: 220, type: 'string' },
      { header: 'SKU', key: 'sku', width: 120, type: 'string' },
      { header: 'Category', key: 'category', width: 140, type: 'string' },
      { header: 'Unit Price', key: 'retail_price', width: 110, type: 'currency' },
      { header: 'Stock Available', key: 'stock_quantity', width: 110, type: 'number' },
      { header: 'Units Sold', key: 'units_sold', width: 100, type: 'number' },
      { header: 'Gross Sales (GMV)', key: 'gross_revenue', width: 140, type: 'currency' },
      { header: 'Discounts', key: 'discounts', width: 110, type: 'currency' },
      { header: 'Vouchers', key: 'vouchers', width: 110, type: 'currency' },
      { header: 'Refunds', key: 'refunds', width: 110, type: 'currency' },
      { header: 'Settled NCS', key: 'ncs_contribution', width: 140, type: 'currency' },
      { header: 'Brand Net Payout', key: 'brand_payout', width: 140, type: 'currency' },
    ];

    exportToXls(
      `Catalog_Breakdown_${dateRange}_${new Date().toISOString().slice(0, 10)}`,
      filteredProducts,
      columns,
      'Catalog Breakdown'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-base-content flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-primary" />
            <span>Catalog Breakdown</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Detailed itemized breakdown of stock, unit sales, gross revenue, settled NCS, and net brand payout.
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

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5">
          <span className="text-[11px] font-bold text-base-content/60 uppercase">Total Items</span>
          <p className="text-xl font-black text-base-content mt-1">{products.length}</p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5">
          <span className="text-[11px] font-bold text-base-content/60 uppercase">Units Sold</span>
          <p className="text-xl font-black text-base-content mt-1">{totalUnitsSold.toLocaleString()}</p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5">
          <span className="text-[11px] font-bold text-base-content/60 uppercase">Gross GMV</span>
          <p className="text-xl font-black text-base-content mt-1">{formatCurrency(totalGrossRevenue)}</p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5">
          <span className="text-[11px] font-bold text-warning-content uppercase">Settled NCS</span>
          <p className="text-xl font-black text-primary mt-1">{formatCurrency(totalSettledNcs)}</p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-success uppercase">Brand Payout</span>
          <p className="text-xl font-black text-success mt-1">{formatCurrency(totalBrandPayout)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

            <select
              className="select select-bordered select-sm text-xs font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="ncs">Sort by Settled NCS</option>
              <option value="units">Sort by Units Sold</option>
              <option value="revenue">Sort by Gross Revenue</option>
              <option value="payout">Sort by Brand Payout</option>
              <option value="stock">Sort by Stock Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Product Analytics Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 sm:p-5 border-b border-base-300 flex items-center justify-between bg-base-100">
            <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
              <Boxes className="w-4 h-4 text-primary" />
              <span>Catalog Items ({filteredProducts.length})</span>
            </h3>
            <span className="text-xs text-base-content/50">
              Showing financial & volume stats
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="bg-base-200/70 text-base-content/70">
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Stock</th>
                  <th className="text-right">Units Sold</th>
                  <th className="text-right">Gross Sales (GMV)</th>
                  <th className="text-right">Discounts & Vouchers</th>
                  <th className="text-right">Settled NCS</th>
                  <th className="text-right font-bold text-success">Brand Net Payout</th>
                  <th className="text-center">Actions</th>
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
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item, idx) => {
                    const totalDeductions = (item.discounts || 0) + (item.vouchers || 0) + (item.refunds || 0);
                    return (
                      <tr key={item.id || idx} className="hover">
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
                        <td className="text-right font-medium">
                          {formatCurrency(item.retail_price)}
                        </td>
                        <td className="text-center">
                          {item.stock_quantity > 10 ? (
                            <span className="badge badge-success badge-sm text-[10px] text-white">
                              {item.stock_quantity}
                            </span>
                          ) : item.stock_quantity > 0 ? (
                            <span className="badge badge-warning badge-sm text-[10px]">
                              {item.stock_quantity} Low
                            </span>
                          ) : (
                            <span className="badge badge-error badge-sm text-[10px] text-white">
                              Out
                            </span>
                          )}
                        </td>
                        <td className="text-right font-bold text-base-content">
                          {item.units_sold.toLocaleString()}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(item.gross_revenue)}
                        </td>
                        <td className="text-right text-error font-medium">
                          {totalDeductions > 0 ? `-${formatCurrency(totalDeductions)}` : '—'}
                        </td>
                        <td className="text-right font-bold text-primary">
                          {formatCurrency(item.ncs_contribution)}
                        </td>
                        <td className="text-right font-black text-success">
                          {formatCurrency(item.brand_payout)}
                        </td>
                        <td className="text-center">
                          <Link
                            href={`/vendor-portal/products/${item.uuid || item.id}/edit`}
                            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
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
