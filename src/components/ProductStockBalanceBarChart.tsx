'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Boxes, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface ProductInventoryStat {
  id: string | number;
  name: string;
  sku?: string;
  stock_quantity?: number;
  stock?: number;
  units_sold?: number;
  gross_revenue?: number;
}

interface ProductStockBalanceBarChartProps {
  products?: ProductInventoryStat[];
  topProducts?: any[];
  loading?: boolean;
}

export default function ProductStockBalanceBarChart({
  products = [],
  topProducts = [],
  loading = false,
}: ProductStockBalanceBarChartProps) {
  // Combine live product inventory with performance units_sold
  const combinedList = useMemo(() => {
    // Map units sold by product id or name/sku from topProducts
    const soldMap = new Map<string, number>();
    topProducts.forEach((tp) => {
      if (tp.id) soldMap.set(String(tp.id), Number(tp.units_sold || 0));
      if (tp.sku) soldMap.set(String(tp.sku), Number(tp.units_sold || 0));
      if (tp.name) soldMap.set(String(tp.name), Number(tp.units_sold || 0));
    });

    let items: Array<{
      id: string | number;
      name: string;
      sku: string;
      stock: number;
      sold: number;
    }> = [];

    if (products.length > 0) {
      items = products.map((p) => {
        const stock = Number(p.stock_quantity ?? p.stock ?? 0);
        const sold =
          Number(p.units_sold) ||
          soldMap.get(String(p.id)) ||
          soldMap.get(String(p.sku)) ||
          soldMap.get(String(p.name)) ||
          0;

        return {
          id: p.id,
          name: p.name || 'Product',
          sku: p.sku || 'SKU-001',
          stock,
          sold,
        };
      });
    } else if (topProducts.length > 0) {
      items = topProducts.map((tp) => ({
        id: tp.id || tp.uuid,
        name: tp.name || 'Product',
        sku: tp.sku || 'SKU-001',
        stock: Number(tp.stock_quantity ?? 50),
        sold: Number(tp.units_sold || 0),
      }));
    } else {
      items = [];
    }

    // Sort by most activity (sold + stock)
    return items.sort((a, b) => b.sold + b.stock - (a.sold + a.stock));
  }, [products, topProducts]);

  // Find maximum scale value for proportional bar widths
  const maxScale = useMemo(() => {
    return Math.max(
      ...combinedList.map((item) => Math.max(item.stock, item.sold)),
      20,
    );
  }, [combinedList]);

  // Aggregate stats
  const totalStock = useMemo(
    () => combinedList.reduce((sum, item) => sum + item.stock, 0),
    [combinedList],
  );
  const totalSold = useMemo(
    () => combinedList.reduce((sum, item) => sum + item.sold, 0),
    [combinedList],
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden flex flex-col h-full max-h-[450px]">
      {/* Header (Pinned) */}
      <div className="p-4 sm:p-5 border-b border-base-200 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-base-content tracking-tight truncate">
              Stock vs Sold
            </h2>
            <span className="badge badge-success badge-xs font-bold gap-1 text-white py-1.5 px-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              NOW
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-0.5 truncate">
            Live inventory balance & sales velocity
          </p>
        </div>

        <Link
          href="/vendor-portal/catalog/manage-product"
          className="btn btn-ghost btn-xs text-primary gap-1 font-semibold shrink-0"
        >
          <span>All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Legend & Stats Summary (Pinned) */}
      <div className="px-4 sm:px-5 py-2.5 bg-base-200/40 border-b border-base-200 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
            <span className="text-[11px] font-medium text-base-content/75">Stock Qty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" />
            <span className="text-[11px] font-medium text-base-content/75">Total Sold</span>
          </div>
        </div>

        <div className="text-[11px] text-base-content/60 font-mono">
          {combinedList.length} Items
        </div>
      </div>

      {/* Bar List (Scrollable inner content) */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5 relative min-h-0 divide-y divide-base-200/50 flex flex-col">
        {loading && (
          <div className="absolute inset-0 bg-base-100/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        )}

        {combinedList.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 my-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-base-200/70 flex items-center justify-center text-base-content/40">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-base-content">No Products in Inventory</p>
              <p className="text-xs text-base-content/50 max-w-[220px]">
                Add products to your catalog to track real-time stock and sales velocity.
              </p>
            </div>
            <Link
              href="/vendor-portal/catalog/add-product"
              className="btn btn-primary btn-xs gap-1.5 font-semibold"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        ) : (
          combinedList.map((item, idx) => {
            const stockPct = Math.min(100, Math.max(6, (item.stock / maxScale) * 100));
            const soldPct = Math.min(100, Math.max(6, (item.sold / maxScale) * 100));

            return (
              <div key={item.id} className={`space-y-1.5 ${idx > 0 ? 'pt-3' : ''}`}>
                {/* Product Title & Stock Status Badge */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span
                    className="font-semibold text-base-content truncate max-w-[160px] sm:max-w-[200px]"
                    title={item.name}
                  >
                    {{ ...item }.name}
                  </span>

                  {item.stock === 0 ? (
                    <span className="badge badge-error badge-xs font-bold text-[9px] text-white shrink-0">
                      Out of Stock
                    </span>
                  ) : item.stock < 10 ? (
                    <span className="badge badge-warning badge-xs font-bold text-[9px] shrink-0">
                      Low ({item.stock})
                    </span>
                  ) : (
                    <span className="badge badge-ghost badge-xs font-medium text-[9px] text-base-content/60 shrink-0">
                      {item.stock} in stock
                    </span>
                  )}
                </div>

                {/* Comparative Double Bars */}
                <div className="space-y-1 bg-base-200/50 p-2 rounded-xl border border-base-300/40">
                  {/* Stock Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-base-content/50 w-8 font-mono">STK</span>
                    <div className="flex-1 h-3 bg-base-300/50 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-primary font-mono w-7 text-right">
                      {item.stock}
                    </span>
                  </div>

                  {/* Sold Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-base-content/50 w-8 font-mono">SLD</span>
                    <div className="flex-1 h-3 bg-base-300/50 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-success font-mono w-7 text-right">
                      {item.sold}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Catalog Action (Pinned) */}
      <div className="p-4 border-t border-base-200 flex items-center justify-between text-xs text-base-content/60 shrink-0 bg-base-100">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">
            Inventory Health
          </span>
          <p className="font-semibold text-base-content">
            {totalStock} in stock / {totalSold} sold
          </p>
        </div>
        <Link
          href="/vendor-portal/catalog/breakdown"
          className="btn btn-outline btn-xs gap-1 hover:btn-primary"
        >
          <span>Breakdown</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
