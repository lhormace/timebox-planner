"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Project } from "@/types";
import { getCompletionDate, getPlacedHours, getTaskStatus, TASK_STATUS_LABEL } from "@/lib/planner";
import {
  getProjectTasks,
  isTaskWithinProjectWindow,
  getProjectFinance,
  getProjectProgress,
  getProjectMemberBreakdown,
  hasUnratedAssignee,
} from "@/lib/projectFinance";
import { getMemberFullName } from "@/lib/member";
import { exportProjectReport } from "@/lib/excelExport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const yen = (n: number) => `¥${Math.round(n).toLocaleString("ja-JP")}`;

type Props = {
  project: Project;
  onClose: () => void;
};

export function ProjectDetailDialog({ project, onClose }: Props) {
  const { tasks, members } = usePlannerStore();

  const projectTasks = getProjectTasks(tasks, project.id);
  const finance = getProjectFinance(tasks, members, project);
  const progress = getProjectProgress(tasks, project.id);
  const unrated = hasUnratedAssignee(tasks, members, project.id);
  const memberBreakdown = getProjectMemberBreakdown(tasks, members, project.id);
  const sortedTasks = [...projectTasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  const budgetUsedPct =
    finance.budget !== undefined && finance.budget > 0
      ? Math.min(100, (finance.cost / finance.budget) * 100)
      : undefined;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            {project.name}
            <Button
              variant="outline"
              size="xs"
              className="ml-auto mr-6"
              onClick={() => exportProjectReport(project, tasks, members)}
            >
              Excel出力
            </Button>
          </DialogTitle>
        </DialogHeader>

        {project.charter && (
          <div className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2 whitespace-pre-wrap">
            {project.charter}
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>
            期間:{" "}
            {project.startDate ? format(parseISO(project.startDate), "yyyy/M/d") : "未設定"} 〜{" "}
            {project.endDate ? format(parseISO(project.endDate), "yyyy/M/d") : "未設定"}
          </span>
        </div>

        {/* Status: progress / cost / margin / break-even */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-[11px] text-gray-500">進捗率（実績入力があれば実績時間、なければ予定時間 ÷ 見積時間）</p>
            <p className={"text-lg font-bold " + (progress > 100 ? "text-amber-600" : "text-gray-800")}>
              {progress.toFixed(0)}%
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn("h-full rounded-full", progress > 100 ? "bg-amber-500" : "bg-indigo-500")}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-[11px] text-gray-500">積算費用（配置時間 × 人日単価）</p>
            <p className="text-lg font-bold text-gray-800">{yen(finance.cost)}</p>
            {unrated && (
              <p className="text-[10px] text-amber-600">単価未設定の担当者を含む（未計上）</p>
            )}
          </div>
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-[11px] text-gray-500">予算 / 損益分岐点</p>
            <p className="text-lg font-bold text-gray-800">
              {finance.budget !== undefined ? yen(finance.budget) : "未設定"}
            </p>
            {budgetUsedPct !== undefined && (
              <div className="mt-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    (finance.meetsTarget ?? finance.breakEven) ? "bg-emerald-500" : "bg-red-500"
                  )}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-[11px] text-gray-500">
              利益率{finance.targetMarginRate !== undefined ? `（目標 ${finance.targetMarginRate}%）` : ""}
            </p>
            {finance.marginRate !== undefined ? (
              <p className={"text-lg font-bold " + (finance.marginRate >= 0 ? "text-emerald-600" : "text-red-600")}>
                {finance.marginRate >= 0 ? "+" : ""}
                {finance.marginRate.toFixed(1)}%
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({finance.margin! >= 0 ? "黒字" : "赤字"} {yen(Math.abs(finance.margin!))})
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold text-gray-400">予算未設定</p>
            )}
            {finance.meetsTarget !== undefined && (
              <p className={"text-[11px] " + (finance.meetsTarget ? "text-emerald-600" : "text-red-600")}>
                {finance.meetsTarget ? "✓ 目標利益率を達成" : "✗ 目標利益率未達"}
              </p>
            )}
          </div>
        </div>

        {/* Member workload breakdown */}
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-gray-500">メンバー別工数・コスト</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {memberBreakdown.length === 0 && (
              <p className="text-xs text-gray-400">配置がありません</p>
            )}
            {memberBreakdown.map(({ member, plannedHours, actualHours, cost }) => {
              const variancePct =
                actualHours !== undefined && plannedHours > 0
                  ? ((actualHours - plannedHours) / plannedHours) * 100
                  : undefined;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
                    <span className="text-sm text-gray-800 truncate">{getMemberFullName(member)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-shrink-0">
                    <span>予定 {plannedHours}h{actualHours !== undefined ? ` / 実績 ${actualHours}h` : ""}</span>
                    {variancePct !== undefined && (
                      <span className={variancePct <= 0 ? "text-emerald-600" : "text-red-600"}>
                        {variancePct >= 0 ? "+" : ""}
                        {variancePct.toFixed(0)}%
                      </span>
                    )}
                    <span>{yen(cost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks and deadline-within-window check */}
        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-gray-500">タスクとプロジェクト期間の整合</p>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {sortedTasks.length === 0 && (
              <p className="text-xs text-gray-400">タスクがありません</p>
            )}
            {sortedTasks.map((t) => {
              const withinWindow = isTaskWithinProjectWindow(t, project);
              const status = getTaskStatus(t);
              const completion = getCompletionDate(t);
              return (
                <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-500">
                      期限 {format(parseISO(t.deadline), "M/d(E)", { locale: ja })} ・ 配置{" "}
                      {getPlacedHours(t)}/{t.estimatedHours}h ・ 完了予定{" "}
                      {completion ? format(parseISO(completion), "M/d(E)", { locale: ja }) : "未定"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">{TASK_STATUS_LABEL[status]}</Badge>
                    {withinWindow ? (
                      <Badge variant="outline" className="text-[10px] text-emerald-600">期間内</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px]">期間外</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
