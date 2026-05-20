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
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16",
];

type Props = { onClose: () => void };

export function MemberDialog({ onClose }: Props) {
  const { members, addMember, removeMember } = usePlannerStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addMember({ id: uuidv4(), name: name.trim(), color });
    setName("");
    setColor(PRESET_COLORS[members.length % PRESET_COLORS.length]);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>メンバー管理</DialogTitle>
        </DialogHeader>

        {/* Member list */}
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {members.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">メンバーがいません</p>
          )}
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-sm font-medium text-gray-700">{m.name}</span>
              </div>
              <button
                onClick={() => removeMember(m.id)}
                className="text-gray-400 hover:text-red-500 text-xs px-1 transition-colors"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="border-t pt-3 space-y-3">
          <p className="text-xs font-medium text-gray-500">新しいメンバーを追加</p>
          <div className="grid gap-1.5">
            <Label className="text-xs">名前</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="例: Charlie"
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
