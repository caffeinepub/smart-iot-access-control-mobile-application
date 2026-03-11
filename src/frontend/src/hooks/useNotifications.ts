import { useCallback, useState } from "react";
import type { LogEvent } from "../backend";
import type { AccessEvent } from "../types/accessEvent";

export type NotificationCategory =
  | "Access Events"
  | "System Alerts"
  | "Automation";

export interface AppNotification {
  id: string;
  type:
    | "access_granted"
    | "access_denied"
    | "intrusion"
    | "device_offline"
    | "system";
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

function assignCategory(
  type: AppNotification["type"],
  message: string,
): NotificationCategory {
  if (type === "access_granted" || type === "access_denied")
    return "Access Events";
  if (type === "intrusion" || type === "device_offline") return "System Alerts";
  const lower = message.toLowerCase();
  if (
    lower.includes("rule") ||
    lower.includes("automation") ||
    lower.includes("smart")
  )
    return "Automation";
  if (
    lower.includes("intrusion") ||
    lower.includes("tamper") ||
    lower.includes("device") ||
    lower.includes("offline")
  )
    return "System Alerts";
  return "System Alerts";
}

function eventsToNotifications(
  events: AccessEvent[],
  logs: LogEvent[],
): AppNotification[] {
  const notifs: AppNotification[] = [];

  for (const event of events.slice(0, 20)) {
    const ts = Number(event.timestamp) / 1_000_000;
    const type: AppNotification["type"] = event.success
      ? "access_granted"
      : "access_denied";
    notifs.push({
      id: `event-${event.timestamp}-${event.rfidUid}`,
      type,
      category: "Access Events",
      title: event.success ? "Access Granted" : "Access Denied",
      message: `${event.userEmail || event.rfidUid} via ${event.method}`,
      timestamp: ts,
      read: false,
    });
  }

  for (const log of logs.slice(0, 10)) {
    const ts = Number(log.timestamp) / 1_000_000;
    const type: AppNotification["type"] = "system";
    const category = assignCategory(type, log.message);
    notifs.push({
      id: `log-${log.timestamp}-${log.code}`,
      type,
      category,
      title: "System Event",
      message: log.message,
      timestamp: ts,
      read: false,
    });
  }

  return notifs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
}

export function useNotifications(
  events: AccessEvent[] = [],
  logs: LogEvent[] = [],
) {
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("notif_read_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const notifications = eventsToNotifications(events, logs).map((n) => ({
    ...n,
    read: readIds.has(n.id),
  }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const newSet = new Set([...readIds, ...allIds]);
    setReadIds(newSet);
    localStorage.setItem("notif_read_ids", JSON.stringify([...newSet]));
  }, [notifications, readIds]);

  return { notifications, unreadCount, markAllRead };
}
