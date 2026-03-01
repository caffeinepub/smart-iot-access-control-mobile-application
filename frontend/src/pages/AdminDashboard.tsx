import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Users, Shield, ShieldOff, UserCheck, UserX, Cpu, Lock, Unlock,
  AlertTriangle, Activity, Zap, Thermometer, Wifi, Battery,
  CheckCircle, XCircle, Clock, TrendingUp, Eye, Server, Globe
} from 'lucide-react';

function useGetAdminDashboardData() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['adminDashboardData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboardData();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
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

function useGetAllDevices() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['allDevices'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDevices();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

function StatCard({
  title, value, icon: Icon, color, subtitle
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceStatusCard({
  deviceId, status
}: {
  deviceId: string;
  status: {
    isLocked: boolean;
    batteryLevel: bigint;
    wifiSignalStrength: bigint;
    firmwareVersion: string;
    emergencyMode: boolean;
    tamperDetected: boolean;
    currentUsers: bigint;
  };
}) {
  const battery = Number(status.batteryLevel);
  const wifi = Number(status.wifiSignalStrength);
  const isOnline = wifi > 0;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-foreground truncate max-w-[120px]">{deviceId}</span>
          </div>
          <Badge variant={isOnline ? 'default' : 'secondary'} className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {status.isLocked
              ? <Lock className="w-3 h-3 text-green-400" />
              : <Unlock className="w-3 h-3 text-yellow-400" />}
            <span className="text-muted-foreground">{status.isLocked ? 'Locked' : 'Unlocked'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-3 h-3 text-blue-400" />
            <span className="text-muted-foreground">{battery}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-muted-foreground">{wifi} dBm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="text-muted-foreground">v{status.firmwareVersion}</span>
          </div>
        </div>

        {(status.emergencyMode || status.tamperDetected) && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {status.emergencyMode && (
              <Badge variant="destructive" className="text-xs">Emergency</Badge>
            )}
            {status.tamperDetected && (
              <Badge variant="destructive" className="text-xs">Tamper!</Badge>
            )}
          </div>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Battery</span>
            <span>{battery}%</span>
          </div>
          <Progress
            value={battery}
            className="h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function EventFeedItem({ event }: {
  event: {
    rfidUid: string;
    method: string;
    userEmail: string;
    timestamp: bigint;
    success: boolean;
    location: string;
    eventType: string;
  }
}) {
  const ts = new Date(Number(event.timestamp) / 1_000_000);
  const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="mt-0.5">
        {event.success
          ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">{event.userEmail || event.rfidUid}</span>
          <Badge variant={event.success ? 'default' : 'destructive'} className="text-xs shrink-0">
            {event.eventType}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          <span>{event.method}</span>
          <span>·</span>
          <span>{event.location}</span>
          <span>·</span>
          <span>{dateStr} {timeStr}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: dashData, isLoading: dashLoading } = useGetAdminDashboardData();
  const { data: allDevices, isLoading: devicesLoading } = useGetAllDevices();

  const isAdmin = role === 'admin';

  const failedEvents = useMemo(() => {
    if (!dashData) return [];
    return dashData.accessEventFeed.filter(e => !e.success);
  }, [dashData]);

  const recentEvents = useMemo(() => {
    if (!dashData) return [];
    return [...dashData.accessEventFeed].slice(0, 50);
  }, [dashData]);

  const healthScore = useMemo(() => {
    if (!dashData || dashData.deviceStatuses.length === 0) return 100;
    const total = dashData.deviceStatuses.length;
    const healthy = dashData.deviceStatuses.filter(([, s]) => !s.emergencyMode && !s.tamperDetected).length;
    return Math.round((healthy / total) * 100);
  }, [dashData]);

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-card border-border p-8 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the Admin Dashboard.</p>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-card border-border p-8 text-center max-w-md">
          <ShieldOff className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view the Admin Dashboard. Admin role required.</p>
        </Card>
      </div>
    );
  }

  const isLoading = dashLoading || devicesLoading;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive system monitoring & control</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      {/* User Count Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={Number(dashData?.totalUsers ?? 0)}
            icon={Users}
            color="bg-primary/20 text-primary"
            subtitle="Registered users"
          />
          <StatCard
            title="Active Users"
            value={Number(dashData?.activeUsers ?? 0)}
            icon={UserCheck}
            color="bg-green-500/20 text-green-400"
            subtitle="Currently enabled"
          />
          <StatCard
            title="Disabled Users"
            value={Number(dashData?.disabledUsers ?? 0)}
            icon={UserX}
            color="bg-red-500/20 text-red-400"
            subtitle="Access revoked"
          />
          <StatCard
            title="Guest Users"
            value={Number(dashData?.guestUsers ?? 0)}
            icon={Eye}
            color="bg-yellow-500/20 text-yellow-400"
            subtitle="Limited access"
          />
        </div>
      )}

      {/* System Metrics Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Failed Attempts (24h)"
            value={Number(dashData?.failedAccessLast24h ?? 0)}
            icon={AlertTriangle}
            color="bg-orange-500/20 text-orange-400"
            subtitle="Unauthorized access"
          />
          <StatCard
            title="Active Rules"
            value={Number(dashData?.activeSmartRulesCount ?? 0)}
            icon={Zap}
            color="bg-purple-500/20 text-purple-400"
            subtitle="Automation rules"
          />
          <StatCard
            title="Health Score"
            value={`${healthScore}%`}
            icon={Activity}
            color={healthScore >= 80 ? "bg-green-500/20 text-green-400" : healthScore >= 50 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}
            subtitle="System health"
          />
          <StatCard
            title="Vacation Mode"
            value={dashData?.vacationMode ? 'Active' : 'Inactive'}
            icon={Globe}
            color={dashData?.vacationMode ? "bg-blue-500/20 text-blue-400" : "bg-muted/50 text-muted-foreground"}
            subtitle={dashData?.vacationMode ? 'All doors locked' : 'Normal operation'}
          />
        </div>
      )}

      {/* Intrusion Alert Banner */}
      {!isLoading && failedEvents.length > 0 && (
        <Card className="bg-red-950/30 border-red-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-red-300">
                  {failedEvents.length} Intrusion Alert{failedEvents.length > 1 ? 's' : ''} Detected
                </p>
                <p className="text-xs text-red-400/80 mt-0.5">
                  Last: {failedEvents[0]?.userEmail || failedEvents[0]?.rfidUid} — {new Date(Number(failedEvents[0]?.timestamp) / 1_000_000).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" />
                Device Status Grid
                {!isLoading && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {dashData?.deviceStatuses.length ?? 0} devices
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
              ) : dashData?.deviceStatuses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No devices registered</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashData?.deviceStatuses.map(([deviceId, status]) => (
                    <DeviceStatusCard key={deviceId} deviceId={deviceId} status={status} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Failed Attempts Detail */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Intrusion Alerts
                {!isLoading && failedEvents.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {failedEvents.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : failedEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400 opacity-60" />
                  <p className="text-sm">No intrusion alerts</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  {failedEvents.slice(0, 20).map((event, i) => (
                    <EventFeedItem key={i} event={event} />
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Event Feed */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Live Event Feed
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No events yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[420px]">
                  <div className="px-4 pb-4">
                    {recentEvents.map((event, i) => (
                      <EventFeedItem key={i} event={event} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* System Health Score */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className={`text-2xl font-bold ${healthScore >= 80 ? 'text-green-400' : healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {healthScore}%
                    </span>
                  </div>
                  <Progress value={healthScore} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span>{dashData?.deviceStatuses.filter(([, s]) => !s.emergencyMode && !s.tamperDetected).length ?? 0} Healthy</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>{dashData?.deviceStatuses.filter(([, s]) => s.emergencyMode || s.tamperDetected).length ?? 0} Critical</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Vacation Mode</span>
                      <Badge variant={dashData?.vacationMode ? 'default' : 'secondary'} className="text-xs">
                        {dashData?.vacationMode ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Active Rules</span>
                      <span className="text-foreground font-mono">{Number(dashData?.activeSmartRulesCount ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Failed (24h)</span>
                      <span className={`font-mono ${Number(dashData?.failedAccessLast24h ?? 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {Number(dashData?.failedAccessLast24h ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
