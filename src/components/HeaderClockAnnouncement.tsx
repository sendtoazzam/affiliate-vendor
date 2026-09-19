'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Moon,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  X,
  Calendar,
} from 'lucide-react';
import { vendorApi } from '@/lib/api';

interface AnnouncementItem {
  id: string | number;
  title: string;
  category: 'global' | 'vf-vendor' | 'vf_vendor' | 'storefront' | 'user-notification' | string;
  description?: string;
  short_description?: string;
  media_url?: string | null;
  thumbnail_url?: string | null;
  external_link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
}

const FALLBACK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: '1',
    title: 'Weekly Settlement Policy & Cutoff Reminder',
    category: 'vf-vendor',
    description:
      '<p>Please note that weekly settlement cycles close every <strong>Sunday at 11:59 PM</strong>. Approved payouts will be automatically computed and scheduled for release every <strong>Wednesday</strong>.</p><p>Review your statement breakdown and settlement reports under Commerce Hub & Payouts.</p>',
    external_link: '/vendor-portal/accounting',
  },
  {
    id: '2',
    title: 'Single Hub Fulfillment Logistics Integration',
    category: 'vf-vendor',
    description:
      '<p>All vendor partner customer shipments are routed and fulfilled directly via the <strong>VAMOFLEX Central Logistics Hub</strong>. Ensure inventory stock counts in your catalog are synchronized to avoid delivery delays.</p>',
    external_link: '/vendor-portal/catalog/manage-product',
  },
  {
    id: '3',
    title: 'Welcome to VAMOFLEX Partner Hub',
    category: 'global',
    description:
      '<p>Welcome to the VAMOFLEX Vendor Hub. Manage your product catalog, monitor real-time sales reporting, and track payouts efficiently in one unified portal.</p>',
    external_link: '/vendor-portal/dashboard',
  },
];

export default function HeaderClockAnnouncement() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(FALLBACK_ANNOUNCEMENTS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  // Load announcements from API
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const list = await vendorApi.getAnnouncements(['global', 'vf-vendor']);
        if (isMounted && Array.isArray(list) && list.length > 0) {
          // Strictly filter only global and vf-vendor
          const filtered = list.filter(
            (a: any) =>
              (a.category === 'global' ||
                a.category === 'vf-vendor' ||
                a.category === 'vf_vendor') &&
              a.status !== 'inactive'
          );
          if (filtered.length > 0) {
            setAnnouncements(filtered);
          }
        }
      } catch {
        // use fallbacks
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Clock interval
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Rotate announcements every 6s when not paused or modal open
  useEffect(() => {
    if (isPaused || selectedAnnouncement !== null || announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, selectedAnnouncement, announcements.length]);

  // Format Gregorian Date & Time
  const formatGregorian = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-MY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return { dateStr, timeStr };
  };

  // Format Islamic / Hijri Calendar
  const formatHijri = (date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat('ms-MY-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return formatter.format(date);
    } catch {
      try {
        const fallbackFormatter = new Intl.DateTimeFormat('en-MY-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return fallbackFormatter.format(date);
      } catch {
        return '';
      }
    }
  };

  const { dateStr, timeStr } = formatGregorian(currentTime);
  const hijriStr = formatHijri(currentTime);
  const currentAnnouncement =
    announcements[currentIdx] || announcements[0] || FALLBACK_ANNOUNCEMENTS[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % announcements.length);
  };

  const getCategoryBadge = (cat: string) => {
    if (cat === 'vf-vendor' || cat === 'vf_vendor') {
      return {
        label: 'VF Vendor',
        badgeClass: 'badge-warning font-bold text-[10px] text-warning-content',
      };
    }
    return {
      label: 'Global',
      badgeClass: 'badge-primary font-bold text-[10px] text-white',
    };
  };

  const badgeInfo = getCategoryBadge(currentAnnouncement.category);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 min-w-0 flex-1 opacity-0 pointer-events-none">
        <div className="h-9 w-40 bg-base-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center min-w-0 flex-1 gap-2.5 max-w-4xl">
        {/* Date Time & Hijri Calendar Block */}
        <div className="flex flex-col justify-center shrink-0 pr-1 select-none">
          {/* Row 1: Gregorian Date & Live Time */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-base-content leading-tight">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{dateStr}</span>
            <span className="text-base-content/40">•</span>
            <span className="font-mono text-primary font-bold tracking-tight">
              {timeStr}
            </span>
          </div>

          {/* Row 2: Hijri Calendar */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-base-content/65 leading-tight mt-0.5">
            <Moon className="w-3 h-3 text-secondary shrink-0" />
            <span className="font-serif tracking-normal text-base-content/80">
              {hijriStr}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-base-300 mx-1 hidden md:block shrink-0" />

        {/* Announcement Bar with Hyperlink & Detail Modal Trigger */}
        <div
          className="hidden md:flex items-center gap-2 min-w-0 flex-1 overflow-hidden bg-base-200/60 hover:bg-base-200/90 transition-all px-3 py-1.5 rounded-xl border border-base-300/60 group cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => setSelectedAnnouncement(currentAnnouncement)}
          title="Click to view announcement details"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              {currentAnnouncement.category === 'vf-vendor' ? (
                <Sparkles className="w-3 h-3 text-warning animate-pulse" />
              ) : (
                <Megaphone className="w-3 h-3 text-primary" />
              )}
            </div>
            <span className={`badge badge-xs px-1.5 py-0.5 ${badgeInfo.badgeClass}`}>
              {badgeInfo.label}
            </span>
          </div>

          {/* Clickable Announcement Message Ticker */}
          <div className="overflow-hidden min-w-0 flex-1 relative h-4 flex items-center">
            <p
              key={currentAnnouncement.id}
              className="text-xs text-base-content/85 group-hover:text-primary transition-colors truncate leading-none animate-fade-in font-medium"
            >
              {currentAnnouncement.title}
            </p>
          </div>

          {/* Click to view indicator */}
          <span className="text-[10px] text-primary/70 font-semibold underline underline-offset-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            Read More
          </span>

          {/* Next / Prev Controls */}
          {announcements.length > 1 && (
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-ghost btn-xs btn-square h-5 w-5 min-h-0 text-base-content/60 hover:text-base-content"
                title="Previous announcement"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono text-base-content/40 px-0.5">
                {currentIdx + 1}/{announcements.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-ghost btn-xs btn-square h-5 w-5 min-h-0 text-base-content/60 hover:text-base-content"
                title="Next announcement"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 p-6 animate-scale-in max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-base-300 shrink-0">
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge badge-sm px-2 py-0.5 ${
                      getCategoryBadge(selectedAnnouncement.category).badgeClass
                    }`}
                  >
                    {getCategoryBadge(selectedAnnouncement.category).label}
                  </span>
                  {selectedAnnouncement.created_at && (
                    <span className="text-[11px] text-base-content/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-base-content tracking-tight">
                  {selectedAnnouncement.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="btn btn-sm btn-ghost btn-circle text-base-content/50 hover:text-base-content shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto py-4 space-y-4 flex-1 custom-scrollbar">
              {selectedAnnouncement.media_url && (
                <div className="rounded-xl overflow-hidden border border-base-300 bg-base-200">
                  <img
                    src={selectedAnnouncement.media_url}
                    alt={selectedAnnouncement.title}
                    className="w-full max-h-56 object-cover"
                  />
                </div>
              )}

              {/* Description HTML */}
              <div
                className="text-xs text-base-content/80 leading-relaxed space-y-2 [&_p]:mb-2 [&_strong]:text-base-content [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedAnnouncement.description ||
                    selectedAnnouncement.short_description ||
                    selectedAnnouncement.title,
                }}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-base-300 shrink-0">
              {selectedAnnouncement.external_link ? (
                <a
                  href={selectedAnnouncement.external_link}
                  target={
                    selectedAnnouncement.external_link.startsWith('http')
                      ? '_blank'
                      : '_self'
                  }
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary text-white text-xs font-semibold gap-1.5 shadow-sm"
                >
                  <span>Go to Action</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="btn btn-sm btn-ghost text-xs font-semibold px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
