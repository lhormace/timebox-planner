"use client";

import { useRef, useState } from "react";
import { usePlannerStore } from "@/store/usePlannerStore";
import { buildExport, exportFileName, parseImport, PlannerData } from "@/lib/dataPortability";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const JSON_ACCEPT = {
  description: "JSON",
  accept: { "application/json": [".json"] },
};

export function DataPortabilitySection() {
  const { members, projects, tasks, settings, loadData } = usePlannerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);
  const [error, setError] = useState("");

  const supportsFileSystemAccess =
    typeof window !== "undefined" && typeof window.showSaveFilePicker === "function";

  const currentData: PlannerData = { members, projects, tasks, settings };

  const writeToBlob = () => {
    const blob = new Blob([JSON.stringify(buildExport(currentData), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = (json: string) => {
    try {
      const data = parseImport(json);
      if (!confirm("現在のデータを読み込んだファイルの内容で上書きします。よろしいですか？")) return;
      loadData(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    }
  };

  // Without File System Access support, every save is a fresh download and
  // every load is a fresh file picker — there's no persistent "linked" file.
  const handleSave = async () => {
    if (!supportsFileSystemAccess) {
      writeToBlob();
      return;
    }
    try {
      let handle = fileHandleRef.current;
      if (!handle) {
        handle = await window.showSaveFilePicker!({
          suggestedName: exportFileName(),
          types: [JSON_ACCEPT],
        });
        fileHandleRef.current = handle;
        setLinkedFileName(handle.name);
      }
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(buildExport(currentData), null, 2));
      await writable.close();
      setError("");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError("ファイルへの保存に失敗しました");
    }
  };

  const handleLoadClick = () => {
    if (!supportsFileSystemAccess) {
      fileInputRef.current?.click();
      return;
    }
    (async () => {
      try {
        const [handle] = await window.showOpenFilePicker!({ types: [JSON_ACCEPT] });
        const file = await handle.getFile();
        applyImport(await file.text());
        fileHandleRef.current = handle;
        setLinkedFileName(handle.name);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("ファイルの読み込みに失敗しました");
      }
    })();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    applyImport(await file.text());
  };

  return (
    <div className="grid gap-2">
      <Label>データの保存・読み込み</Label>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleSave}>
          保存
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleLoadClick}>
          読み込み
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      <p className="text-xs text-gray-400">
        {supportsFileSystemAccess
          ? linkedFileName
            ? `連携中のファイル: ${linkedFileName}（「保存」で上書き。このタブを閉じるまで有効）`
            : "「保存」で保存先ファイルを選ぶと、以降はそのファイルに上書き保存されます"
          : "このブラウザではファイルとの連携ができないため、保存のたびにダウンロード、読み込みのたびにファイル選択になります"}
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
