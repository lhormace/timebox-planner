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

export type Task = {
  id: string;
  title: string;
  projectId: string;
  memberId: string;
  estimatedHours: number;
  deadline: string; // ISO date string YYYY-MM-DD
  placements: Placement[];
};

// A placement is one "block" on the grid: member × day × hours
export type Placement = {
  date: string;   // YYYY-MM-DD
  hours: number;  // 0 < hours <= 8
};
