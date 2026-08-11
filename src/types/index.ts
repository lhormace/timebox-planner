export type Member = {
  id: string;
  name: string;
  color: string;
};

export type Project = {
  id: string;
  name: string;
  color: string;
};

export type TaskTexture = "none" | "stripes" | "dots" | "grid";

export type Task = {
  id: string;
  title: string;
  projectId: string;
  // Unset when the task is created — a member is assigned later, once
  // ownership is decided.
  memberId?: string;
  estimatedHours: number;
  deadline: string; // ISO date string YYYY-MM-DD
  placements: Placement[];
  // Randomized at creation so tasks within the same project stay visually
  // distinguishable on the grid; editable afterwards.
  color?: string;
  texture?: TaskTexture;
};

// A placement is one "block" on the grid: member × day × hours
export type Placement = {
  date: string;   // YYYY-MM-DD
  hours: number;  // 0 < hours <= 8
};
