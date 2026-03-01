import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, RefreshCw, Download, CheckCircle } from 'lucide-react';
import { useGetAllDevices, useUpdateDeviceFirmware } from '../../hooks/useQueries';
import { toast } from 'sonner';

function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  if (parts.length === 3) {
    parts[2]++;
    return parts.join('.');
  }
  return '1.1.0';
}

interface DeviceFirmwareRowProps {
  deviceId: string;
  deviceName: string;
  currentVersion: string;
}

function DeviceFirmwareRow({ deviceId, deviceName, currentVersion }: DeviceFirmwareRowProps) {
  const [checking, setChecking] = useState(false);
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const updateFirmware = useUpdateDeviceFirmware();
  const { data: devices = [] } = useGetAllDevices();

  const handleCheck = async () => {
    setChecking(true);
    setAvailableVersion(null);
    await new Promise((r) => setTimeout(r, 2000));
    const newer = incrementVersion(currentVersion);
    setAvailableVersion(newer);
    toast.info(`Update available: v${newer} for ${deviceName}`);
    setChecking(false);
  };

  const handleApply = async () => {
    if (!availableVersion) return;
    setUpdating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 150);

    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(interval);
    setProgress(100);

    // Find the device's current status and update firmware version
    const deviceEntry = devices.find(([id]) => id === deviceId);
    if (deviceEntry) {
      const [, deviceInfo] = deviceEntry;
      await updateFirmware.mutateAsync({
        deviceId,
        newStatus: { ...deviceInfo.status, firmwareVersion: availableVersion },
      });
    }

    setAvailableVersion(null);
    setUpdating(false);
    setProgress(0);
  };

  return (
    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{deviceName}</p>
          <p className="text-xs text-muted-foreground font-mono">{deviceId.slice(0, 12)}...</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            v{currentVersion}
          </Badge>
          {availableVersion && (
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
              v{availableVersion} available
            </Badge>
          )}
        </div>
      </div>

      {updating && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Installing firmware...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-2">
        {!availableVersion && !updating && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheck}
            disabled={checking}
            className="text-xs gap-1"
          >
            {checking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {checking ? 'Checking...' : 'Check for Updates'}
          </Button>
        )}
        {availableVersion && !updating && (
          <>
            <Button
              size="sm"
              onClick={handleApply}
              className="text-xs gap-1 bg-accent hover:bg-accent/90"
            >
              <Download className="w-3 h-3" />
              Apply v{availableVersion}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAvailableVersion(null)}
              className="text-xs"
            >
              Dismiss
            </Button>
          </>
        )}
        {updating && (
          <Button size="sm" disabled className="text-xs gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Updating...
          </Button>
        )}
        {progress === 100 && !updating && (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle className="w-3 h-3" /> Up to date
          </span>
        )}
      </div>
    </div>
  );
}

export default function FirmwareUpdatePanel() {
  const { data: devices = [] } = useGetAllDevices();

  return (
    <Card className="border-accent/20 shadow-lg shadow-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent" />
          Firmware Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No devices registered
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map(([deviceId, deviceInfo]) => (
              <DeviceFirmwareRow
                key={deviceId}
                deviceId={deviceId}
                deviceName={deviceInfo.deviceName}
                currentVersion={deviceInfo.status.firmwareVersion}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
