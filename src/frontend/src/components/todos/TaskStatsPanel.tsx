import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ToDo } from "../../backend";

interface TaskStatsPanelProps {
  todos: ToDo[];
}

export default function TaskStatsPanel({ todos }: TaskStatsPanelProps) {
  const stats = useMemo(() => {
    const now = Date.now();
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const overdue = todos.filter((t) => {
      if (!t.dueDate || t.completed) return false;
      return Number(t.dueDate) / 1_000_000 < now;
    }).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, completionPct };
  }, [todos]);

  const weeklyData = useMemo(() => {
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
  }, [todos]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ListTodo className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-xl font-bold">{stats.completed}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
          <p className="text-xl font-bold mb-1">{stats.completionPct}%</p>
          <Progress value={stats.completionPct} className="h-1.5" />
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-xl font-bold text-red-500">{stats.overdue}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-4 bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Completions — Last 7 Days
          </p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart
              data={weeklyData}
              margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
            >
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
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
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
