# VAMOFLEX Vendor Portal (`vf-vendor-dashboard`)

A modern, high-performance Partner Brand & Vendor Management Portal built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **DaisyUI**.

---

## 🌟 Overview

The **VAMOFLEX Vendor Portal** enables partner brands and vendors to seamlessly manage products, track multi-tier sales, review transparent Net Cleared Sales (NCS) analytics, and reconcile weekly automated settlement payouts.

---

## 🚀 Key Features

### 1. Vendor Dashboard (`/vendor-portal/dashboard`)
- **Key Performance Indicators (KPIs)**: Real-time Gross Merchandise Value (GMV), Settled Net Commissionable Sales (NCS), Estimated Brand Payout, and units dispatched.
- **Active Settlement Tier**: Real-time display of the brand's settlement class (Kelas A: 45%, Kelas B: 50% Standard, Kelas C: 55%).
- **Quick Action Hub**: Animated shortcut cards navigating to Catalog, Insights, and Accounting.
- **Weekly Payout Notice**: Automated countdown to Wednesday payouts (Sunday midnight cutoff).

### 2. Catalog Management (`/vendor-portal/catalog`)
- **Manage Products** (`/vendor-portal/catalog/manage-product`):
  - Search by product title or SKU.
  - Category dropdown filter dynamically populated from active inventory.
  - Stock level filtering (All / In-Stock / Out-of-Stock).
  - Variant filtering (Simple vs. Multi-Variant).
  - Quick-view modals: Product Details, Stock Allocation, and Variant SKU/Pricing tables.
  - Excel (.xls) catalog export and batch product management.
- **Add Product** (`/vendor-portal/catalog/add-product`): Create standard and variable products with SKU, categories, media, and pricing.
- **NCS Leaderboard** (`/vendor-portal/catalog/performance`): Visual ranking of top revenue and NCS-generating products with contribution share progress bars.
- **Catalog Breakdown** (`/vendor-portal/catalog/breakdown`): Detailed unit sales, itemized deductions (discounts, vouchers, refunds), settled NCS, stock health badges, and one-click XLS export.

### 3. Insights & Analytics (`/vendor-portal/insights`)
- **Sales & Settlement Report** (`/vendor-portal/insights/sales-report`):
  - **NCS Waterfall Model**: Transparent formula visualization:
    $$\text{Settled NCS} = \text{Gross GMV} - \text{Member Discounts} - \text{Eligible Platform Vouchers } (\le 40\%) - \text{Refunds}$$
  - Breakdown of Net Brand Payout, Affiliate Bonus Distribution Pool, and Platform Service Fees.
- **Performance Report** (`/vendor-portal/insights/performance-report`): Time-filtered sales volume and revenue velocity metrics.

### 4. Accounting & Payouts (`/vendor-portal/accounting`)
- Complete historical ledger of weekly payouts and bank disbursements.
- Statement review, bank account verification, and settlement tier management.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: Axios with centralized token management & automatic session expiry handling
- **Exporting**: Clean XML/HTML-based spreadsheet export (`exportToXls`)

---

## 📦 Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm / pnpm / yarn
- Running backend API instance (`affiliatex-api`)

### Installation

1. **Navigate to the dashboard directory**:
   ```bash
   cd vf-vendor-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Build & Production

To build the application for production:

```bash
npm run build
```

To run the production server:

```bash
npm run start
```

To run linting:

```bash
npm run lint
```

---

## 📁 Directory Structure

```
vf-vendor-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login & password recovery routes
│   │   ├── vendor-portal/
│   │   │   ├── layout.tsx      # Sidebar navigation & breadcrumb generator
│   │   │   ├── dashboard/      # Primary vendor analytics dashboard
│   │   │   ├── catalog/        # Catalog management, leaderboard, breakdown
│   │   │   ├── products/       # Products list, edit, and create forms
│   │   │   ├── insights/       # Sales reports & NCS waterfall
│   │   │   └── accounting/     # Payout statements & accounting
│   ├── components/             # Reusable UI components (ProductForm, ConfirmModal, etc.)
│   ├── lib/
│   │   ├── api.ts              # Vendor API client & endpoints
│   │   ├── auth-context.tsx    # Vendor session & authentication state
│   │   ├── export-xls.ts       # Excel report generator
│   │   └── types.ts            # TypeScript interfaces & definitions
├── public/                     # Static assets, logos, and icons
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind & DaisyUI theme settings
└── package.json
```

---

## 🐳 Docker Deployment

The application is containerized using a multi-stage Docker build with Nginx as the lightweight production runner.

### Quick Start with Docker Compose

```bash
# Build and run the container locally on port 3301
docker compose up -d --build

# View container logs
docker compose logs -f affiliate-vendor

# Stop the container
docker compose down
```

### Production Deployment

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 Security & Guidelines

- Single Hub Central Logistics Fulfillment model.
- Strictly read-only financial data access for vendor users with authenticated Bearer tokens.
- Theme consistency powered by semantic DaisyUI theme tokens and responsive layouts.

