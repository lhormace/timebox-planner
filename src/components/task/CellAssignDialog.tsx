"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { getPlacedHours } from "@/lib/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  memberId: string;
  date: string;
  onClose: () => void;
};

export function CellAssignDialog({ memberId, date, onClose }: Props) {
  const { tasks, members, addPlacement, updateTask } = usePlannerStore();
  const member = members.find((m) => m.id === memberId);
  // Tasks already owned by this member, plus not-yet-assigned tasks —
  // placing one of the latter here assigns it to this member.
  const assignableTasks = tasks.filter((t) => !t.memberId || t.memberId === memberId);

  const [taskId, setTaskId] = useState(assignableTasks[0]?.id ?? "");
  const [hours, setHours] = useState(8);

  const taskItems = Object.fromEntries(
    assignableTasks.map((t) => [t.id, t.memberId ? t.title : `${t.title}（未定）`])
  );
  const selectedTask = assignableTasks.find((t) => t.id === taskId);
  const remaining = selectedTask
    ? selectedTask.estimatedHours - getPlacedHours(selectedTask)
    : 0;

  const handleSubmit = () => {
    if (!taskId || hours <= 0) return;
    if (selectedTask && !selectedTask.memberId) {
      updateTask(taskId, { memberId });
    }
    addPlacement(taskId, { date, hours: Math.min(hours, 8) });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {member?.name} — {format(parseISO(date), "M月d日(E)", { locale: ja })} に配置
          </DialogTitle>
        </DialogHeader>

        {assignableTasks.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            配置できるタスクがありません。先に「+ タスク追加」からタスクを作成してください。
          </p>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>タスク</Label>
              <Select items={taskItems} value={taskId} onValueChange={(v) => v && setTaskId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.memberId ? t.title : `${t.title}（未定）`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTask && (
                <p className="text-xs text-gray-500">
                  残り {remaining}h / 総工数 {selectedTask.estimatedHours}h
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>時間 (最大8h)</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!taskId || hours <= 0}>
            配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
