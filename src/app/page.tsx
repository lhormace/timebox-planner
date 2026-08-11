"use client";

import { useState } from "react";
import { addDays, subDays, format, parseISO, startOfToday } from "date-fns";
import { ja } from "date-fns/locale";
import { TimelineGrid } from "@/components/timeline/TimelineGrid";
import { TaskDialog } from "@/components/task/TaskDialog";
import { TaskPlacementDialog } from "@/components/task/TaskPlacementDialog";
import { CellAssignDialog } from "@/components/task/CellAssignDialog";
import { MemberDialog } from "@/components/member/MemberDialog";
import { ProjectDialog } from "@/components/project/ProjectDialog";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCompletionDate, getMemberFinishDate, isAtRisk } from "@/lib/planner";

export default function Home() {
  const [startDate, setStartDate] = useState(startOfToday());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [placementTaskId, setPlacementTaskId] = useState<string | undefined>();
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [businessDaysOnly, setBusinessDaysOnly] = useState(false);

  const { tasks, projects, members } = usePlannerStore();

  const totalPlaced = tasks.reduce(
    (sum, t) => sum + t.placements.reduce((s, p) => s + p.hours, 0),
    0
  );
  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const atRiskTasks = tasks.filter(isAtRisk);

  const handleCellClick = (memberId: string, date: string) => {
    setSelectedMemberId(memberId);
    setSelectedDate(date);
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
          <Button variant="outline" size="sm" onClick={() => setProjectDialogOpen(true)}>
            プロジェクト管理
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMemberDialogOpen(true)}>
            メンバー管理
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
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
          {format(startDate, "yyyy年M月d日")} 〜
        </span>
        <Button variant="outline" size="sm" onClick={() => setStartDate((d) => addDays(d, 7))}>
          次週 →
        </Button>

        <label className="ml-auto flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={businessDaysOnly}
            onChange={(e) => setBusinessDaysOnly(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
          <span className="text-sm text-gray-600">営業日のみ表示</span>
        </label>
      </div>

      {/* Member legend */}
      <div className="px-6 py-2 flex items-center gap-4">
        {members.map((m) => {
          const finishDate = getMemberFinishDate(tasks, m.id);
          return (
            <div key={m.id} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-xs text-gray-600">{m.name}</span>
              <span className="text-[10px] text-gray-400">
                {finishDate
                  ? `〜${format(parseISO(finishDate), "M/d(E)", { locale: ja })}`
                  : "未配置"}
              </span>
            </div>
          );
        })}
        <span className="text-xs text-gray-400 ml-auto">空セル: タスクを配置　タスクブロック: 配置を管理</span>
      </div>

      {/* At-risk tasks banner */}
      {atRiskTasks.length > 0 && (
        <div className="mx-6 mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
          <p className="text-xs font-semibold text-red-700 mb-1">
            ⚠ 期限に間に合わない、または未配置のタスク（{atRiskTasks.length}件）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {atRiskTasks.map((t) => {
              const member = members.find((m) => m.id === t.memberId);
              const completion = getCompletionDate(t);
              return (
                <button
                  key={t.id}
                  onClick={() => setPlacementTaskId(t.id)}
                  className="text-[11px] bg-white border border-red-200 rounded px-2 py-0.5 text-red-700 hover:bg-red-100 transition-colors"
                >
                  {t.title}（{member?.name}）— 期限{" "}
                  {format(parseISO(t.deadline), "M/d", { locale: ja })} /{" "}
                  {completion
                    ? `完了予定 ${format(parseISO(completion), "M/d", { locale: ja })}`
                    : "未配置"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <main className="px-6 pb-8">
        <TimelineGrid
          startDate={startDate}
          businessDaysOnly={businessDaysOnly}
          onCellClick={handleCellClick}
          onTaskClick={(taskId) => setPlacementTaskId(taskId)}
        />
      </main>

      <TaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {selectedMemberId && selectedDate && (
        <CellAssignDialog
          memberId={selectedMemberId}
          date={selectedDate}
          onClose={() => {
            setSelectedMemberId(undefined);
            setSelectedDate(undefined);
          }}
        />
      )}

      {(() => {
        const task = placementTaskId ? tasks.find((t) => t.id === placementTaskId) : undefined;
        return task ? (
          <TaskPlacementDialog
            task={task}
            onClose={() => setPlacementTaskId(undefined)}
            onEdit={() => {
              setEditingTaskId(task.id);
              setPlacementTaskId(undefined);
            }}
          />
        ) : null;
      })()}

      {(() => {
        const task = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : undefined;
        return task ? (
          <TaskDialog
            open
            task={task}
            onClose={() => setEditingTaskId(undefined)}
          />
        ) : null;
      })()}

      {memberDialogOpen && <MemberDialog onClose={() => setMemberDialogOpen(false)} />}
      {projectDialogOpen && <ProjectDialog onClose={() => setProjectDialogOpen(false)} />}
    </div>
  );
}
