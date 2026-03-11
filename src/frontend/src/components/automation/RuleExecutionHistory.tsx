import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ClipboardList, History, XCircle } from "lucide-react";
import { useGetSmartRuleExecutionLog } from "../../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms <= 0) return "Unknown";
  const date = new Date(ms);
  return date.toLocaleString();
}

const ROW_CLASS =
  "flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors";

export default function RuleExecutionHistory() {
  const { data: logs = [], isLoading } = useGetSmartRuleExecutionLog();

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          Rule Execution History
          <Badge variant="outline" className="ml-auto text-xs">
            Last 50 entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <ClipboardList className="w-10 h-10 opacity-30" />
            <p className="text-sm">No rule executions recorded yet</p>
            <p className="text-xs opacity-70">
              Rule triggers will appear here when automation rules fire
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2 pr-2">
              {logs.map((log, idx) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable log list
                  <div key={idx} className={ROW_CLASS}>
                    <div className="mt-0.5 shrink-0">
                      {log.outcome ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {log.ruleName}
                        </span>
                        <Badge
                          variant={log.outcome ? "default" : "destructive"}
                          className={`text-xs ${
                            log.outcome
                              ? "bg-success/20 text-success border-success/30"
                              : ""
                          }`}
                        >
                          {log.outcome ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>
                          Trigger:{" "}
                          <span className="text-foreground">
                            {log.triggerCondition}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          Action:{" "}
                          <span className="text-foreground">
                            {log.actionTaken}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
