import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  CheckSquare, Plus, Trash2, Pencil, ClipboardList,
  Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useQueries';
import type { ToDo } from '@/backend';

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  isToggling,
  isDeleting,
}: {
  todo: ToDo;
  onToggle: (todo: ToDo) => void;
  onDelete: (id: bigint) => void;
  onEdit: (todo: ToDo) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const createdAt = new Date(Number(todo.createdAt) / 1_000_000);
  const dateStr = createdAt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
      todo.completed
        ? 'border-border/40 bg-muted/20 opacity-70'
        : 'border-border bg-card hover:border-primary/30'
    }`}>
      <div className="mt-0.5">
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo)}
            className="mt-0.5"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className={`text-xs mt-0.5 ${todo.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <Clock className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60">{dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(todo)}
          disabled={isDeleting}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<strong>{todo.title}</strong>"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(todo.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function EditTodoDialog({
  todo,
  open,
  onClose,
}: {
  todo: ToDo | null;
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const updateTodo = useUpdateTodo();

  React.useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
    }
  }, [todo]);

  const handleSave = async () => {
    if (!todo || !title.trim()) return;
    await updateTodo.mutateAsync({
      id: todo.id,
      newTitle: title.trim(),
      newDescription: description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Edit Task
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Description (optional)</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="bg-background border-border resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateTodo.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || updateTodo.isPending}
          >
            {updateTodo.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ToDoList() {
  const { data: todos, isLoading } = useGetTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState<ToDo | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const pendingTodos = (todos ?? []).filter(t => !t.completed);
  const completedTodos = (todos ?? []).filter(t => t.completed);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTodo.mutateAsync({ title: newTitle.trim(), description: newDescription.trim() });
    setNewTitle('');
    setNewDescription('');
    setShowForm(false);
  };

  const handleToggle = async (todo: ToDo) => {
    const key = todo.id.toString();
    setTogglingIds(prev => new Set(prev).add(key));
    try {
      await updateTodo.mutateAsync({ id: todo.id, completed: !todo.completed });
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const handleDelete = async (id: bigint) => {
    const key = id.toString();
    setDeletingIds(prev => new Set(prev).add(key));
    try {
      await deleteTodo.mutateAsync(id);
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            To-Do List
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {(todos ?? []).length} task{(todos ?? []).length !== 1 ? 's' : ''} total
            {completedTodos.length > 0 && ` · ${completedTodos.length} completed`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(v => !v)}
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="bg-card border-primary/30 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-title">Task Title <span className="text-destructive">*</span></Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="bg-background border-border"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-desc">Description (optional)</Label>
              <Textarea
                id="new-desc"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Add more details..."
                rows={2}
                className="bg-background border-border resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || createTodo.isPending}
                size="sm"
              >
                {createTodo.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Task
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowForm(false); setNewTitle(''); setNewDescription(''); }}
                disabled={createTodo.isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Pending Tasks */}
      {!isLoading && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Pending
              <Badge variant="secondary" className="ml-auto text-xs">
                {pendingTodos.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTodos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending tasks. Great job!</p>
              </div>
            ) : (
              pendingTodos.map(todo => (
                <TodoItem
                  key={todo.id.toString()}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={t => setEditTodo(t)}
                  isToggling={togglingIds.has(todo.id.toString())}
                  isDeleting={deletingIds.has(todo.id.toString())}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {!isLoading && completedTodos.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Completed
              <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                {completedTodos.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTodos.map(todo => (
              <TodoItem
                key={todo.id.toString()}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={t => setEditTodo(t)}
                isToggling={togglingIds.has(todo.id.toString())}
                isDeleting={deletingIds.has(todo.id.toString())}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (todos ?? []).length === 0 && !showForm && (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Click "New Task" to get started</p>
        </div>
      )}

      {/* Edit Dialog */}
      <EditTodoDialog
        todo={editTodo}
        open={editTodo !== null}
        onClose={() => setEditTodo(null)}
      />
    </div>
  );
}
