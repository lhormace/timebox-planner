"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
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
  open: boolean;
  task?: Task;
  onClose: () => void;
};

export function TaskDialog({ open, task, onClose }: Props) {
  const { tasks, members, projects, addTask, updateTask } = usePlannerStore();
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(task?.projectId ?? projects[0]?.id ?? "");
  const [memberId, setMemberId] = useState(task?.memberId ?? "");
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours ?? 8);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [error, setError] = useState("");

  const projectItems = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const memberItems = Object.fromEntries(members.map((m) => [m.id, m.name]));

  const isDuplicateTitle = (candidate: string) =>
    tasks.some(
      (t) => t.id !== task?.id && t.title.trim().toLowerCase() === candidate.trim().toLowerCase()
    );

  const handleSubmit = () => {
    if (!title || !projectId || !deadline) return;
    if (isDuplicateTitle(title)) {
      setError("同じ名前のタスクが既に存在します");
      return;
    }
    if (isEdit && task) {
      updateTask(task.id, {
        title,
        projectId,
        memberId: memberId || undefined,
        estimatedHours,
        deadline,
      });
    } else {
      addTask({
        id: uuidv4(),
        title,
        projectId,
        estimatedHours,
        deadline,
        placements: [],
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "タスクを編集" : "タスクを追加"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>プロジェクト</Label>
            <Select items={projectItems} value={projectId} onValueChange={(v) => v && setProjectId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>タスク名</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="例: API設計"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          {isEdit && (
            <div className="grid gap-1.5">
              <Label>担当者</Label>
              <Select
                items={memberItems}
                value={memberId}
                onValueChange={(v) => setMemberId(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="未定" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>総工数 (時間)</Label>
              <Input
                type="number"
                min={1}
                max={999}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>期限</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!title || !deadline}>
            {isEdit ? "保存" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
