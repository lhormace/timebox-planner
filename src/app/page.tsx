"use client";

import { useState } from "react";
import { addDays, subDays, format, startOfToday } from "date-fns";
import { TimelineGrid } from "@/components/timeline/TimelineGrid";
import { TaskDialog } from "@/components/task/TaskDialog";
import { TaskPlacementDialog } from "@/components/task/TaskPlacementDialog";
import { MemberDialog } from "@/components/member/MemberDialog";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [startDate, setStartDate] = useState(startOfToday());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [placementTaskId, setPlacementTaskId] = useState<string | undefined>();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const { tasks, projects, members } = usePlannerStore();

  const totalPlaced = tasks.reduce(
    (sum, t) => sum + t.placements.reduce((s, p) => s + p.hours, 0),
    0
  );
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  const handleCellClick = (memberId: string, date: string) => {
    setSelectedMemberId(memberId);
    setSelectedDate(date);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Timebox Planner</h1>
          <div className="flex gap-2">
            {projects.map((p) => (
              <Badge key={p.id} style={{ backgroundColor: p.color }} className="text-white text-[10px]">
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            配置済 <strong>{totalPlaced}h</strong> / 総見積 <strong>{totalEstimated}h</strong>
          </span>
          <Button variant="outline" size="sm" onClick={() => setMemberDialogOpen(true)}>
            メンバー管理
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedMemberId(undefined);
              setSelectedDate(undefined);
              setDialogOpen(true);
            }}
          >
            + タスク追加
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setStartDate((d) => subDays(d, 7))}>
          ← 前週
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStartDate(startOfToday())}>
          今日
        </Button>
        <span className="text-sm text-gray-600 font-medium">
          {format(startDate, "yyyy年M月d日")} 〜 {format(addDays(startDate, 27), "M月d日")}
        </span>
        <Button variant="outline" size="sm" onClick={() => setStartDate((d) => addDays(d, 7))}>
          次週 →
        </Button>
      </div>

      {/* Member legend */}
      <div className="px-6 py-2 flex items-center gap-4">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-xs text-gray-600">{m.name}</span>
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-auto">空セル: 新規タスク　タスクブロック: 配置を管理</span>
      </div>

      {/* Timeline */}
      <main className="px-6 pb-8">
        <TimelineGrid
          startDate={startDate}
          onCellClick={handleCellClick}
          onTaskClick={(taskId) => setPlacementTaskId(taskId)}
        />
      </main>

      <TaskDialog
        open={dialogOpen}
        defaultMemberId={selectedMemberId}
        defaultDate={selectedDate}
        onClose={() => setDialogOpen(false)}
      />

      {(() => {
        const task = placementTaskId ? tasks.find((t) => t.id === placementTaskId) : undefined;
        return task ? (
          <TaskPlacementDialog task={task} onClose={() => setPlacementTaskId(undefined)} />
        ) : null;
      })()}

      {memberDialogOpen && <MemberDialog onClose={() => setMemberDialogOpen(false)} />}
    </div>
  );
}
