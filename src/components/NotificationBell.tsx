"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  CheckCheck,
  Sparkles,
  ChevronRight,
  X,
  Volume2,
} from "lucide-react";
import { vendorApi } from "@/lib/api";
import { firebaseMessaging } from "@/lib/firebase-messaging";

export interface VendorNotification {
  id: string;
  type: string;
  data: {
    title?: string;
    message?: string;
    type?: string;
    order_id?: number | string;
    order_number?: string;
    statement_number?: string;
    cycle_code?: string;
    payout_amount?: number | string;
    requested_class?: string;
    class_name?: string;
    reason?: string;
    link?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<VendorNotification | null>(null);
  const [isPushSupported, setIsPushSupported] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isEnablingPush, setIsEnablingPush] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await vendorApi.getUnreadNotificationsCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      // Ignore count fetch errors
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await vendorApi.getNotifications({ page: 1, per_page: 20 });
      const items: VendorNotification[] = Array.isArray(res)
        ? res
        : res.data || [];
      setNotifications(items);
      const unread = items.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    } catch {
      // Ignore list fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    if (typeof window !== "undefined") {
      setIsPushEnabled(firebaseMessaging.isPushEnabled());
      if (!("Notification" in window)) {
        setIsPushSupported(false);
      }
    }

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    const handleNewNotification = () => {
      fetchUnreadCount();
      fetchNotifications();
    };

    window.addEventListener("vf:notification-received", handleNewNotification);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "vf:notification-received",
        handleNewNotification
      );
    };
  }, [fetchUnreadCount, fetchNotifications]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    try {
      const granted = await firebaseMessaging.requestPermissionAndRegister();
      if (granted) {
        setIsPushEnabled(true);
      }
    } finally {
      setIsEnablingPush(false);
    }
  };

  const handleMarkAsRead = async (notification: VendorNotification) => {
    if (!notification.read_at) {
      try {
        await vendorApi.markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignore mark error
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await vendorApi.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Ignore error
    }
  };

  const handleNotificationClick = (notification: VendorNotification) => {
    handleMarkAsRead(notification);
    setSelectedNotification(notification);
    setIsOpen(false);
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 60) return "Just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
      return date.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationDetails = (notification: VendorNotification) => {
    const rawType = (
      notification.data?.type ||
      notification.type ||
      ""
    ).toLowerCase();

    if (rawType.includes("order")) {
      return {
        icon: ShoppingBag,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300",
        badgeColor: "badge-info",
        category: "Order",
        actionLabel: "View Catalog & Orders",
        targetUrl: "/vendor-portal/catalog/manage-product",
      };
    }
    if (rawType.includes("settlement") || rawType.includes("statement") || rawType.includes("payout")) {
      return {
        icon: Receipt,
        color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300",
        badgeColor: "badge-success",
        category: "Settlement",
        actionLabel: "View Accounting & Payouts",
        targetUrl: "/vendor-portal/accounting",
      };
    }
    if (rawType.includes("approved") || rawType.includes("class_change_approved")) {
      return {
        icon: CheckCircle2,
        color: "text-teal-600 bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300",
        badgeColor: "badge-primary",
        category: "Class Change",
        actionLabel: "View Class Change History",
        targetUrl: "/vendor-portal/commerce-hub/history",
      };
    }
    if (rawType.includes("rejected") || rawType.includes("class_change_rejected")) {
      return {
        icon: XCircle,
        color: "text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300",
        badgeColor: "badge-error",
        category: "Class Change",
        actionLabel: "View Settlement Plan",
        targetUrl: "/vendor-portal/commerce-hub/settlement-plan",
      };
    }

    return {
      icon: Bell,
      color: "text-primary bg-primary/10",
      badgeColor: "badge-primary",
      category: "System",
      actionLabel: "View Dashboard",
      targetUrl: "/vendor-portal/dashboard",
    };
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read_at;
    return true;
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Bell Trigger Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="btn btn-ghost btn-circle btn-sm relative text-base-content/70 hover:text-base-content"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-base-100">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-base-100 border border-base-300 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-base-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-base-content">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-xs font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Push Permission Prompt if not enabled */}
            {isPushSupported && !isPushEnabled && (
              <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Volume2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-base-content/80 truncate">
                    Enable push alerts for new orders & settlements
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={isEnablingPush}
                  className="btn btn-primary btn-xs shrink-0"
                >
                  {isEnablingPush ? "Enabling..." : "Enable"}
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-base-200 bg-base-200/40 px-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "unread"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/60 hover:text-base-content"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="badge badge-error badge-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-base-200">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-base-content/50 flex flex-col items-center gap-2">
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-base-content/50 flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 text-base-content/20" />
                  <span>
                    {activeTab === "unread"
                      ? "No unread notifications"
                      : "No notifications yet"}
                  </span>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const meta = getNotificationDetails(notif);
                  const Icon = meta.icon;
                  const isUnread = !notif.read_at;
                  const title =
                    notif.data?.title || notif.data?.message || "Notification";
                  const message = notif.data?.message || "";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-150 relative ${
                        isUnread
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-base-200/60"
                      }`}
                    >
                      {/* Icon Avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`badge ${meta.badgeColor} badge-xs font-semibold text-[9px]`}
                          >
                            {meta.category}
                          </span>
                          <span className="text-[10px] text-base-content/50 whitespace-nowrap">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>
                        <h4
                          className={`text-xs truncate ${
                            isUnread
                              ? "font-bold text-base-content"
                              : "font-medium text-base-content/80"
                          }`}
                        >
                          {title}
                        </h4>
                        {message && (
                          <p className="text-[11px] text-base-content/60 line-clamp-2 mt-0.5 leading-snug">
                            {message}
                          </p>
                        )}
                      </div>

                      {/* Unread dot indicator */}
                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-lg p-6 bg-base-100 rounded-2xl border border-base-300 shadow-2xl relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedNotification(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60 hover:text-base-content"
            >
              <X className="w-4 h-4" />
            </button>

            {(() => {
              const meta = getNotificationDetails(selectedNotification);
              const Icon = meta.icon;
              const title =
                selectedNotification.data?.title ||
                selectedNotification.data?.message ||
                "Notification Details";
              const message = selectedNotification.data?.message || "";
              const targetUrl =
                selectedNotification.data?.link || meta.targetUrl;

              return (
                <div className="space-y-4">
                  {/* Category & Icon */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${meta.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span
                        className={`badge ${meta.badgeColor} badge-sm font-semibold text-[10px]`}
                      >
                        {meta.category}
                      </span>
                      <h3 className="font-bold text-base text-base-content mt-1">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-base-content/50 bg-base-200/50 px-3 py-1.5 rounded-lg w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(
                        selectedNotification.created_at
                      ).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Message Body */}
                  {message && (
                    <div className="p-4 bg-base-200/60 rounded-xl border border-base-300/60 text-sm text-base-content/90 leading-relaxed">
                      {message}
                    </div>
                  )}

                  {/* Dynamic Metadata Details */}
                  {selectedNotification.data && (
                    <div className="space-y-2">
                      {selectedNotification.data.order_number && (
                        <div className="flex justify-between text-xs py-1 border-b border-base-200">
                          <span className="text-base-content/60">
                            Order Number
                          </span>
                          <span className="font-mono font-bold text-base-content">
                            {selectedNotification.data.order_number}
                          </span>
                        </div>
                      )}
                      {selectedNotification.data.statement_number && (
                        <div className="flex justify-between text-xs py-1 border-b border-base-200">
                          <span className="text-base-content/60">
                            Statement Number
                          </span>
                          <span className="font-mono font-bold text-base-content">
                            {selectedNotification.data.statement_number}
                          </span>
                        </div>
                      )}
                      {selectedNotification.data.payout_amount && (
                        <div className="flex justify-between text-xs py-1 border-b border-base-200">
                          <span className="text-base-content/60">
                            Payout Amount
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            RM{" "}
                            {Number(
                              selectedNotification.data.payout_amount
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {selectedNotification.data.requested_class && (
                        <div className="flex justify-between text-xs py-1 border-b border-base-200">
                          <span className="text-base-content/60">
                            Settlement Plan
                          </span>
                          <span className="font-bold uppercase text-primary">
                            {selectedNotification.data.class_name ||
                              selectedNotification.data.requested_class}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="modal-action flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedNotification(null)}
                      className="btn btn-ghost btn-sm"
                    >
                      Close
                    </button>
                    {targetUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotification(null);
                          router.push(targetUrl);
                        }}
                        className="btn btn-primary btn-sm flex items-center gap-1.5 font-semibold"
                      >
                        <span>{meta.actionLabel}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setSelectedNotification(null)}
          ></div>
        </div>
      )}
    </>
  );
}
