"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Member } from "@/types";
import { getMemberFullName } from "@/lib/member";
import { getCompletionDate, getPlacedHours, getTaskStatus, TASK_STATUS_LABEL } from "@/lib/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  not_started: "outline",
  in_progress: "secondary",
  on_track: "default",
  overdue: "destructive",
};

type Props = {
  member: Member;
  onClose: () => void;
};

export function MemberDetailDialog({ member, onClose }: Props) {
  const { tasks, projects } = usePlannerStore();

  const memberTasks = tasks.filter((t) => t.memberIds?.includes(member.id));
  const assignedProjects = projects.filter((p) =>
    memberTasks.some((t) => t.projectId === p.id)
  );

  const sortedTasks = [...memberTasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
            {getMemberFullName(member)}
          </DialogTitle>
        </DialogHeader>

        <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>会社: {member.company || "未設定"}</span>
          <span>部署: {member.department || "未設定"}</span>
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-gray-500">担当プロジェクト</p>
          {assignedProjects.length === 0 ? (
            <p className="text-xs text-gray-400">担当プロジェクトはありません</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {assignedProjects.map((p) => (
                <Badge key={p.id} style={{ backgroundColor: p.color }} className="text-white text-[10px]">
                  {p.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-1.5">
          <p className="text-xs font-medium text-gray-500">担当タスクの状況</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sortedTasks.length === 0 && (
              <p className="text-xs text-gray-400">担当タスクはありません</p>
            )}
            {sortedTasks.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              const status = getTaskStatus(t);
              const placed = getPlacedHours(t);
              const completion = getCompletionDate(t);
              return (
                <div key={t.id} className="bg-gray-50 rounded px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project?.color }}
                    />
                    <span className="text-sm font-medium text-gray-800 truncate flex-1">{t.title}</span>
                    <Badge variant={STATUS_VARIANT[status]} className="text-[10px] flex-shrink-0">
                      {TASK_STATUS_LABEL[status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-1 mt-0.5 text-[11px] text-gray-500">
                    <span>{project?.name}</span>
                    <span>期限: {format(parseISO(t.deadline), "M/d(E)", { locale: ja })}</span>
                    <span>配置 {placed}/{t.estimatedHours}h</span>
                    <span>
                      完了予定:{" "}
                      {completion ? format(parseISO(completion), "M/d(E)", { locale: ja }) : "未定"}
                    </span>
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
