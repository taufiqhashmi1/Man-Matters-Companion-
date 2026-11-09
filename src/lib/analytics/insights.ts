import { AppStateData } from "@/types/domain";
import { getPastDates, parseDateString } from "@/lib/dates";

export interface CategoryMetric {
  category: string;
  totalScheduled: number;
  totalCompleted: number;
  rate: number;
}

export interface WeeklyInsightSummary {
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  totalScheduled: number;
  totalCompleted: number;
  overallRate: number; // 0 to 100
  categoryMetrics: CategoryMetric[];
  mostConsistentCategory: string | null;
  journalEntryCount: number;
  dailyBreakdown: {
    date: string;
    dayLabel: string;
    scheduled: number;
    completed: number;
    rate: number;
  }[];
  explanation: string;
}

export function computeWeeklyInsights(state: AppStateData): WeeklyInsightSummary {
  const past7Days = getPastDates(7);
  const startDate = past7Days[0];
  const endDate = past7Days[6];

  const startFormatted = parseDateString(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFormatted = parseDateString(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateRangeLabel = `${startFormatted} – ${endFormatted}`;

  const activeRoutineItems = state.routineItems.filter((i) => i.isActive);
  const productMap = new Map(state.products.map((p) => [p.id, p]));

  let totalScheduled = 0;
  let totalCompleted = 0;

  const categoryScheduledMap = new Map<string, number>();
  const categoryCompletedMap = new Map<string, number>();

  const dailyBreakdown = past7Days.map((dateStr) => {
    const d = parseDateString(dateStr);
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    // Count scheduled items for this date
    let dayScheduled = 0;
    for (const item of activeRoutineItems) {
      let isScheduled = false;
      if (item.frequency === "daily" || item.frequency === "as-entered") {
        isScheduled = true;
      } else if (item.frequency === "selected-days" && item.daysOfWeek) {
        isScheduled = item.daysOfWeek.includes(dayOfWeek);
      } else {
        isScheduled = true;
      }

      if (isScheduled) {
        dayScheduled++;
        totalScheduled++;

        // Track category
        const prod = item.productId ? productMap.get(item.productId) : undefined;
        const cat = prod?.category || "general";
        categoryScheduledMap.set(cat, (categoryScheduledMap.get(cat) || 0) + 1);
      }
    }

    // Count completed logs for this date
    const logsForDate = state.routineLogs.filter(
      (log) => log.localDate === dateStr && log.status === "completed"
    );
    // Unique item IDs completed on this date
    const completedItemIds = new Set(logsForDate.map((l) => l.routineItemId));
    const dayCompleted = completedItemIds.size;
    totalCompleted += dayCompleted;

    // Track category completions
    completedItemIds.forEach((itemId) => {
      const item = activeRoutineItems.find((ri) => ri.id === itemId);
      if (item) {
        const prod = item.productId ? productMap.get(item.productId) : undefined;
        const cat = prod?.category || "general";
        categoryCompletedMap.set(cat, (categoryCompletedMap.get(cat) || 0) + 1);
      }
    });

    const rate = dayScheduled > 0 ? Math.round((dayCompleted / dayScheduled) * 100) : 0;

    return {
      date: dateStr,
      dayLabel,
      scheduled: dayScheduled,
      completed: dayCompleted,
      rate,
    };
  });

  const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  // Category breakdown
  const categoryMetrics: CategoryMetric[] = Array.from(categoryScheduledMap.entries()).map(
    ([category, sched]) => {
      const comp = categoryCompletedMap.get(category) || 0;
      const rate = sched > 0 ? Math.round((comp / sched) * 100) : 0;
      return {
        category,
        totalScheduled: sched,
        totalCompleted: comp,
        rate,
      };
    }
  );

  categoryMetrics.sort((a, b) => b.rate - a.rate);
  const mostConsistentCategory =
    categoryMetrics.length > 0 && categoryMetrics[0].totalCompleted > 0
      ? categoryMetrics[0].category
      : null;

  // Count journal entries in past 7 days
  const recentJournalEntries = state.journalEntries.filter(
    (e) => e.date >= startDate && e.date <= endDate
  );

  const explanation = `Metrics are calculated strictly from your local 7-day routine logs (${dateRangeLabel}). Scheduled items represent active activities assigned to each day. Completion rate is total completed instances (${totalCompleted}) divided by total scheduled instances (${totalScheduled}). No estimations or artificial scoring algorithms are applied.`;

  return {
    dateRangeLabel,
    startDate,
    endDate,
    totalScheduled,
    totalCompleted,
    overallRate,
    categoryMetrics,
    mostConsistentCategory,
    journalEntryCount: recentJournalEntries.length,
    dailyBreakdown,
    explanation,
  };
}
