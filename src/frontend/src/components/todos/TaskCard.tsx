import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
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

interface TaskCardProps {
  todo: ToDo;
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

const priorityConfig = {
  high: {
    label: "High",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  low: {
    label: "Low",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
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
      className={`flex items-center gap-2 text-sm font-mono ${isLow ? "text-red-400" : "text-muted-foreground"}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span className={isExpired ? "text-red-500 font-bold" : ""}>
        {isExpired ? "Expired" : formatTime(remaining)}
      </span>
      {!isExpired && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
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
            className="h-6 w-6"
            onClick={reset}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </>
      )}
      <div className="w-16">
        <Progress
          value={percentRemaining}
          className={`h-1 ${isLow ? "[&>div]:bg-red-500" : ""}`}
        />
      </div>
    </div>
  );
}

export default function TaskCard({
  todo,
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

  const completedSubtasks = todo.subtasks.filter(
    (s: Subtask) => s.completed,
  ).length;
  const totalSubtasks = todo.subtasks.length;

  const dueDate = todo.dueDate
    ? new Date(Number(todo.dueDate) / 1_000_000)
    : null;
  const isOverdue = dueDate && dueDate < new Date() && !todo.completed;

  const timerSecs = todo.timerSeconds ? Number(todo.timerSeconds) : null;

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`transition-all duration-200 cursor-grab active:cursor-grabbing border-border/50 bg-card/80 backdrop-blur-sm ${
        isDragging
          ? "opacity-50 scale-95"
          : "hover:border-primary/30 hover:shadow-md"
      } ${todo.completed ? "opacity-60" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={(checked) => onToggleComplete(todo.id, !!checked)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={`font-medium text-sm leading-tight ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {todo.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(todo)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
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
                className={`text-xs px-1.5 py-0 ${pConfig.className}`}
              >
                {pConfig.label}
              </Badge>
              {todo.category && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {todo.category}
                </span>
              )}
              {dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}
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
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                    className="w-12 h-1 ml-1"
                  />
                </button>
                {subtasksExpanded && (
                  <div className="mt-2 space-y-1.5 pl-2 border-l border-border/50">
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
                          className="h-3.5 w-3.5"
                        />
                        <span
                          className={`text-xs ${subtask.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
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
      </CardContent>
    </Card>
  );
}
