"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DataPortabilitySection } from "@/components/settings/DataPortabilitySection";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const MONTH_ITEMS = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [String(i + 1), `${i + 1}月`])
);

type Props = { onClose: () => void };

export function SettingsDialog({ onClose }: Props) {
  const { settings, updateSettings, addHoliday, removeHoliday } = usePlannerStore();
  const [newHoliday, setNewHoliday] = useState("");

  const toggleWeekendDay = (dow: number) => {
    const next = settings.weekendDays.includes(dow)
      ? settings.weekendDays.filter((d) => d !== dow)
      : [...settings.weekendDays, dow];
    updateSettings({ weekendDays: next });
  };

  const sortedHolidays = [...settings.holidays].sort();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-1.5">
            <Label>週末（休業日）とする曜日</Label>
            <div className="flex gap-1.5">
              {WEEKDAY_LABELS.map((label, dow) => {
                const selected = settings.weekendDays.includes(dow);
                return (
                  <button
                    key={dow}
                    type="button"
                    onClick={() => toggleWeekendDay(dow)}
                    className={cn(
                      "w-9 h-9 rounded-full border text-sm transition-colors",
                      selected
                        ? "bg-gray-800 text-white border-gray-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400">
              週末・祝日もタスクは配置可能です。表示のグレー表示と「営業日のみ表示」の対象に反映されます。
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label>祝日・休業日</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!newHoliday) return;
                  addHoliday(newHoliday);
                  setNewHoliday("");
                }}
                disabled={!newHoliday}
              >
                追加
              </Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {sortedHolidays.length === 0 && (
                <p className="text-xs text-gray-400">登録された祝日はありません</p>
              )}
              {sortedHolidays.map((h) => (
                <div key={h} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
                  <span className="text-sm">{format(parseISO(h), "yyyy年M月d日(E)", { locale: ja })}</span>
                  <button
                    onClick={() => removeHoliday(h)}
                    className="text-gray-400 hover:text-red-500 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>年度の開始月</Label>
            <Select
              items={MONTH_ITEMS}
              value={String(settings.fiscalYearStartMonth)}
              onValueChange={(v) => v && updateSettings({ fiscalYearStartMonth: Number(v) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MONTH_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <DataPortabilitySection />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
