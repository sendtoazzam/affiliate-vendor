import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "VAMOFLEX Vendor Portal | Multi-Brand Partner Hub",
  description:
    "Curated Brand Partner Portal for Products, Reporting, Settlements and Payouts",
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/images/logo/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-base-200 text-base-content antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
