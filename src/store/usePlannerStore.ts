import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Member, Project, Task, Placement } from "@/types";

type PlannerStore = {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addPlacement: (taskId: string, placement: Placement) => void;
  removePlacement: (taskId: string, date: string) => void;
};

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      members: [
        { id: "m1", name: "Alice", color: "#6366f1" },
        { id: "m2", name: "Bob", color: "#f59e0b" },
      ],
      projects: [
        { id: "p1", name: "プロジェクトA", color: "#10b981" },
      ],
      tasks: [],

      addMember: (member) =>
        set((s) => ({ members: [...s.members, member] })),
      removeMember: (id) =>
        set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, project] })),
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
                    ...t.placements.filter((p) => p.date !== placement.date),
                    placement,
                  ],
                }
              : t
          ),
        })),
      removePlacement: (taskId, date) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, placements: t.placements.filter((p) => p.date !== date) }
              : t
          ),
        })),
    }),
    { name: "timebox-planner" }
  )
);
