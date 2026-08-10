"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16",
];

type Props = { onClose: () => void };

export function ProjectDialog({ onClose }: Props) {
  const { projects, addProject, updateProject, removeProject } = usePlannerStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addProject({ id: uuidv4(), name: name.trim(), color });
    setName("");
    setColor(PRESET_COLORS[projects.length % PRESET_COLORS.length]);
  };

  const startEdit = (id: string, currentName: string, currentColor: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditColor(currentColor);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateProject(editingId, { name: editName.trim(), color: editColor });
    setEditingId(undefined);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>プロジェクト管理</DialogTitle>
        </DialogHeader>

        {/* Project list */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {projects.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">プロジェクトがありません</p>
          )}
          {projects.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="bg-gray-50 rounded px-3 py-2 space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: editColor === c ? "2px solid #1f2937" : "2px solid transparent",
                        outlineOffset: "2px",
                      }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                    title="カスタムカラー"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="xs" onClick={() => setEditingId(undefined)}>
                    キャンセル
                  </Button>
                  <Button size="xs" onClick={saveEdit} disabled={!editName.trim()}>
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium text-gray-700">{p.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(p.id, p.name, p.color)}
                    className="text-gray-400 hover:text-indigo-500 text-xs px-1 transition-colors"
                    title="編集"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => removeProject(p.id)}
                    className="text-gray-400 hover:text-red-500 text-xs px-1 transition-colors"
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Add form */}
        <div className="border-t pt-3 space-y-3">
          <p className="text-xs font-medium text-gray-500">新しいプロジェクトを追加</p>
          <div className="grid gap-1.5">
            <Label className="text-xs">名前</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="例: プロジェクトB"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">カラー</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
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
          </div>
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            追加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
