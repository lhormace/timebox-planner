import { isAfter, parseISO } from "date-fns";
import { Task } from "@/types";

// The last placement date is when a task's work is actually scheduled to
// finish — the real-world signal this tool exists to surface, as opposed to
// the deadline (when it's due) or estimatedHours (how much work it is).
export function getCompletionDate(task: Task): string | undefined {
  if (task.placements.length === 0) return undefined;
  return task.placements.reduce((latest, p) => (p.date > latest ? p.date : latest), task.placements[0].date);
}

export function getPlacedHours(task: Task): number {
  return task.placements.reduce((sum, p) => sum + p.hours, 0);
}

export function isFullyPlaced(task: Task): boolean {
  return getPlacedHours(task) >= task.estimatedHours;
}

// A task is "at risk" if it's not fully scheduled yet, or if the work that
// is scheduled finishes after the deadline.
export function isAtRisk(task: Task): boolean {
  if (!isFullyPlaced(task)) return true;
  const completion = getCompletionDate(task);
  return !!completion && isAfter(parseISO(completion), parseISO(task.deadline));
}

// Last scheduled day across every task assigned to a member — the date by
// which that member's current workload is actually done.
export function getMemberFinishDate(tasks: Task[], memberId: string): string | undefined {
  const dates = tasks
    .filter((t) => t.memberIds?.includes(memberId))
    .flatMap((t) => t.placements.filter((p) => p.memberId === memberId).map((p) => p.date));
  if (dates.length === 0) return undefined;
  return dates.reduce((latest, d) => (d > latest ? d : latest), dates[0]);
}
