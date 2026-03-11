import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Flame, Star, Target, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UserStats } from "../../backend";
import { useGetMyStats } from "../../hooks/useQueries";

const BADGE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  "First Task": {
    icon: <Star className="w-3.5 h-3.5" />,
    label: "First Task",
    color: "text-yellow-400",
  },
  "On a Roll": {
    icon: <Flame className="w-3.5 h-3.5" />,
    label: "On a Roll",
    color: "text-orange-400",
  },
  Century: {
    icon: <Trophy className="w-3.5 h-3.5" />,
    label: "Century",
    color: "text-purple-400",
  },
  "Streak Master": {
    icon: <Zap className="w-3.5 h-3.5" />,
    label: "Streak Master",
    color: "text-blue-400",
  },
  Achiever: {
    icon: <Award className="w-3.5 h-3.5" />,
    label: "Achiever",
    color: "text-green-400",
  },
  "Goal Crusher": {
    icon: <Target className="w-3.5 h-3.5" />,
    label: "Goal Crusher",
    color: "text-red-400",
  },
};

interface BadgeItemProps {
  name: string;
  isNew: boolean;
}

function BadgeItem({ name, isNew }: BadgeItemProps) {
  const config = BADGE_CONFIG[name] ?? {
    icon: <Award className="w-3.5 h-3.5" />,
    label: name,
    color: "text-primary",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium
        ${isNew ? "animate-badge-unlock border-primary/50 bg-primary/10" : "border-border/50 bg-muted/30"}
        ${config.color}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {isNew && <span className="text-[10px] text-primary ml-0.5">NEW!</span>}
    </div>
  );
}

export default function GamificationPanel() {
  const { data: stats } = useGetMyStats();
  const prevBadgesRef = useRef<string[]>([]);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!stats) return;
    const current = stats.unlockedBadges;
    const prev = prevBadgesRef.current;
    const fresh = current.filter((b) => !prev.includes(b));
    if (fresh.length > 0) {
      setNewBadges(fresh);
      setTimeout(() => setNewBadges([]), 4000);
    }
    prevBadgesRef.current = current;
  }, [stats]);

  if (!stats) {
    return (
      <Card className="bg-card/70 backdrop-blur-sm border-border/50">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Complete tasks to earn stats!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold">{Number(stats.currentStreak)}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-0.5">
              <Star className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold">{Number(stats.points)}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold">{Number(stats.totalCompleted)}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </div>
        </div>

        {stats.unlockedBadges.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Badges</p>
            <div className="flex flex-wrap gap-1.5">
              {stats.unlockedBadges.map((badge) => (
                <BadgeItem
                  key={badge}
                  name={badge}
                  isNew={newBadges.includes(badge)}
                />
              ))}
            </div>
          </div>
        )}

        {stats.unlockedBadges.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Complete tasks to earn badges!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Need to import CheckCircle
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Check circle icon"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
