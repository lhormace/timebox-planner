"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { getMemberFullName } from "@/lib/member";
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
import {
  TASK_COLOR_PALETTE,
  TASK_TEXTURES,
  randomTaskColor,
  randomTaskTexture,
  taskBlockStyle,
} from "@/lib/taskStyle";

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
  const [memberIds, setMemberIds] = useState<string[]>(task?.memberIds ?? []);
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours ?? 8);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [color, setColor] = useState(task?.color ?? randomTaskColor());
  const [texture, setTexture] = useState(task?.texture ?? randomTaskTexture());
  const [error, setError] = useState("");

  const projectItems = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const textureItems = Object.fromEntries(TASK_TEXTURES.map((t) => [t.value, t.label]));

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const isDuplicateTitle = (candidate: string) =>
    tasks.some(
      (t) =>
        t.id !== task?.id &&
        t.projectId === projectId &&
        t.title.trim().toLowerCase() === candidate.trim().toLowerCase()
    );

  const handleSubmit = () => {
    if (!title || !projectId || !deadline) return;
    if (isDuplicateTitle(title)) {
      setError("同じプロジェクト内に同じ名前のタスクが既に存在します");
      return;
    }
    if (isEdit && task) {
      updateTask(task.id, {
        title,
        projectId,
        memberIds: memberIds.length > 0 ? memberIds : undefined,
        estimatedHours,
        deadline,
        color,
        texture,
      });
    } else {
      addTask({
        id: uuidv4(),
        title,
        projectId,
        estimatedHours,
        deadline,
        placements: [],
        color,
        texture,
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
              <Label>担当者（複数選択可）</Label>
              <div className="flex flex-wrap gap-1.5">
                {members.length === 0 && (
                  <p className="text-xs text-gray-400">メンバーがいません</p>
                )}
                {members.map((m) => {
                  const selected = memberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                        selected
                          ? "border-transparent text-white"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      )}
                      style={selected ? { backgroundColor: m.color } : undefined}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selected ? "white" : m.color }}
                      />
                      {getMemberFullName(m)}
                    </button>
                  );
                })}
              </div>
              {memberIds.length === 0 && (
                <p className="text-xs text-gray-400">未選択のまま保存すると担当未定になります</p>
              )}
            </div>
          )}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label>色・テクスチャ</Label>
              <span
                className="w-16 h-6 rounded border border-gray-200"
                style={taskBlockStyle(color, texture)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TASK_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid #1f2937" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                title="カスタムカラー"
              />
            </div>
            <Select
              items={textureItems}
              value={texture}
              onValueChange={(v) => v && setTexture(v as typeof texture)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TEXTURES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
