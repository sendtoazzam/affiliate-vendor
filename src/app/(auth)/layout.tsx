import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen relative flex flex-col justify-between bg-gradient-to-br from-base-200 via-base-100 to-base-300/70 overflow-x-hidden"
    >
      {/* Ambient background glows */}
      <div className="fixed -top-24 -left-24 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-primary/15 blur-[90px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Subtle Dot Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(#4B146E 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* Unified Auth Footer */}
      <footer className="relative z-10 py-5 px-4 text-center text-xs text-base-content/60 border-t border-base-300/60 bg-base-100/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Vamoflex Merchant Network. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-base-content/70">
            <Link href="/vendor-portal/legal/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span>&bull;</span>
            <Link href="/vendor-portal/legal/privacy-notice" className="hover:text-primary transition-colors">
              Privacy Notice
            </Link>
            <span>&bull;</span>
            <Link href="/vendor-portal/legal/pdpa" className="hover:text-primary transition-colors">
              PDPA Notice
            </Link>
            <span>&bull;</span>
            <Link href="/vendor-portal/support" className="hover:text-primary transition-colors">
              Vendor Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
