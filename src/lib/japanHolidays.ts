import { addDays, format } from "date-fns";

// 国民の祝日に関する法律 (as amended) — computed rather than hardcoded so it
// stays correct across years without a data file to maintain. Equinox
// approximation is valid for 1980-2099.
function nthMondayDate(year: number, month: number, n: number): Date {
  const first = new Date(year, month - 1, 1);
  const daysUntilMonday = (8 - first.getDay()) % 7;
  return new Date(year, month - 1, 1 + daysUntilMonday + (n - 1) * 7);
}

function vernalEquinoxDate(year: number): Date {
  const day = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return new Date(year, 2, day);
}

function autumnalEquinoxDate(year: number): Date {
  const day = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return new Date(year, 8, day);
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export function getJapanHolidays(year: number): string[] {
  const holidays = new Map<string, Date>();
  const add = (d: Date) => holidays.set(iso(d), d);

  add(new Date(year, 0, 1));           // 元日
  add(nthMondayDate(year, 1, 2));      // 成人の日
  add(new Date(year, 1, 11));          // 建国記念の日
  add(new Date(year, 1, 23));          // 天皇誕生日
  add(vernalEquinoxDate(year));        // 春分の日
  add(new Date(year, 3, 29));          // 昭和の日
  add(new Date(year, 4, 3));           // 憲法記念日
  add(new Date(year, 4, 4));           // みどりの日
  add(new Date(year, 4, 5));           // こどもの日
  add(nthMondayDate(year, 7, 3));      // 海の日
  add(new Date(year, 7, 11));          // 山の日
  add(nthMondayDate(year, 9, 3));      // 敬老の日
  add(autumnalEquinoxDate(year));      // 秋分の日
  add(nthMondayDate(year, 10, 2));     // スポーツの日
  add(new Date(year, 10, 3));          // 文化の日
  add(new Date(year, 10, 23));         // 勤労感謝の日

  // 国民の休日: a weekday sandwiched between two holidays becomes a holiday.
  for (const d of [...holidays.values()]) {
    const between = addDays(d, 1);
    const dow = between.getDay();
    if (dow === 0 || dow === 6 || holidays.has(iso(between))) continue;
    if (holidays.has(iso(addDays(between, 1)))) {
      holidays.set(iso(between), between);
    }
  }

  // 振替休日: a holiday falling on Sunday moves to the next non-holiday day.
  const substitutes: Date[] = [];
  for (const d of [...holidays.values()]) {
    if (d.getDay() !== 0) continue;
    let candidate = addDays(d, 1);
    while (holidays.has(iso(candidate))) candidate = addDays(candidate, 1);
    substitutes.push(candidate);
  }
  substitutes.forEach(add);

  return [...holidays.keys()].sort();
}

export function getJapanHolidaysForYears(years: number[]): string[] {
  return Array.from(new Set(years.flatMap(getJapanHolidays))).sort();
}
