import { isAfter, isBefore, parseISO } from "date-fns";
import { Member, Placement, Project, Task } from "@/types";
import { getEffectiveHours, getCompletionDate } from "@/lib/planner";

export function getProjectTasks(tasks: Task[], projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId);
}

// A task fits its project's window when its deadline (and, once scheduled,
// its completion date) falls within [startDate, endDate]. Either bound may
// be unset, in which case that side is unconstrained.
export function isTaskWithinProjectWindow(task: Task, project: Project): boolean {
  const { startDate, endDate } = project;
  if (!startDate && !endDate) return true;
  const completion = getCompletionDate(task);
  const datesToCheck = [task.deadline, completion].filter((d): d is string => !!d);
  return datesToCheck.every((d) => {
    const date = parseISO(d);
    if (startDate && isBefore(date, parseISO(startDate))) return false;
    if (endDate && isAfter(date, parseISO(endDate))) return false;
    return true;
  });
}

// Cost roll-up: every placed hour costs (member's daily rate / 8h), summed
// across all tasks in the project. Placements without a rated member (rate
// unset) contribute 0 — the caller can flag that separately if desired.
export function getProjectCost(tasks: Task[], members: Member[], projectId: string): number {
  const projectTasks = getProjectTasks(tasks, projectId);
  const rateByMember = new Map(members.map((m) => [m.id, m.dailyRateJpy]));
  return projectTasks.reduce((sum, t) => {
    return (
      sum +
      t.placements.reduce((s, p) => {
        const rate = rateByMember.get(p.memberId);
        return rate ? s + (p.hours / 8) * rate : s;
      }, 0)
    );
  }, 0);
}

export function hasUnratedAssignee(tasks: Task[], members: Member[], projectId: string): boolean {
  const projectTasks = getProjectTasks(tasks, projectId);
  const rateByMember = new Map(members.map((m) => [m.id, m.dailyRateJpy]));
  return projectTasks.some((t) => t.placements.some((p) => !rateByMember.get(p.memberId)));
}

// Progress = effective hours / estimated hours across the project's tasks.
// "Effective" hours use the recorded actual where one exists (so a placement
// that ran over or under plan moves progress accordingly) and fall back to
// the scheduled hours otherwise. Not capped at 100% — an overrun should show
// as such rather than being hidden at the ceiling.
export function getProjectProgress(tasks: Task[], projectId: string): number {
  const projectTasks = getProjectTasks(tasks, projectId);
  const estimated = projectTasks.reduce((s, t) => s + t.estimatedHours, 0);
  if (estimated === 0) return 0;
  const effective = projectTasks.reduce((s, t) => s + getEffectiveHours(t), 0);
  return (effective / estimated) * 100;
}

export type ProjectFinance = {
  cost: number;
  budget: number | undefined;
  margin: number | undefined; // budget - cost
  marginRate: number | undefined; // margin / budget * 100
  breakEven: boolean | undefined; // cost <= budget (marginRate >= 0%)
  targetMarginRate: number | undefined;
  meetsTarget: boolean | undefined; // marginRate >= targetMarginRate
};

export function getProjectFinance(tasks: Task[], members: Member[], project: Project): ProjectFinance {
  const cost = getProjectCost(tasks, members, project.id);
  const budget = project.budgetJpy;
  const margin = budget !== undefined ? budget - cost : undefined;
  const marginRate = budget !== undefined && budget !== 0 ? (margin! / budget) * 100 : undefined;
  const breakEven = budget !== undefined ? cost <= budget : undefined;
  const targetMarginRate = project.targetMarginRate;
  const meetsTarget =
    marginRate !== undefined && targetMarginRate !== undefined ? marginRate >= targetMarginRate : undefined;
  return { cost, budget, margin, marginRate, breakEven, targetMarginRate, meetsTarget };
}

export type ProjectMemberBreakdown = {
  member: Member;
  plannedHours: number;
  actualHours: number | undefined; // undefined when nothing recorded yet
  cost: number; // based on planned hours, same basis as getProjectCost
};

// Per-member workload within a single project — who's doing how much, and
// at what cost, ranked by planned hours.
export function getProjectMemberBreakdown(
  tasks: Task[],
  members: Member[],
  projectId: string
): ProjectMemberBreakdown[] {
  const projectTasks = getProjectTasks(tasks, projectId);
  const placementsByMember = new Map<string, Placement[]>();
  for (const t of projectTasks) {
    for (const p of t.placements) {
      const list = placementsByMember.get(p.memberId) ?? [];
      list.push(p);
      placementsByMember.set(p.memberId, list);
    }
  }
  const rows: ProjectMemberBreakdown[] = [];
  for (const [memberId, placements] of placementsByMember) {
    const member = members.find((m) => m.id === memberId);
    if (!member) continue;
    const plannedHours = placements.reduce((s, p) => s + p.hours, 0);
    const recorded = placements.filter((p) => p.actualHours !== undefined);
    const actualHours =
      recorded.length > 0 ? recorded.reduce((s, p) => s + (p.actualHours ?? 0), 0) : undefined;
    const cost = member.dailyRateJpy ? (plannedHours / 8) * member.dailyRateJpy : 0;
    rows.push({ member, plannedHours, actualHours, cost });
  }
  return rows.sort((a, b) => b.plannedHours - a.plannedHours);
}

// Planned-vs-actual variance for a member, using only placements where
// actualHours has been recorded (unrecorded placements are excluded rather
// than treated as 0, since "not yet reported" isn't the same as "did none").
export function getMemberVariance(
  tasks: Task[],
  memberId: string
): { plannedHours: number; actualHours: number; variancePct: number | undefined } {
  const placements: Placement[] = tasks.flatMap((t) =>
    t.placements.filter((p) => p.memberId === memberId && p.actualHours !== undefined)
  );
  const plannedHours = placements.reduce((s, p) => s + p.hours, 0);
  const actualHours = placements.reduce((s, p) => s + (p.actualHours ?? 0), 0);
  const variancePct = plannedHours > 0 ? ((actualHours - plannedHours) / plannedHours) * 100 : undefined;
  return { plannedHours, actualHours, variancePct };
}
