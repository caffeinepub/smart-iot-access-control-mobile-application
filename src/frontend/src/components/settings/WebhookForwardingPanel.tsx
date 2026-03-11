import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Send, Trash2, Webhook } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

interface WebhookConfig {
  url: string;
  alertTypes: {
    intrusion: boolean;
    lockdown: boolean;
    firmware: boolean;
  };
}

interface WebhookLog {
  id: string;
  timestamp: string;
  endpoint: string;
  payload: object;
  status: number;
  eventType: string;
}

const STORAGE_KEY = "webhook-config";
const LOGS_KEY = "webhook-logs";

function loadConfig(): WebhookConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    url: "",
    alertTypes: { intrusion: true, lockdown: false, firmware: false },
  };
}

function loadLogs(): WebhookLog[] {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveLogs(logs: WebhookLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 10)));
}

export default function WebhookForwardingPanel() {
  const { actor, isFetching: actorFetching } = useActor();
  const [config, setConfig] = useState<WebhookConfig>(loadConfig);
  const [logs, setLogs] = useState<WebhookLog[]>(loadLogs);
  const [urlInput, setUrlInput] = useState(config.url);

  const { data: accessEvents } = useQuery({
    queryKey: ["accessEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccessEvents();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });

  const simulateWebhook = useCallback(
    (eventType: string, payload: object) => {
      if (!config.url) return;
      const log: WebhookLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        endpoint: config.url,
        payload,
        status: 200,
        eventType,
      };
      setLogs((prev) => {
        const updated = [log, ...prev].slice(0, 10);
        saveLogs(updated);
        return updated;
      });
    },
    [config.url],
  );

  // Monitor for intrusion events
  useEffect(() => {
    if (!accessEvents || !config.alertTypes.intrusion || !config.url) return;
    const recent = accessEvents.filter((e) => !e.success);
    if (recent.length > 0) {
      const latest = recent[0];
      const key = `webhook-last-intrusion-${latest.timestamp}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        simulateWebhook("intrusion", {
          event: "ACCESS_DENIED",
          timestamp: new Date(
            Number(latest.timestamp) / 1_000_000,
          ).toISOString(),
          deviceId: "default",
          userEmail: latest.userEmail,
          location: latest.location,
        });
      }
    }
  }, [accessEvents, config.alertTypes.intrusion, config.url, simulateWebhook]);

  const handleSave = () => {
    const updated = { ...config, url: urlInput };
    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAlertTypeChange = (
    type: keyof WebhookConfig["alertTypes"],
    checked: boolean,
  ) => {
    const updated = {
      ...config,
      alertTypes: { ...config.alertTypes, [type]: checked },
    };
    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleTestWebhook = () => {
    simulateWebhook("test", {
      event: "TEST_WEBHOOK",
      timestamp: new Date().toISOString(),
      deviceId: "default",
      message: "Test webhook from IoT Access Control",
    });
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(LOGS_KEY);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Webhook className="w-4 h-4 text-primary" />
          Webhook / Alert Forwarding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Webhook URL (mock)
          </Label>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-endpoint.example.com/webhook"
              className="bg-background border-border font-mono text-sm"
            />
            <Button size="sm" onClick={handleSave} variant="outline">
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Alert Types</Label>
          <div className="flex flex-wrap gap-4">
            {(["intrusion", "lockdown", "firmware"] as const).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`webhook-${type}`}
                  checked={config.alertTypes[type]}
                  onCheckedChange={(checked) =>
                    handleAlertTypeChange(type, !!checked)
                  }
                />
                <Label
                  htmlFor={`webhook-${type}`}
                  className="text-sm capitalize cursor-pointer"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleTestWebhook}
          disabled={!config.url}
          className="flex items-center gap-2"
        >
          <Send className="w-3 h-3" />
          Send Test Webhook
        </Button>

        {logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                Webhook Log (last 10)
              </Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearLogs}
                className="h-6 px-2 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-48 rounded border border-border">
              <div className="p-2 space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-background/50 rounded p-2 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {log.eventType}
                        </Badge>
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>{log.status} OK</span>
                        </div>
                      </div>
                    </div>
                    <div className="font-mono text-muted-foreground truncate">
                      {log.endpoint}
                    </div>
                    <div className="font-mono text-xs text-foreground/60 bg-muted/30 rounded p-1 overflow-x-auto">
                      {JSON.stringify(log.payload, null, 0)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
