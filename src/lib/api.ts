const API_BASE = "http://localhost:3001";

export async function getTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function createTask(data: {
  title: string;
  notes?: string;
  dueDate?: string | null;
}) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create task");
  }

  return res.json();
}

export async function updateTask(
  id: string,
  data: {
    title: string;
    notes?: string;
    dueDate?: string | null;
    status: "ACTIVE" | "COMPLETED";
  }
) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update task");
  }

  return res.json();
}

export async function completeTask(id: string) {
  const res = await fetch(`${API_BASE}/tasks/${id}/complete`, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("Failed to complete task");
  return res.json();
}

export async function reopenTask(id: string) {
  const res = await fetch(`${API_BASE}/tasks/${id}/reopen`, {
    method: "PATCH",
  });

  if (!res.ok) throw new Error("Failed to reopen task");
  return res.json();
}

export async function deleteTask(id: string) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete task");
}