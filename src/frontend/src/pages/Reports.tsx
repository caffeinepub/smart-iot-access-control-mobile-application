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
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

  // Pie data
  const pieData = [
    { name: "Completed", value: totalSuccess },
    { name: "Failed", value: totalFailed },
  ];

  // Bar chart data — one entry per row
  const barData = rows.map((r) => ({
    period: r.period ?? "—",
    Completed: r.successCount,
    Failed: r.failureCount,
  }));

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
          <Button onClick={handleExportCsv} variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" className="gap-2">
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
          className={`text-center ${successRate >= 70 ? "border-green-500/30" : "border-red-500/30"}`}
        >
          <CardContent className="pt-4 pb-4">
            {successRate >= 70 ? (
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
            )}
            <p
              className={`text-2xl font-bold font-mono ${successRate >= 70 ? "text-green-400" : "text-red-400"}`}
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
                    Completed vs Failed —{" "}
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
