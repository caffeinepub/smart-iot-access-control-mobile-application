import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDeviceHealth } from "../../hooks/useDeviceHealth";

interface TelemetryPoint {
  time: string;
  temperature: number;
  cpu: number;
  memory: number;
}

export default function TelemetryChartPanel() {
  const { history, devices } = useDeviceHealth();

  const chartData = useMemo((): TelemetryPoint[] => {
    if (devices.length === 0) return [];

    // Aggregate across all devices by timestamp index
    const maxPoints = 10;
    const points: TelemetryPoint[] = [];

    for (let i = 0; i < maxPoints; i++) {
      let tempSum = 0;
      let cpuSum = 0;
      let memSum = 0;
      let count = 0;

      for (const [deviceId] of devices) {
        const deviceHistory = history.get(deviceId) ?? [];
        if (deviceHistory[i]) {
          tempSum += deviceHistory[i].temperature;
          cpuSum += deviceHistory[i].cpuUsage;
          memSum += deviceHistory[i].memoryUsage;
          count++;
        }
      }

      if (count > 0) {
        points.push({
          time: `T-${maxPoints - 1 - i}`,
          temperature: Math.round(tempSum / count),
          cpu: Math.round(cpuSum / count),
          memory: Math.round(memSum / count),
        });
      }
    }

    return points;
  }, [history, devices]);

  return (
    <Card className="border-accent/20 shadow-lg shadow-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Device Telemetry
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            Updates every 10s
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            No devices registered. Add a device to see telemetry.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(var(--popover))",
                  border: "1px solid oklch(var(--border))",
                  borderRadius: "8px",
                  color: "oklch(var(--foreground))",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => {
                  const unit = name === "temperature" ? "°C" : "%";
                  return [
                    `${value}${unit}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="oklch(var(--destructive))"
                strokeWidth={2}
                dot={false}
                name="Temperature"
              />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="oklch(var(--accent))"
                strokeWidth={2}
                dot={false}
                name="CPU"
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="oklch(var(--warning))"
                strokeWidth={2}
                dot={false}
                name="Memory"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
