import type { AccessEvent } from "../types/accessEvent";

export interface UserActivityMetrics {
  accessCount: number;
  lastAccessTime: bigint | null;
  successRate: number;
}

export function computeUserActivityMetrics(
  events: AccessEvent[],
): Map<string, UserActivityMetrics> {
  const map = new Map<
    string,
    { total: number; success: number; lastTs: bigint }
  >();

  for (const event of events) {
    const key = event.userEmail || event.rfidUid || "Unknown";
    const existing = map.get(key) ?? {
      total: 0,
      success: 0,
      lastTs: BigInt(0),
    };
    existing.total++;
    if (event.success) existing.success++;
    if (event.timestamp > existing.lastTs) existing.lastTs = event.timestamp;
    map.set(key, existing);
  }

  const result = new Map<string, UserActivityMetrics>();
  for (const [key, val] of map) {
    result.set(key, {
      accessCount: val.total,
      lastAccessTime: val.lastTs > BigInt(0) ? val.lastTs : null,
      successRate:
        val.total > 0 ? Math.round((val.success / val.total) * 100) : 0,
    });
  }

  return result;
}
