"use client";

import { useState } from "react";
import {
  Settings,
  Download,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  Clock,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const exportDataJson = useAppStore((s) => s.exportDataJson);
  const importDataJson = useAppStore((s) => s.importDataJson);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const clearAllData = useAppStore((s) => s.clearAllData);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [preferredReminder, setPreferredReminder] = useState<"morning" | "evening">(
    profile.preferences?.preferredReminderPeriod || "morning"
  );
  const [isSaved, setIsSaved] = useState(false);

  // Modals & confirmation dialogs
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim() || "User",
      preferences: {
        preferredReminderPeriod: preferredReminder,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `man-matters-companion-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importDataJson(text);
      if (res.success) {
        setImportStatus("Backup imported successfully!");
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setDisplayName("Alex");
  };

  const handleExecuteClear = async () => {
    await clearAllData();
    setShowClearConfirm(false);
    setDisplayName("User");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-wellness-border pb-6">
        <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1">
          Preferences & Storage Controls
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
          Settings & Local Data
        </h1>
        <p className="text-sm text-wellness-secondary mt-1">
          Manage your personal profile, download JSON backups, or reset demo data.
        </p>
      </div>

      {/* Profile Preferences */}
      <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-wellness-border-subtle">
          <User className="w-4 h-4 text-wellness-accent" />
          <h3 className="font-bold text-sm text-wellness-primary">Profile Preferences</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-wellness-primary block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-sm px-3.5 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-wellness-primary block">
              Primary Habit Focus Period
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reminderPeriod"
                  checked={preferredReminder === "morning"}
                  onChange={() => setPreferredReminder("morning")}
                  className="accent-wellness-accent"
                />
                <span className="text-wellness-primary">Morning</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reminderPeriod"
                  checked={preferredReminder === "evening"}
                  onChange={() => setPreferredReminder("evening")}
                  className="accent-wellness-accent"
                />
                <span className="text-wellness-primary">Evening</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-subtle"
            >
              Save Preferences
            </button>
            {isSaved && (
              <span className="text-wellness-success text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* AI Model Status & Configuration Info */}
      <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-3 text-xs leading-relaxed">
        <div className="flex items-center gap-2.5 pb-2 border-b border-wellness-border-subtle">
          <Sparkles className="w-4 h-4 text-wellness-accent" />
          <h3 className="font-bold text-sm text-wellness-primary">Gemini AI Configuration Status</h3>
        </div>

        <p className="text-wellness-secondary">
          The companion uses Google&apos;s GenAI SDK inside a secure Next.js server route (<code className="bg-wellness-surface-alt px-1 py-0.5 rounded text-[11px] border border-wellness-border">/api/companion</code>).
          The server environment variable <code className="bg-wellness-surface-alt px-1 py-0.5 rounded text-[11px] border border-wellness-border">GEMINI_API_KEY</code> is kept strictly private and never exposed to the browser client.
        </p>

        <div className="p-3 bg-wellness-surface-alt rounded-control border border-wellness-border-subtle flex items-start gap-2.5 text-wellness-secondary">
          <Info className="w-4 h-4 text-wellness-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-wellness-primary block">
              Zero-Dependency Fallback Guarantee
            </span>
            <span>
              If no API key is configured or the cloud API is offline, the companion automatically serves curated, verified instructions from the local knowledge base.
            </span>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-wellness-border-subtle">
          <Download className="w-4 h-4 text-wellness-accent" />
          <h3 className="font-bold text-sm text-wellness-primary">Data Backup & Migration</h3>
        </div>

        <p className="text-xs text-wellness-secondary leading-relaxed">
          Your product cabinet, routines, completion logs, and text journal entries can be exported as a standard JSON file.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border hover:bg-wellness-surface text-wellness-primary font-medium text-xs shadow-subtle transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-wellness-accent" />
            <span>Export Data as JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border hover:bg-wellness-surface text-wellness-primary font-medium text-xs shadow-subtle transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-wellness-accent" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs font-medium text-wellness-accent">{importStatus}</p>
        )}
      </div>

      {/* Reset & Clear Demo Controls */}
      <div className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-wellness-border-subtle">
          <RotateCcw className="w-4 h-4 text-wellness-warning" />
          <h3 className="font-bold text-sm text-wellness-primary">Demo State Management</h3>
        </div>

        <p className="text-xs text-wellness-secondary leading-relaxed">
          Restore the preloaded fictional demo customer (Alex) with illustrative products, morning/evening routines, synthetic 7-day logs, and sample journal notes.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-warning-soft text-wellness-warning hover:bg-wellness-warning hover:text-white font-medium text-xs transition-colors border border-wellness-warning/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Seed State</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-danger-soft text-wellness-danger hover:bg-wellness-danger hover:text-white font-medium text-xs transition-colors border border-wellness-danger/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Local App Data</span>
          </button>
        </div>
      </div>

      {/* Legal & Medical Disclaimers */}
      <div className="p-5 rounded-card bg-wellness-surface-alt border border-wellness-border space-y-2 text-xs leading-relaxed text-wellness-secondary">
        <div className="flex items-center gap-2 font-bold text-wellness-primary text-xs">
          <ShieldCheck className="w-4 h-4 text-wellness-accent" />
          <span>Independent Prototype Concept Disclaimer</span>
        </div>
        <p>
          This application is an independent concept prototype developed for the Mosaic Wellness Fellowship Challenge. It is not an official Man Matters product, medical diagnostic system, or clinical service.
        </p>
        <p>
          All information is intended solely for educational consistency tracking. For medical concerns, adverse reactions, or prescription questions, please consult a qualified healthcare professional.
        </p>
      </div>

      {/* Reset Demo Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-wellness-warning">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-base text-wellness-primary">Reset Demo State?</h4>
            </div>
            <p className="text-xs text-wellness-secondary leading-relaxed">
              This will restore the preloaded demo customer (Alex), sample products, synthetic 7-day routine logs, and journal entries. Any unsaved custom modifications will be overwritten.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-control text-xs font-medium text-wellness-secondary hover:text-wellness-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-4 py-1.5 rounded-control text-xs font-medium bg-wellness-accent text-white hover:bg-wellness-accent-hover transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-wellness-danger">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-base text-wellness-primary">Clear All Data?</h4>
            </div>
            <p className="text-xs text-wellness-secondary leading-relaxed">
              This will permanently delete all saved products, routines, logs, and photos from this browser. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-control text-xs font-medium text-wellness-secondary hover:text-wellness-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteClear}
                className="px-4 py-1.5 rounded-control text-xs font-medium bg-wellness-danger text-white hover:bg-wellness-danger/90 transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
