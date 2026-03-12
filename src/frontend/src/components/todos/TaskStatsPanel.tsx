import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ToDo } from "../../backend";

const TOOLTIP_STYLE = {
  fontSize: 11,
  background: "#0f172a",
  border: "1px solid rgba(0,212,255,0.2)",
  borderRadius: "8px",
  color: "#94a3b8",
};

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
    const days: { day: string; completed: number; overdue: number }[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      const dayEnd = dayStart + 86_400_000;
      const completed = todos.filter((t) => {
        if (!t.completed) return false;
        const created = Number(t.createdAt) / 1_000_000;
        return created >= dayStart && created < dayEnd;
      }).length;
      const overdue = todos.filter((t) => {
        if (t.completed) return false;
        const due = t.dueDate ? Number(t.dueDate) / 1_000_000 : null;
        if (!due) return false;
        return due >= dayStart && due < dayEnd && due < now;
      }).length;
      days.push({
        day: d.toLocaleDateString("en", { weekday: "short" }),
        completed,
        overdue,
      });
    }
    return days;
  }, [todos]);

  const metricCards = [
    {
      label: "TOTAL",
      value: stats.total,
      icon: <ListTodo className="w-4 h-4" />,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      glow: "shadow-[0_0_8px_rgba(0,212,255,0.15)]",
    },
    {
      label: "DONE",
      value: stats.completed,
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
      glow: "shadow-[0_0_8px_rgba(34,197,94,0.15)]",
    },
    {
      label: "PROGRESS",
      value: null,
      icon: <Clock className="w-4 h-4" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      glow: "shadow-[0_0_8px_rgba(168,85,247,0.15)]",
      extra: (
        <div className="mt-1">
          <span className="font-mono font-bold text-xl text-purple-300">
            {stats.completionPct}%
          </span>
          <Progress
            value={stats.completionPct}
            className="h-1.5 mt-1 [&>div]:bg-purple-500"
          />
        </div>
      ),
    },
    {
      label: "OVERDUE",
      value: stats.overdue,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      glow: "shadow-[0_0_8px_rgba(239,68,68,0.15)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {metricCards.map((m) => (
        <div
          key={m.label}
          className={`rounded-xl border p-3 backdrop-blur-sm bg-slate-900/70 ${m.bg} ${m.glow} transition-shadow`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={m.color}>{m.icon}</span>
            <span
              className={`text-[9px] font-mono uppercase tracking-widest ${m.color}`}
            >
              {m.label}
            </span>
          </div>
          {m.extra ?? (
            <p
              className={`font-mono font-bold text-2xl ${m.color} drop-shadow-[0_0_6px_currentColor]`}
            >
              {m.value}
            </p>
          )}
        </div>
      ))}

      {/* Weekly completed vs overdue bar chart */}
      <div className="col-span-2 lg:col-span-4 rounded-xl border border-cyan-500/15 bg-slate-900/70 backdrop-blur-sm p-3">
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Task Radar — Last 7 Days (Completed vs Overdue)
        </p>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart
            data={weeklyData}
            margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#64748b" }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="completed" name="Completed" radius={[3, 3, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell key={entry.day || String(index)} fill="#22c55e" />
              ))}
            </Bar>
            <Bar dataKey="overdue" name="Overdue" radius={[3, 3, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell key={entry.day || String(index)} fill="#ef4444" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-1">
          <span className="flex items-center gap-1 text-[9px] font-mono text-green-400">
            <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />{" "}
            Completed
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-red-400">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />{" "}
            Overdue
          </span>
        </div>
      </div>
    </div>
  );
}
