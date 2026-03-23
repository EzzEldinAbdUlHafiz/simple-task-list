import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  task?: Task | null;
  onSave: (title: string, notes: string, due_date: string | null) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function TaskForm({ task, onSave, onCancel, saving }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? parseISO(task.due_date) : undefined
  );
  const [errors, setErrors] = useState<{ title?: string; notes?: string }>({});

  useEffect(() => {
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
    setDueDate(task?.due_date ? parseISO(task.due_date) : undefined);
    setErrors({});
  }, [task]);

  const handleSave = () => {
    const trimmed = title.trim();
    const newErrors: { title?: string; notes?: string } = {};
    if (!trimmed) newErrors.title = "Title is required.";
    else if (trimmed.length > 120) newErrors.title = "Title must be 120 characters or fewer.";
    if (notes.length > 1000) newErrors.notes = "Notes must be 1000 characters or fewer.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const dueDateStr = dueDate ? format(dueDate, "yyyy-MM-dd") : null;
    onSave(trimmed, notes, dueDateStr);
  };

  const isEditing = !!task;

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-xl font-serif text-foreground">
        {isEditing ? "Edit Task" : "Add Task"}
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-sm font-medium">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          placeholder="What needs to be done?"
          className={cn(errors.title && "border-destructive")}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
        <p className="text-xs text-muted-foreground text-right">{title.trim().length}/120</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (errors.notes) setErrors((p) => ({ ...p, notes: undefined }));
          }}
          placeholder="Add any extra details..."
          rows={3}
          className={cn(errors.notes && "border-destructive")}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes}</p>
        )}
        <p className="text-xs text-muted-foreground text-right">{notes.length}/1000</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Due Date</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {dueDate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDueDate(undefined)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Clear due date"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
