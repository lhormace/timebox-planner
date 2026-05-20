"use client";

import { useMemo } from "react";
import { addDays, format, isSameDay, parseISO, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

const HOURS_PER_DAY = 8;

const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

type Props = {
  startDate: Date;
  businessDaysOnly: boolean;
  onCellClick: (memberId: string, date: string) => void;
  onTaskClick: (taskId: string) => void;
};

export function TimelineGrid({ startDate, businessDaysOnly, onCellClick, onTaskClick }: Props) {
  const { members, tasks, projects } = usePlannerStore();

  const days = useMemo(() => {
    const result: Date[] = [];
    let cursor = startDate;
    const target = businessDaysOnly ? 20 : 28;
    while (result.length < target) {
      if (!businessDaysOnly || !isWeekend(cursor)) result.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return result;
  }, [startDate, businessDaysOnly]);

  const getTasksForCell = (memberId: string, date: Date) =>
    tasks.filter(
      (t) =>
        t.memberId === memberId &&
        t.placements.some((p) => isSameDay(parseISO(p.date), date))
    );

  const getHoursForCell = (memberId: string, date: Date): number =>
    tasks
      .filter((t) => t.memberId === memberId)
      .reduce((sum, t) => {
        const p = t.placements.find((p) => isSameDay(parseISO(p.date), date));
        return sum + (p?.hours ?? 0);
      }, 0);

  const isOverDeadline = (task: Task, date: Date) =>
    isAfter(date, parseISO(task.deadline));

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs min-w-max">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-2 w-28 text-left font-semibold text-gray-600">
              メンバー
            </th>
            {days.map((d) => {
              const weekend = isWeekend(d);
              return (
                <th
                  key={d.toISOString()}
                  className={cn(
                    "border border-gray-200 px-1 py-2 w-16 text-center font-normal",
                    weekend ? "bg-gray-50 text-gray-400" : "bg-white text-gray-600"
                  )}
                >
                  <div className="font-semibold">{format(d, "M/d")}</div>
                  <div className="text-[10px]">{format(d, "E", { locale: ja })}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="font-medium text-gray-700 truncate">{member.name}</span>
                </div>
              </td>
              {days.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const weekend = isWeekend(d);
                const usedHours = getHoursForCell(member.id, d);
                const cellTasks = getTasksForCell(member.id, d);
                const isOver = usedHours > HOURS_PER_DAY;

                return (
                  <td
                    key={dateStr}
                    className={cn(
                      "border border-gray-200 p-0 align-top h-16 cursor-pointer hover:bg-blue-50 transition-colors relative",
                      weekend && "bg-gray-50 cursor-default hover:bg-gray-50",
                      isOver && "bg-red-50"
                    )}
                    onClick={() => !weekend && onCellClick(member.id, dateStr)}
                  >
                    <div className="absolute inset-0 flex flex-col-reverse overflow-hidden">
                      {cellTasks.map((task) => {
                        const placement = task.placements.find(
                          (p) => isSameDay(parseISO(p.date), d)
                        );
                        const hours = placement?.hours ?? 0;
                        const heightPct = Math.min((hours / HOURS_PER_DAY) * 100, 100);
                        const project = projects.find((p) => p.id === task.projectId);
                        const overDl = isOverDeadline(task, d);
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "w-full flex items-start px-1 pt-0.5 cursor-pointer hover:brightness-90 active:brightness-75 overflow-hidden flex-shrink-0",
                              overDl && "outline outline-1 outline-red-500 outline-offset-[-1px]"
                            )}
                            style={{
                              backgroundColor: project?.color ?? "#6366f1",
                              height: `${heightPct}%`,
                            }}
                            title={`${task.title} (${hours}h) — クリックして配置を管理`}
                            onClick={(e) => { e.stopPropagation(); onTaskClick(task.id); }}
                          >
                            <span className="text-[10px] text-white leading-4 truncate">
                              {task.title} {hours}h
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {!weekend && (
                      <div className={cn(
                        "absolute bottom-0 right-0.5 text-[9px] z-10",
                        isOver ? "text-red-600 font-bold" : "text-gray-400"
                      )}>
                        {usedHours}/{HOURS_PER_DAY}h
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
