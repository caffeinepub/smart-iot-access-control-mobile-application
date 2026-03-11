import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Lock, LockOpen, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import type { DeviceInfo } from "../../backend";
import { useToggleDeviceLock } from "../../hooks/useQueries";

interface DeviceCardProps {
  device: DeviceInfo;
  isAdmin: boolean;
}

export default function DeviceCard({ device, isAdmin }: DeviceCardProps) {
  const toggleLock = useToggleDeviceLock();

  const handleToggle = () => {
    toggleLock.mutate(device.deviceId, {
      onSuccess: () =>
        toast.success(
          `${device.deviceName} ${device.status.isLocked ? "unlocked" : "locked"}`,
        ),
      onError: (e) => toast.error(`Failed: ${e.message}`),
    });
  };

  const isOnline = device.isConnected;
  const isLocked = device.status.isLocked;

  return (
    <Card
      className={`border-accent/20 transition-all duration-300 ${isLocked ? "shadow-destructive/10" : "shadow-success/10"} shadow-lg`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            {device.deviceName}
          </CardTitle>
          <Badge
            variant={isOnline ? "default" : "outline"}
            className={`text-xs ${isOnline ? "bg-success/20 text-success border-success/30" : ""}`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {device.deviceId}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Lock className="w-5 h-5 text-destructive" />
            ) : (
              <LockOpen className="w-5 h-5 text-success" />
            )}
            <span
              className={`text-sm font-semibold ${isLocked ? "text-destructive" : "text-success"}`}
            >
              {isLocked ? "Locked" : "Unlocked"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            WiFi: {Number(device.status.wifiSignalStrength)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            Battery:{" "}
            <span className="text-foreground font-mono">
              {Number(device.status.batteryLevel)}%
            </span>
          </div>
          <div>
            FW:{" "}
            <span className="text-foreground font-mono">
              {device.status.firmwareVersion}
            </span>
          </div>
        </div>

        {isAdmin && (
          <Button
            size="sm"
            onClick={handleToggle}
            disabled={toggleLock.isPending}
            className={`w-full gap-2 ${isLocked ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-destructive/80 hover:bg-destructive text-destructive-foreground"}`}
          >
            {isLocked ? (
              <LockOpen className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {toggleLock.isPending
              ? "Processing..."
              : isLocked
                ? "Unlock"
                : "Lock"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
