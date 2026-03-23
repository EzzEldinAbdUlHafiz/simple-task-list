export type TaskStatus = "active" | "completed";

export interface Task {
  id: string;
  title: string;
  notes: string;
  due_date: string | null; // YYYY-MM-DD
  status: TaskStatus;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type TaskFilter = "active" | "completed" | "all";
