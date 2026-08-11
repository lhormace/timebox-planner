"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { addDays, format, isSameDay, parseISO, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { taskBlockStyle, complementaryColor } from "@/lib/taskStyle";
import { businessDayTarget, FIT_TO_SCREEN_DAY_CAP } from "@/lib/viewRange";
import { isNonWorkingDay, getDayColor } from "@/lib/calendar";
import { getMemberFullName } from "@/lib/member";

const HOURS_PER_DAY = 8;

type DragState = { taskId: string; memberId: string; hours: number };

type Props = {
  startDate: Date;
  rangeDays: number;
  businessDaysOnly: boolean;
  projectFilterId?: string;
  onCellClick: (memberId: string, date: string) => void;
  onTaskClick: (taskId: string) => void;
};

export function TimelineGrid({
  startDate,
  rangeDays,
  businessDaysOnly,
  projectFilterId,
  onCellClick,
  onTaskClick,
}: Props) {
  const { members, tasks: allTasks, projects, settings, addPlacement } = usePlannerStore();
  const tasks = projectFilterId ? allTasks.filter((t) => t.projectId === projectFilterId) : allTasks;

  // Use a ref so mouseenter handlers always see the latest drag state
  const draggingRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);

  const days = useMemo(() => {
    const result: Date[] = [];
    let cursor = startDate;
    const target = businessDaysOnly ? businessDayTarget(rangeDays) : rangeDays;
    while (result.length < target) {
      if (!businessDaysOnly || !isNonWorkingDay(cursor, settings)) result.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return result;
  }, [startDate, rangeDays, businessDaysOnly, settings]);

  // Clear drag on mouseup anywhere in the document
  useEffect(() => {
    const stop = () => {
      draggingRef.current = null;
      setDragging(null);
    };
    document.addEventListener("mouseup", stop);
    return () => document.removeEventListener("mouseup", stop);
  }, []);

  const startDrag = useCallback((taskId: string, memberId: string, hours: number) => {
    const state: DragState = { taskId, memberId, hours };
    draggingRef.current = state;
    setDragging(state);
  }, []);

  const handleCellEnter = useCallback((memberId: string, dateStr: string) => {
    const d = draggingRef.current;
    if (!d || d.memberId !== memberId) return;
    addPlacement(d.taskId, { memberId, date: dateStr, hours: d.hours });
  }, [addPlacement]);

  const getTasksForCell = (memberId: string, date: Date) =>
    tasks.filter(
      (t) =>
        t.memberIds?.includes(memberId) &&
        t.placements.some((p) => p.memberId === memberId && isSameDay(parseISO(p.date), date))
    );

  const getHoursForCell = (memberId: string, date: Date): number =>
    tasks
      .filter((t) => t.memberIds?.includes(memberId))
      .reduce((sum, t) => {
        const p = t.placements.find(
          (p) => p.memberId === memberId && isSameDay(parseISO(p.date), date)
        );
        return sum + (p?.hours ?? 0);
      }, 0);

  const isOverDeadline = (task: Task, date: Date) =>
    isAfter(date, parseISO(task.deadline));

  // Column widths are expressed as fractions of a shared unit count so they
  // sum to 100% of the reference span — the grid fits the viewport up to
  // FIT_TO_SCREEN_DAY_CAP days. Beyond that, column width stays pinned at
  // the cap's density and the table scrolls horizontally instead of
  // compressing further. The member column is worth a few day-columns.
  const MEMBER_COL_UNITS = 3;
  const widthReferenceDays = Math.min(days.length, FIT_TO_SCREEN_DAY_CAP);
  const widthReferenceUnits = widthReferenceDays + MEMBER_COL_UNITS;
  const memberColPercent = (MEMBER_COL_UNITS / widthReferenceUnits) * 100;
  const dayColPercent = (1 / widthReferenceUnits) * 100;
  const needsHorizontalScroll = days.length > FIT_TO_SCREEN_DAY_CAP;
  const tableWidthPercent = needsHorizontalScroll
    ? ((days.length + MEMBER_COL_UNITS) / widthReferenceUnits) * 100
    : 100;
  const showWeekdayLabel = widthReferenceDays <= 14;
  const denseHeader = widthReferenceDays > 31;

  return (
    <div className={cn(needsHorizontalScroll && "overflow-x-auto", dragging && "select-none")}>
      <table
        className="border-collapse text-xs table-fixed"
        style={{ width: `${tableWidthPercent}%` }}
      >
        <colgroup>
          <col style={{ width: `${memberColPercent}%` }} />
          {days.map((d) => (
            <col key={d.toISOString()} style={{ width: `${dayColPercent}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600">
              メンバー
            </th>
            {days.map((d) => {
              const nonWorking = isNonWorkingDay(d, settings);
              const dayColor = getDayColor(d, settings);
              return (
                <th
                  key={d.toISOString()}
                  className={cn(
                    "border border-gray-200 px-0.5 py-2 text-center font-normal overflow-hidden",
                    denseHeader && "px-0",
                    dayColor === "saturday" && "bg-blue-50 text-blue-600",
                    dayColor === "sunday-or-holiday" && "bg-red-50 text-red-600",
                    dayColor === "normal" && (nonWorking ? "bg-gray-50 text-gray-400" : "bg-white text-gray-600")
                  )}
                >
                  <div className={cn("font-semibold truncate", denseHeader && "text-[9px]")}>
                    {format(d, denseHeader ? "d" : "M/d")}
                  </div>
                  {showWeekdayLabel && (
                    <div className="text-[10px]">{format(d, "E", { locale: ja })}</div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-700 truncate leading-tight">
                      {getMemberFullName(member)}
                    </p>
                    {member.title && (
                      <p className="text-[10px] text-gray-400 truncate leading-tight">{member.title}</p>
                    )}
                  </div>
                </div>
              </td>
              {days.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const nonWorking = isNonWorkingDay(d, settings);
                const dayColor = getDayColor(d, settings);
                const usedHours = getHoursForCell(member.id, d);
                const cellTasks = getTasksForCell(member.id, d);
                const isOver = usedHours > HOURS_PER_DAY;
                const isDragTarget = dragging?.memberId === member.id;

                return (
                  <td
                    key={dateStr}
                    className={cn(
                      "border border-gray-200 p-0 align-top h-28 transition-colors relative",
                      !dragging && "cursor-pointer hover:bg-blue-50",
                      isDragTarget && "cursor-crosshair hover:bg-indigo-50",
                      dayColor === "saturday" && "bg-blue-50/40",
                      dayColor === "sunday-or-holiday" && "bg-red-50/40",
                      dayColor === "normal" && nonWorking && "bg-gray-50",
                      isOver && "bg-red-50"
                    )}
                    onClick={() => !dragging && onCellClick(member.id, dateStr)}
                    onMouseEnter={() => handleCellEnter(member.id, dateStr)}
                  >
                    <div className="absolute inset-0 flex flex-col-reverse overflow-hidden">
                      {cellTasks.map((task) => {
                        const placement = task.placements.find(
                          (p) => p.memberId === member.id && isSameDay(parseISO(p.date), d)
                        );
                        const hours = placement?.hours ?? 0;
                        const heightPct = Math.min((hours / HOURS_PER_DAY) * 100, 100);
                        const project = projects.find((p) => p.id === task.projectId);
                        const blockColor = task.color ?? project?.color ?? "#6366f1";
                        const overDl = isOverDeadline(task, d);
                        const isThisDragging = dragging?.taskId === task.id;
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "w-full flex flex-col items-start justify-start px-1 pt-0.5 overflow-hidden flex-shrink-0 relative",
                              !dragging && "cursor-pointer hover:brightness-90 active:brightness-75",
                              isThisDragging && "cursor-crosshair brightness-110 ring-2 ring-white ring-inset",
                              overDl && "outline outline-1 outline-red-500 outline-offset-[-1px]"
                            )}
                            style={{
                              ...taskBlockStyle(blockColor, task.texture),
                              height: `${heightPct}%`,
                            }}
                            title={
                              dragging
                                ? `ドラッグして延伸中: ${project?.name ?? ""}－${task.title}`
                                : `${project?.name ?? ""}－${task.title} (${hours}h${
                                    placement?.actualHours !== undefined ? ` / 実績${placement.actualHours}h` : ""
                                  }) — ドラッグ: 延伸 / クリック: 配置管理`
                            }
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startDrag(task.id, member.id, hours);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!dragging) onTaskClick(task.id);
                            }}
                          >
                            {placement?.actualHours !== undefined && hours > 0 && (
                              <div
                                className="absolute inset-y-0 left-0 z-0"
                                style={{
                                  width: `${Math.min(100, (placement.actualHours / hours) * 100)}%`,
                                  backgroundColor: complementaryColor(blockColor),
                                  opacity: 0.45,
                                }}
                              />
                            )}
                            <span className="relative z-10 w-full text-[9px] text-white/80 leading-tight truncate">
                              {project?.name}
                            </span>
                            <span className="relative z-10 w-full text-[10px] text-white leading-tight truncate">
                              {task.title} {hours}h
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0.5 text-[9px] z-10",
                      isOver ? "text-red-600 font-bold" : "text-gray-400"
                    )}>
                      {usedHours}/{HOURS_PER_DAY}h
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
