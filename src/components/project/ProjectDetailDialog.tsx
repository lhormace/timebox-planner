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
  hasUnratedAssignee,
} from "@/lib/projectFinance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const sortedTasks = [...projectTasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            {project.name}
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
          </div>
          <div className="bg-gray-50 rounded px-3 py-2">
            <p className="text-[11px] text-gray-500">利益率</p>
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
