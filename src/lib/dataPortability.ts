import { Member, Project, Task, PlannerSettings } from "@/types";

export type PlannerData = {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  settings: PlannerSettings;
};

export type ExportedFile = PlannerData & {
  schemaVersion: 1;
  exportedAt: string;
};

export function buildExport(data: PlannerData): ExportedFile {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), ...data };
}

export function exportFileName(): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `timebox-planner-${stamp}.json`;
}

export function parseImport(json: string): PlannerData {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("JSONとして読み込めませんでした");
  }
  if (!data || typeof data !== "object") {
    throw new Error("ファイルの形式が不正です");
  }
  const { members, projects, tasks, settings } = data as Partial<PlannerData>;
  if (!Array.isArray(members) || !Array.isArray(projects) || !Array.isArray(tasks) || !settings) {
    throw new Error("ファイルの形式が不正です（members/projects/tasks/settingsが必要）");
  }
  return { members, projects, tasks, settings };
}
