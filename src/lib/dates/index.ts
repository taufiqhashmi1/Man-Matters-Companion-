// Local date manipulation utilities for consistent routine tracking and analytics

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getPastDates(days: number): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(formatDateString(d));
  }
  return result;
}

export function getDayName(dateStr: string, format: "short" | "long" = "short"): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString("en-US", { weekday: format });
}

export function formatFriendlyDate(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return "Today";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatDateString(yesterday)) return "Yesterday";

  const d = parseDateString(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
