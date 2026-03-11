import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  MemoryStick,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import { useMemo } from "react";
import { useDeviceHealth } from "../../hooks/useDeviceHealth";
import {
  calculateAverageMemoryUsage,
  calculateAverageTemperature,
  calculateHealthScore,
  countCriticalDevices,
  countWarningDevices,
} from "../../utils/healthMetricsUtils";

function HealthGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-success"
      : score >= 60
        ? "text-warning"
        : "text-destructive";
  const bgColor =
    score >= 80
      ? "bg-success/10 border-success/30"
      : score >= 60
        ? "bg-warning/10 border-warning/30"
        : "bg-destructive/10 border-destructive/30";
  const label = score >= 80 ? "Healthy" : score >= 60 ? "Warning" : "Critical";

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${bgColor}`}
    >
      <span className={`text-5xl font-bold font-mono ${color}`}>{score}</span>
      <span className={`text-sm font-semibold mt-1 ${color}`}>{label}</span>
      <span className="text-xs text-muted-foreground mt-0.5">Health Score</span>
    </div>
  );
}

export default function SystemHealthOverview() {
  const { currentMetrics } = useDeviceHealth();

  const stats = useMemo(
    () => ({
      avgTemp: calculateAverageTemperature(currentMetrics),
      avgMem: calculateAverageMemoryUsage(currentMetrics),
      warnings: countWarningDevices(currentMetrics),
      criticals: countCriticalDevices(currentMetrics),
      score: calculateHealthScore(currentMetrics),
    }),
    [currentMetrics],
  );

  return (
    <Card className="border-accent/20 shadow-lg shadow-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          System Health Overview
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            Refreshes every 30s
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentMetrics.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No devices registered
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HealthGauge score={stats.score} />

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <Thermometer className="w-4 h-4 text-destructive shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Temp</p>
                  <p className="text-lg font-bold font-mono">
                    {stats.avgTemp}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <MemoryStick className="w-4 h-4 text-warning shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Memory</p>
                  <p className="text-lg font-bold font-mono">{stats.avgMem}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Warning</p>
                  <p className="text-lg font-bold font-mono text-warning">
                    {stats.warnings}
                  </p>
                  <p className="text-xs text-muted-foreground">devices</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <p className="text-lg font-bold font-mono text-destructive">
                    {stats.criticals}
                  </p>
                  <p className="text-xs text-muted-foreground">devices</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Device Breakdown
              </p>
              {currentMetrics.map((d) => (
                <div
                  key={d.deviceId}
                  className="flex items-center justify-between text-xs mb-1"
                >
                  <span className="truncate text-muted-foreground max-w-[80px]">
                    {d.deviceId.slice(0, 8)}
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      d.temperature > 85 || d.memoryUsage > 95
                        ? "text-destructive"
                        : d.temperature > 70 || d.memoryUsage > 80
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {d.temperature}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
