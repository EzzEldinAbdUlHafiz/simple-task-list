export type TaskStatus = "active" | "completed";
export type TaskFilter = "active" | "completed" | "all";

export interface Task {
  id: string;
  title: string;
  notes: string;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}