import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { loadEmergencyContacts, EmergencyContact } from '@/components/settings/EmergencyContactsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhoneCall, X, AlertTriangle } from 'lucide-react';

interface AlertNotification {
  id: string;
  contact: EmergencyContact;
  message: string;
  timestamp: string;
}

export default function EmergencyContactAlerts() {
  const { actor, isFetching: actorFetching } = useActor();
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  const { data: accessEvents } = useQuery({
    queryKey: ['accessEvents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccessEvents();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!accessEvents) return;
    const contacts = loadEmergencyContacts();
    if (contacts.length === 0) return;

    const failedEvents = accessEvents.filter(e => !e.success);
    if (failedEvents.length === 0) return;

    const latest = failedEvents[0];
    const key = `emergency-alert-${latest.timestamp}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const ts = new Date(Number(latest.timestamp) / 1_000_000).toLocaleString();
    const newAlerts: AlertNotification[] = contacts.map(contact => ({
      id: `${contact.id}-${latest.timestamp}`,
      contact,
      message: `Alert sent: Intrusion detected at ${latest.location || 'unknown location'} at ${ts}. User: ${latest.userEmail || latest.rfidUid}`,
      timestamp: ts,
    }));

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 9));
  }, [accessEvents]);

  const dismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map(alert => (
        <Card key={alert.id} className="bg-orange-950/30 border-orange-500/50">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-orange-500/20 shrink-0 mt-0.5">
                <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="text-sm font-semibold text-orange-300">Emergency Alert</span>
                  <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-400">
                    {alert.contact.name}
                  </Badge>
                </div>
                <p className="text-xs text-orange-300/80 mt-1">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Contact: {alert.contact.contact}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismiss(alert.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
