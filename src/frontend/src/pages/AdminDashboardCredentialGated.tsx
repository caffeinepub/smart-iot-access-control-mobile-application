import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { ToDo } from "../backend";
import TodoActivityLog from "../components/admin/TodoActivityLog";
import AdminLoginGate from "../components/auth/AdminLoginGate";
import {
  useDeleteTodo,
  useGetAdminDashboardData,
  useGetTodos,
} from "../hooks/useQueries";
import { exportTodosToCsv } from "../utils/todosCsvExport";

function getPriorityKey(priority: ToDo["priority"]): "high" | "medium" | "low" {
  if (typeof priority === "object") {
    if ("high" in priority) return "high";
    if ("medium" in priority) return "medium";
    return "low";
  }
  return (priority as string).toLowerCase() as "high" | "medium" | "low";
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

function AdminDashboardContent() {
  const { data: dashData, isLoading: dashLoading } = useGetAdminDashboardData();
  const { data: todos = [], isLoading: todosLoading } = useGetTodos();
  const deleteTodo = useDeleteTodo();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const weeklyData = (() => {
    const days: { day: string; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      const dayEnd = dayStart + 86_400_000;
      const count = todos.filter((t) => {
        if (!t.completed) return false;
        const created = Number(t.createdAt) / 1_000_000;
        return created >= dayStart && created < dayEnd;
      }).length;
      days.push({
        day: d.toLocaleDateString("en", { weekday: "short" }),
        completed: count,
      });
    }
    return days;
  })();

  const handleDeleteTodo = async (id: bigint) => {
    if (!confirm("Delete this task permanently?")) return;
    setDeletingId(id);
    try {
      await deleteTodo.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            System overview and management
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {dashLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : dashData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-card/70 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {Number(dashData.totalUsers)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {Number(dashData.activeUsers)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Failed (24h)</p>
                <p className="text-2xl font-bold text-red-500">
                  {Number(dashData.failedAccessLast24h)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">
                  {Number(dashData.activeSmartRulesCount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Weekly Completion Chart */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Task Completions — Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={weeklyData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar
                dataKey="completed"
                fill="oklch(var(--primary))"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Todos Table */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              All Tasks ({todos.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTodosToCsv(todos)}
              disabled={todos.length === 0}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todosLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks yet.
            </p>
          ) : (
            <div className="overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todos.map((todo) => {
                    const pKey = getPriorityKey(todo.priority);
                    const dueDate = todo.dueDate
                      ? new Date(
                          Number(todo.dueDate) / 1_000_000,
                        ).toLocaleDateString()
                      : "—";
                    return (
                      <TableRow key={todo.id.toString()}>
                        <TableCell className="text-xs font-medium max-w-32 truncate">
                          {todo.title}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {todo.owner.toString().slice(0, 10)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityColors[pKey]}`}
                          >
                            {pKey}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {todo.category || "—"}
                        </TableCell>
                        <TableCell className="text-xs">{dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              todo.completed
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            {todo.completed ? "Done" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTodo(todo.id)}
                            disabled={
                              deletingId?.toString() === todo.id.toString()
                            }
                          >
                            {deletingId?.toString() === todo.id.toString() ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TodoActivityLog todos={todos} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardCredentialGated() {
  return (
    <AdminLoginGate>
      <AdminDashboardContent />
    </AdminLoginGate>
  );
}
