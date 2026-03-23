import { useState, useCallback, useEffect } from "react";
import { Task, TaskFilter, TaskStatus } from "@/types/task";

const STORAGE_KEY = "task-manager-tasks";

function generateId(): string {
  return crypto.randomUUID();
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return parsed.filter(
      (t) =>
        t.id &&
        t.title &&
        (t.status === "active" || t.status === "completed")
    );
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Tasks with due dates before tasks without
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    // Earlier due date first
    if (a.due_date && b.due_date) {
      const cmp = a.due_date.localeCompare(b.due_date);
      if (cmp !== 0) return cmp;
    }
    // More recently updated first
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<TaskFilter>("active");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const createTask = useCallback(
    (title: string, notes: string, due_date: string | null): Task => {
      const now = new Date().toISOString();
      const task: Task = {
        id: generateId(),
        title: title.trim(),
        notes,
        due_date,
        status: "active",
        created_at: now,
        updated_at: now,
      };
      setTasks((prev) => [...prev, task]);
      return task;
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<Task, "title" | "notes" | "due_date">>) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updates, title: updates.title !== undefined ? updates.title.trim() : t.title, updated_at: new Date().toISOString() }
            : t
        )
      );
    },
    []
  );

  const toggleStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: (t.status === "active" ? "completed" : "active") as TaskStatus,
              updated_at: new Date().toISOString(),
            }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = (() => {
    let result: Task[];
    if (filter === "all") {
      const active = sortTasks(tasks.filter((t) => t.status === "active"));
      const completed = sortTasks(tasks.filter((t) => t.status === "completed"));
      result = [...active, ...completed];
    } else {
      result = sortTasks(tasks.filter((t) => t.status === filter));
    }
    return result;
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
