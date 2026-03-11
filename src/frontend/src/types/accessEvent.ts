// Local AccessEvent type since it's not in the backend interface.
// The backend uses LogEvent for event storage; we map those to this shape on the frontend.
export interface AccessEvent {
  rfidUid: string;
  timestamp: bigint;
  success: boolean;
  eventType: string;
  location: string;
  method: string;
  userEmail: string;
}
