"use client";

import Link from "next/link";
import {
  CalendarCheck2,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Package,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { formatFriendlyDate, getTodayDateString } from "@/lib/dates";
import { computeWeeklyInsights } from "@/lib/analytics/insights";

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile);
  const products = useAppStore((s) => s.products);
  const routines = useAppStore((s) => s.routines);
  const routineItems = useAppStore((s) => s.routineItems);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const toggleCompleteItem = useAppStore((s) => s.toggleCompleteItem);
  const isItemCompletedOnDate = useAppStore((s) => s.isItemCompletedOnDate);
  const store = useAppStore();

  const todayStr = getTodayDateString();
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Calculate dynamic weekly insights
  const weeklyInsights = computeWeeklyInsights(store);

  // Active products
  const activeProducts = products.filter((p) => p.status === "active");

  // Filter today's active items
  const activeRoutineItems = routineItems.filter((i) => i.isActive);
  const currentDayOfWeek = new Date().getDay();

  const todayScheduledItems = activeRoutineItems.filter((item) => {
    if (item.frequency === "daily" || item.frequency === "as-entered") return true;
    if (item.frequency === "selected-days" && item.daysOfWeek) {
      return item.daysOfWeek.includes(currentDayOfWeek);
    }
    return true;
  });

  const completedTodayCount = todayScheduledItems.filter((item) =>
    isItemCompletedOnDate(item.id, todayStr)
  ).length;

  const todayCompletionRate =
    todayScheduledItems.length > 0
      ? Math.round((completedTodayCount / todayScheduledItems.length) * 100)
      : 0;

  // Group today's items by routine timeOfDay
  const morningRoutine = routines.find((r) => r.timeOfDay === "morning");
  const eveningRoutine = routines.find((r) => r.timeOfDay === "evening");

  const morningItems = todayScheduledItems.filter((item) =>
    morningRoutine ? item.routineId === morningRoutine.id : false
  );
  const eveningItems = todayScheduledItems.filter((item) =>
    eveningRoutine ? item.routineId === eveningRoutine.id : false
  );
  const otherItems = todayScheduledItems.filter(
    (item) =>
      (!morningRoutine || item.routineId !== morningRoutine.id) &&
      (!eveningRoutine || item.routineId !== eveningRoutine.id)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting & Summary Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-wellness-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1">
            {todayFormatted}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
            Welcome back, {profile.displayName}
          </h1>
          <p className="text-sm text-wellness-secondary mt-1">
            {todayScheduledItems.length === 0
              ? "No routine items scheduled for today."
              : completedTodayCount === todayScheduledItems.length
              ? "All scheduled activities completed for today. Well done on your consistency!"
              : `${completedTodayCount} of ${todayScheduledItems.length} activities completed today.`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/products?action=new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-wellness-surface border border-wellness-border hover:bg-wellness-surface-alt text-wellness-primary text-xs font-medium transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5 text-wellness-accent" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/journal?action=new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control bg-wellness-surface border border-wellness-border hover:bg-wellness-surface-alt text-wellness-primary text-xs font-medium transition-colors shadow-subtle"
          >
            <BookOpen className="w-3.5 h-3.5 text-wellness-accent" />
            <span>Log Progress</span>
          </Link>
          <Link
            href="/companion"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-control bg-wellness-accent text-white hover:bg-wellness-accent-hover text-xs font-medium transition-colors shadow-card"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Companion</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Progress Card */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-wellness-secondary">Today&apos;s Routine</span>
            <CalendarCheck2 className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-wellness-primary">{todayCompletionRate}%</span>
            <span className="text-xs text-wellness-muted">
              ({completedTodayCount}/{todayScheduledItems.length})
            </span>
          </div>
          <div className="w-full bg-wellness-border/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-wellness-accent h-full transition-all duration-300"
              style={{ width: `${todayCompletionRate}%` }}
            />
          </div>
        </div>

        {/* 7-Day Consistency Card */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-wellness-secondary">7-Day Consistency</span>
            <TrendingUp className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-wellness-primary">
              {weeklyInsights.overallRate}%
            </span>
            <span className="text-xs text-wellness-muted">
              ({weeklyInsights.totalCompleted}/{weeklyInsights.totalScheduled} logs)
            </span>
          </div>
          <Link
            href="/insights"
            className="text-xs text-wellness-accent font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View 7-day breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Products Card */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-wellness-secondary">Cabinet In-Use</span>
            <Package className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-wellness-primary">
              {activeProducts.length}
            </span>
            <span className="text-xs text-wellness-muted">active products</span>
          </div>
          <Link
            href="/products"
            className="text-xs text-wellness-accent font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>Review instructions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Today's Schedule & Routine Completion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-wellness-primary">Today&apos;s Activities</h2>
            <p className="text-xs text-wellness-secondary">
              Check off items as you complete them. Persists automatically in your browser.
            </p>
          </div>
          <Link
            href="/routine"
            className="text-xs text-wellness-accent hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Manage schedules</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {todayScheduledItems.length === 0 ? (
          <div className="p-8 text-center rounded-card bg-wellness-surface border border-wellness-border text-wellness-secondary space-y-2">
            <CalendarCheck2 className="w-8 h-8 text-wellness-muted mx-auto" />
            <p className="text-sm font-medium">No routine activities scheduled for today.</p>
            <Link
              href="/routine"
              className="text-xs text-wellness-accent font-medium hover:underline inline-block"
            >
              Configure your daily routine →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Morning Section */}
            {morningItems.length > 0 && (
              <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border space-y-3 shadow-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-wellness-border-subtle">
                  <span className="text-xs font-semibold text-wellness-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-wellness-accent" />
                    Morning Routine
                  </span>
                  <span className="text-[11px] text-wellness-secondary">
                    {morningItems.filter((i) => isItemCompletedOnDate(i.id, todayStr)).length} /{" "}
                    {morningItems.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {morningItems.map((item) => {
                    const isDone = isItemCompletedOnDate(item.id, todayStr);
                    const linkedProd = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCompleteItem(item.id, todayStr)}
                        className={`p-3 rounded-control border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? "bg-wellness-accent-soft/40 border-wellness-accent/30 text-wellness-primary"
                            : "bg-wellness-surface-alt hover:bg-wellness-surface border-wellness-border text-wellness-primary"
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-wellness-accent shrink-0 focus:outline-none"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 fill-wellness-accent text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-wellness-muted hover:text-wellness-accent" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isDone ? "line-through text-wellness-secondary" : ""
                              }`}
                            >
                              {item.title}
                            </span>
                            {linkedProd && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-wellness-surface border border-wellness-border text-wellness-secondary">
                                {linkedProd.category}
                              </span>
                            )}
                          </div>
                          {item.instruction && (
                            <p className="text-xs text-wellness-secondary mt-0.5 line-clamp-2">
                              {item.instruction}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evening Section */}
            {eveningItems.length > 0 && (
              <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border space-y-3 shadow-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-wellness-border-subtle">
                  <span className="text-xs font-semibold text-wellness-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-wellness-accent" />
                    Evening Routine
                  </span>
                  <span className="text-[11px] text-wellness-secondary">
                    {eveningItems.filter((i) => isItemCompletedOnDate(i.id, todayStr)).length} /{" "}
                    {eveningItems.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {eveningItems.map((item) => {
                    const isDone = isItemCompletedOnDate(item.id, todayStr);
                    const linkedProd = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCompleteItem(item.id, todayStr)}
                        className={`p-3 rounded-control border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? "bg-wellness-accent-soft/40 border-wellness-accent/30 text-wellness-primary"
                            : "bg-wellness-surface-alt hover:bg-wellness-surface border-wellness-border text-wellness-primary"
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-wellness-accent shrink-0 focus:outline-none"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 fill-wellness-accent text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-wellness-muted hover:text-wellness-accent" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isDone ? "line-through text-wellness-secondary" : ""
                              }`}
                            >
                              {item.title}
                            </span>
                            {linkedProd && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-wellness-surface border border-wellness-border text-wellness-secondary">
                                {linkedProd.category}
                              </span>
                            )}
                          </div>
                          {item.instruction && (
                            <p className="text-xs text-wellness-secondary mt-0.5 line-clamp-2">
                              {item.instruction}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other / Custom Items */}
            {otherItems.length > 0 && (
              <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border space-y-3 shadow-subtle md:col-span-2">
                <div className="text-xs font-semibold text-wellness-primary uppercase tracking-wider pb-2 border-b border-wellness-border-subtle">
                  Custom & Flexible Schedule
                </div>
                <div className="space-y-2">
                  {otherItems.map((item) => {
                    const isDone = isItemCompletedOnDate(item.id, todayStr);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCompleteItem(item.id, todayStr)}
                        className={`p-3 rounded-control border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isDone
                            ? "bg-wellness-accent-soft/40 border-wellness-accent/30"
                            : "bg-wellness-surface-alt hover:bg-wellness-surface border-wellness-border"
                        }`}
                      >
                        <button type="button" className="mt-0.5 text-wellness-accent shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 fill-wellness-accent text-white" />
                          ) : (
                            <Circle className="w-5 h-5 text-wellness-muted" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-medium ${
                              isDone ? "line-through text-wellness-secondary" : ""
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.instruction && (
                            <p className="text-xs text-wellness-secondary mt-0.5">
                              {item.instruction}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row: Active Products Snapshot & Recent Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Products List */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-wellness-primary text-sm">Active Product Guidelines</h3>
            <Link
              href="/products"
              className="text-xs text-wellness-accent hover:underline font-medium"
            >
              View cabinet
            </Link>
          </div>
          <div className="space-y-2.5">
            {activeProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-control bg-wellness-surface-alt border border-wellness-border-subtle space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-wellness-primary">{prod.name}</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-wellness-accent bg-wellness-accent-soft px-2 py-0.5 rounded-full">
                    {prod.category}
                  </span>
                </div>
                <p className="text-xs text-wellness-secondary line-clamp-2 leading-relaxed">
                  {prod.instructionText || "No verified instructions added."}
                </p>
                {prod.sourceLabel && (
                  <div className="text-[10px] text-wellness-muted flex items-center gap-1 pt-0.5">
                    <span>Source: {prod.sourceLabel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Journal Activity */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-wellness-primary text-sm">Subjective Observations</h3>
            <Link
              href="/journal"
              className="text-xs text-wellness-accent hover:underline font-medium"
            >
              Open journal
            </Link>
          </div>

          {journalEntries.length === 0 ? (
            <div className="py-6 text-center text-xs text-wellness-secondary space-y-2">
              <p>No observations recorded yet.</p>
              <Link
                href="/journal?action=new"
                className="text-wellness-accent font-medium hover:underline inline-block"
              >
                + Add your first observation
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {journalEntries.slice(0, 2).map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-control bg-wellness-surface-alt border border-wellness-border-subtle space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-wellness-accent capitalize">
                      {entry.category} observation
                    </span>
                    <span className="text-wellness-muted">{formatFriendlyDate(entry.date)}</span>
                  </div>
                  <p className="text-xs text-wellness-secondary line-clamp-2 leading-relaxed">
                    &ldquo;{entry.observation}&rdquo;
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-wellness-surface text-wellness-secondary border border-wellness-border"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
