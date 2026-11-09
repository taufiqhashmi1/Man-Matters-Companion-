"use client";

import Link from "next/link";
import {
  Package,
  CalendarCheck2,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkle,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";

export default function WelcomePage() {
  const profile = useAppStore((s) => s.profile);
  const resetDemoData = useAppStore((s) => s.resetDemoData);

  return (
    <div className="space-y-12 py-4 sm:py-8 max-w-4xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wellness-accent-soft text-wellness-accent text-xs font-semibold border border-wellness-accent/15">
          <Sparkle className="w-3.5 h-3.5" />
          <span>Mosaic Wellness Fellowship Challenge Prototype</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-wellness-primary leading-[1.15]">
          Your wellness journey, <br className="hidden sm:inline" />
          <span className="text-wellness-accent">in one calm place.</span>
        </h1>

        <p className="text-base sm:text-lg text-wellness-secondary max-w-2xl mx-auto leading-relaxed">
          Manage your personal products, build consistent daily routines, capture honest progress observations, and query verified product instructions with contextual AI.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover shadow-card transition-all text-sm group"
          >
            <span>Explore Preloaded Demo ({profile.displayName})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/routine"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-wellness-surface text-wellness-primary font-medium hover:bg-wellness-surface-alt border border-wellness-border transition-colors text-sm shadow-subtle"
          >
            <span>Configure Routine</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-wellness-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-wellness-success" />
            No signup or credit card required
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-wellness-accent" />
            Instant interactive reviewer demo
          </span>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-wellness-accent-soft flex items-center justify-center text-wellness-accent">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-wellness-primary">1. Product Cabinet</h3>
          <p className="text-sm text-wellness-secondary leading-relaxed">
            Keep track of what you own with verified usage directions, application guidelines, and official source labels. No fabricated instructions.
          </p>
        </div>

        <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-wellness-accent-soft flex items-center justify-center text-wellness-accent">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-wellness-primary">2. Daily Routines</h3>
          <p className="text-sm text-wellness-secondary leading-relaxed">
            Morning, evening, and custom schedules with date-specific completion check-offs. Honest consistency tracking without shame or guilt language.
          </p>
        </div>

        <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-wellness-accent-soft flex items-center justify-center text-wellness-accent">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-wellness-primary">3. Progress Journal</h3>
          <p className="text-sm text-wellness-secondary leading-relaxed">
            Record subjective observations, tags, and progress photos securely stored in your browser IndexedDB. Compare two entries side-by-side.
          </p>
        </div>

        <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-3">
          <div className="w-10 h-10 rounded-xl bg-wellness-accent-soft flex items-center justify-center text-wellness-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-wellness-primary">4. Contextual Companion</h3>
          <p className="text-sm text-wellness-secondary leading-relaxed">
            Ask questions grounded strictly in your saved products, verified instructions, and recent logs. Gracefully falls back to local knowledge when offline.
          </p>
        </div>
      </div>

      {/* Trust & Boundary Notice */}
      <div className="p-5 rounded-card bg-wellness-surface border border-wellness-border/80 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-wellness-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-wellness-secondary leading-relaxed">
          <div className="font-semibold text-wellness-primary">Safe by Design & Non-Medical Policy</div>
          <p>
            This is an independent concept prototype built for the Mosaic Wellness Fellowship Challenge. It does not provide medical advice, diagnosis, or prescription changes. All personal data is saved strictly in your local browser profile.
          </p>
        </div>
      </div>
    </div>
  );
}
