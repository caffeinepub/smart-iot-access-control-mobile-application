import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AccessEvent } from "../../types/accessEvent";
import {
  extractPeakHours,
  groupEventsByDay,
  groupEventsByUser,
} from "../../utils/analyticsUtils";

const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid rgba(0,212,255,0.25)",
  borderRadius: "8px",
  color: "#94a3b8",
  fontSize: "12px",
};

const COLOR_SUCCESS = "#22c55e";
const COLOR_FAIL = "#ef4444";
const COLOR_ACCENT = "#06b6d4";

interface AdvancedAnalyticsProps {
  events: AccessEvent[];
}

export default function AdvancedAnalytics({ events }: AdvancedAnalyticsProps) {
  const dailyData = useMemo(() => groupEventsByDay(events), [events]);
  const userData = useMemo(() => groupEventsByUser(events), [events]);
  const peakHours = useMemo(() => extractPeakHours(events), [events]);

  return (
    <div className="space-y-6">
      {/* Daily Trend */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-accent" />
            Daily Access Trend (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.1)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={COLOR_ACCENT}
                strokeWidth={2}
                dot={false}
                name="Access Events"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Success/Failure Stacked Bar */}
        <div className="lg:col-span-2">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-accent" />
                Access by User
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  No user data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={userData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.1)"
                    />
                    <XAxis
                      dataKey="userEmail"
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar
                      dataKey="successCount"
                      name="Success"
                      stackId="a"
                      fill={COLOR_SUCCESS}
                    />
                    <Bar
                      dataKey="failureCount"
                      name="Failure"
                      stackId="a"
                      fill={COLOR_FAIL}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Peak Hours */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-accent" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {peakHours.length === 0 || peakHours[0].count === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No data available
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {peakHours.map((ph, idx) => (
                  <div key={ph.hour} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0
                              ? "bg-accent text-accent-foreground"
                              : idx === 1
                                ? "bg-accent/60 text-accent-foreground"
                                : "bg-accent/30 text-accent-foreground"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-mono font-semibold">
                          {ph.label}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {ph.count} events
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${peakHours[0].count > 0 ? (ph.count / peakHours[0].count) * 100 : 0}%`,
                          background: COLOR_ACCENT,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  Top 3 busiest hours based on all access events
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
