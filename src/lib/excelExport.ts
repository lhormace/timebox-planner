import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import { Member, Project, Task } from "@/types";
import {
  getCompletionDate,
  getPlacedHours,
  getTaskStatus,
  TASK_STATUS_LABEL,
} from "@/lib/planner";
import {
  getProjectTasks,
  isTaskWithinProjectWindow,
  getProjectFinance,
  getProjectProgress,
  getProjectMemberBreakdown,
} from "@/lib/projectFinance";
import { getMemberFullName } from "@/lib/member";

function dateLabel(iso: string | undefined): string {
  return iso ? format(parseISO(iso), "yyyy-MM-dd") : "";
}

export function exportProjectReport(project: Project, tasks: Task[], members: Member[]) {
  const projectTasks = getProjectTasks(tasks, project.id);
  const finance = getProjectFinance(tasks, members, project);
  const progress = getProjectProgress(tasks, project.id);
  const memberBreakdown = getProjectMemberBreakdown(tasks, members, project.id);

  const wb = XLSX.utils.book_new();

  const overviewRows = [
    ["プロジェクト名", project.name],
    ["プロジェクト憲章", project.charter ?? ""],
    ["開始日", dateLabel(project.startDate)],
    ["終了日", dateLabel(project.endDate)],
    [],
    ["進捗率(%)", Math.round(progress * 10) / 10],
    ["積算費用(円)", Math.round(finance.cost)],
    ["予算(円)", finance.budget ?? ""],
    ["損益(円)", finance.margin !== undefined ? Math.round(finance.margin) : ""],
    ["利益率(%)", finance.marginRate !== undefined ? Math.round(finance.marginRate * 10) / 10 : ""],
    ["損益分岐", finance.breakEven === undefined ? "" : finance.breakEven ? "黒字" : "赤字"],
    ["目標利益率(%)", finance.targetMarginRate ?? ""],
    ["目標達成", finance.meetsTarget === undefined ? "" : finance.meetsTarget ? "達成" : "未達"],
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewRows);
  XLSX.utils.book_append_sheet(wb, overviewSheet, "概要");

  const taskRows = [
    ["タスク名", "担当者", "見積時間(h)", "配置時間(h)", "期限", "完了予定日", "状況", "期間内か"],
    ...projectTasks.map((t) => {
      const assignees = members
        .filter((m) => t.memberIds?.includes(m.id))
        .map((m) => getMemberFullName(m))
        .join("・");
      const status = getTaskStatus(t);
      const completion = getCompletionDate(t);
      return [
        t.title,
        assignees,
        t.estimatedHours,
        getPlacedHours(t),
        dateLabel(t.deadline),
        dateLabel(completion),
        TASK_STATUS_LABEL[status],
        isTaskWithinProjectWindow(t, project) ? "期間内" : "期間外",
      ];
    }),
  ];
  const taskSheet = XLSX.utils.aoa_to_sheet(taskRows);
  XLSX.utils.book_append_sheet(wb, taskSheet, "タスク一覧");

  const memberRows = [
    ["担当者", "予定時間(h)", "実績時間(h)", "差分(%)", "コスト(円)"],
    ...memberBreakdown.map((row) => {
      const variance =
        row.actualHours !== undefined && row.plannedHours > 0
          ? Math.round(((row.actualHours - row.plannedHours) / row.plannedHours) * 1000) / 10
          : "";
      return [
        getMemberFullName(row.member),
        row.plannedHours,
        row.actualHours ?? "",
        variance,
        Math.round(row.cost),
      ];
    }),
  ];
  const memberSheet = XLSX.utils.aoa_to_sheet(memberRows);
  XLSX.utils.book_append_sheet(wb, memberSheet, "メンバー別工数");

  const stamp = format(new Date(), "yyyyMMdd-HHmm");
  XLSX.writeFile(wb, `${project.name}_report_${stamp}.xlsx`);
}
