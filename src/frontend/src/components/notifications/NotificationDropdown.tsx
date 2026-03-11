import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type {
  AppNotification,
  NotificationCategory,
} from "../../hooks/useNotifications";

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onClose: () => void;
}

const CATEGORIES: Array<"All" | NotificationCategory> = [
  "All",
  "Access Events",
  "System Alerts",
  "Automation",
];

function getIcon(type: AppNotification["type"]) {
  switch (type) {
    case "access_granted":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "access_denied":
      return <XCircle className="w-4 h-4 text-destructive" />;
    case "intrusion":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    default:
      return <Info className="w-4 h-4 text-accent" />;
  }
}

function getCategoryColor(category: NotificationCategory): string {
  switch (category) {
    case "Access Events":
      return "bg-accent/15 text-accent border-accent/30";
    case "System Alerts":
      return "bg-warning/15 text-warning border-warning/30";
    case "Automation":
      return "bg-chart-5/15 text-chart-5 border-chart-5/30";
  }
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown({
  notifications,
  onClose,
}: NotificationDropdownProps) {
  const [activeFilter, setActiveFilter] = useState<
    "All" | NotificationCategory
  >("All");

  const filtered =
    activeFilter === "All"
      ? notifications
      : notifications.filter((n) => n.category === activeFilter);

  return (
    <div className="absolute right-0 top-12 w-96 z-50 rounded-xl border border-border bg-popover shadow-2xl animate-slide-in-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          Notifications
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "All"
              ? notifications.filter((n) => !n.read).length
              : notifications.filter((n) => n.category === cat && !n.read)
                  .length;
          return (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === cat
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
              {count > 0 && (
                <span
                  className={`text-xs rounded-full px-1 min-w-[16px] text-center ${
                    activeFilter === cat
                      ? "bg-accent-foreground/20 text-accent-foreground"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ScrollArea className="h-72">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <Bell className="w-6 h-6 opacity-30" />
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${!notif.read ? "bg-accent/5" : ""}`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">
                      {notif.title}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${getCategoryColor(notif.category)}`}
                    >
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(notif.timestamp)}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
