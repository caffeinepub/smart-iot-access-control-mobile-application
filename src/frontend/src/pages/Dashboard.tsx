import EmergencyContactAlerts from "@/components/alerts/EmergencyContactAlerts";
import IntrusionAlertBanner from "@/components/alerts/IntrusionAlertBanner";
import ControlButtons from "@/components/dashboard/ControlButtons";
import FirmwareUpdatePanel from "@/components/dashboard/FirmwareUpdatePanel";
import LockStateIndicator from "@/components/dashboard/LockStateIndicator";
import SystemHealthOverview from "@/components/dashboard/SystemHealthOverview";
import TelemetryChartPanel from "@/components/dashboard/TelemetryChartPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/contexts/AppStateContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import type { AccessEvent } from "@/types/accessEvent";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Battery,
  BatteryFull,
  CheckSquare,
  Coins,
  Lock,
  Server,
  Shield,
  ShieldCheck,
  Unlock,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";

function useGetDefaultDeviceStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["defaultDeviceStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDefaultDeviceStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

function useGetAccessEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AccessEvent[]>({
    queryKey: ["accessEvents"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const events = await actor.getAccessEvents();
      return events as AccessEvent[];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

function useGetAdminData() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["adminDashboardData"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdminDashboardData();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: deviceStatus, isLoading } = useGetDefaultDeviceStatus();
  const { data: accessEvents } = useGetAccessEvents();
  const { data: role } = useGetCallerUserRole();
  const { data: adminData } = useGetAdminData();
  const {
    todoStats,
    deviceStatus: cachedDevice,
    dailyChallenge,
    updateDeviceStatus,
    updateRecentEvents,
  } = useAppState();
  const isAdmin = role === "admin";

  // Sync device status to AppState
  useEffect(() => {
    if (deviceStatus) {
      updateDeviceStatus({
        isLocked: deviceStatus.isLocked,
        batteryLevel: Number(deviceStatus.batteryLevel),
        wifiSignalStrength: Number(deviceStatus.wifiSignalStrength),
      });
    }
  }, [deviceStatus, updateDeviceStatus]);

  // Sync access events to AppState
  useEffect(() => {
    if (accessEvents && accessEvents.length > 0) {
      updateRecentEvents(
        accessEvents.slice(0, 5).map((e) => ({
          id: `${e.timestamp}-${e.userEmail}`,
          success: e.success,
          userEmail: e.userEmail,
          method: e.method,
          timestamp: Number(e.timestamp) / 1_000_000,
          location: e.location,
        })),
      );
    }
  }, [accessEvents, updateRecentEvents]);

  const latestFailedEvent = useMemo((): AccessEvent | null => {
    if (!accessEvents) return null;
    const failed = accessEvents.filter((e) => !e.success);
    return failed.length > 0 ? failed[0] : null;
  }, [accessEvents]);

  // Activity feed: access events + completed todos
  const activityFeed = useMemo(() => {
    const accessItems = (accessEvents ?? []).slice(0, 5).map((e) => ({
      type: "access" as const,
      success: e.success,
      description: e.success
        ? `${e.userEmail} accessed via ${e.method}`
        : `Failed access attempt by ${e.userEmail}`,
      timestamp: Number(e.timestamp) / 1_000_000,
    }));

    let todoItems: { type: "todo"; description: string; timestamp: number }[] =
      [];
    try {
      const feed = JSON.parse(
        localStorage.getItem("completed_todos_feed") ?? "[]",
      );
      todoItems = (feed as { title: string; cr: number; timestamp: number }[])
        .slice(0, 3)
        .map((t) => ({
          type: "todo" as const,
          description: `Task '${t.title}' completed (+${t.cr} CR)`,
          timestamp: t.timestamp,
        }));
    } catch {}

    return [...accessItems, ...todoItems]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  }, [accessEvents]);

  // Daily challenge progress
  const challengeProgress = Math.min(
    100,
    (dailyChallenge.current / dailyChallenge.target) * 100,
  );

  const batteryLevel = deviceStatus
    ? Number(deviceStatus.batteryLevel)
    : cachedDevice.batteryLevel;
  const wifiStrength = deviceStatus
    ? Number(deviceStatus.wifiSignalStrength)
    : cachedDevice.wifiSignalStrength;
  const isLocked = deviceStatus ? deviceStatus.isLocked : cachedDevice.isLocked;
  const failedAttempts24h = adminData
    ? Number(adminData.failedAccessLast24h)
    : 0;
  const activeUsers = adminData ? Number(adminData.activeUsers) : 0;

  if (!identity) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            IoT Access Control System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      <EmergencyContactAlerts />
      {latestFailedEvent && (
        <IntrusionAlertBanner recentFailedEvent={latestFailedEvent} />
      )}

      {/* Top Stats Row */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        data-ocid="dashboard.section"
      >
        {/* Lock Status */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {isLocked ? (
                <Lock className="w-4 h-4 text-primary" />
              ) : (
                <Unlock className="w-4 h-4 text-green-400" />
              )}
              <span className="text-xs text-muted-foreground font-mono">
                LOCK
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <p
                className={`text-sm font-bold font-mono ${isLocked ? "text-primary" : "text-green-400"}`}
              >
                {isLocked ? "LOCKED" : "UNLOCKED"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Connection */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground font-mono">
                CONNECTION
              </span>
            </div>
            <p className="text-sm font-bold font-mono text-green-400">ONLINE</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Just now
            </p>
          </CardContent>
        </Card>

        {/* Battery */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground font-mono">
                BATTERY
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              <>
                <p className="text-sm font-bold font-mono text-foreground">
                  {batteryLevel}%
                </p>
                <Progress value={batteryLevel} className="h-1 mt-1" />
              </>
            )}
          </CardContent>
        </Card>

        {/* WiFi */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              {wifiStrength > 30 ? (
                <Wifi className="w-4 h-4 text-cyan-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs text-muted-foreground font-mono">
                WIFI
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              <>
                <p className="text-sm font-bold font-mono text-foreground">
                  {wifiStrength}%
                </p>
                <Progress value={wifiStrength} className="h-1 mt-1" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Total CR */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground font-mono">
                TOTAL CR
              </span>
            </div>
            <p className="text-sm font-bold font-mono text-amber-400">
              {todoStats.totalCR.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {todoStats.level}
            </p>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="border-border">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground font-mono">
                TASKS
              </span>
            </div>
            <p className="text-sm font-bold font-mono text-green-400">
              {todoStats.completed}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenge */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  Daily Challenge
                </span>
                {dailyChallenge.completed && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-mono">
                    CHALLENGE COMPLETE
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">
                {dailyChallenge.title}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={challengeProgress} className="flex-1 h-2" />
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {dailyChallenge.current} / {dailyChallenge.target}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-400 font-mono text-xs"
              >
                Bonus: +{dailyChallenge.rewardCR} CR
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Lock controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockStateIndicator isLocked={isLocked} />
            {isAdmin && <ControlButtons />}
          </div>
          <SystemHealthOverview />
          <TelemetryChartPanel />
          <FirmwareUpdatePanel />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Live Activity Feed */}
          <Card className="border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {activityFeed.length === 0 ? (
                <p
                  data-ocid="activity.empty_state"
                  className="text-xs text-muted-foreground"
                >
                  No recent activity.
                </p>
              ) : (
                activityFeed.map((item, i) => (
                  <div
                    key={`${item.timestamp}-${i}`}
                    data-ocid={`activity.item.${i + 1}`}
                    className="flex items-start gap-2 py-1.5 border-b border-border last:border-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === "todo"
                          ? "bg-green-500/20"
                          : item.success
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                      }`}
                    >
                      {item.type === "todo" ? (
                        <CheckSquare className="w-3 h-3 text-green-400" />
                      ) : item.success ? (
                        <ShieldCheck className="w-3 h-3 text-green-400" />
                      ) : (
                        <Shield className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-tight line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {item.timestamp > 0
                          ? timeAgo(item.timestamp)
                          : "just now"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* IoT Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-red-500/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Failed 24h
                </p>
                <p className="text-xl font-bold font-mono text-red-400 mt-1">
                  {failedAttempts24h}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Active Users
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-xl font-bold font-mono text-foreground">
                    {activeUsers}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Uptime
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Server className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-xs font-bold font-mono text-green-400">
                    14d 3h
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Security
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <BatteryFull className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-xs font-bold font-mono text-green-400">
                    HIGH
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
