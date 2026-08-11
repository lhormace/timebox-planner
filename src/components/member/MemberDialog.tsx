"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { usePlannerStore } from "@/store/usePlannerStore";
import { getMemberFullName } from "@/lib/member";
import { Member } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberDetailDialog } from "@/components/member/MemberDetailDialog";

const PRESET_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16",
];

type FormState = {
  lastName: string;
  firstName: string;
  company: string;
  department: string;
  dailyRateJpy: string;
  color: string;
};

const emptyForm = (color: string): FormState => ({
  lastName: "",
  firstName: "",
  company: "",
  department: "",
  dailyRateJpy: "",
  color,
});

function MemberForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={form.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          placeholder="姓"
        />
        <Input
          value={form.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          placeholder="名"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={form.company}
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="会社名"
        />
        <Input
          value={form.department}
          onChange={(e) => onChange({ department: e.target.value })}
          placeholder="部署名"
        />
      </div>
      <Input
        type="number"
        min={0}
        value={form.dailyRateJpy}
        onChange={(e) => onChange({ dailyRateJpy: e.target.value })}
        placeholder="人日単価（円、任意）"
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
    </div>
  );
}

type Props = { onClose: () => void };

export function MemberDialog({ onClose }: Props) {
  const { members, addMember, updateMember, removeMember } = usePlannerStore();
  const [form, setForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editForm, setEditForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [detailMember, setDetailMember] = useState<Member | undefined>();

  const handleAdd = () => {
    if (!form.lastName.trim() && !form.firstName.trim()) return;
    addMember({
      id: uuidv4(),
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      company: form.company.trim(),
      department: form.department.trim(),
      dailyRateJpy: form.dailyRateJpy ? Number(form.dailyRateJpy) : undefined,
      color: form.color,
    });
    setForm(emptyForm(PRESET_COLORS[members.length % PRESET_COLORS.length]));
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEditForm({
      lastName: m.lastName,
      firstName: m.firstName,
      company: m.company ?? "",
      department: m.department ?? "",
      dailyRateJpy: m.dailyRateJpy !== undefined ? String(m.dailyRateJpy) : "",
      color: m.color,
    });
  };

  const saveEdit = () => {
    if (!editingId || (!editForm.lastName.trim() && !editForm.firstName.trim())) return;
    updateMember(editingId, {
      lastName: editForm.lastName.trim(),
      firstName: editForm.firstName.trim(),
      company: editForm.company.trim(),
      department: editForm.department.trim(),
      dailyRateJpy: editForm.dailyRateJpy ? Number(editForm.dailyRateJpy) : undefined,
      color: editForm.color,
    });
    setEditingId(undefined);
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>メンバー管理</DialogTitle>
          </DialogHeader>

          {/* Member list */}
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {members.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">メンバーがいません</p>
            )}
            {members.map((m) =>
              editingId === m.id ? (
                <div key={m.id} className="bg-gray-50 rounded px-3 py-2 space-y-2">
                  <MemberForm form={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="xs" onClick={() => setEditingId(undefined)}>
                      キャンセル
                    </Button>
                    <Button
                      size="xs"
                      onClick={saveEdit}
                      disabled={!editForm.lastName.trim() && !editForm.firstName.trim()}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{getMemberFullName(m)}</p>
                      {(m.company || m.department) && (
                        <p className="text-[11px] text-gray-400 truncate">
                          {[m.company, m.department].filter(Boolean).join(" / ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setDetailMember(m)}
                      className="text-gray-400 hover:text-indigo-500 text-xs px-1 transition-colors"
                      title="詳細"
                    >
                      詳細
                    </button>
                    <button
                      onClick={() => startEdit(m)}
                      className="text-gray-400 hover:text-indigo-500 text-xs px-1 transition-colors"
                      title="編集"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => removeMember(m.id)}
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
            <p className="text-xs font-medium text-gray-500">新しいメンバーを追加</p>
            <MemberForm form={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={!form.lastName.trim() && !form.firstName.trim()}
            >
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {detailMember && (
        <MemberDetailDialog member={detailMember} onClose={() => setDetailMember(undefined)} />
      )}
    </>
  );
}
