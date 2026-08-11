import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Member, Project, Task, Placement, PlannerSettings } from "@/types";
import { getJapanHolidaysForYears } from "@/lib/japanHolidays";

type PlannerStore = {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  settings: PlannerSettings;
  updateSettings: (patch: Partial<PlannerSettings>) => void;
  addHoliday: (date: string) => void;
  removeHoliday: (date: string) => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, patch: Partial<Omit<Member, "id">>) => void;
  removeMember: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  removeProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addPlacement: (taskId: string, placement: Placement) => void;
  removePlacement: (taskId: string, memberId: string, date: string) => void;
  setPlacementActualHours: (
    taskId: string,
    memberId: string,
    date: string,
    actualHours: number | undefined
  ) => void;
  setPlacementHours: (taskId: string, memberId: string, date: string, hours: number) => void;
  resetAll: () => void;
  loadData: (data: Pick<PlannerStore, "members" | "projects" | "tasks" | "settings">) => void;
};

const initialState: Pick<PlannerStore, "members" | "projects" | "tasks" | "settings"> = {
  members: [
    { id: "m1", lastName: "山田", firstName: "太郎", company: "", department: "", color: "#6366f1" },
    { id: "m2", lastName: "佐藤", firstName: "花子", company: "", department: "", color: "#f59e0b" },
  ],
  projects: [
    { id: "p1", name: "プロジェクトA", color: "#10b981" },
  ],
  tasks: [],
  settings: {
    weekendDays: [0, 6],
    // Default to Japan's national holidays (computed, not hardcoded) for the
    // surrounding few years so the calendar is useful out of the box.
    holidays: getJapanHolidaysForYears([
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
    ]),
    fiscalYearStartMonth: 4,
  },
};

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      addHoliday: (date) =>
        set((s) =>
          s.settings.holidays.includes(date)
            ? s
            : { settings: { ...s.settings, holidays: [...s.settings.holidays, date].sort() } }
        ),
      removeHoliday: (date) =>
        set((s) => ({
          settings: { ...s.settings, holidays: s.settings.holidays.filter((h) => h !== date) },
        })),

      addMember: (member) =>
        set((s) => ({ members: [...s.members, member] })),
      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: (id) =>
        set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, project] })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addPlacement: (taskId, placement) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  placements: [
                    ...t.placements.filter(
                      (p) => !(p.memberId === placement.memberId && p.date === placement.date)
                    ),
                    placement,
                  ],
                }
              : t
          ),
        })),
      removePlacement: (taskId, memberId, date) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  placements: t.placements.filter(
                    (p) => !(p.memberId === memberId && p.date === date)
                  ),
                }
              : t
          ),
        })),

      setPlacementActualHours: (taskId, memberId, date, actualHours) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  placements: t.placements.map((p) =>
                    p.memberId === memberId && p.date === date ? { ...p, actualHours } : p
                  ),
                }
              : t
          ),
        })),

      setPlacementHours: (taskId, memberId, date, hours) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  placements: t.placements.map((p) =>
                    p.memberId === memberId && p.date === date ? { ...p, hours } : p
                  ),
                }
              : t
          ),
        })),

      resetAll: () => set(initialState),
      loadData: (data) => set(data),
    }),
    { name: "timebox-planner" }
  )
);
