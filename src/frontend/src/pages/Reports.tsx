import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReportTable from "../components/reports/ReportTable";
import { useGetAccessEvents } from "../hooks/useQueries";
import { exportReportToCsv } from "../utils/csvExport";
import { groupEventsByMonth, groupEventsByWeek } from "../utils/reportUtils";

const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid rgba(0,212,255,0.2)",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
};

// Generate mock 14-day trend data
function generateTrendData(): { date: string; rate: number }[] {
  const data: { date: string; rate: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });
    const rate = 60 + Math.round(Math.sin(i * 0.7) * 15 + Math.random() * 10);
    data.push({ date: label, rate: Math.min(98, Math.max(55, rate)) });
  }
  return data;
}

// Mock heatmap data: 7 days x 24 hours
function generateHeatmapData() {
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
      const isWeekday = day < 5;
      return Math.round(
        (isPeak ? 5 : 1) * (isWeekday ? 3 : 1) + Math.random() * 4,
      );
    }),
  );
}

const MOCK_USERS = [
  { name: "Alex Chen", count: 124 },
  { name: "Priya Nair", count: 87 },
  { name: "Jordan Lee", count: 63 },
  { name: "Sam Rivera", count: 45 },
  { name: "Morgan Kim", count: 22 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Reports() {
  const { data: events = [], isLoading } = useGetAccessEvents();
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  const rows = useMemo(() => {
    return view === "weekly"
      ? groupEventsByWeek(events)
      : groupEventsByMonth(events);
  }, [events, view]);

  const handleExportPdf = () => window.print();
  const handleExportCsv = () =>
    exportReportToCsv(rows, view === "weekly" ? "Week" : "Month");

  const totalSuccess = rows.reduce((s, r) => s + r.successCount, 0);
  const totalFailed = rows.reduce((s, r) => s + r.failureCount, 0);
  const totalEvents = rows.reduce((s, r) => s + r.total, 0);
  const successRate =
    totalEvents > 0 ? Math.round((totalSuccess / totalEvents) * 100) : 0;

  const pieData = [
    { name: "Completed", value: totalSuccess },
    { name: "Failed", value: totalFailed },
  ];

  const barData = rows.map((r) => ({
    period: r.period ?? "—",
    Completed: r.successCount,
    Failed: r.failureCount,
  }));

  const trendData = useMemo(() => generateTrendData(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const maxHeat = useMemo(() => Math.max(...heatmapData.flat()), [heatmapData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            Access Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics and grouped access event summaries
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <Button
            data-ocid="reports.secondary_button"
            onClick={handleExportCsv}
            variant="outline"
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            data-ocid="reports.primary_button"
            onClick={handleExportPdf}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <Card className="border-accent/20 text-center">
          <CardContent className="pt-4 pb-4">
            <FileText className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{totalEvents}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 text-center">
          <CardContent className="pt-4 pb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono text-green-400">
              {totalSuccess}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 text-center">
          <CardContent className="pt-4 pb-4">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono text-red-400">
              {totalFailed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Failed</p>
          </CardContent>
        </Card>
        <Card
          className={`text-center ${
            successRate >= 70 ? "border-green-500/30" : "border-red-500/30"
          }`}
        >
          <CardContent className="pt-4 pb-4">
            {successRate >= 70 ? (
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
            )}
            <p
              className={`text-2xl font-bold font-mono ${
                successRate >= 70 ? "text-green-400" : "text-red-400"
              }`}
            >
              {successRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print"
        data-ocid="reports.section"
      >
        {/* Donut chart */}
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Outcome Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Completed vs Failed ratio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalEvents === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Stacked bar chart */}
        <div className="lg:col-span-2">
          <Card className="border-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    {view === "weekly" ? (
                      <CalendarDays className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    Completed vs Failed &mdash;{" "}
                    {view === "weekly" ? "Weekly" : "Monthly"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Stacked bar per period
                  </CardDescription>
                </div>
                <div className="flex gap-1 no-print">
                  <Button
                    size="sm"
                    variant={view === "weekly" ? "default" : "outline"}
                    onClick={() => setView("weekly")}
                    className={
                      view === "weekly"
                        ? "bg-accent text-accent-foreground h-7 text-xs"
                        : "h-7 text-xs"
                    }
                    data-ocid="reports.tab"
                  >
                    Weekly
                  </Button>
                  <Button
                    size="sm"
                    variant={view === "monthly" ? "default" : "outline"}
                    onClick={() => setView("monthly")}
                    className={
                      view === "monthly"
                        ? "bg-accent text-accent-foreground h-7 text-xs"
                        : "h-7 text-xs"
                    }
                    data-ocid="reports.tab"
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  No data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.1)"
                    />
                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                        fontFamily: "monospace",
                      }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Completed" stackId="a" fill="#22c55e" />
                    <Bar
                      dataKey="Failed"
                      stackId="a"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Success Rate Trend */}
      <Card className="border-accent/20 no-print">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Task Success Rate Trend (Last 14 Days)
          </CardTitle>
          <CardDescription className="text-xs">
            Daily success rate percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.1)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
                interval={2}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#64748b" }}
                unit="%"
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [`${v}%`, "Success Rate"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: "#06b6d4", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Access Heatmap + User Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Heatmap */}
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Access Log Heatmap
            </CardTitle>
            <CardDescription className="text-xs">
              Access frequency by day and hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex gap-1 mb-1">
                <div className="w-7 shrink-0" />
                {[
                  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                  18, 19, 20, 21, 22, 23,
                ].map((h) => (
                  <div
                    key={`hour-label-${h}`}
                    className="text-[8px] text-muted-foreground font-mono text-center"
                    style={{ width: 14, flexShrink: 0 }}
                  >
                    {h % 4 === 0 ? h : ""}
                  </div>
                ))}
              </div>
              {heatmapData.map((dayRow, d) => (
                <div key={DAYS[d]} className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] text-muted-foreground font-mono w-7 shrink-0 text-right pr-1">
                    {DAYS[d]}
                  </span>
                  {dayRow.map((val, h) => {
                    const intensity = maxHeat > 0 ? val / maxHeat : 0;
                    return (
                      <div
                        key={`${DAYS[d]}-${h}`}
                        data-ocid={
                          d === 0 && h === 0 ? "heatmap.chart_point" : undefined
                        }
                        title={`${DAYS[d]} ${h}:00 — ${val} accesses`}
                        className="rounded-sm cursor-default"
                        style={{
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                          backgroundColor: `rgba(6,182,212,${(intensity * 0.85).toFixed(2)})`,
                          border: "1px solid rgba(6,182,212,0.1)",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] text-muted-foreground font-mono">
                Low
              </span>
              <div className="flex gap-0.5">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                  <div
                    key={o}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `rgba(6,182,212,${o})` }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">
                High
              </span>
            </div>
          </CardContent>
        </Card>

        {/* User Access Frequency */}
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Access Frequency
            </CardTitle>
            <CardDescription className="text-xs">
              Access count per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={MOCK_USERS}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 60, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.1)"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{
                    fontSize: 10,
                    fill: "#94a3b8",
                    fontFamily: "monospace",
                  }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {MOCK_USERS.map((user, i) => {
                    const colors = [
                      "#06b6d4",
                      "#22c55e",
                      "#a855f7",
                      "#f97316",
                      "#3b82f6",
                    ];
                    return (
                      <Cell key={user.name} fill={colors[i % colors.length]} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {view === "weekly" ? (
                  <CalendarDays className="w-5 h-5 text-accent" />
                ) : (
                  <Calendar className="w-5 h-5 text-accent" />
                )}
                {view === "weekly" ? "Weekly" : "Monthly"} Report
              </CardTitle>
              <CardDescription>
                Access events grouped by {view === "weekly" ? "week" : "month"}{" "}
                and user
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReportTable
            rows={rows}
            periodLabel={view === "weekly" ? "Week" : "Month"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
