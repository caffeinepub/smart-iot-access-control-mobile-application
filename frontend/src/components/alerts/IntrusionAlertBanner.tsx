import { AlertTriangle, X, Camera } from 'lucide-react';
import { useState } from 'react';
import type { AccessEvent } from '../../types/accessEvent';

interface IntrusionAlertBannerProps {
  recentFailedEvent: AccessEvent | null;
}

export default function IntrusionAlertBanner({ recentFailedEvent }: IntrusionAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!recentFailedEvent || dismissed) return null;

  const time = new Date(Number(recentFailedEvent.timestamp) / 1_000_000).toLocaleTimeString();

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl mb-4 animate-slide-in-right">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 animate-pulse" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-8 rounded bg-muted/50 border border-destructive/20 flex items-center justify-center shrink-0">
          <Camera className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-destructive">Intrusion Detected</p>
          <p className="text-xs text-muted-foreground truncate">
            Failed access by {recentFailedEvent.userEmail || recentFailedEvent.rfidUid || 'Unknown'} at {time}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
