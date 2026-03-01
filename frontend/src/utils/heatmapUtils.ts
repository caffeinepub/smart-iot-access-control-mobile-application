import type { AccessEvent } from '../types/accessEvent';

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
  intensity: number; // 0-5
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function buildHeatmapData(events: AccessEvent[]): HeatmapCell[][] {
  const counts: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

  events.forEach((event) => {
    const date = new Date(Number(event.timestamp) / 1_000_000);
    const day = date.getDay();
    const hour = date.getHours();
    counts[day][hour]++;
  });

  const maxCount = Math.max(1, ...counts.flat());

  return counts.map((dayRow, day) =>
    dayRow.map((count, hour) => ({
      day,
      hour,
      count,
      intensity: count === 0 ? 0 : Math.ceil((count / maxCount) * 5),
    }))
  );
}

export { DAYS };
