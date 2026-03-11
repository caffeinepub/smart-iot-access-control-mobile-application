import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Subtask, ToDo } from "../backend";
import AddEditTaskModal from "../components/todos/AddEditTaskModal";
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

export default function ToDoList() {
  const { identity } = useInternetIdentity();
  const { data: todos = [], isLoading } = useGetTodos();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<ToDo | null>(null);
  const [draggedId, setDraggedId] = useState<bigint | null>(null);
  const [localOrder, setLocalOrder] = useState<bigint[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(todos.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [todos]);

  // Ordered todos
  const orderedTodos = useMemo(() => {
    if (localOrder.length === 0) return todos;
    const map = new Map(todos.map((t) => [t.id.toString(), t]));
    const ordered: ToDo[] = [];
    for (const id of localOrder) {
      const t = map.get(id.toString());
      if (t) ordered.push(t);
    }
    // Add any new todos not in localOrder
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

  const handleToggleComplete = useCallback(
    async (id: bigint, completed: boolean) => {
      try {
        await updateTodo.mutateAsync({ id, completed });
        if (completed) toast.success("Task completed! 🎉");
      } catch {
        toast.error("Failed to update task");
      }
    },
    [updateTodo],
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

  // Drag and drop
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
        <p className="text-muted-foreground">
          Please log in to view your tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your to-do list
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTodo(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No tasks found</p>
              <p className="text-sm mt-1">
                {todos.length === 0
                  ? "Create your first task!"
                  : "Try adjusting your filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <TaskCard
                  key={todo.id.toString()}
                  todo={todo}
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
        <div className="lg:col-span-1">
          <GamificationPanel />
        </div>
      </div>

      <AddEditTaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTodo(null);
        }}
        editingTodo={editingTodo}
      />
    </div>
  );
}
