"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Team } from "@/types";
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
  "#0ea5e9", "#6366f1", "#f59e0b", "#10b981",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16",
];

type Props = { onClose: () => void };

export function TeamDialog({ onClose }: Props) {
  const { teams, members, addTeam, updateTeam, removeTeam } = usePlannerStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addTeam({ id: uuidv4(), name: name.trim(), color });
    setName("");
    setColor(PRESET_COLORS[teams.length % PRESET_COLORS.length]);
  };

  const startEdit = (t: Team) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditColor(t.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateTeam(editingId, { name: editName.trim(), color: editColor });
    setEditingId(undefined);
  };

  const memberCount = (teamId: string) => members.filter((m) => m.teamId === teamId).length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>チーム管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {teams.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">チームがありません</p>
          )}
          {teams.map((t) =>
            editingId === t.id ? (
              <div key={t.id} className="bg-gray-50 rounded px-3 py-2 space-y-2">
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
              <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="text-sm font-medium text-gray-700">{t.name}</span>
                  <span className="text-[11px] text-gray-400">{memberCount(t.id)}名</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-gray-400 hover:text-indigo-500 text-xs px-1 transition-colors"
                    title="編集"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => removeTeam(t.id)}
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

        {!editingId && (
          <div className="border-t pt-3 space-y-3">
            <p className="text-xs font-medium text-gray-500">新しいチームを追加</p>
            <div className="grid gap-1.5">
              <Label className="text-xs">チーム名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="例: 開発チーム"
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
            <Button className="w-full" onClick={handleAdd} disabled={!name.trim()}>
              追加
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
