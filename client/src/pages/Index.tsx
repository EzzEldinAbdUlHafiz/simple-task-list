import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@/types/task";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";

type View = "list" | "add" | "edit";

const Index = () => {
  const { tasks, allTasks, filter, setFilter, createTask, updateTask, toggleStatus, deleteTask } = useTasks();
  const [view, setView] = useState<View>("list");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const counts = {
    active: allTasks.filter((t) => t.status === "active").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    all: allTasks.length,
  };

  const handleAdd = () => {
    setEditingTask(null);
    setView("add");
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setView("edit");
  };

  const handleSave = (title: string, notes: string, due_date: string | null) => {
    if (view === "edit" && editingTask) {
      updateTask(editingTask.id, { title, notes, due_date });
    } else {
      createTask(title, notes, due_date);
    }
    setView("list");
    setEditingTask(null);
  };

  const handleCancel = () => {
    setView("list");
    setEditingTask(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setDeletingTask(null);
    }
  };

  const emptyMessage = (() => {
    if (allTasks.length === 0) return "No tasks yet.";
    if (filter === "active") return "No active tasks.";
    if (filter === "completed") return "No completed tasks.";
    return "No tasks yet.";
  })();

  if (view !== "list") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
          <TaskForm
            task={view === "edit" ? editingTask : null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground tracking-tight">
            Tasks
          </h1>
          <Button onClick={handleAdd} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <TaskFilters filter={filter} onFilterChange={setFilter} counts={counts} />
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">{emptyMessage}</p>
            {allTasks.length === 0 && (
              <Button onClick={handleAdd} variant="outline" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleStatus}
                onEdit={handleEdit}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deletingTask}
        taskTitle={deletingTask?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
};

export default Index;
