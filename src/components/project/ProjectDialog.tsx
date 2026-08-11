"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import { Project } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectDetailDialog } from "@/components/project/ProjectDetailDialog";

const PRESET_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16",
];

type FormState = {
  name: string;
  color: string;
  charter: string;
  startDate: string;
  endDate: string;
  budgetJpy: string;
  targetMarginRate: string;
};

const emptyForm = (color: string): FormState => ({
  name: "",
  color,
  charter: "",
  startDate: "",
  endDate: "",
  budgetJpy: "",
  targetMarginRate: "",
});

function ProjectForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-2">
      <Input
        value={form.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="プロジェクト名"
      />
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              outline: form.color === c ? "2px solid #1f2937" : "2px solid transparent",
              outlineOffset: "2px",
            }}
            onClick={() => onChange({ color: c })}
          />
        ))}
        <input
          type="color"
          value={form.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 bg-transparent"
          title="カスタムカラー"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs text-gray-500">プロジェクト憲章（任意）</Label>
        <Textarea
          value={form.charter}
          onChange={(e) => onChange({ charter: e.target.value })}
          placeholder="目的・スコープ・成果物など"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-gray-500">開始日</Label>
          <Input type="date" value={form.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-gray-500">終了日</Label>
          <Input type="date" value={form.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label className="text-xs text-gray-500">予算（円、任意）</Label>
          <Input
            type="number"
            min={0}
            value={form.budgetJpy}
            onChange={(e) => onChange({ budgetJpy: e.target.value })}
            placeholder="例: 3000000"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-gray-500">目標利益率（%、任意）</Label>
          <Input
            type="number"
            value={form.targetMarginRate}
            onChange={(e) => onChange({ targetMarginRate: e.target.value })}
            placeholder="例: 20"
          />
        </div>
      </div>
    </div>
  );
}

type Props = { onClose: () => void };

export function ProjectDialog({ onClose }: Props) {
  const { projects, addProject, updateProject, removeProject } = usePlannerStore();
  const [form, setForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editForm, setEditForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [detailProject, setDetailProject] = useState<Project | undefined>();

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addProject({
      id: uuidv4(),
      name: form.name.trim(),
      color: form.color,
      charter: form.charter.trim() || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      budgetJpy: form.budgetJpy ? Number(form.budgetJpy) : undefined,
      targetMarginRate: form.targetMarginRate ? Number(form.targetMarginRate) : undefined,
    });
    setForm(emptyForm(PRESET_COLORS[projects.length % PRESET_COLORS.length]));
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      color: p.color,
      charter: p.charter ?? "",
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
      budgetJpy: p.budgetJpy !== undefined ? String(p.budgetJpy) : "",
      targetMarginRate: p.targetMarginRate !== undefined ? String(p.targetMarginRate) : "",
    });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateProject(editingId, {
      name: editForm.name.trim(),
      color: editForm.color,
      charter: editForm.charter.trim() || undefined,
      startDate: editForm.startDate || undefined,
      endDate: editForm.endDate || undefined,
      budgetJpy: editForm.budgetJpy ? Number(editForm.budgetJpy) : undefined,
      targetMarginRate: editForm.targetMarginRate ? Number(editForm.targetMarginRate) : undefined,
    });
    setEditingId(undefined);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プロジェクト管理</DialogTitle>
          </DialogHeader>

          {/* Project list */}
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {projects.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">プロジェクトがありません</p>
            )}
            {projects.map((p) =>
              editingId === p.id ? (
                <div key={p.id} className="bg-gray-50 rounded px-3 py-2 space-y-2">
                  <ProjectForm form={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="xs" onClick={() => setEditingId(undefined)}>
                      キャンセル
                    </Button>
                    <Button size="xs" onClick={saveEdit} disabled={!editForm.name.trim()}>
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
                      onClick={() => setDetailProject(p)}
                      className="text-gray-400 hover:text-indigo-500 text-xs px-1 transition-colors"
                      title="詳細"
                    >
                      詳細
                    </button>
                    <button
                      onClick={() => startEdit(p)}
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
          {!editingId && (
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-medium text-gray-500">新しいプロジェクトを追加</p>
              <ProjectForm form={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
              <Button className="w-full" onClick={handleAdd} disabled={!form.name.trim()}>
                追加
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {detailProject && (
        <ProjectDetailDialog project={detailProject} onClose={() => setDetailProject(undefined)} />
      )}
    </>
  );
}
