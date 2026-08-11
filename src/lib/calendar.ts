import { format } from "date-fns";
import { PlannerSettings } from "@/types";

// A "non-working day" (configurable weekend + custom holidays) is still
// fillable with tasks — it only affects the "営業日のみ表示" filter and the
// grid's visual styling, never whether a cell can be clicked.
export function isNonWorkingDay(date: Date, settings: PlannerSettings): boolean {
  if (settings.weekendDays.includes(date.getDay())) return true;
  return settings.holidays.includes(format(date, "yyyy-MM-dd"));
}

export type DayColor = "saturday" | "sunday-or-holiday" | "normal";

// Calendar convention (independent of the configurable weekend/holiday
// settings): Saturdays render blue, Sundays and holidays render red.
export function getDayColor(date: Date, settings: PlannerSettings): DayColor {
  if (date.getDay() === 6) return "saturday";
  if (date.getDay() === 0 || settings.holidays.includes(format(date, "yyyy-MM-dd"))) {
    return "sunday-or-holiday";
  }
  return "normal";
}
