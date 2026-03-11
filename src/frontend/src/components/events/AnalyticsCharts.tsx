import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
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
import type { AccessEvent } from "../../types/accessEvent";

interface AnalyticsChartsProps {
  events: AccessEvent[];
}

export default function AnalyticsCharts({ events }: AnalyticsChartsProps) {
  const successRate = useMemo(() => {
    const total = events.length;
    const successful = events.filter((e) => e.success).length;
    const failed = total - successful;
    return [
      { name: "Success", value: successful, color: "oklch(0.55 0.18 162)" },
      { name: "Failed", value: failed, color: "oklch(0.58 0.22 25)" },
    ];
  }, [events]);

  const methodFrequency = useMemo(() => {
    const methodCounts: Record<string, number> = {};
    for (const event of events) {
      methodCounts[event.method] = (methodCounts[event.method] || 0) + 1;
    }
    return Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
    }));
  }, [events]);

  const hourlyActivity = useMemo(() => {
    const hourlyCounts: Record<number, number> = {};
    for (const event of events) {
      const date = new Date(Number(event.timestamp) / 1_000_000);
      const hour = date.getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourlyCounts[i] || 0,
    }));
  }, [events]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle>Success vs Failure Rate</CardTitle>
          <CardDescription>Overall access attempt outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={successRate}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {successRate.map((entry, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable derived list
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle>Access Method Frequency</CardTitle>
          <CardDescription>
            Distribution by authentication method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={methodFrequency}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.5 0 0 / 15%)"
              />
              <XAxis dataKey="method" stroke="oklch(0.52 0.02 250)" />
              <YAxis stroke="oklch(0.52 0.02 250)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.018 240)",
                  border: "1px solid oklch(0.93 0.01 200 / 12%)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="oklch(0.72 0.18 195)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-accent/20 lg:col-span-2">
        <CardHeader>
          <CardTitle>Hourly Activity Pattern</CardTitle>
          <CardDescription>Access events by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyActivity}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.5 0 0 / 15%)"
              />
              <XAxis dataKey="hour" stroke="oklch(0.52 0.02 250)" />
              <YAxis stroke="oklch(0.52 0.02 250)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.018 240)",
                  border: "1px solid oklch(0.93 0.01 200 / 12%)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="oklch(0.65 0.2 162)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
