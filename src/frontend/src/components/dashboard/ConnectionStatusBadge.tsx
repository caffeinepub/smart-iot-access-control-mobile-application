import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusBadgeProps {
  lastSync: bigint;
}

export default function ConnectionStatusBadge({
  lastSync,
}: ConnectionStatusBadgeProps) {
  const now = Date.now();
  const lastSyncMs = Number(lastSync) / 1_000_000;
  const timeDiff = now - lastSyncMs;
  const isConnected = timeDiff < 30000;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">ESP32 Status</span>
      <Badge
        variant={isConnected ? "default" : "destructive"}
        className="gap-1"
      >
        {isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        {isConnected ? "Connected" : "Offline"}
      </Badge>
    </div>
  );
}
