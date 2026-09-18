"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Store, ShieldCheck, Zap } from "lucide-react";

interface VendorLoaderProps {
  label?: string;
  sublabel?: string;
}

const loadingStages = [
  "Connecting to Multi-Brand Partner Hub...",
  "Synchronizing vendor catalog & rates...",
  "Loading settlement & ledger matrices...",
  "Finalizing dashboard workspace...",
];

export default function VendorLoader({
  label = "VAMOFLEX Vendor Portal",
  sublabel,
}: VendorLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % loadingStages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full flex items-center justify-center bg-base-200/90 relative overflow-hidden select-none p-4"
    >
      {/* Ambient background glow elements */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
      <div
        className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      {/* Main interactive glass card */}
      <div
        className="relative z-10 flex flex-col items-center max-w-sm w-full bg-base-100/80 backdrop-blur-xl border border-base-300/60 rounded-3xl p-8 shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${-mousePos.y * 0.4}deg) rotateY(${mousePos.x * 0.4}deg)`,
        }}
      >
        {/* Interactive SVG Animation Container */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          {/* SVG Orbit and Animated Vectors */}
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="vf-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--a, var(--p)))" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="vf-grad-track" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="0.15" />
                <stop offset="100%" stopColor="hsl(var(--bc))" stopOpacity="0.05" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background static circle track */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="url(#vf-grad-track)"
              strokeWidth="2"
            />

            {/* Inner secondary pulse track */}
            <circle
              cx="80"
              cy="80"
              r="52"
              fill="none"
              stroke="url(#vf-grad-track)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className="animate-[spin_12s_linear_infinite]"
            />

            {/* Fast Orbit Dash Outer Arc */}
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="url(#vf-grad-primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="80 180"
              className="animate-[spin_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite]"
              filter="url(#glow)"
            />

            {/* Reverse Counter-Rotating Middle Ring */}
            <circle
              cx="80"
              cy="80"
              r="58"
              fill="none"
              stroke="hsl(var(--p))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="40 120"
              className="animate-[spin_3.5s_linear_infinite_reverse] opacity-75"
            />

            {/* Orbiting Satellite Nodes */}
            <g className="animate-[spin_6s_linear_infinite]">
              <circle cx="80" cy="12" r="4.5" fill="hsl(var(--p))" filter="url(#glow)" />
              <circle cx="80" cy="148" r="3.5" fill="hsl(var(--a, var(--p)))" />
              <circle cx="12" cy="80" r="3" fill="hsl(var(--p))" opacity="0.6" />
              <circle cx="148" cy="80" r="3" fill="hsl(var(--p))" opacity="0.6" />
            </g>

            {/* Inner radar scan sweep effect */}
            <g className="animate-[spin_4s_linear_infinite] origin-center">
              <line
                x1="80"
                y1="80"
                x2="80"
                y2="28"
                stroke="url(#vf-grad-primary)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            </g>
          </svg>

          {/* Center Brand Icon with breathing animation */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-base-100 shadow-lg border border-base-200 flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-110">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping opacity-30" />
            <img
              src="/images/logo/preloader_icon.png"
              alt="VAMOFLEX"
              className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
            />
          </div>
        </div>

        {/* Brand & Loading Labels */}
        <div className="text-center space-y-2 w-full">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-base text-base-content tracking-tight">
              {label}
            </h3>
            <span className="badge badge-primary badge-xs uppercase font-bold text-[9px] px-1.5">
              Live
            </span>
          </div>

          <p className="text-xs text-base-content/70 h-5 font-medium transition-all duration-300">
            {sublabel || loadingStages[stageIndex]}
          </p>

          {/* Smooth animated progress bar */}
          <div className="w-full bg-base-300/50 rounded-full h-1.5 overflow-hidden mt-3">
            <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-[shimmer_1.8s_ease-in-out_infinite] w-full origin-left" />
          </div>

          {/* Hub Status Indicators */}
          <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-base-content/50 border-t border-base-200/80 mt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-warning" />
              Fast Sync
            </span>
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-primary" />
              Brand Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
