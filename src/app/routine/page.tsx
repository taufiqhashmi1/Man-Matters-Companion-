"use client";

import { useState } from "react";
import {
  CalendarCheck2,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { RoutineFrequency, RoutineItem, TimeOfDay } from "@/types/domain";
import { formatFriendlyDate, getPastDates, getTodayDateString } from "@/lib/dates";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RoutinePage() {
  const routines = useAppStore((s) => s.routines);
  const routineItems = useAppStore((s) => s.routineItems);
  const products = useAppStore((s) => s.products);
  const toggleCompleteItem = useAppStore((s) => s.toggleCompleteItem);
  const isItemCompletedOnDate = useAppStore((s) => s.isItemCompletedOnDate);
  const addRoutineItem = useAppStore((s) => s.addRoutineItem);
  const updateRoutineItem = useAppStore((s) => s.updateRoutineItem);
  const toggleRoutineItemActive = useAppStore((s) => s.toggleRoutineItemActive);
  const deleteRoutineItem = useAppStore((s) => s.deleteRoutineItem);
  const reorderRoutineItems = useAppStore((s) => s.reorderRoutineItems);

  // Selected date filter (default today, can pick any of the last 7 days)
  const past7Days = getPastDates(7);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);
  const [routineId, setRoutineId] = useState("routine-morning");
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [frequency, setFrequency] = useState<RoutineFrequency>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const openAddModal = (targetRoutineId?: string) => {
    setEditingItem(null);
    setRoutineId(targetRoutineId || "routine-morning");
    setTitle("");
    setProductId("");
    setInstruction("");
    setFrequency("daily");
    setSelectedDays([1, 2, 3, 4, 5]);
    setModalOpen(true);
  };

  const openEditModal = (item: RoutineItem) => {
    setEditingItem(item);
    setRoutineId(item.routineId);
    setTitle(item.title);
    setProductId(item.productId || "");
    setInstruction(item.instruction || "");
    setFrequency(item.frequency);
    setSelectedDays(item.daysOfWeek || [1, 2, 3, 4, 5]);
    setModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      updateRoutineItem(editingItem.id, {
        routineId,
        title: title.trim(),
        productId: productId || undefined,
        instruction: instruction.trim() || undefined,
        frequency,
        daysOfWeek: frequency === "selected-days" ? selectedDays : undefined,
      });
    } else {
      addRoutineItem({
        routineId,
        title: title.trim(),
        productId: productId || undefined,
        instruction: instruction.trim() || undefined,
        frequency,
        daysOfWeek: frequency === "selected-days" ? selectedDays : undefined,
        isActive: true,
      });
    }

    setModalOpen(false);
  };

  const moveItemOrder = (item: RoutineItem, direction: "up" | "down") => {
    const itemsInRoutine = routineItems
      .filter((i) => i.routineId === item.routineId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const index = itemsInRoutine.findIndex((i) => i.id === item.id);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itemsInRoutine.length) return;

    const newOrder = [...itemsInRoutine];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    reorderRoutineItems(
      item.routineId,
      newOrder.map((i) => i.id)
    );
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wellness-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-wellness-accent mb-1">
            Habit Consistency & Scheduling
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-wellness-primary tracking-tight">
            Daily Routine Manager
          </h1>
          <p className="text-sm text-wellness-secondary mt-1">
            Build your personalized morning and evening routines. Check off activities for today or past days.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control bg-wellness-accent text-white font-medium hover:bg-wellness-accent-hover transition-colors shadow-card text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Date Switcher Carousel (Review today or past days) */}
      <div className="p-4 rounded-card bg-wellness-surface border border-wellness-border shadow-subtle space-y-2">
        <div className="flex items-center justify-between text-xs text-wellness-secondary font-medium">
          <span>Active Tracking Day</span>
          <span className="text-wellness-accent font-semibold">
            {formatFriendlyDate(selectedDate)}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {past7Days.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getTodayDateString();
            const dateObj = new Date(dateStr + "T00:00:00");
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = dateObj.getDate();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`py-2 px-1 rounded-control flex flex-col items-center justify-center text-xs transition-all ${
                  isSelected
                    ? "bg-wellness-accent text-white font-bold shadow-sm"
                    : "bg-wellness-surface-alt hover:bg-wellness-surface text-wellness-secondary border border-wellness-border-subtle"
                }`}
              >
                <span className="text-[10px] uppercase font-medium">{dayName}</span>
                <span className="text-sm font-semibold">{dayNum}</span>
                {isToday && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected ? "bg-white" : "bg-wellness-accent"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Routines List Grouped by Morning / Evening */}
      <div className="space-y-6">
        {routines.map((routine) => {
          const items = routineItems
            .filter((i) => i.routineId === routine.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          const completedCount = items.filter((i) =>
            isItemCompletedOnDate(i.id, selectedDate)
          ).length;

          return (
            <div
              key={routine.id}
              className="p-6 rounded-card bg-wellness-surface border border-wellness-border space-y-4 shadow-subtle"
            >
              {/* Routine Group Header */}
              <div className="flex items-center justify-between pb-3 border-b border-wellness-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-wellness-accent-soft flex items-center justify-center text-wellness-accent">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-wellness-primary">{routine.name}</h3>
                    <div className="text-xs text-wellness-secondary">
                      {completedCount} of {items.length} completed for {formatFriendlyDate(selectedDate)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openAddModal(routine.id)}
                  className="inline-flex items-center gap-1 text-xs text-wellness-accent hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to {routine.name.split(" ")[0]}</span>
                </button>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-6 text-center text-xs text-wellness-secondary space-y-1 bg-wellness-surface-alt rounded-control">
                  <p>No activities configured for this schedule.</p>
                  <button
                    onClick={() => openAddModal(routine.id)}
                    className="text-wellness-accent font-medium hover:underline text-xs"
                  >
                    + Add your first activity
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {items.map((item, index) => {
                    const isCompleted = isItemCompletedOnDate(item.id, selectedDate);
                    const linkedProduct = products.find((p) => p.id === item.productId);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-control border transition-all flex items-start justify-between gap-3 ${
                          isCompleted
                            ? "bg-wellness-accent-soft/35 border-wellness-accent/30"
                            : "bg-wellness-surface-alt hover:bg-wellness-surface border-wellness-border"
                        }`}
                      >
                        {/* Checkbox & Details */}
                        <div
                          onClick={() => toggleCompleteItem(item.id, selectedDate)}
                          className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-wellness-accent shrink-0 focus:outline-none"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 fill-wellness-accent text-white" />
                            ) : (
                              <Circle className="w-5 h-5 text-wellness-muted hover:text-wellness-accent" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-semibold text-wellness-primary ${
                                  isCompleted ? "line-through text-wellness-secondary" : ""
                                }`}
                              >
                                {item.title}
                              </span>

                              {linkedProduct && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-wellness-surface border border-wellness-border text-wellness-secondary">
                                  <LinkIcon className="w-2.5 h-2.5 text-wellness-accent" />
                                  <span>{linkedProduct.name}</span>
                                </span>
                              )}
                            </div>

                            {item.instruction && (
                              <p className="text-xs text-wellness-secondary leading-relaxed">
                                {item.instruction}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-[10px] text-wellness-muted pt-0.5">
                              <span className="capitalize">Frequency: {item.frequency}</span>
                              {item.frequency === "selected-days" && item.daysOfWeek && (
                                <span>
                                  Days: {item.daysOfWeek.map((d) => DAYS_OF_WEEK[d]).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reordering & Edit Controls */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <button
                            onClick={() => moveItemOrder(item, "up")}
                            disabled={index === 0}
                            className="p-1 text-wellness-secondary hover:text-wellness-primary disabled:opacity-30 rounded hover:bg-wellness-surface"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItemOrder(item, "down")}
                            disabled={index === items.length - 1}
                            className="p-1 text-wellness-secondary hover:text-wellness-primary disabled:opacity-30 rounded hover:bg-wellness-surface"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 text-wellness-secondary hover:text-wellness-primary rounded hover:bg-wellness-surface"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRoutineItem(item.id)}
                            className="p-1 text-wellness-danger hover:text-wellness-danger/80 rounded hover:bg-wellness-danger-soft"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Routine Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-wellness-surface rounded-card border border-wellness-border shadow-elevated w-full max-w-lg p-6 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-wellness-border">
              <h3 className="font-bold text-base text-wellness-primary">
                {editingItem ? "Edit Routine Activity" : "Add Routine Activity"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-wellness-secondary hover:text-wellness-primary rounded-full hover:bg-wellness-surface-alt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Minoxidil 5% Application"
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">Routine Slot</label>
                  <select
                    value={routineId}
                    onChange={(e) => setRoutineId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  >
                    {routines.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-wellness-primary block">
                    Link Product (Optional)
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                  >
                    <option value="">None (Independent Activity)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-wellness-primary block">
                  User-Configured Instruction Summary
                </label>
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. Apply 1ml with dropper, massage gently."
                  className="w-full px-3 py-2 rounded-control bg-wellness-surface-alt border border-wellness-border text-wellness-primary focus:outline-none focus:border-wellness-accent"
                />
                <p className="text-[10px] text-wellness-muted">
                  Note: Do not infer medical dosage. Enter directions as advised by official label or clinician.
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-wellness-primary block">Frequency</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency("daily")}
                    className={`flex-1 py-1.5 px-3 rounded-control text-xs font-medium border transition-colors ${
                      frequency === "daily"
                        ? "bg-wellness-accent text-white border-wellness-accent"
                        : "bg-wellness-surface-alt text-wellness-secondary border-wellness-border"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency("selected-days")}
                    className={`flex-1 py-1.5 px-3 rounded-control text-xs font-medium border transition-colors ${
                      frequency === "selected-days"
                        ? "bg-wellness-accent text-white border-wellness-accent"
                        : "bg-wellness-surface-alt text-wellness-secondary border-wellness-border"
                    }`}
                  >
                    Specific Days
                  </button>
                </div>
              </div>

              {frequency === "selected-days" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-wellness-primary block">Select Days</label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map((day, idx) => {
                      const isSel = selectedDays.includes(idx);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(idx)}
                          className={`py-1.5 rounded text-xs font-medium border transition-colors ${
                            isSel
                              ? "bg-wellness-accent text-white border-wellness-accent"
                              : "bg-wellness-surface-alt text-wellness-secondary border-wellness-border"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  {editingItem ? "Save Changes" : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
