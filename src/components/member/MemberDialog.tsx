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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberDetailDialog } from "@/components/member/MemberDetailDialog";
import { TeamDialog } from "@/components/team/TeamDialog";
import { Team } from "@/types";

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
  title: string;
  teamId: string;
  dailyRateJpy: string;
  color: string;
};

const emptyForm = (color: string): FormState => ({
  lastName: "",
  firstName: "",
  company: "",
  department: "",
  title: "",
  teamId: "",
  dailyRateJpy: "",
  color,
});

function MemberForm({
  form,
  teams,
  onChange,
}: {
  form: FormState;
  teams: Team[];
  onChange: (patch: Partial<FormState>) => void;
}) {
  const teamItems = Object.fromEntries(teams.map((t) => [t.id, t.name]));
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
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="役職（任意）"
        />
        <Select
          items={teamItems}
          value={form.teamId}
          onValueChange={(v) => onChange({ teamId: v ?? "" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="チーム未所属" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
  const { members, teams, addMember, updateMember, removeMember, moveMember } = usePlannerStore();
  const [form, setForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [editingId, setEditingId] = useState<string | undefined>();
  const [editForm, setEditForm] = useState<FormState>(emptyForm(PRESET_COLORS[0]));
  const [detailMember, setDetailMember] = useState<Member | undefined>();
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  const handleAdd = () => {
    if (!form.lastName.trim() && !form.firstName.trim()) return;
    addMember({
      id: uuidv4(),
      lastName: form.lastName.trim(),
      firstName: form.firstName.trim(),
      company: form.company.trim(),
      department: form.department.trim(),
      title: form.title.trim() || undefined,
      teamId: form.teamId || undefined,
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
      title: m.title ?? "",
      teamId: m.teamId ?? "",
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
      title: editForm.title.trim() || undefined,
      teamId: editForm.teamId || undefined,
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
            <DialogTitle className="flex items-center gap-2">
              メンバー管理
              <Button
                variant="outline"
                size="xs"
                className="ml-auto mr-6"
                onClick={() => setTeamDialogOpen(true)}
              >
                チーム管理
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Member list */}
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {members.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">メンバーがいません</p>
            )}
            {members.map((m, index) =>
              editingId === m.id ? (
                <div key={m.id} className="bg-gray-50 rounded px-3 py-2 space-y-2">
                  <MemberForm
                    form={editForm}
                    teams={teams}
                    onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
                  />
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
                    <div className="flex flex-col flex-shrink-0">
                      <button
                        onClick={() => moveMember(m.id, "up")}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-indigo-500 disabled:opacity-20 disabled:hover:text-gray-400 leading-none text-[10px]"
                        title="上に移動"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveMember(m.id, "down")}
                        disabled={index === members.length - 1}
                        className="text-gray-400 hover:text-indigo-500 disabled:opacity-20 disabled:hover:text-gray-400 leading-none text-[10px]"
                        title="下に移動"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {getMemberFullName(m)}
                        {m.title && <span className="text-gray-400 font-normal"> ・ {m.title}</span>}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {[
                          teams.find((t) => t.id === m.teamId)?.name,
                          m.company,
                          m.department,
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
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
          {!editingId && (
            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-medium text-gray-500">新しいメンバーを追加</p>
              <MemberForm form={form} teams={teams} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />
              <Button
                className="w-full"
                onClick={handleAdd}
                disabled={!form.lastName.trim() && !form.firstName.trim()}
              >
                追加
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {detailMember && (
        <MemberDetailDialog member={detailMember} onClose={() => setDetailMember(undefined)} />
      )}
      {teamDialogOpen && <TeamDialog onClose={() => setTeamDialogOpen(false)} />}
    </>
  );
}
