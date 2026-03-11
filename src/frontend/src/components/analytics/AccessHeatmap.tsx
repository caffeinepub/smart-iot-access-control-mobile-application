import { useMemo } from "react";
import type { AccessEvent } from "../../types/accessEvent";
import { DAYS, buildHeatmapData } from "../../utils/heatmapUtils";

interface AccessHeatmapProps {
  events: AccessEvent[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function intensityClass(intensity: number): string {
  return `heatmap-cell-${intensity}`;
}

export default function AccessHeatmap({ events }: AccessHeatmapProps) {
  const heatmapData = useMemo(() => buildHeatmapData(events), [events]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1 ml-10">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-xs text-muted-foreground font-mono"
              >
                {h % 4 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <div className="w-9 text-xs text-muted-foreground text-right pr-2 shrink-0">
                {day}
              </div>
              {HOURS.map((hour) => {
                const cell = heatmapData[dayIdx]?.[hour];
                return (
                  <div
                    key={hour}
                    className={`flex-1 h-6 rounded-sm ${intensityClass(cell?.intensity ?? 0)} transition-all duration-300 cursor-default`}
                    title={`${day} ${hour}:00 — ${cell?.count ?? 0} events`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-5 h-5 rounded-sm ${intensityClass(i)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
