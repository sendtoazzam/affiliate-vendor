"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VendorLoader from "@/components/VendorLoader";

export default function RootHomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const target = isAuthenticated ? "/vendor-portal/dashboard" : "/login";
      router.replace(target);

      // Fallback timer in case router transition is interrupted
      const timer = setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          window.location.replace(target);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <VendorLoader
      label="VAMOFLEX Vendor Hub"
      sublabel="Redirecting to Vendor Hub..."
    />
  );
}
