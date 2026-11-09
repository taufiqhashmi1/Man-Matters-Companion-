"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarCheck2,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Product Cabinet", icon: Package },
  { href: "/routine", label: "Daily Routine", icon: CalendarCheck2 },
  { href: "/journal", label: "Progress Journal", icon: BookOpen },
  { href: "/companion", label: "AI Companion", icon: Sparkles },
  { href: "/insights", label: "Weekly Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings & Data", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-wellness-border bg-wellness-surface min-h-screen sticky top-0 left-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-wellness-border-subtle">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-wellness-accent flex items-center justify-center text-white shadow-sm font-semibold tracking-wide text-lg group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="font-semibold text-wellness-primary tracking-tight text-base leading-tight">
              Man Matters
            </div>
            <div className="text-[11px] font-medium text-wellness-accent tracking-wider uppercase">
              Companion
            </div>
          </div>
        </Link>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-wellness-accent-soft text-wellness-accent text-[11px] font-medium border border-wellness-accent/15">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Independent Prototype</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium transition-all ${
                isActive
                  ? "bg-wellness-accent text-white shadow-sm"
                  : "text-wellness-secondary hover:text-wellness-primary hover:bg-wellness-bg"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-wellness-secondary"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Reset demo */}
      <div className="p-4 border-t border-wellness-border-subtle space-y-3 bg-wellness-surface-alt">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-medium text-wellness-primary">{profile.displayName}</div>
            <div className="text-[11px] text-wellness-secondary">Preloaded Demo User</div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset to default demo data"
            className="flex items-center gap-1 text-[11px] text-wellness-secondary hover:text-wellness-primary hover:bg-wellness-surface px-2 py-1 rounded border border-wellness-border transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>

        {showResetConfirm && (
          <div className="p-3 bg-wellness-surface rounded-control border border-wellness-border shadow-card text-xs space-y-2 animate-fade-in">
            <p className="text-wellness-secondary">Restore preloaded demo state?</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 bg-wellness-accent text-white rounded text-xs font-medium hover:bg-wellness-accent-hover transition-colors"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 text-wellness-secondary hover:text-wellness-primary text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  const mobileNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/routine", label: "Routine", icon: CalendarCheck2 },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/companion", label: "AI", icon: Sparkles },
    { href: "/insights", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-wellness-surface border-t border-wellness-border z-40 py-1.5 px-2 flex justify-around items-center shadow-elevated">
      {mobileNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? "text-wellness-accent font-semibold"
                : "text-wellness-secondary hover:text-wellness-primary"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-wellness-accent" : "text-wellness-secondary"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function TopHeader() {
  const profile = useAppStore((s) => s.profile);

  return (
    <header className="sticky top-0 z-20 bg-wellness-bg/90 backdrop-blur-md border-b border-wellness-border px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="md:hidden font-semibold text-wellness-primary text-sm tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-wellness-accent text-white inline-flex items-center justify-center text-xs font-bold">
            M
          </span>
          Man Matters Companion
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-wellness-secondary">
          <span>Active Persona:</span>
          <span className="font-semibold text-wellness-primary px-2 py-0.5 bg-wellness-surface rounded-full border border-wellness-border">
            {profile.displayName} (Demo)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/companion"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-wellness-accent text-white text-xs font-medium hover:bg-wellness-accent-hover transition-colors shadow-subtle"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Companion</span>
        </Link>
        <Link
          href="/settings"
          className="p-1.5 rounded-control text-wellness-secondary hover:text-wellness-primary hover:bg-wellness-surface border border-transparent hover:border-wellness-border transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
