"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Receipt,
  Store,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  PanelLeft,
  Boxes,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  User,
  HelpCircle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import SessionExpiredModal from "@/components/SessionExpiredModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    brand,
    user,
    isAuthenticated,
    isLoading,
    isSessionExpired,
    logout,
    dismissSessionExpired,
  } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isSessionExpired) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isSessionExpired, router]);

  useEffect(() => {
    if (pathname.includes("/catalog") || pathname.includes("/products")) {
      setOpenSubmenu("catalog");
    } else if (
      pathname.includes("/insights") ||
      pathname.includes("/reporting")
    ) {
      setOpenSubmenu("insights");
    } else {
      setOpenSubmenu(null);
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm font-medium text-base-content/60">
            Loading Vendor Hub...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isSessionExpired) {
    return null;
  }

  const isItemActive = (href: string, aliases?: string[]) => {
    if (pathname === href) return true;
    if (aliases && aliases.some((a) => pathname === a)) return true;
    if (
      (href === "/vendor-portal/dashboard" || href === "/dashboard") &&
      (pathname === "/vendor-portal" ||
        pathname === "/vendor-portal/dashboard" ||
        pathname === "/" ||
        pathname === "/dashboard")
    ) {
      return true;
    }
    if (
      href === "/vendor-portal/catalog/manage-product" &&
      (pathname === "/vendor-portal/products" ||
        (pathname.startsWith("/vendor-portal/products/") &&
          !pathname.includes("/performance") &&
          !pathname.includes("/breakdown") &&
          !pathname.includes("/new")))
    ) {
      return true;
    }
    return false;
  };

  const navSections = [
    {
      type: "link" as const,
      name: "Dashboard",
      href: "/vendor-portal/dashboard",
      aliases: [
        "/vendor-portal",
        "/vendor-portal/dashboard",
        "/",
        "/dashboard",
      ],
      icon: LayoutDashboard,
    },
    {
      type: "group" as const,
      name: "Catalog",
      key: "catalog",
      icon: Package,
      items: [
        {
          name: "Manage Product",
          href: "/vendor-portal/catalog/manage-product",
          aliases: ["/vendor-portal/products", "/products"],
          icon: Boxes,
        },
        {
          name: "Add Product",
          href: "/vendor-portal/catalog/add-product",
          aliases: ["/vendor-portal/products/new", "/products/new"],
          icon: PlusCircle,
        },
        {
          name: "NCS Leaderboard",
          href: "/vendor-portal/catalog/performance",
          aliases: [
            "/vendor-portal/products/performance",
            "/products/performance",
          ],
          icon: TrendingUp,
        },
        {
          name: "Catalog Breakdown",
          href: "/vendor-portal/catalog/breakdown",
          aliases: ["/vendor-portal/products/breakdown", "/products/breakdown"],
          icon: Layers,
        },
      ],
    },
    {
      type: "group" as const,
      name: "Insights",
      key: "insights",
      icon: BarChart3,
      items: [
        {
          name: "Sales Report",
          href: "/vendor-portal/insights/sales-report",
          aliases: ["/vendor-portal/reporting", "/reporting"],
          icon: BarChart3,
        },
        {
          name: "Performance Report",
          href: "/vendor-portal/insights/performance-report",
          aliases: ["/vendor-portal/reporting/products", "/reporting/products"],
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      type: "link" as const,
      name: "Accounting & Payouts",
      href: "/vendor-portal/accounting",
      aliases: ["/accounting"],
      icon: Receipt,
    },
  ];

  const getKelasBadge = (cls?: string) => {
    switch (cls) {
      case "kelas_a":
        return { label: "Kelas A (45%)", color: "badge-info" };
      case "kelas_c":
        return { label: "Kelas C (55%)", color: "badge-accent" };
      case "kelas_b":
      default:
        return { label: "Kelas B (50% - Standard)", color: "badge-primary" };
    }
  };

  const kelasInfo = getKelasBadge(brand?.settlement_class);

  // Custom Breadcrumbs Generator
  const renderBreadcrumbs = () => {
    if (
      pathname === "/" ||
      pathname === "/dashboard" ||
      pathname === "/vendor-portal" ||
      pathname === "/vendor-portal/dashboard"
    )
      return null;

    let items: { label: string; href?: string }[] = [
      { label: "Dashboard", href: "/vendor-portal/dashboard" },
    ];

    if (pathname.includes("/catalog") || pathname.includes("/products")) {
      items.push({
        label: "Catalog",
        href: "/vendor-portal/catalog/manage-product",
      });
      if (
        pathname.includes("/manage-product") ||
        pathname.endsWith("/products")
      ) {
        items.push({ label: "Manage Product" });
      } else if (
        pathname.includes("/add-product") ||
        pathname.includes("/new")
      ) {
        items.push({ label: "Add Product" });
      } else if (pathname.includes("/performance")) {
        items.push({ label: "NCS Leaderboard" });
      } else if (pathname.includes("/breakdown")) {
        items.push({ label: "Catalog Breakdown" });
      } else if (pathname.includes("/edit")) {
        items.push({ label: "Edit Product" });
      }
    } else if (
      pathname.includes("/insights") ||
      pathname.includes("/reporting")
    ) {
      items.push({
        label: "Insights",
        href: "/vendor-portal/insights/sales-report",
      });
      if (
        pathname.includes("/sales-report") ||
        pathname.endsWith("/reporting")
      ) {
        items.push({ label: "Sales Report" });
      } else if (
        pathname.includes("/performance-report") ||
        pathname.includes("/reporting/products")
      ) {
        items.push({ label: "Performance Report" });
      }
    } else if (
      pathname === "/vendor-portal/accounting" ||
      pathname === "/accounting"
    ) {
      items.push({ label: "Accounting & Payouts" });
    } else {
      const segments = pathname
        .replace(/^\/vendor-portal/, "")
        .split("/")
        .filter(Boolean);
      segments.forEach((seg, idx) => {
        const href = "/vendor-portal/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const label = seg
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({ label, href: isLast ? undefined : href });
      });
    }

    return (
      <div className="text-xs breadcrumbs mb-6 text-base-content/60">
        <ul>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li
                key={idx}
                className={isLast ? "font-semibold text-base-content" : ""}
              >
                {item.href ? (
                  <Link href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-base-100 border-r border-base-300 flex flex-col shrink-0 fixed inset-y-0 z-20 transition-all duration-200`}
      >
        {/* Top Logo Container - Exact h-16 to match navbar border */}
        <div className="h-16 px-4 border-b border-base-300 flex items-center justify-center shrink-0">
          <Link
            href="/vendor-portal/dashboard"
            className="flex items-center justify-center w-full h-full px-2"
          >
            {isCollapsed ? (
              <img
                src="/images/logo/preloader_icon.png"
                alt="VAMOFLEX"
                className="h-9 w-9 object-contain"
              />
            ) : (
              <img
                src="/images/logo/logo.png"
                alt="VAMOFLEX"
                className="h-20 sm:h-18 w-auto max-h-20 object-contain"
              />
            )}
          </Link>
        </div>

        {/* Partner Brand Section (Below Border) */}
        {!isCollapsed ? (
          <div className="p-4 border-b border-base-300 bg-base-100">
            <div className="flex items-center gap-2.5 p-2.5 bg-base-200/80 rounded-xl border border-base-300/60">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="overflow-hidden flex-1">
                <h2 className="font-bold text-xs tracking-tight truncate text-base-content">
                  {brand?.name || "Partner Brand"}
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`badge ${kelasInfo.color} badge-xs font-semibold text-[9px]`}
                  >
                    {kelasInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="p-3 border-b border-base-300 flex justify-center bg-base-100"
            title={`${brand?.name || "Partner Brand"} (${kelasInfo.label})`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Navigation - Full Width Edge-to-Edge with Submenus */}
        <nav className="flex-1 py-3 px-0 space-y-1 overflow-y-auto">
          {navSections.map((section) => {
            if (section.type === "link") {
              const isActive =
                section.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(section.href);
              const Icon = section.icon;

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  title={isCollapsed ? section.name : undefined}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center px-0" : "justify-between px-6"
                  } py-3 rounded-none text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content font-bold"
                      : "text-base-content/75 hover:bg-primary/5 hover:text-primary font-medium"
                  }`}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"}`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive
                          ? "text-primary-content"
                          : "text-base-content/60 group-hover:text-primary"
                      }`}
                    />
                    {!isCollapsed && <span>{section.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive
                          ? "opacity-90 translate-x-0 text-primary-content"
                          : "opacity-0 -translate-x-2 text-primary group-hover:opacity-100 group-hover:translate-x-0"
                      }`}
                    />
                  )}
                </Link>
              );
            }

            // Submenu Group (Catalog or Insights)
            const Icon = section.icon;
            const isGroupActive = section.items.some((item) =>
              isItemActive(item.href, item.aliases),
            );
            const isOpen = openSubmenu === section.key;

            if (isCollapsed) {
              return (
                <div
                  key={section.key}
                  className="dropdown dropdown-right w-full flex justify-center py-1"
                >
                  <div
                    tabIndex={0}
                    role="button"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isGroupActive
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-base-content/60 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-box w-52 border border-base-300 ml-2"
                  >
                    <li className="menu-title text-xs font-bold text-base-content/80 uppercase px-3 py-1">
                      {section.name}
                    </li>
                    {section.items.map((subItem) => {
                      const isSubActive = isItemActive(
                        subItem.href,
                        subItem.aliases,
                      );
                      const SubIcon = subItem.icon;
                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center gap-2 text-xs py-2 ${
                              isSubActive
                                ? "active bg-primary text-primary-content font-bold"
                                : ""
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }

            return (
              <div key={section.key} className="space-y-0.5">
                {/* Group Header Trigger */}
                <button
                  type="button"
                  onClick={() => toggleSubmenu(section.key)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm font-semibold transition-colors duration-150 ${
                    isGroupActive
                      ? "text-primary bg-primary/5"
                      : "text-base-content/80 hover:bg-base-200/60 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 ${isGroupActive ? "text-primary" : "text-base-content/60"}`}
                    />
                    <span>{section.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-base-content/40 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Submenu Items List */}
                {isOpen && (
                  <div className="bg-base-200/40 py-1 border-y border-base-300/30 space-y-0.5">
                    {section.items.map((subItem) => {
                      const isSubActive = isItemActive(
                        subItem.href,
                        subItem.aliases,
                      );
                      const SubIcon = subItem.icon;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`group flex items-center justify-between pl-12 pr-6 py-2.5 text-xs transition-all duration-150 ${
                            isSubActive
                              ? "bg-primary text-primary-content font-bold shadow-sm"
                              : "text-base-content/70 hover:text-primary hover:bg-primary/5 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon
                              className={`w-4 h-4 ${
                                isSubActive
                                  ? "text-primary-content"
                                  : "text-base-content/50 group-hover:text-primary"
                              }`}
                            />
                            <span>{subItem.name}</span>
                          </div>
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Single Hub Fulfillment Notice (expanded only) */}
        {!isCollapsed && (
          <div className="p-4 mx-3 mb-3 bg-base-200/90 rounded-xl border border-base-300 text-xs text-base-content/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Single Hub Fulfillment</span>
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              All customer shipments are fulfilled seamlessly via VAMOFLEX
              Central Logistics Hub.
            </p>
          </div>
        )}

        {/* User / Logout Footer */}
        <div
          className={`p-4 border-t border-base-300 flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-base-content">
                {user?.name || user?.username || "Vendor Account"}
              </p>
              <p className="text-[10px] text-base-content/50 truncate">
                {user?.email || "vendor@vamoflex.com"}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="btn btn-ghost btn-sm btn-square text-error"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          isCollapsed ? "ml-20" : "ml-64"
        } min-w-0 transition-all duration-200`}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-base-100 border-b border-base-300 sticky top-0 z-10 px-2flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-ghost btn-sm btn-square text-base-content/70 hover:text-base-content"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Weekly Cycle Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Next Payout: <strong className="font-bold">Wednesday</strong>{" "}
                (Sunday Cutoff)
              </span>
            </div>

            {/* User Profile & Account Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2 pl-2 pr-3 rounded-full border border-base-300 hover:bg-base-200"
              >
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "V"}
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold leading-tight text-base-content max-w-[140px] truncate">
                    {user?.name || user?.username || "Vendor Partner"}
                  </span>
                  <span className="text-[10px] text-base-content/60 leading-none truncate max-w-[140px]">
                    {brand?.name || "Brand Partner"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-base-content/60" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-300 mt-2 space-y-1"
              >
                <li className="menu-title px-3 py-1">
                  <span className="text-xs font-semibold text-base-content/80">
                    Account
                  </span>
                </li>
                <li>
                  <Link
                    href="/vendor-portal/profile"
                    className="flex items-center gap-2.5 py-2 text-xs font-medium"
                  >
                    <User className="w-4 h-4 text-base-content/70" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendor-portal/support"
                    className="flex items-center gap-2.5 py-2 text-xs font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-base-content/70" />
                    Help & Support
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2.5 py-2 text-xs font-medium text-error hover:bg-error/10 hover:text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8">
          {renderBreadcrumbs()}
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Sign Out of Vendor Portal"
        description="Are you sure you want to sign out? You will need to enter your brand credentials again to access the portal."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        variant="primary"
        icon="logout"
      />

      {/* Session Expired / Token Invalid Modal */}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onRedirectNow={dismissSessionExpired}
        redirectSeconds={15}
      />
    </div>
  );
}
