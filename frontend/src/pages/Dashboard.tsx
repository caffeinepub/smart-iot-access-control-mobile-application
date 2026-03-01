import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LockStateIndicator from '@/components/dashboard/LockStateIndicator';
import ConnectionStatusBadge from '@/components/dashboard/ConnectionStatusBadge';
import WiFiStrengthIndicator from '@/components/dashboard/WiFiStrengthIndicator';
import ControlButtons from '@/components/dashboard/ControlButtons';
import SystemHealthOverview from '@/components/dashboard/SystemHealthOverview';
import TelemetryChartPanel from '@/components/dashboard/TelemetryChartPanel';
import FirmwareUpdatePanel from '@/components/dashboard/FirmwareUpdatePanel';
import IntrusionAlertBanner from '@/components/alerts/IntrusionAlertBanner';
import EmergencyContactAlerts from '@/components/alerts/EmergencyContactAlerts';
import { Battery, Shield } from 'lucide-react';
import type { AccessEvent } from '@/types/accessEvent';

function useGetDefaultDeviceStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['defaultDeviceStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDefaultDeviceStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

function useGetAccessEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AccessEvent[]>({
    queryKey: ['accessEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const events = await actor.getAccessEvents();
      // Cast to AccessEvent[] — timestamps remain bigint as per the type definition
      return events as AccessEvent[];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: deviceStatus, isLoading } = useGetDefaultDeviceStatus();
  const { data: accessEvents } = useGetAccessEvents();
  const { data: role } = useGetCallerUserRole();
  const isAdmin = role === 'admin';

  const latestFailedEvent = React.useMemo((): AccessEvent | null => {
    if (!accessEvents) return null;
    const failed = accessEvents.filter(e => !e.success);
    return failed.length > 0 ? failed[0] : null;
  }, [accessEvents]);

  if (!identity) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">IoT Access Control System</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      {/* Emergency Contact Alerts */}
      <EmergencyContactAlerts />

      {/* Intrusion Alert Banner */}
      {latestFailedEvent && (
        <IntrusionAlertBanner recentFailedEvent={latestFailedEvent} />
      )}

      {/* System Health Overview */}
      <SystemHealthOverview />

      {/* Main Status Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lock State */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-3 h-32">
              <LockStateIndicator isLocked={deviceStatus?.isLocked ?? true} />
              <Badge variant={deviceStatus?.isLocked ? 'default' : 'secondary'} className="text-xs">
                {deviceStatus?.isLocked ? 'LOCKED' : 'UNLOCKED'}
              </Badge>
            </CardContent>
          </Card>

          {/* Connection */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-3 h-32">
              <ConnectionStatusBadge lastSync={deviceStatus?.lastSync ?? BigInt(0)} />
              <span className="text-xs text-muted-foreground font-mono">
                {deviceStatus?.lastSync && Number(deviceStatus.lastSync) > 0
                  ? new Date(Number(deviceStatus.lastSync) / 1_000_000).toLocaleTimeString()
                  : 'Never'}
              </span>
            </CardContent>
          </Card>

          {/* Battery */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-3 h-32">
              <div className="flex items-center gap-2">
                <Battery className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-foreground font-mono">
                  {Number(deviceStatus?.batteryLevel ?? 0)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Battery Level</span>
            </CardContent>
          </Card>

          {/* WiFi */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-3 h-32">
              <WiFiStrengthIndicator strength={Number(deviceStatus?.wifiSignalStrength ?? 0)} />
              <span className="text-xs text-muted-foreground font-mono">
                {Number(deviceStatus?.wifiSignalStrength ?? 0)} dBm
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Buttons — admin only */}
      {isAdmin && (
        <ControlButtons
          isLocked={deviceStatus?.isLocked ?? true}
          emergencyMode={deviceStatus?.emergencyMode ?? false}
        />
      )}

      {/* Telemetry Chart */}
      <TelemetryChartPanel />

      {/* Firmware Update Panel */}
      <FirmwareUpdatePanel />
    </div>
  );
}
