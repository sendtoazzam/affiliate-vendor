"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function startPreloader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vf:preloader-start"));
  }
}

export function stopPreloader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vf:preloader-stop"));
  }
}

interface PreloaderBarProps {
  isLoading?: boolean;
}

function PreloaderBarInner({ isLoading: externalLoading }: PreloaderBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const trickleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const clearTimers = () => {
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  };

  const startLoading = () => {
    clearTimers();
    setOpacity(1);
    setVisible(true);
    setProgress(20);

    trickleIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + Math.random() * 12 + 6;
        if (prev < 75) return prev + Math.random() * 6 + 2;
        if (prev < 90) return prev + Math.random() * 2 + 0.5;
        return prev;
      });
    }, 200);
  };

  const completeLoading = () => {
    clearTimers();
    setProgress(100);

    completeTimeoutRef.current = setTimeout(() => {
      setOpacity(0);
      completeTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }, 200);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    completeLoading();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (externalLoading === true) {
      startLoading();
    } else if (externalLoading === false && visible) {
      completeLoading();
    }
  }, [externalLoading]);

  useEffect(() => {
    const handleStartEvent = () => startLoading();
    const handleStopEvent = () => completeLoading();

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        targetAttr === "_blank" ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin !== currentUrl.origin) return;

        const isSamePage =
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search;

        if (!isSamePage) {
          startLoading();
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    const handlePopState = () => {
      startLoading();
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("vf:preloader-start", handleStartEvent);
    window.addEventListener("vf:preloader-stop", handleStopEvent);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("vf:preloader-start", handleStartEvent);
      window.removeEventListener("vf:preloader-stop", handleStopEvent);
    };
  }, [visible]);

  if (!visible && progress === 0) return null;

  return (
    <>
      <style>{`
        @keyframes preloaderGradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes preloaderPulse {
          0%, 100% {
            opacity: 0.9;
            transform: scaleY(1);
          }
          50% {
            opacity: 1;
            transform: scaleY(1.15);
          }
        }
        .theme-preloader-gradient {
          background: linear-gradient(
            90deg,
            #4B146E 0%,
            #7C2DA8 25%,
            #D4AF37 55%,
            #F7DF94 75%,
            #7C2DA8 90%,
            #4B146E 100%
          );
          background-size: 250% 100%;
          animation: preloaderGradientMove 2.2s ease infinite, preloaderPulse 1.8s ease-in-out infinite;
        }
        .preloader-glow-tip {
          box-shadow: 0 0 12px 3px rgba(212, 175, 55, 0.85), 0 0 20px 6px rgba(124, 45, 168, 0.55);
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none bg-transparent overflow-hidden"
        style={{
          opacity,
          transition: "opacity 200ms ease-out",
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full theme-preloader-gradient relative transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#F7DF94]/80 preloader-glow-tip" />
        </div>
      </div>
    </>
  );
}

export default function PreloaderBar(props: PreloaderBarProps) {
  return (
    <Suspense fallback={null}>
      <PreloaderBarInner {...props} />
    </Suspense>
  );
}
