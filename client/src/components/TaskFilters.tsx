import { TaskFilter } from "@/types/task";

interface TaskFiltersProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: { active: number; completed: number; all: number };
}

const filters: { value: TaskFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
];

export function TaskFilters({ filter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-secondary p-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            filter === f.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
          <span className="ml-1.5 text-xs opacity-60">{counts[f.value]}</span>
        </button>
      ))}
    </div>
  );
}
