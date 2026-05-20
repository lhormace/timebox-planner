"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
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
  defaultMemberId?: string;
  defaultDate?: string;
  onClose: () => void;
};

export function TaskDialog({ open, defaultMemberId, defaultDate, onClose }: Props) {
  const { members, projects, addTask } = usePlannerStore();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [memberId, setMemberId] = useState(defaultMemberId ?? members[0]?.id ?? "");
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [deadline, setDeadline] = useState(defaultDate ?? "");
  const [placementHours, setPlacementHours] = useState(8);

  const handleSubmit = () => {
    if (!title || !memberId || !projectId || !deadline) return;
    addTask({
      id: uuidv4(),
      title,
      projectId,
      memberId,
      estimatedHours,
      deadline,
      placements: defaultDate
        ? [{ date: defaultDate, hours: Math.min(placementHours, 8) }]
        : [],
    });
    setTitle("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>タスクを追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>タスク名</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: API設計"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>プロジェクト</Label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger>
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
              <Label>担当者</Label>
              <Select value={memberId} onValueChange={(v) => v && setMemberId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          {defaultDate && (
            <div className="grid gap-1.5">
              <Label>{defaultDate} の配置時間 (最大8h)</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={placementHours}
                onChange={(e) => setPlacementHours(Number(e.target.value))}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={handleSubmit} disabled={!title || !deadline}>追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
