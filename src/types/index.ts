export type Member = {
  id: string;
  lastName: string;
  firstName: string;
  company?: string;
  department?: string;
  color: string;
  // Cost basis for project cost roll-ups (人日単価).
  dailyRateJpy?: number;
};

export type Project = {
  id: string;
  name: string;
  color: string;
  // Optional PMP-style project definition fields.
  charter?: string;
  startDate?: string; // ISO date string YYYY-MM-DD
  endDate?: string;   // ISO date string YYYY-MM-DD
  // 受注金額・予算 — compared against roll-up cost for margin/break-even.
  budgetJpy?: number;
};

export type TaskTexture = "none" | "stripes" | "dots" | "grid";

export type Task = {
  id: string;
  title: string;
  projectId: string;
  // Empty/unset when the task is created — members are assigned later, once
  // ownership is decided. A task can have more than one assignee, each
  // working their own hours against the shared estimatedHours total.
  memberIds?: string[];
  estimatedHours: number;
  deadline: string; // ISO date string YYYY-MM-DD
  placements: Placement[];
  // Randomized at creation so tasks within the same project stay visually
  // distinguishable on the grid; editable afterwards.
  color?: string;
  texture?: TaskTexture;
};

// A placement is one "block" on the grid: member × day × hours
export type Placement = {
  memberId: string;
  date: string;   // YYYY-MM-DD
  hours: number;  // planned hours, 0 < hours <= 8
  // Actual hours worked, entered after the fact — left unset until someone
  // records it. Used to compute planned-vs-actual variance.
  actualHours?: number;
};

// Company-specific calendar rules — what counts as a non-working day and
// when the fiscal year begins vary by organization, so both are configurable
// rather than hardcoded.
export type PlannerSettings = {
  // Day-of-week indices (0 = Sunday .. 6 = Saturday) treated as weekend.
  weekendDays: number[];
  // Extra non-working dates (ISO YYYY-MM-DD), e.g. public holidays.
  holidays: string[];
  // 1-12; the calendar month the fiscal year starts on (e.g. 4 = April).
  fiscalYearStartMonth: number;
};
