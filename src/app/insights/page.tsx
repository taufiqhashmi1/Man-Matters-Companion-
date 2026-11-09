"use client";

import Link from "next/link";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
  Package,
  BookOpen,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { computeWeeklyInsights } from "@/lib/analytics/insights";

export default function InsightsPage() {
  const store = useAppStore();
  const summary = computeWeeklyInsights(store);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{summary.dateRangeLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
            Weekly Activity Insights
          </h1>
          <p className="text-sm text-wellness-secondary mt-1">
            Factual summaries derived strictly from your local routine check-offs and journal logs.
          </p>
        </div>

        <Link
          href="/companion"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-card text-xs shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Summarize with AI</span>
        </Link>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Completion Rate */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-wellness-secondary">
            <span>Weekly Completion</span>
            <TrendingUp className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-wellness-primary">{summary.overallRate}%</span>
            <span className="text-xs text-wellness-muted">of scheduled items</span>
          </div>
          <p className="text-[11px] text-wellness-secondary">
            {summary.totalCompleted} completed out of {summary.totalScheduled} total scheduled activities.
          </p>
        </div>

        {/* Most Consistent Focus */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-wellness-secondary">
            <span>Highest Consistency</span>
            <Package className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-wellness-primary capitalize">
              {summary.mostConsistentCategory || "N/A"}
            </span>
          </div>
          <p className="text-[11px] text-wellness-secondary">
            {summary.mostConsistentCategory
              ? "Maintained the highest check-off rate over the past 7 days."
              : "Not enough routine logs to compute category rank."}
          </p>
        </div>

        {/* Observations Recorded */}
        <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-wellness-secondary">
            <span>Journal Observations</span>
            <BookOpen className="w-4 h-4 text-wellness-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-wellness-primary">
              {summary.journalEntryCount}
            </span>
            <span className="text-xs text-wellness-muted">entries this week</span>
          </div>
          <p className="text-[11px] text-wellness-secondary">
            Subjective observations recorded during this 7-day period.
          </p>
        </div>
      </div>

      {/* Daily Breakdown Chart / Progress Bars */}
      <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-wellness-primary">7-Day Daily Adherence</h3>
            <p className="text-xs text-wellness-secondary">
              Activity completion across each day of the week.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {summary.dailyBreakdown.map((day) => (
            <div key={day.date} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-wellness-primary w-20">
                  {day.dayLabel} ({day.date.split("-").slice(1).join("/")})
                </span>
                <span className="text-wellness-secondary">
                  {day.completed} / {day.scheduled} completed ({day.rate}%)
                </span>
              </div>
              <div className="w-full bg-wellness-surface-alt border border-wellness-border-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="bg-wellness-accent h-full transition-all duration-300"
                  style={{ width: `${day.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {summary.categoryMetrics.length > 0 && (
        <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-4">
          <h3 className="font-bold text-base text-wellness-primary">Consistency by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {summary.categoryMetrics.map((cat) => (
              <div
                key={cat.category}
                className="p-3.5 rounded-control bg-wellness-surface-alt border border-wellness-border-subtle space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-wellness-primary capitalize">{cat.category}</span>
                  <span className="font-semibold text-wellness-accent">{cat.rate}%</span>
                </div>
                <div className="w-full bg-wellness-border/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-wellness-accent h-full"
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
                <div className="text-[10px] text-wellness-muted">
                  {cat.totalCompleted} completed / {cat.totalScheduled} scheduled
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation of Calculation (Transparent Non-Medical Data Governance) */}
      <div className="p-5 rounded-card bg-wellness-surface-alt border border-wellness-border flex items-start gap-3 text-xs leading-relaxed text-wellness-secondary">
        <Info className="w-4 h-4 text-wellness-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-wellness-primary block">
            How these figures are derived:
          </span>
          <p>{summary.explanation}</p>
        </div>
      </div>
    </div>
  );
}
