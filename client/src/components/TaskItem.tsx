import { Task } from "@/types/task";
import { Check, Pencil, Trash2, Calendar } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const isOverdue =
    !isCompleted && task.due_date && isPast(parseISO(task.due_date + "T23:59:59"));

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/60 transition-colors duration-150 animate-fade-in">
      {/* Check circle */}
      <button
        onClick={() => onToggle(task.id)}
        className={isCompleted ? "task-check-done mt-0.5" : "task-check mt-0.5"}
        aria-label={isCompleted ? "Reopen task" : "Complete task"}
      >
        {isCompleted && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {task.notes}
          </p>
        )}
        {task.due_date && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs ${
              isOverdue ? "text-overdue font-medium" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-3 h-3" />
            {format(parseISO(task.due_date), "MMM d, yyyy")}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Edit task"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
