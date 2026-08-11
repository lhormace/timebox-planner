export type ViewRangeKey = "day" | "week" | "biweek" | "month" | "quarter" | "halfYear";

// Calendar-day span for each view. When "business days only" is on, the grid
// shows roughly this many days' worth of weekdays instead (see
// businessDayTarget below) so the same wall-clock range stays visible.
export const VIEW_RANGES: { key: ViewRangeKey; label: string; days: number }[] = [
  { key: "day", label: "1日", days: 1 },
  { key: "week", label: "1週間", days: 7 },
  { key: "biweek", label: "2週間", days: 14 },
  { key: "month", label: "1か月", days: 30 },
  { key: "quarter", label: "3か月", days: 90 },
  { key: "halfYear", label: "半年", days: 182 },
];

export function businessDayTarget(calendarDays: number): number {
  return Math.max(1, Math.round((calendarDays * 5) / 7));
}
