import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Camera, Clock } from "lucide-react";
import type { AccessEvent } from "../../types/accessEvent";

interface IntrusionAlertsPanelProps {
  events: AccessEvent[];
}

function formatTime(ts: bigint): string {
  const date = new Date(Number(ts) / 1_000_000);
  return date.toLocaleString();
}

export default function IntrusionAlertsPanel({
  events,
}: IntrusionAlertsPanelProps) {
  const failedEvents = events.filter((e) => !e.success).slice(0, 20);

  if (failedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
        <AlertTriangle className="w-12 h-12 opacity-30" />
        <p className="text-sm">No intrusion alerts detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {failedEvents.map((event, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable filtered list
        <Card key={idx} className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-16 rounded-lg bg-muted/50 border border-destructive/20 flex flex-col items-center justify-center shrink-0 overflow-hidden">
                <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">No Feed</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <span className="font-semibold text-sm text-destructive">
                    Intrusion Alert
                  </span>
                  <Badge variant="destructive" className="text-xs ml-auto">
                    FAILED
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  User: {event.userEmail || event.rfidUid || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Method: {event.method} • Location: {event.location}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.timestamp)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
