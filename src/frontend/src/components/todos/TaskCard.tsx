import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  GripVertical,
  Pause,
  Play,
  RotateCcw,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Subtask, ToDo } from "../../backend";
import { formatTime, useTaskTimer } from "../../hooks/useTaskTimer";

const PRIORITY_CREDITS: Record<string, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

const priorityConfig = {
  high: {
    label: "HIGH",
    badgeClass:
      "bg-red-500/15 text-red-400 border-red-500/40 font-mono uppercase tracking-wider text-[9px]",
    cardGlow:
      "border-red-500/30 hover:border-red-400/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  },
  medium: {
    label: "MED",
    badgeClass:
      "bg-amber-500/15 text-amber-400 border-amber-500/40 font-mono uppercase tracking-wider text-[9px]",
    cardGlow:
      "border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  low: {
    label: "LOW",
    badgeClass:
      "bg-green-500/15 text-green-400 border-green-500/40 font-mono uppercase tracking-wider text-[9px]",
    cardGlow:
      "border-green-500/30 hover:border-green-400/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
  },
};

function getPriorityKey(priority: ToDo["priority"]): "high" | "medium" | "low" {
  if (typeof priority === "object") {
    if ("high" in priority) return "high";
    if ("medium" in priority) return "medium";
    return "low";
  }
  return (priority as string).toLowerCase() as "high" | "medium" | "low";
}

interface TimerDisplayProps {
  todoId: bigint;
  timerSeconds: number;
}

function TimerDisplay({ todoId, timerSeconds }: TimerDisplayProps) {
  const {
    remaining,
    percentRemaining,
    isRunning,
    isExpired,
    start,
    stop,
    reset,
  } = useTaskTimer({
    todoId,
    timerSeconds,
    onExpire: () =>
      toast.warning("⏰ Timer expired!", {
        description: "Your task timer has run out.",
      }),
  });

  const isLow = percentRemaining < 20;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-mono ${
        isLow ? "text-red-400" : "text-slate-400"
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span className={isExpired ? "text-red-500 font-bold" : ""}>
        {isExpired ? "EXPIRED" : formatTime(remaining)}
      </span>
      {!isExpired && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-cyan-400"
            onClick={isRunning ? stop : start}
          >
            {isRunning ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-cyan-400"
            onClick={reset}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </>
      )}
      <div className="w-16">
        <Progress
          value={percentRemaining}
          className={`h-1 ${
            isLow ? "[&>div]:bg-red-500" : "[&>div]:bg-cyan-500"
          }`}
        />
      </div>
    </div>
  );
}

interface TaskCardProps {
  todo: ToDo;
  index: number;
  onEdit: (todo: ToDo) => void;
  onDelete: (id: bigint) => void;
  onToggleComplete: (id: bigint, completed: boolean) => void;
  onToggleSubtask: (
    todoId: bigint,
    subtaskId: bigint,
    completed: boolean,
  ) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export default function TaskCard({
  todo,
  index,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSubtask,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const priorityKey = getPriorityKey(todo.priority);
  const pConfig = priorityConfig[priorityKey];
  const creditReward = PRIORITY_CREDITS[priorityKey];

  const completedSubtasks = todo.subtasks.filter(
    (s: Subtask) => s.completed,
  ).length;
  const totalSubtasks = todo.subtasks.length;

  const dueDate = todo.dueDate
    ? new Date(Number(todo.dueDate) / 1_000_000)
    : null;
  const isOverdue = dueDate && dueDate < new Date() && !todo.completed;

  const timerSecs = todo.timerSeconds ? Number(todo.timerSeconds) : null;

  const ocidBase = `todo.item.${index}`;

  return (
    <div
      data-ocid={ocidBase}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group relative transition-all duration-200 rounded-xl border bg-slate-900/80 backdrop-blur-sm cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 scale-95" : pConfig.cardGlow
      } ${todo.completed ? "opacity-50 border-slate-700/30" : ""}`}
    >
      {/* Top accent line */}
      {!todo.completed && (
        <span
          className={`absolute top-0 left-4 right-4 h-px opacity-60 ${
            priorityKey === "high"
              ? "bg-red-500"
              : priorityKey === "medium"
                ? "bg-amber-500"
                : "bg-green-500"
          }`}
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 shrink-0 group-hover:text-slate-400 transition-colors" />

          <Checkbox
            data-ocid={`todo.checkbox.${index}`}
            checked={todo.completed}
            onCheckedChange={(checked) => onToggleComplete(todo.id, !!checked)}
            className="mt-0.5 border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={`font-medium text-sm leading-tight ${
                    todo.completed
                      ? "line-through text-slate-600"
                      : "text-slate-200"
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {todo.description}
                  </p>
                )}
              </div>

              {/* Right side: credit chip + actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!todo.completed && (
                  <span
                    data-ocid={`todo.credit.badge.${index}`}
                    className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                  >
                    +{creditReward} CR
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`todo.edit_button.${index}`}
                  className="h-7 w-7 text-slate-500 hover:text-cyan-400"
                  onClick={() => onEdit(todo)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`todo.delete_button.${index}`}
                  className="h-7 w-7 text-slate-600 hover:text-red-400"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0 ${pConfig.badgeClass}`}
              >
                {pConfig.label}
              </Badge>
              {todo.category && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Tag className="w-3 h-3" />
                  {todo.category}
                </span>
              )}
              {dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    isOverdue ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {isOverdue && <AlertTriangle className="w-3 h-3" />}
                  <Calendar className="w-3 h-3" />
                  {dueDate.toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Timer */}
            {timerSecs && timerSecs > 0 && (
              <div className="mt-2">
                <TimerDisplay todoId={todo.id} timerSeconds={timerSecs} />
              </div>
            )}

            {/* Subtasks */}
            {totalSubtasks > 0 && (
              <div className="mt-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono"
                  onClick={() => setSubtasksExpanded(!subtasksExpanded)}
                >
                  {subtasksExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span>
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>
                  <Progress
                    value={(completedSubtasks / totalSubtasks) * 100}
                    className="w-12 h-1 ml-1 [&>div]:bg-cyan-500"
                  />
                </button>
                {subtasksExpanded && (
                  <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-700/50">
                    {todo.subtasks.map((subtask: Subtask) => (
                      <div
                        key={subtask.id.toString()}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) =>
                            onToggleSubtask(todo.id, subtask.id, !!checked)
                          }
                          className="h-3.5 w-3.5 border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                        />
                        <span
                          className={`text-xs ${
                            subtask.completed
                              ? "line-through text-slate-600"
                              : "text-slate-300"
                          }`}
                        >
                          {subtask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
