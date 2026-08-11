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
  // Empty/unset when the task is created — members are assigned later, once
  // ownership is decided. A task can have more than one assignee, each
  // working their own hours against the shared estimatedHours total.
  memberIds?: string[];
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
  memberId: string;
  date: string;   // YYYY-MM-DD
  hours: number;  // 0 < hours <= 8
};
