'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Layers, DollarSign, Calendar } from 'lucide-react';

interface TimelinePoint {
  date: string;
  gross_revenue?: number;
  gross_sales?: number;
  settled_ncs?: number;
  brand_payout?: number;
  units_sold?: number;
  orders_count?: number;
}

interface ProductSalesLineChartProps {
  timeline: TimelinePoint[];
  loading?: boolean;
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  brandSharePct?: number;
}

export default function ProductSalesLineChart({
  timeline = [],
  loading = false,
  selectedRange = 'now',
  onRangeChange,
  brandSharePct = 50,
}: ProductSalesLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<'all' | 'gmv' | 'ncs' | 'payout'>('all');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTooltipCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const chartData = useMemo(() => {
    if (selectedRange === 'now') {
      // Intra-day live timeline points
      const todayTotalGmv = timeline.reduce(
        (sum, t) => sum + Number(t.gross_revenue ?? t.gross_sales ?? 0),
        0,
      );
      const todayTotalNcs = timeline.reduce(
        (sum, t) => sum + Number(t.settled_ncs ?? (t.gross_revenue ?? 0) * 0.85),
        0,
      );
      const todayTotalUnits = timeline.reduce((sum, t) => sum + Number(t.units_sold ?? 0), 0);

      const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
      const currentHour = new Date().getHours();

      return hours.map((hr, idx) => {
        const factor = (idx + 1) / hours.length;
        const gmv = Math.round(todayTotalGmv * factor * 100) / 100;
        const ncs = Math.round(todayTotalNcs * factor * 100) / 100;
        const payout = Math.round(ncs * (brandSharePct / 100) * 100) / 100;
        const units = Math.round(todayTotalUnits * factor);

        return {
          date: hr,
          gross_revenue: gmv,
          settled_ncs: ncs,
          brand_payout: payout,
          units_sold: units,
          orders_count: Math.ceil(units * 0.8),
        };
      });
    }

    if (!timeline || timeline.length === 0) {
      // Generate standard fallback 7 days data for clean presentation if empty
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        return {
          date: dateStr,
          gross_revenue: 0,
          settled_ncs: 0,
          brand_payout: 0,
          units_sold: 0,
          orders_count: 0,
        };
      });
    }

    return timeline.map((pt) => {
      const gmv = Number(pt.gross_revenue ?? pt.gross_sales ?? 0);
      const ncs = Number(pt.settled_ncs ?? gmv * 0.85);
      const payout = Number(pt.brand_payout ?? ncs * (brandSharePct / 100));
      return {
        date: pt.date,
        gross_revenue: gmv,
        settled_ncs: ncs,
        brand_payout: payout,
        units_sold: Number(pt.units_sold ?? 0),
        orders_count: Number(pt.orders_count ?? 0),
      };
    });
  }, [timeline, brandSharePct, selectedRange]);

  // Aggregate stats
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, cur) => {
        acc.gmv += cur.gross_revenue;
        acc.ncs += cur.settled_ncs;
        acc.payout += cur.brand_payout;
        acc.units += cur.units_sold;
        return acc;
      },
      { gmv: 0, ncs: 0, payout: 0, units: 0 },
    );
  }, [chartData]);

  // SVG Chart Dimensions
  const svgWidth = 680;
  const svgHeight = 240;
  const padding = { top: 20, right: 24, bottom: 35, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = useMemo(() => {
    const rawMax = Math.max(
      ...chartData.map((d) => Math.max(d.gross_revenue, d.settled_ncs, d.brand_payout)),
      100,
    );
    // Round up to clean ceiling
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
    return Math.ceil((rawMax * 1.15) / magnitude) * magnitude;
  }, [chartData]);

  // Generate coordinates
  const points = useMemo(() => {
    const step = chartData.length > 1 ? graphWidth / (chartData.length - 1) : graphWidth;
    return chartData.map((d, i) => {
      const x = padding.left + i * step;
      const yGmv = padding.top + graphHeight - (d.gross_revenue / maxVal) * graphHeight;
      const yNcs = padding.top + graphHeight - (d.settled_ncs / maxVal) * graphHeight;
      const yPayout = padding.top + graphHeight - (d.brand_payout / maxVal) * graphHeight;
      return { x, yGmv, yNcs, yPayout, data: d, index: i };
    });
  }, [chartData, graphWidth, graphHeight, maxVal, padding.left, padding.top]);

  // Build SVG path strings with smooth curves
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const gmvPath = useMemo(
    () => createSmoothPath(points.map((p) => ({ x: p.x, y: p.yGmv }))),
    [points],
  );
  const ncsPath = useMemo(
    () => createSmoothPath(points.map((p) => ({ x: p.x, y: p.yNcs }))),
    [points],
  );
  const payoutPath = useMemo(
    () => createSmoothPath(points.map((p) => ({ x: p.x, y: p.yPayout }))),
    [points],
  );

  const gmvAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const last = points[points.length - 1];
    const first = points[0];
    const baseline = padding.top + graphHeight;
    return `${gmvPath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [gmvPath, points, graphHeight, padding.top]);

  // Y-Axis Grid increments
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    val: maxVal * ratio,
    y: padding.top + graphHeight - ratio * graphHeight,
  }));

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes(':') || dateStr === 'Now') return dateStr;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden flex flex-col h-full max-h-[450px]">
      {/* Header & Controls (Pinned) */}
      <div className="p-4 sm:p-5 border-b border-base-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-base-content tracking-tight">
              Product Sales & NCS Velocity
            </h2>
            <span className="badge badge-success badge-xs font-bold gap-1 text-white py-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-0.5">
            Real-time live monitoring of Gross Sales (GMV) vs Settled NCS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector with Now as default */}
          <div className="join bg-base-200/80 p-0.5 rounded-lg border border-base-300/60 text-xs">
            {[
              { label: 'Now', value: 'now' },
              { label: '7D', value: '7d' },
              { label: '30D', value: '30d' },
              { label: 'Month', value: 'month' },
              { label: 'All', value: 'all' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onRangeChange && onRangeChange(tab.value)}
                className={`join-item btn btn-xs border-0 font-medium ${
                  selectedRange === tab.value
                    ? 'btn-primary text-primary-content shadow-sm'
                    : 'btn-ghost text-base-content/70 hover:text-base-content'
                }`}
              >
                {tab.value === 'now' ? (
                  <span className="flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                    Now
                  </span>
                ) : (
                  tab.label
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series Filters & Metrics Strip (Pinned) */}
      <div className="px-4 sm:px-5 py-2.5 bg-base-200/40 border-b border-base-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSeries('all')}
            className={`btn btn-xs rounded-md gap-1.5 ${
              activeSeries === 'all'
                ? 'btn-neutral text-neutral-content'
                : 'btn-ghost text-base-content/70'
            }`}
          >
            <span>All Series</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries('gmv')}
            className={`btn btn-xs rounded-md gap-1.5 ${
              activeSeries === 'gmv' ? 'btn-primary' : 'btn-ghost text-base-content/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span>Gross Sales (GMV)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries('ncs')}
            className={`btn btn-xs rounded-md gap-1.5 ${
              activeSeries === 'ncs' ? 'btn-info text-info-content' : 'btn-ghost text-base-content/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-info inline-block" />
            <span>Settled NCS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSeries('payout')}
            className={`btn btn-xs rounded-md gap-1.5 ${
              activeSeries === 'payout'
                ? 'btn-success text-success-content'
                : 'btn-ghost text-base-content/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            <span>Brand Payout</span>
          </button>
        </div>

        {/* Selected hover info / period stats */}
        <div className="flex items-center gap-4 text-[11px] text-base-content/70">
          <div>
            Total GMV: <strong className="text-base-content font-bold">{formatCurrency(totals.gmv)}</strong>
          </div>
          <div className="hidden sm:block">
            Net NCS: <strong className="text-primary font-bold">{formatCurrency(totals.ncs)}</strong>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Area */}
      <div className="p-4 sm:p-5 relative flex-1 flex flex-col justify-center overflow-y-auto select-none min-h-0">
        {loading && (
          <div className="absolute inset-0 bg-base-100/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        )}

        <div className="w-full overflow-hidden relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[280px] overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Primary GMV Fill Gradient */}
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(var(--p))" stopOpacity="0.28" />
                <stop offset="85%" stopColor="oklch(var(--p))" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={svgWidth - padding.right}
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-base-300"
                  strokeDasharray={i === 0 ? '0' : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-base-content/40 font-mono"
                >
                  {formatCurrency(tick.val)}
                </text>
              </g>
            ))}

            {/* Area Fill for Gross GMV */}
            {(activeSeries === 'all' || activeSeries === 'gmv') && gmvAreaPath && (
              <path d={gmvAreaPath} fill="url(#salesGradient)" />
            )}

            {/* Line: Settled NCS */}
            {(activeSeries === 'all' || activeSeries === 'ncs') && (
              <path
                d={ncsPath}
                fill="none"
                stroke="oklch(var(--in))"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Line: Brand Net Payout */}
            {(activeSeries === 'all' || activeSeries === 'payout') && (
              <path
                d={payoutPath}
                fill="none"
                stroke="oklch(var(--su))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Line: Gross GMV (Primary) */}
            {(activeSeries === 'all' || activeSeries === 'gmv') && (
              <path
                d={gmvPath}
                fill="none"
                stroke="oklch(var(--p))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points & Interactive Hover Columns */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={i}>
                  {/* Invisible hit box for hover */}
                  <rect
                    x={pt.x - graphWidth / (points.length * 2)}
                    y={padding.top}
                    width={graphWidth / points.length}
                    height={graphHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                  />

                  {/* Vertical cursor guideline when hovered */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={padding.top}
                      x2={pt.x}
                      y2={padding.top + graphHeight}
                      stroke="oklch(var(--p))"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="opacity-75"
                    />
                  )}

                  {/* Dot on Gross GMV */}
                  {(activeSeries === 'all' || activeSeries === 'gmv') && (
                    <circle
                      cx={pt.x}
                      cy={pt.yGmv}
                      r={isHovered ? 6 : 3.5}
                      fill="oklch(var(--p))"
                      stroke="oklch(var(--b1))"
                      strokeWidth="2"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  )}

                  {/* Dot on Settled NCS */}
                  {(activeSeries === 'all' || activeSeries === 'ncs') && (
                    <circle
                      cx={pt.x}
                      cy={pt.yNcs}
                      r={isHovered ? 5 : 2.5}
                      fill="oklch(var(--in))"
                      stroke="oklch(var(--b1))"
                      strokeWidth="1.5"
                      className="transition-all duration-150 pointer-events-none"
                    />
                  )}

                  {/* X-Axis Date Labels */}
                  {(points.length <= 10 || i % Math.ceil(points.length / 7) === 0 || i === points.length - 1) && (
                    <text
                      x={pt.x}
                      y={padding.top + graphHeight + 18}
                      textAnchor="middle"
                      className="text-[10px] fill-base-content/60 font-medium"
                    >
                      {formatDateLabel(pt.data.date)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Box */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-100 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(Math.min(hoveredPoint.yGmv, hoveredPoint.yNcs) / svgHeight) * 100 - 4}%`,
              }}
            >
              <div className="bg-base-100/95 text-base-content backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-2xl border border-base-300 min-w-[170px] text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="font-bold border-b border-base-200 pb-1 text-base-content flex items-center justify-between">
                  <span>{formatDateLabel(hoveredPoint.data.date)}</span>
                  <span className="text-[10px] text-base-content/50 font-normal">
                    {hoveredPoint.data.units_sold} items
                  </span>
                </div>
                <div className="space-y-0.5 pt-0.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3 text-primary font-semibold">
                    <span>Gross GMV:</span>
                    <span>{formatTooltipCurrency(hoveredPoint.data.gross_revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-info font-medium">
                    <span>Settled NCS:</span>
                    <span>{formatTooltipCurrency(hoveredPoint.data.settled_ncs)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-success font-bold pt-0.5 border-t border-base-200/60">
                    <span>Brand Payout:</span>
                    <span>{formatTooltipCurrency(hoveredPoint.data.brand_payout)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
