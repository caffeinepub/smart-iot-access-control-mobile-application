import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Subtask, ToDo } from "../../backend";
import { Priority } from "../../backend";
import { useCreateTodo, useUpdateTodo } from "../../hooks/useQueries";

interface AddEditTaskModalProps {
  open: boolean;
  onClose: () => void;
  editingTodo?: ToDo | null;
}

interface SubtaskDraft {
  id: number;
  text: string;
  completed: boolean;
}

export default function AddEditTaskModal({
  open,
  onClose,
  editingTodo,
}: AddEditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timerMinutes, setTimerMinutes] = useState("");
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const isEditing = !!editingTodo;

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      const pKey = getPriorityKey(editingTodo.priority);
      setPriority(
        pKey === "high"
          ? Priority.high
          : pKey === "low"
            ? Priority.low
            : Priority.medium,
      );
      setCategory(editingTodo.category);
      if (editingTodo.dueDate) {
        const d = new Date(Number(editingTodo.dueDate) / 1_000_000);
        setDueDate(d.toISOString().split("T")[0]);
      } else {
        setDueDate("");
      }
      if (editingTodo.timerSeconds) {
        setTimerMinutes(
          String(Math.round(Number(editingTodo.timerSeconds) / 60)),
        );
      } else {
        setTimerMinutes("");
      }
      setSubtasks(
        editingTodo.subtasks.map((s: Subtask) => ({
          id: Number(s.id),
          text: s.text,
          completed: s.completed,
        })),
      );
    } else {
      setTitle("");
      setDescription("");
      setPriority(Priority.medium);
      setCategory("");
      setDueDate("");
      setTimerMinutes("");
      setSubtasks([]);
    }
    setNewSubtask("");
  }, [editingTodo]);

  function getPriorityKey(p: ToDo["priority"]): "high" | "medium" | "low" {
    if (typeof p === "object") {
      if ("high" in p) return "high";
      if ("medium" in p) return "medium";
      return "low";
    }
    return (p as string).toLowerCase() as "high" | "medium" | "low";
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: Date.now(), text: newSubtask.trim(), completed: false },
    ]);
    setNewSubtask("");
  };

  const removeSubtask = (id: number) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const dueDateBigInt = dueDate
      ? BigInt(new Date(dueDate).getTime()) * 1_000_000n
      : null;

    const timerSecsBigInt = timerMinutes
      ? BigInt(Number.parseInt(timerMinutes) * 60)
      : null;

    const subtaskPayload: Subtask[] = subtasks.map((s, i) => ({
      id: BigInt(i),
      text: s.text,
      completed: s.completed,
    }));

    try {
      if (isEditing && editingTodo) {
        await updateTodo.mutateAsync({
          id: editingTodo.id,
          title: title.trim(),
          description: description.trim(),
          priority,
          category: category.trim(),
          dueDate: dueDateBigInt,
          subtasks: subtaskPayload,
          timerSeconds: timerSecsBigInt,
        });
        toast.success("Task updated!");
      } else {
        await createTodo.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          priority,
          category: category.trim(),
          dueDate: dueDateBigInt,
          subtasks: subtaskPayload,
          timerSeconds: timerSecsBigInt,
        });
        toast.success("Task created!");
      }
      onClose();
    } catch (_err) {
      toast.error("Failed to save task");
    }
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.high}>🔴 High</SelectItem>
                  <SelectItem value={Priority.medium}>🟡 Medium</SelectItem>
                  <SelectItem value={Priority.low}>🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work, Personal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timer">Timer (minutes)</Label>
              <Input
                id="timer"
                type="number"
                min="1"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addSubtask}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-muted/30 rounded px-2 py-1"
                  >
                    <Checkbox
                      checked={s.completed}
                      onCheckedChange={(checked) =>
                        setSubtasks((prev) =>
                          prev.map((st) =>
                            st.id === s.id
                              ? { ...st, completed: !!checked }
                              : st,
                          ),
                        )
                      }
                    />
                    <span
                      className={`flex-1 text-sm ${s.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {s.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeSubtask(s.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
