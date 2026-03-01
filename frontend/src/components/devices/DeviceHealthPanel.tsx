import { Thermometer, MemoryStick, Activity, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { DeviceHealthMetrics } from '../../hooks/useDeviceHealth';

interface DeviceHealthPanelProps {
  metrics: DeviceHealthMetrics;
  deviceName: string;
}

function statusColor(status: DeviceHealthMetrics['status']) {
  switch (status) {
    case 'healthy': return 'text-success';
    case 'warning': return 'text-warning';
    case 'critical': return 'text-destructive';
  }
}

function statusBadgeClass(status: DeviceHealthMetrics['status']) {
  switch (status) {
    case 'healthy': return 'bg-success/20 text-success border-success/30';
    case 'warning': return 'bg-warning/20 text-warning border-warning/30';
    case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
  }
}

function progressColor(value: number, thresholds: [number, number]) {
  if (value >= thresholds[1]) return 'bg-destructive';
  if (value >= thresholds[0]) return 'bg-warning';
  return 'bg-success';
}

export default function DeviceHealthPanel({ metrics, deviceName }: DeviceHealthPanelProps) {
  return (
    <Card className="border-accent/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Health: {deviceName}
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${statusBadgeClass(metrics.status)}`}>
            {metrics.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" /> Uptime
            </span>
            <span className={`font-mono font-semibold ${statusColor(metrics.status)}`}>{metrics.uptime}%</span>
          </div>
          <Progress value={metrics.uptime} className="h-1.5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Thermometer className="w-3 h-3" /> Temperature
            </span>
            <span className={`font-mono font-semibold ${metrics.temperature > 55 ? 'text-destructive' : metrics.temperature > 45 ? 'text-warning' : 'text-success'}`}>
              {metrics.temperature}°C
            </span>
          </div>
          <div className="w-full bg-muted/40 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${progressColor(metrics.temperature, [45, 55])}`}
              style={{ width: `${Math.min(100, (metrics.temperature / 80) * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MemoryStick className="w-3 h-3" /> Memory
            </span>
            <span className={`font-mono font-semibold ${metrics.memoryUsage > 80 ? 'text-destructive' : metrics.memoryUsage > 65 ? 'text-warning' : 'text-success'}`}>
              {metrics.memoryUsage}%
            </span>
          </div>
          <div className="w-full bg-muted/40 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${progressColor(metrics.memoryUsage, [65, 80])}`}
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" /> CPU Load
            </span>
            <span className={`font-mono font-semibold ${metrics.cpuLoad > 85 ? 'text-destructive' : metrics.cpuLoad > 70 ? 'text-warning' : 'text-success'}`}>
              {metrics.cpuLoad}%
            </span>
          </div>
          <div className="w-full bg-muted/40 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${progressColor(metrics.cpuLoad, [70, 85])}`}
              style={{ width: `${metrics.cpuLoad}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
