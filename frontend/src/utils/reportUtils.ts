import type { AccessEvent } from '../types/accessEvent';

export interface ReportRow {
  period: string;
  userEmail: string;
  successCount: number;
  failureCount: number;
  total: number;
}

function getWeekLabel(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function getMonthLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function groupEventsByWeek(events: AccessEvent[]): ReportRow[] {
  const map: Record<string, Record<string, { success: number; failure: number }>> = {};

  events.forEach((event) => {
    const date = new Date(Number(event.timestamp) / 1_000_000);
    const period = getWeekLabel(date);
    const user = event.userEmail || event.rfidUid || 'Unknown';

    if (!map[period]) map[period] = {};
    if (!map[period][user]) map[period][user] = { success: 0, failure: 0 };

    if (event.success) {
      map[period][user].success++;
    } else {
      map[period][user].failure++;
    }
  });

  const rows: ReportRow[] = [];
  Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([period, users]) => {
      Object.entries(users).forEach(([userEmail, counts]) => {
        rows.push({
          period,
          userEmail,
          successCount: counts.success,
          failureCount: counts.failure,
          total: counts.success + counts.failure,
        });
      });
    });

  return rows;
}

export function groupEventsByMonth(events: AccessEvent[]): ReportRow[] {
  const map: Record<string, Record<string, { success: number; failure: number }>> = {};

  events.forEach((event) => {
    const date = new Date(Number(event.timestamp) / 1_000_000);
    const period = getMonthLabel(date);
    const user = event.userEmail || event.rfidUid || 'Unknown';

    if (!map[period]) map[period] = {};
    if (!map[period][user]) map[period][user] = { success: 0, failure: 0 };

    if (event.success) {
      map[period][user].success++;
    } else {
      map[period][user].failure++;
    }
  });

  const rows: ReportRow[] = [];
  Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([period, users]) => {
      Object.entries(users).forEach(([userEmail, counts]) => {
        rows.push({
          period,
          userEmail,
          successCount: counts.success,
          failureCount: counts.failure,
          total: counts.success + counts.failure,
        });
      });
    });

  return rows;
}
