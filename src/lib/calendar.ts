import { format } from "date-fns";
import { PlannerSettings } from "@/types";

// A "non-working day" (configurable weekend + custom holidays) is still
// fillable with tasks — it only affects the "営業日のみ表示" filter and the
// grid's visual styling, never whether a cell can be clicked.
export function isNonWorkingDay(date: Date, settings: PlannerSettings): boolean {
  if (settings.weekendDays.includes(date.getDay())) return true;
  return settings.holidays.includes(format(date, "yyyy-MM-dd"));
}
