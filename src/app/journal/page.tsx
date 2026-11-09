"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Image as ImageIcon,
  Tag,
  Calendar,
  X,
  Trash2,
  Columns2,
  ShieldAlert,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { JournalEntry, ProductCategory } from "@/types/domain";
import { formatFriendlyDate, getTodayDateString } from "@/lib/dates";
import {
  getPhotoDataUrl,
  savePhotoBlob,
  deletePhotoBlob,
} from "@/lib/storage/indexed-db";

const CATEGORIES: ProductCategory[] = ["hair", "skin", "nutrition", "wellness", "other"];

export default function JournalPage() {
  const journalEntries = useAppStore((s) => s.journalEntries);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const deleteJournalEntry = useAppStore((s) => s.deleteJournalEntry);
  const addJournalPhoto = useAppStore((s) => s.addJournalPhoto);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<string>("hair");
  const [observation, setObservation] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Loaded photo previews for entries: Map<photoId, dataUrl>
  const [photoCache, setPhotoCache] = useState<{ [photoId: string]: string }>({});

  // Comparison selections (entry A & entry B)
  const [compareIdA, setCompareIdA] = useState<string>("");
  const [compareIdB, setCompareIdB] = useState<string>("");

  // Load photos into local cache on mount and entry changes
  useEffect(() => {
    let isMounted = true;
    async function loadAllPhotos() {
      const neededPhotoIds = journalEntries.flatMap((e) => e.photoIds || []);
      const newCache: { [id: string]: string } = {};

      for (const id of neededPhotoIds) {
        if (!photoCache[id]) {
          const url = await getPhotoDataUrl(id);
          if (url && isMounted) {
            newCache[id] = url;
          }
        }
      }

      if (isMounted && Object.keys(newCache).length > 0) {
        setPhotoCache((prev) => ({ ...prev, ...newCache }));
      }
    }
    loadAllPhotos();
    return () => {
      isMounted = false;
    };
  }, [journalEntries]);

  const openAddModal = () => {
    setDate(getTodayDateString());
    setCategory("hair");
    setObservation("");
    setTagsInput("");
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      setUploadError("Only standard image files (JPEG, PNG, WebP) are supported.");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size exceeds 5MB limit. Please upload a smaller photo.");
      return;
    }

    setPhotoBlob(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(previewUrl);
  };

  const removePhotoDraft = () => {
    setPhotoBlob(null);
    setPhotoPreviewUrl(null);
    setUploadError(null);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) return;

    const tags = tagsInput
      .split(/[\s,#,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const photoIds: string[] = [];

    if (photoBlob) {
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await savePhotoBlob(photoId, photoBlob);
      addJournalPhoto({
        id: photoId,
        indexedDbKey: photoId,
        mimeType: photoBlob.type,
        size: photoBlob.size,
        createdAt: new Date().toISOString(),
      });
      photoIds.push(photoId);

      if (photoPreviewUrl) {
        setPhotoCache((prev) => ({ ...prev, [photoId]: photoPreviewUrl }));
      }
    }

    addJournalEntry({
      date,
      category,
      observation: observation.trim(),
      tags,
      photoIds,
    });

    setModalOpen(false);
  };

  const filteredEntries = journalEntries.filter((e) => {
    if (activeCategory === "all") return true;
    return e.category === activeCategory;
  });

  const openComparison = () => {
    if (journalEntries.length >= 2) {
      setCompareIdA(journalEntries[0].id);
      setCompareIdB(journalEntries[1].id);
      setCompareModalOpen(true);
    }
  };

  const entryA = journalEntries.find((e) => e.id === compareIdA);
  const entryB = journalEntries.find((e) => e.id === compareIdB);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1">
            Subjective Observation Timeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
            Progress Journal
          </h1>
          <p className="text-sm text-wellness-secondary mt-1">
            Capture personal observations, texture changes, and optional photos securely stored on your device.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {journalEntries.length >= 2 && (
            <button
              onClick={openComparison}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-control bg-wellness-surface border border-wellness-border text-wellness-primary hover:bg-wellness-surface-alt font-medium text-xs shadow-subtle transition-colors"
            >
              <Columns2 className="w-3.5 h-3.5 text-wellness-accent" />
              <span>Compare Entries</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-card text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Observation</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-wellness-accent text-white shadow-sm"
              : "bg-wellness-surface text-wellness-secondary border border-wellness-border hover:text-wellness-primary"
          }`}
        >
          All Observations ({journalEntries.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = journalEntries.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-wellness-accent text-white shadow-sm"
                  : "bg-wellness-surface text-wellness-secondary border border-wellness-border hover:text-wellness-primary"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Journal Timeline List (Newest first) */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-wellness-surface border border-wellness-border space-y-3">
          <BookOpen className="w-10 h-10 text-wellness-muted mx-auto" />
          <h3 className="font-semibold text-wellness-primary text-base">No journal entries yet</h3>
          <p className="text-xs text-wellness-secondary max-w-sm mx-auto">
            {activeCategory === "all"
              ? "Document how your scalp or skin feels over time to track genuine consistency."
              : `No entries recorded for ${activeCategory}.`}
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-wellness-accent text-white text-xs font-medium hover:bg-wellness-accent-hover"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Observation</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle hover:shadow-card transition-shadow space-y-3.5"
            >
              {/* Top Row: Date, Category, Delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-wellness-accent-soft text-wellness-accent uppercase tracking-wider">
                    {entry.category}
                  </span>
                  <span className="text-xs text-wellness-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatFriendlyDate(entry.date)}
                  </span>
                </div>

                <button
                  onClick={() => deleteJournalEntry(entry.id)}
                  className="p-1 text-wellness-secondary hover:text-wellness-danger rounded hover:bg-wellness-surface-alt transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subjective Observation Text */}
              <p className="text-sm text-wellness-primary leading-relaxed whitespace-pre-line">
                {entry.observation}
              </p>

              {/* Photo Attachment (if any) */}
              {entry.photoIds && entry.photoIds.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-3">
                  {entry.photoIds.map((pid) => {
                    const cachedUrl = photoCache[pid];
                    return (
                      <div
                        key={pid}
                        className="relative w-36 h-36 rounded-control overflow-hidden border border-wellness-border bg-wellness-surface-alt flex items-center justify-center"
                      >
                        {cachedUrl ? (
                          <img
                            src={cachedUrl}
                            alt="Progress Observation"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-wellness-muted text-[10px]">
                            <ImageIcon className="w-5 h-5" />
                            <span>Loading photo...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-wellness-muted" />
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded bg-wellness-surface-alt border border-wellness-border-subtle text-wellness-secondary"
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

      {/* Two-Entry Comparison Modal */}
      {compareModalOpen && entryA && entryB && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-4xl p-6 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-wellness-border">
              <div>
                <h3 className="font-bold text-base text-wellness-primary">
                  Side-by-Side Observation Comparison
                </h3>
                <p className="text-xs text-wellness-secondary">
                  Compare two subjective check-ins over your wellness journey.
                </p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 text-wellness-secondary hover:text-wellness-primary rounded-full hover:bg-wellness-surface-alt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column (Entry A) */}
              <div className="p-4 rounded-control bg-wellness-surface-alt border border-wellness-border space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-wellness-secondary block">
                    First Entry
                  </label>
                  <select
                    value={compareIdA}
                    onChange={(e) => setCompareIdA(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-control bg-wellness-surface border border-wellness-border text-xs text-wellness-primary"
                  >
                    {journalEntries.map((e) => (
                      <option key={e.id} value={e.id}>
                        {formatFriendlyDate(e.date)} — {e.category} ({e.observation.substring(0, 30)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-wellness-accent-soft text-wellness-accent">
                    {entryA.category}
                  </span>
                  <p className="text-xs text-wellness-primary leading-relaxed whitespace-pre-line">
                    {entryA.observation}
                  </p>
                  {entryA.photoIds && entryA.photoIds.length > 0 && photoCache[entryA.photoIds[0]] && (
                    <div className="w-full h-48 rounded-control overflow-hidden border border-wellness-border">
                      <img
                        src={photoCache[entryA.photoIds[0]]}
                        alt="Photo Observation A"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Entry B) */}
              <div className="p-4 rounded-control bg-wellness-surface-alt border border-wellness-border space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-wellness-secondary block">
                    Second Entry
                  </label>
                  <select
                    value={compareIdB}
                    onChange={(e) => setCompareIdB(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-control bg-wellness-surface border border-wellness-border text-xs text-wellness-primary"
                  >
                    {journalEntries.map((e) => (
                      <option key={e.id} value={e.id}>
                        {formatFriendlyDate(e.date)} — {e.category} ({e.observation.substring(0, 30)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-wellness-accent-soft text-wellness-accent">
                    {entryB.category}
                  </span>
                  <p className="text-xs text-wellness-primary leading-relaxed whitespace-pre-line">
                    {entryB.observation}
                  </p>
                  {entryB.photoIds && entryB.photoIds.length > 0 && photoCache[entryB.photoIds[0]] && (
                    <div className="w-full h-48 rounded-control overflow-hidden border border-wellness-border">
                      <img
                        src={photoCache[entryB.photoIds[0]]}
                        alt="Photo Observation B"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Observation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-lg p-6 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-wellness-border">
              <h3 className="font-bold text-base text-wellness-primary">Log Subjective Observation</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-wellness-secondary hover:text-wellness-primary rounded-full hover:bg-wellness-surface-alt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Focus Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary capitalize focus:outline-none focus:border-wellness-accent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">
                  Subjective Observation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Record what you notice (e.g. Scalp feels less greasy after washing, hair shed seems slightly reduced in morning brush)."
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="minoxidil, morning, texture, scalp"
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2 pt-1">
                <label className="font-semibold text-wellness-primary block">
                  Optional Progress Photo (Stored in Browser IndexedDB)
                </label>

                {photoPreviewUrl ? (
                  <div className="relative w-36 h-36 rounded-control overflow-hidden border border-wellness-border group">
                    <img
                      src={photoPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhotoDraft}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-wellness-border hover:border-wellness-accent rounded-control p-4 flex flex-col items-center justify-center cursor-pointer bg-wellness-surface-alt transition-colors">
                    <Upload className="w-5 h-5 text-wellness-muted mb-1" />
                    <span className="text-xs font-medium text-wellness-primary">Click to select photo</span>
                    <span className="text-[10px] text-wellness-muted">JPG, PNG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadError && (
                  <div className="flex items-center gap-1.5 text-wellness-danger text-[11px] pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Privacy Warning */}
              <div className="p-3 bg-wellness-surface-alt rounded-control border border-wellness-border-subtle flex items-start gap-2 text-[11px] text-wellness-secondary">
                <ShieldAlert className="w-4 h-4 text-wellness-warning shrink-0 mt-0.5" />
                <p>
                  Photos remain in this browser profile and are never uploaded to AI models or external servers. Clearing browser data will erase saved local images.
                </p>
              </div>

              <div className="pt-3 border-t border-wellness-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-control text-wellness-secondary hover:text-wellness-primary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-subtle"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
