import { Button } from "@/components/ui/button";
import { Loader2, Plus, Terminal } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Subtask, ToDo } from "../backend";
import AddEditTaskModal from "../components/todos/AddEditTaskModal";
import CreditWallet from "../components/todos/CreditWallet";
import GamificationPanel from "../components/todos/GamificationPanel";
import TaskCard from "../components/todos/TaskCard";
import TaskFilters from "../components/todos/TaskFilters";
import TaskStatsPanel from "../components/todos/TaskStatsPanel";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteTodo, useGetTodos, useUpdateTodo } from "../hooks/useQueries";

function getPriorityKey(priority: ToDo["priority"]): "high" | "medium" | "low" {
  if (typeof priority === "object") {
    if ("high" in priority) return "high";
    if ("medium" in priority) return "medium";
    return "low";
  }
  return (priority as string).toLowerCase() as "high" | "medium" | "low";
}

const PRIORITY_CREDITS: Record<string, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

interface FloatingCredit {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export default function ToDoList() {
  const { identity } = useInternetIdentity();
  const { data: todos = [], isLoading } = useGetTodos();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<ToDo | null>(null);
  const [draggedId, setDraggedId] = useState<bigint | null>(null);
  const [localOrder, setLocalOrder] = useState<bigint[]>([]);
  const [floatingCredits, setFloatingCredits] = useState<FloatingCredit[]>([]);
  const floatCounter = useRef(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(todos.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [todos]);

  const orderedTodos = useMemo(() => {
    if (localOrder.length === 0) return todos;
    const map = new Map(todos.map((t) => [t.id.toString(), t]));
    const ordered: ToDo[] = [];
    for (const id of localOrder) {
      const t = map.get(id.toString());
      if (t) ordered.push(t);
    }
    for (const t of todos) {
      if (!localOrder.find((id) => id.toString() === t.id.toString())) {
        ordered.push(t);
      }
    }
    return ordered;
  }, [todos, localOrder]);

  const filteredTodos = useMemo(() => {
    return orderedTodos.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchPriority =
        filterPriority === "all" ||
        getPriorityKey(t.priority) === filterPriority;
      const matchCategory =
        filterCategory === "all" || t.category === filterCategory;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && t.completed) ||
        (filterStatus === "pending" && !t.completed);
      return matchSearch && matchPriority && matchCategory && matchStatus;
    });
  }, [orderedTodos, search, filterPriority, filterCategory, filterStatus]);

  const spawnFloatingCredit = useCallback(
    (todoId: bigint, x: number, y: number) => {
      const todo = todos.find((t) => t.id.toString() === todoId.toString());
      if (!todo) return;
      const amount = PRIORITY_CREDITS[getPriorityKey(todo.priority)] ?? 10;
      const id = ++floatCounter.current;
      setFloatingCredits((prev) => [...prev, { id, amount, x, y }]);
      setTimeout(() => {
        setFloatingCredits((prev) => prev.filter((f) => f.id !== id));
      }, 1000);
    },
    [todos],
  );

  const handleToggleComplete = useCallback(
    async (id: bigint, completed: boolean) => {
      try {
        await updateTodo.mutateAsync({ id, completed });
        if (completed) {
          const todo = todos.find((t) => t.id.toString() === id.toString());
          const amount = todo
            ? (PRIORITY_CREDITS[getPriorityKey(todo.priority)] ?? 10)
            : 10;
          const x = window.innerWidth / 2;
          const y = 200;
          spawnFloatingCredit(id, x, y);
          toast.success(`+${amount} CR earned! Task complete 🎯`);
        }
      } catch {
        toast.error("Failed to update task");
      }
    },
    [updateTodo, todos, spawnFloatingCredit],
  );

  const handleToggleSubtask = useCallback(
    async (todoId: bigint, subtaskId: bigint, completed: boolean) => {
      const todo = todos.find((t) => t.id.toString() === todoId.toString());
      if (!todo) return;
      const updatedSubtasks: Subtask[] = todo.subtasks.map((s: Subtask) =>
        s.id.toString() === subtaskId.toString() ? { ...s, completed } : s,
      );
      try {
        await updateTodo.mutateAsync({ id: todoId, subtasks: updatedSubtasks });
      } catch {
        toast.error("Failed to update subtask");
      }
    },
    [todos, updateTodo],
  );

  const handleDelete = useCallback(
    async (id: bigint) => {
      if (!confirm("Delete this task?")) return;
      try {
        await deleteTodo.mutateAsync(id);
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
      }
    },
    [deleteTodo],
  );

  const handleEdit = useCallback((todo: ToDo) => {
    setEditingTodo(todo);
    setModalOpen(true);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: bigint) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: bigint) => {
      e.preventDefault();
      if (!draggedId || draggedId.toString() === targetId.toString()) return;
      const currentOrder =
        localOrder.length > 0 ? localOrder : todos.map((t) => t.id);
      const fromIdx = currentOrder.findIndex(
        (id) => id.toString() === draggedId.toString(),
      );
      const toIdx = currentOrder.findIndex(
        (id) => id.toString() === targetId.toString(),
      );
      if (fromIdx === -1 || toIdx === -1) return;
      const newOrder = [...currentOrder];
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, moved);
      setLocalOrder(newOrder);
      setDraggedId(null);
    },
    [draggedId, localOrder, todos],
  );

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Terminal className="w-10 h-10 text-cyan-500/50 mx-auto" />
          <p className="font-mono text-cyan-500/70 uppercase tracking-widest text-sm">
            Authentication Required
          </p>
          <p className="text-slate-500 text-xs">
            Please log in to access the Task Command Center.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="relative container mx-auto px-4 py-6 max-w-6xl">
      {/* Floating credit animations */}
      {floatingCredits.map((fc) => (
        <div
          key={fc.id}
          className="fixed pointer-events-none z-50 font-mono font-bold text-cyan-300 text-sm animate-credit-flyup"
          style={{ left: fc.x, top: fc.y }}
        >
          +{fc.amount} CR
        </div>
      ))}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,212,255,0.7)]" />
            <h1 className="text-2xl font-mono font-bold text-cyan-300 uppercase tracking-widest drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]">
              TASK COMMAND CENTER
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest pl-3.5">
            {pendingCount} mission{pendingCount !== 1 ? "s" : ""} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreditWallet />
          <Button
            onClick={() => {
              setEditingTodo(null);
              setModalOpen(true);
            }}
            className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-mono uppercase tracking-wider text-xs"
            data-ocid="todo.primary_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Neon separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-6" />

      {/* Stats */}
      <TaskStatsPanel todos={todos} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main task list */}
        <div className="lg:col-span-3 space-y-3">
          <TaskFilters
            search={search}
            onSearchChange={setSearch}
            priority={filterPriority}
            onPriorityChange={setFilterPriority}
            category={filterCategory}
            onCategoryChange={setFilterCategory}
            status={filterStatus}
            onStatusChange={setFilterStatus}
            categories={categories}
          />

          {isLoading ? (
            <div
              data-ocid="todo.loading_state"
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div
              data-ocid="todo.empty_state"
              className="text-center py-12 border border-cyan-500/10 rounded-xl bg-slate-900/40 backdrop-blur"
            >
              <Terminal className="w-8 h-8 text-cyan-500/30 mx-auto mb-3" />
              <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">
                {todos.length === 0 ? "No missions queued" : "No matches found"}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {todos.length === 0
                  ? "Initialize your first task to begin."
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTodos.map((todo, idx) => (
                <TaskCard
                  key={todo.id.toString()}
                  todo={todo}
                  index={idx + 1}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtask={handleToggleSubtask}
                  isDragging={draggedId?.toString() === todo.id.toString()}
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, todo.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GamificationPanel />
        </div>
      </div>

      <AddEditTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTodo={editingTodo}
      />
    </div>
  );
}
