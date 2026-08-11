"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { getCompletionDate, isAtRisk } from "@/lib/planner";
import { getMemberFullName } from "@/lib/member";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Props = {
  onClose: () => void;
  onEditTask: (taskId: string) => void;
};

export function TaskManagementDialog({ onClose, onEditTask }: Props) {
  const { tasks, members, projects, removeTask } = usePlannerStore();

  const sortedTasks = [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>タスク管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 max-h-[28rem] overflow-y-auto">
          {sortedTasks.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">タスクがありません</p>
          )}
          {sortedTasks.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            const assignedMembers = members.filter((m) => t.memberIds?.includes(m.id));
            const completion = getCompletionDate(t);
            const atRisk = isAtRisk(t);
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project?.color }}
                    />
                    <span className="text-sm font-medium text-gray-800 truncate">{t.title}</span>
                    {assignedMembers.length === 0 ? (
                      <Badge variant="outline" className="text-[10px] text-gray-500">
                        担当未定
                      </Badge>
                    ) : (
                      assignedMembers.map((m) => (
                        <Badge
                          key={m.id}
                          className="text-[10px] text-white"
                          style={{ backgroundColor: m.color }}
                        >
                          {getMemberFullName(m)}
                        </Badge>
                      ))
                    )}
                    {atRisk && (
                      <Badge variant="destructive" className="text-[10px]">要注意</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-1 mt-1 text-xs text-gray-500">
                    <span>工数: {t.estimatedHours}h</span>
                    <span>期限: {format(parseISO(t.deadline), "M/d(E)", { locale: ja })}</span>
                    <span>
                      完了予定:{" "}
                      {completion
                        ? format(parseISO(completion), "M/d(E)", { locale: ja })
                        : "未配置"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEditTask(t.id)}
                    className="text-gray-400 hover:text-indigo-500 text-xs px-1.5 py-1 transition-colors"
                    title="編集"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => removeTask(t.id)}
                    className="text-gray-400 hover:text-red-500 text-xs px-1.5 py-1 transition-colors"
                    title="削除"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
