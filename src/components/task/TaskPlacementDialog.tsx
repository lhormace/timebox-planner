"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Props = {
  task: Task;
  onClose: () => void;
};

export function TaskPlacementDialog({ task, onClose }: Props) {
  const { projects, members, addPlacement, removePlacement, removeTask } = usePlannerStore();

  const [newDate, setNewDate] = useState("");
  const [newHours, setNewHours] = useState(8);

  const project = projects.find((p) => p.id === task.projectId);
  const member = members.find((m) => m.id === task.memberId);

  const totalPlaced = task.placements.reduce((s, p) => s + p.hours, 0);
  const remaining = task.estimatedHours - totalPlaced;

  const handleAdd = () => {
    if (!newDate || newHours <= 0) return;
    addPlacement(task.id, { date: newDate, hours: Math.min(newHours, 8) });
    setNewDate("");
    setNewHours(Math.min(remaining - newHours, 8) > 0 ? Math.min(remaining - newHours, 8) : 8);
  };

  const sortedPlacements = [...task.placements].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project?.color }}
            />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        {/* Task meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span>担当: <strong>{member?.name}</strong></span>
          <span>期限: <strong>{format(parseISO(task.deadline), "M月d日(E)", { locale: ja })}</strong></span>
          <span>総工数: <strong>{task.estimatedHours}h</strong></span>
          <Badge variant={remaining <= 0 ? "default" : "outline"} className="text-[10px]">
            配置済 {totalPlaced}h / 残 {remaining}h
          </Badge>
        </div>

        {/* Existing placements */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <p className="text-xs font-medium text-gray-500 mb-1">配置済みの日</p>
          {sortedPlacements.length === 0 && (
            <p className="text-xs text-gray-400">まだ配置されていません</p>
          )}
          {sortedPlacements.map((p) => (
            <div key={p.date} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
              <span className="text-sm">
                {format(parseISO(p.date), "M月d日(E)", { locale: ja })}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{p.hours}h</span>
                <button
                  onClick={() => removePlacement(task.id, p.date)}
                  className="text-gray-400 hover:text-red-500 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new placement */}
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">日を追加</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1 grid gap-1">
              <Label className="text-xs">日付</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="w-24 grid gap-1">
              <Label className="text-xs">時間 (max 8h)</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={newHours}
                onChange={(e) => setNewHours(Number(e.target.value))}
              />
            </div>
            <Button size="sm" onClick={handleAdd} disabled={!newDate}>
              追加
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => { removeTask(task.id); onClose(); }}
          >
            タスクを削除
          </Button>
          <Button size="sm" onClick={onClose}>閉じる</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
