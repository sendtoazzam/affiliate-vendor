"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Store, Zap, Sparkles, RefreshCw, Lightbulb } from "lucide-react";

interface VendorLoaderProps {
  label?: string;
  sublabel?: string;
  stages?: string[];
  tips?: string[];
  fullScreen?: boolean;
}

const defaultLoadingStages = [
  "Connecting to Multi-Brand Partner Hub...",
  "Synchronizing vendor catalog & rates...",
  "Loading settlement & ledger matrices...",
  "Preparing your workspace...",
];

const defaultVendorTips = [
  "Changes to bank disbursement accounts take effect on the next weekly payout cycle.",
  "High-resolution logos with square aspect ratio (1:1) give your brand the best visibility.",
  "Keep your official contact person details updated for real-time order & settlement alerts.",
  "Class tier upgrades unlock lower commission rates and prioritized payout processing.",
];

export default function VendorLoader({
  label = "VAMOFLEX Vendor Hub",
  sublabel,
  stages = defaultLoadingStages,
  tips = defaultVendorTips,
  fullScreen = true,
}: VendorLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isPinging, setIsPinging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Progress bar simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const jump = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + jump, 92);
      });
    }, 400);

    // Stage rotation
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 2000);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(tipInterval);
    };
  }, [stages.length, tips.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleLogoClick = () => {
    setIsPinging(true);
    setTipIndex((prev) => (prev + 1) % tips.length);
    setTimeout(() => setIsPinging(false), 700);
  };

  const containerClasses = fullScreen
    ? "min-h-screen w-full flex items-center justify-center bg-base-200/80 relative overflow-hidden select-none p-4"
    : "min-h-[480px] w-full flex items-center justify-center bg-base-200/40 rounded-3xl relative overflow-hidden select-none p-6 my-4 border border-base-300/60";

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={containerClasses}
    >
      {/* Background ambient lighting */}
      <div
        suppressHydrationWarning
        className="absolute w-80 h-80 bg-primary/10 rounded-full blur-3xl -top-10 -left-10 animate-pulse pointer-events-none"
      />
      <div
        suppressHydrationWarning
        className="absolute w-80 h-80 bg-accent/10 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      {/* Main glass card with 3D tilt */}
      <div
        suppressHydrationWarning
        className="relative z-10 flex flex-col items-center max-w-md w-full bg-base-100/95 backdrop-blur-xl border border-base-300/80 rounded-3xl p-7 sm:p-8 shadow-2xl transition-transform duration-200 ease-out"
        style={
          mounted
            ? {
                transform: `perspective(1000px) rotateX(${-mousePos.y * 0.35}deg) rotateY(${mousePos.x * 0.35}deg)`,
              }
            : undefined
        }
      >
        {/* Centered SVG Loader with Center Logo */}
        <div suppressHydrationWarning className="relative w-36 h-36 flex items-center justify-center mb-5">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="vfLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="1" />
                <stop offset="50%" stopColor="hsl(var(--a, var(--p)))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--p))" stopOpacity="0.2" />
              </linearGradient>

              <filter id="vfGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Static background tracks */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="hsl(var(--bc))"
              strokeOpacity="0.08"
              strokeWidth="2"
            />
            <circle
              cx="80"
              cy="80"
              r="52"
              fill="none"
              stroke="hsl(var(--bc))"
              strokeOpacity="0.06"
              strokeWidth="1.5"
            />

            {/* Inner dashed ring rotating counter-clockwise */}
            <g>
              <circle
                cx="80"
                cy="80"
                r="52"
                fill="none"
                stroke="hsl(var(--p))"
                strokeOpacity="0.3"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 80 80"
                to="0 80 80"
                dur="12s"
                repeatCount="indefinite"
              />
            </g>

            {/* Outer dynamic glowing arc rotating clockwise */}
            <g>
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="url(#vfLoaderGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="95 160"
                filter="url(#vfGlow)"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 80 80"
                to="360 80 80"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </g>

            {/* Orbiting Satellite Node Group (Exact center 80,80) */}
            <g>
              <circle cx="80" cy="12" r="4.5" fill="hsl(var(--p))" filter="url(#vfGlow)" />
              <circle cx="148" cy="80" r="3" fill="hsl(var(--a, var(--p)))" opacity="0.8" />
              <circle cx="80" cy="148" r="3.5" fill="hsl(var(--p))" opacity="0.6" />
              <circle cx="12" cy="80" r="3" fill="hsl(var(--a, var(--p)))" opacity="0.5" />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 80 80"
                to="360 80 80"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </g>
          </svg>

          {/* Centered Brand Icon with Click Interactive Ripple */}
          <button
            type="button"
            onClick={handleLogoClick}
            title="Click to interact"
            suppressHydrationWarning
            className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-base-100 shadow-lg border border-base-200/80 flex items-center justify-center pointer-events-auto group cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div
              suppressHydrationWarning
              className={`absolute inset-0 rounded-2xl bg-primary/20 ${isPinging ? 'animate-ping' : 'animate-pulse opacity-40'}`}
            />
            <img
              src="/images/logo/preloader_icon.png"
              alt="VAMOFLEX"
              className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-active:rotate-12"
            />
          </button>
        </div>

        {/* Text and stages */}
        <div suppressHydrationWarning className="text-center space-y-3 w-full">
          <div suppressHydrationWarning className="flex items-center justify-center gap-2">
            <h3 className="font-bold text-sm text-base-content tracking-tight">
              {label}
            </h3>
            <span className="badge badge-primary badge-xs uppercase font-bold text-[9px] px-1.5 py-0.5">
              Syncing {progress}%
            </span>
          </div>

          <p suppressHydrationWarning className="text-xs text-base-content/70 h-5 font-medium transition-all duration-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            <span>{sublabel || stages[stageIndex]}</span>
          </p>

          {/* Animated progress bar */}
          <div suppressHydrationWarning className="w-full bg-base-200 rounded-full h-1.5 overflow-hidden">
            <div
              suppressHydrationWarning
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Interactive stage pill chips */}
          <div suppressHydrationWarning className="flex items-center justify-center gap-1.5 pt-1">
            {stages.map((stg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStageIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  stageIndex === i
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-base-300 hover:bg-base-content/30'
                }`}
                title={stg}
              />
            ))}
          </div>

          {/* Rotating Interactive Vendor Pro-Tip Card */}
          <div
            onClick={() => setTipIndex((prev) => (prev + 1) % tips.length)}
            className="p-3 bg-base-200/60 hover:bg-base-200 rounded-2xl border border-base-300/80 text-left cursor-pointer transition-colors group mt-2"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-primary mb-1">
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-warning" />
                <span>Vendor Pro-Tip</span>
              </span>
              <span className="text-base-content/40 group-hover:text-primary transition-colors flex items-center gap-0.5">
                <span>Next</span>
                <RefreshCw className="w-2.5 h-2.5" />
              </span>
            </div>
            <p className="text-[11px] text-base-content/70 leading-relaxed font-medium">
              {tips[tipIndex]}
            </p>
          </div>

          {/* Status badges */}
          <div suppressHydrationWarning className="pt-2 flex items-center justify-center gap-4 text-[11px] text-base-content/50 border-t border-base-200/80">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-warning" />
              Live Feed
            </span>
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-primary" />
              Partner Portal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

