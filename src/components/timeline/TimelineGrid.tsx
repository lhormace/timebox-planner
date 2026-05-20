"use client";

import { useMemo } from "react";
import { addDays, format, startOfWeek, isSameDay, parseISO, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

const HOURS_PER_DAY = 8;
const DAYS_TO_SHOW = 28;

type Props = {
  startDate: Date;
  onCellClick: (memberId: string, date: string) => void;
};

export function TimelineGrid({ startDate, onCellClick }: Props) {
  const { members, tasks, projects } = usePlannerStore();

  const days = useMemo(() =>
    Array.from({ length: DAYS_TO_SHOW }, (_, i) => addDays(startDate, i)),
    [startDate]
  );

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
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <th
                  key={d.toISOString()}
                  className={cn(
                    "border border-gray-200 px-1 py-2 w-16 text-center font-normal",
                    isWeekend ? "bg-gray-50 text-gray-400" : "bg-white text-gray-600"
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
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const usedHours = getHoursForCell(member.id, d);
                const cellTasks = getTasksForCell(member.id, d);
                const isOver = usedHours > HOURS_PER_DAY;

                return (
                  <td
                    key={dateStr}
                    className={cn(
                      "border border-gray-200 p-0.5 align-top h-16 cursor-pointer hover:bg-blue-50 transition-colors",
                      isWeekend && "bg-gray-50",
                      isOver && "bg-red-50"
                    )}
                    onClick={() => !isWeekend && onCellClick(member.id, dateStr)}
                  >
                    <div className="flex flex-col gap-0.5 h-full">
                      {/* capacity bar */}
                      <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isOver ? "bg-red-500" : "bg-green-400"
                          )}
                          style={{ width: `${Math.min((usedHours / HOURS_PER_DAY) * 100, 100)}%` }}
                        />
                      </div>
                      {/* task blocks */}
                      <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                        {cellTasks.map((task) => {
                          const placement = task.placements.find(
                            (p) => isSameDay(parseISO(p.date), d)
                          );
                          const project = projects.find((p) => p.id === task.projectId);
                          const overDl = isOverDeadline(task, d);
                          return (
                            <div
                              key={task.id}
                              className={cn(
                                "rounded px-1 text-[10px] text-white truncate leading-4",
                                overDl && "ring-1 ring-red-500"
                              )}
                              style={{ backgroundColor: project?.color ?? "#6366f1" }}
                              title={`${task.title} (${placement?.hours}h)`}
                            >
                              {task.title} {placement?.hours}h
                            </div>
                          );
                        })}
                      </div>
                      {!isWeekend && (
                        <div className={cn("text-[9px] text-right pr-0.5", isOver ? "text-red-500 font-bold" : "text-gray-400")}>
                          {usedHours}/{HOURS_PER_DAY}h
                        </div>
                      )}
                    </div>
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
