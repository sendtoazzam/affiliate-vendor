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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Help & Support</h1>
        <p className="text-xs text-base-content/60 mt-1">
          Find answers to common partner questions, review operational policies, or contact vendor support.
        </p>
      </div>

      {/* Quick Action Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-base-content">WhatsApp Partner Desk</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Direct chat with our merchant relations team for urgent fulfillment issues.
            </p>
            <div className="card-actions mt-4">
              <a
                href="https://wa.me/60123456789"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-primary btn-xs w-full font-semibold"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-base-content">Email Support</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Send detailed inquiries, statements, or tier upgrade applications to our desk.
            </p>
            <div className="card-actions mt-4">
              <a
                href="mailto:partner-support@vamoflex.com"
                className="btn btn-outline btn-primary btn-xs w-full font-semibold"
              >
                partner-support@vamoflex.com
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-base-content">Operating Hours</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Monday – Friday: 9:00 AM – 6:00 PM (MYT)<br />
              Logistics Hub operates 7 days a week.
            </p>
            <div className="card-actions mt-4">
              <span className="badge badge-success badge-soft text-[10px] font-semibold w-full py-2">
                Operational Normal
              </span>
            </div>
          </div>
        </div>
      </div>

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
              className="text-primary font-semibold hover:underline"
            >
              Go to Accounting →
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
    </div>
  );
}
