import type { AccessEvent } from '../types/accessEvent';

export interface DailyCount {
  date: string;
  count: number;
}

export interface UserEventSummary {
  userEmail: string;
  successCount: number;
  failureCount: number;
}

export interface PeakHour {
  hour: number;
  count: number;
  label: string;
}

export function groupEventsByDay(events: AccessEvent[]): DailyCount[] {
  const now = new Date();
  const result: DailyCount[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    result.push({ date: label, count: 0 });
  }

  events.forEach((event) => {
    const date = new Date(Number(event.timestamp) / 1_000_000);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 30) {
      const idx = 29 - diffDays;
      if (result[idx]) result[idx].count++;
    }
  });

  return result;
}

export function groupEventsByUser(events: AccessEvent[]): UserEventSummary[] {
  const map = new Map<string, { success: number; failure: number }>();

  events.forEach((event) => {
    const key = event.userEmail || event.rfidUid || 'Unknown';
    const existing = map.get(key) ?? { success: 0, failure: 0 };
    if (event.success) {
      existing.success++;
    } else {
      existing.failure++;
    }
    map.set(key, existing);
  });

  return Array.from(map.entries())
    .map(([userEmail, counts]) => ({
      userEmail,
      successCount: counts.success,
      failureCount: counts.failure,
    }))
    .sort((a, b) => b.successCount + b.failureCount - (a.successCount + a.failureCount))
    .slice(0, 10);
}

export function extractPeakHours(events: AccessEvent[]): PeakHour[] {
  const hourCounts = new Array(24).fill(0);

  events.forEach((event) => {
    const date = new Date(Number(event.timestamp) / 1_000_000);
    hourCounts[date.getHours()]++;
  });

  return hourCounts
    .map((count, hour) => ({
      hour,
      count,
      label: `${hour.toString().padStart(2, '0')}:00`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}
