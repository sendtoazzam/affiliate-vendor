'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  FileQuestion,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  Receipt,
  Truck,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Package,
  Boxes,
  PlusCircle,
  TrendingUp,
  Layers,
  BarChart3,
  FileSpreadsheet,
  ChevronRight,
  FileText,
  Lock,
  Scale,
} from 'lucide-react';

export default function VendorSupportPage() {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('settlement');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setTicketSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does the weekly settlement cycle work?',
      a: 'The settlement period runs weekly with a Sunday 11:59 PM cutoff. All completed orders within that period are calculated and disbursed directly to your registered bank account every Wednesday. You can review detailed statements and historical payout PDFs in the Accounting & Payouts section.',
      category: 'Accounting',
    },
    {
      q: 'What is the difference between Settlement Classes (Kelas A, Kelas B, Kelas C)?',
      a: 'Settlement classes define your brand payout rate based on sales volume and tier agreement: Kelas A (45% rate), Kelas B (50% standard rate), and Kelas C (55% high-volume partner rate). If your sales consistently reach higher tiers, you can request an upgrade.',
      category: 'Accounting',
    },
    {
      q: 'How does Single Hub Logistics & Fulfillment operate?',
      a: 'All customer shipments across all partner brands are consolidated and fulfilled centrally via the VAMOFLEX Central Logistics Hub. Once your stock is received and verified at the central warehouse, order dispatch, delivery tracking, and courier handling are fully managed by our logistics team.',
      category: 'Logistics',
    },
    {
      q: 'How do I submit or update product listings?',
      a: 'Navigate to Catalog > Add Product to draft new SKU items. All newly submitted products undergo a quick compliance and category check before becoming live on the storefront. You can track approval states under Manage Products.',
      category: 'Catalog',
    },
    {
      q: 'How do I update my bank payout details or brand contact?',
      a: 'For security and fraud prevention, bank account modifications require verification. Please submit an inquiry through this support portal or contact your account manager directly with supporting bank statement documentation.',
      category: 'Account',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-primary" />
          <span>Help & Support</span>
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Find answers to common partner questions, review operational policies, or contact vendor support.
        </p>
      </div>

      {/* Quick Action Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-base-content">WhatsApp Partner Desk</h3>
              <p className="text-xs text-base-content/60 mt-1">
                Direct chat with our merchant relations team for urgent fulfillment issues.
              </p>
            </div>
            <div className="card-actions mt-4">
              <a
                href="https://wa.me/60123456789"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-primary btn-sm w-full font-semibold gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-base-content">Email Support</h3>
              <p className="text-xs text-base-content/60 mt-1">
                Send detailed inquiries, statements, or tier upgrade applications to our desk.
              </p>
            </div>
            <div className="card-actions mt-4">
              <a
                href="mailto:partner-support@vamoflex.com"
                className="btn btn-outline btn-primary btn-sm w-full font-semibold gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Support Desk</span>
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm hover:border-primary/40 transition-colors">
          <div className="card-body p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-base-content">Operating Hours</h3>
              <p className="text-xs text-base-content/60 mt-1">
                Monday – Friday: 9:00 AM – 6:00 PM (MYT)<br />
                Logistics Hub operates 7 days a week.
              </p>
            </div>
            <div className="card-actions mt-4">
              <a
                href="https://wa.me/60123456789?text=Urgent%20Logistics%20Support"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-primary btn-sm w-full font-semibold gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Hotline Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs and Support Ticket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 3 cols: FAQs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-base-content">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl"
              >
                <input type="checkbox" name="faq-accordion" />
                <div className="collapse-title text-sm font-semibold text-base-content flex items-center gap-2 pr-8">
                  <span>{faq.q}</span>
                </div>
                <div className="collapse-content text-xs text-base-content/75 leading-relaxed pt-1 border-t border-base-200">
                  <p className="pt-2">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-base-100 rounded-xl border border-base-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="text-base-content/80">Need to view recent invoices or statements?</span>
            </div>
            <Link
              href="/vendor-portal/accounting"
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>Go to Accounting</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 2 cols: Ticket / Message Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 border border-base-300 shadow-sm sticky top-24">
            <div className="card-body p-6">
              <h2 className="text-base font-bold text-base-content">Submit an Inquiry</h2>
              <p className="text-xs text-base-content/60 mb-4">
                Have a specific question? Send a message directly to vendor operations.
              </p>

              {ticketSubmitted ? (
                <div className="p-6 bg-success/10 border border-success/20 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-base-content">Inquiry Received</h3>
                  <p className="text-xs text-base-content/70">
                    Your ticket has been logged with our support team. We will reply to your registered account email within 1 business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketSubmitted(false);
                      setMessage('');
                      setSubject('');
                    }}
                    className="btn btn-outline btn-xs font-semibold mt-2"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Category</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select select-bordered select-sm w-full text-xs"
                    >
                      <option value="settlement">Settlement & Payouts</option>
                      <option value="catalog">Product Catalog & Listing</option>
                      <option value="logistics">Central Hub Logistics & Stock</option>
                      <option value="account">Account & Banking Details</option>
                      <option value="other">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Subject</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Query regarding Statement #STMT-2026-W37"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input input-bordered input-sm w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Message Details</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide order IDs, statement codes, or details to help us assist you faster..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="textarea textarea-bordered w-full text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full gap-2 text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legal, Terms & Privacy Policies */}
      <div className="space-y-4 pt-4 border-t border-base-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span>Merchant Compliance & Legal Policies</span>
          </h2>
          <span className="text-xs text-base-content/60">
            Statutory notices and partner agreements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/vendor-portal/legal/pdpa"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">Act 709</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                PDPA Notice
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Personal Data Protection Act compliance policy and data processing consent notice.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read PDPA Notice</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/vendor-portal/legal/terms"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">Merchant T&amp;C</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Terms &amp; Conditions
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Vendor platform agreement, settlement obligations, and service level terms.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read Terms &amp; Conditions</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/vendor-portal/legal/privacy-notice"
            className="group card bg-base-100 border border-base-300 hover:border-primary/50 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="badge badge-sm badge-ghost text-[10px] font-semibold">ISO 27001</span>
              </div>
              <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                Privacy Notice
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                Information security, merchant data handling practices, and privacy statement.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-primary pt-3 mt-3 border-t border-base-200">
              <span>Read Privacy Notice</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3 Footer Shortcut Cards with Animated Hover Chevron */}
      <div className="space-y-4 pt-4 border-t border-base-300">
        <h2 className="text-base font-bold text-base-content flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          <span>Vendor Hub Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Catalog Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Package className="w-4 h-4" />
                  <span>Catalog</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Manage inventory listings, create new products, and track product level velocity.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/catalog/manage-product"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5" /> Manage Products
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/add-product"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-3.5 h-3.5" /> Add New Product
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/performance"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> NCS Leaderboard
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/catalog/breakdown"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Catalog Breakdown
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Insights Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>Insights & Analytics</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Detailed sales reports, NCS contribution breakdown, and XLS export for accounting.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/insights/sales-report"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" /> Sales Report & Breakdown
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link
                  href="/vendor-portal/insights/performance-report"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-base-200 text-base-content/80 hover:text-primary transition-all duration-200 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Performance Report (XLS)
                  </span>
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Accounting Group */}
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Receipt className="w-4 h-4" />
                  <span>Accounting & Payouts</span>
                </div>
                <p className="text-xs text-base-content/60">
                  Inspect weekly statements, verify bank details, or apply for a higher settlement class.
                </p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-base-200">
                <Link
                  href="/vendor-portal/accounting"
                  className="group flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-200 font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> View Payout Statements
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
