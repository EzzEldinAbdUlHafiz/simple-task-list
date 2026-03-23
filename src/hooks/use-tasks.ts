import { useState, useCallback, useEffect } from "react";
import { Task, TaskFilter, TaskStatus } from "@/types/task";

const API_BASE = "http://localhost:3001";

async function apiGetTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to load tasks");

  const data = await res.json();

  return data.map((t: any) => ({
    id: t.id,
    title: t.title,
    notes: t.notes ?? "",
    due_date: t.dueDate
      ? new Date(t.dueDate).toISOString().slice(0, 10)
      : null,
    status: t.status === "COMPLETED" ? "completed" : "active",
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  }));
}

async function apiCreateTask(
  title: string,
  notes: string,
  due_date: string | null
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      notes,
      dueDate: due_date,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create task");
  }

  const t = await res.json();

  return {
    id: t.id,
    title: t.title,
    notes: t.notes ?? "",
    due_date: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    status: t.status === "COMPLETED" ? "completed" : "active",
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

async function apiUpdateTask(
  id: string,
  updates: Partial<Pick<Task, "title" | "notes" | "due_date">>,
  currentStatus: TaskStatus
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: updates.title,
      notes: updates.notes ?? "",
      dueDate: updates.due_date ?? null,
      status: currentStatus === "completed" ? "COMPLETED" : "ACTIVE",
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update task");
  }

  const t = await res.json();

  return {
    id: t.id,
    title: t.title,
    notes: t.notes ?? "",
    due_date: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    status: t.status === "COMPLETED" ? "completed" : "active",
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

async function apiToggleStatus(task: Task): Promise<Task> {
  const endpoint =
    task.status === "active"
      ? `${API_BASE}/tasks/${task.id}/complete`
      : `${API_BASE}/tasks/${task.id}/reopen`;

  const res = await fetch(endpoint, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("Failed to update task status");

  const t = await res.json();

  return {
    id: t.id,
    title: t.title,
    notes: t.notes ?? "",
    due_date: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    status: t.status === "COMPLETED" ? "completed" : "active",
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

async function apiDeleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete task");
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;

    if (a.due_date && b.due_date) {
      const cmp = a.due_date.localeCompare(b.due_date);
      if (cmp !== 0) return cmp;
    }

    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("active");

  useEffect(() => {
    apiGetTasks()
      .then(setTasks)
      .catch((error) => {
        console.error("Failed to load tasks:", error);
        setTasks([]);
      });
  }, []);

  const createTask = useCallback(
    async (title: string, notes: string, due_date: string | null): Promise<Task> => {
      const created = await apiCreateTask(title, notes, due_date);
      setTasks((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Pick<Task, "title" | "notes" | "due_date">>) => {
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;

      const updated = await apiUpdateTask(id, updates, existing.status);

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks]
  );

  const toggleStatus = useCallback(
    async (id: string) => {
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;

      const updated = await apiToggleStatus(existing);

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks]
  );

  const deleteTask = useCallback(async (id: string) => {
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = (() => {
    if (filter === "all") {
      const active = sortTasks(tasks.filter((t) => t.status === "active"));
      const completed = sortTasks(tasks.filter((t) => t.status === "completed"));
      return [...active, ...completed];
    }

    return sortTasks(tasks.filter((t) => t.status === filter));
  })();

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    createTask,
    updateTask,
    toggleStatus,
    deleteTask,
  };
}