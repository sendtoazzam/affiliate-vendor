"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";

interface PreloaderBarProps {
  isLoading?: boolean;
}

function PreloaderBarInner({ isLoading: externalLoading }: PreloaderBarProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Trigger on route navigation
  useEffect(() => {
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 120);

    const timer2 = setTimeout(() => {
      setProgress(100);
      const timer3 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer3);
    }, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  // Handle external or global loading events
  useEffect(() => {
    if (externalLoading) {
      setVisible(true);
      setLoading(true);
      setProgress(60);
    } else if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [externalLoading, loading]);

  // Listen to custom window events for API calls
  useEffect(() => {
    const handleStart = () => {
      setVisible(true);
      setLoading(true);
      setProgress(50);
    };

    const handleStop = () => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    window.addEventListener("vf:preloader-start", handleStart);
    window.addEventListener("vf:preloader-stop", handleStop);

    return () => {
      window.removeEventListener("vf:preloader-start", handleStart);
      window.removeEventListener("vf:preloader-stop", handleStop);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent overflow-hidden pointer-events-none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all ease-out duration-200"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(75, 20, 110, 0.6)",
        }}
      />
    </div>
  );
}

export default function PreloaderBar(props: PreloaderBarProps) {
  return (
    <Suspense fallback={null}>
      <PreloaderBarInner {...props} />
    </Suspense>
  );
}
