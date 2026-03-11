import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AccessEvent } from "../../types/accessEvent";

interface ActivityFeedProps {
  events: AccessEvent[];
}

const EVENT_ROW_CLASS =
  "flex items-start gap-4 p-4 rounded-lg border border-accent/10 bg-card hover:bg-accent/5 transition-colors";

export default function ActivityFeed({ events }: ActivityFeedProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const sortedEvents = [...events].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Activity Feed
        </CardTitle>
        <CardDescription>
          Recent access events ({events.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {sortedEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No events found
              </p>
            ) : (
              sortedEvents.map((event, index) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable sorted list
                  <div key={index} className={EVENT_ROW_CLASS}>
                    <div className="mt-1">
                      {event.success ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{event.userEmail}</p>
                        <Badge
                          variant={event.success ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {event.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.eventType}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-mono">{event.method}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                        <span>•</span>
                        <span>{formatTimestamp(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
