import { Progress } from "@/components/ui/progress";
import {
  Award,
  CheckCircle2,
  Flame,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetMyStats } from "../../hooks/useQueries";

const BADGE_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  "First Task": {
    icon: <Star className="w-3 h-3" />,
    label: "First Task",
    color: "text-yellow-300",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  "On a Roll": {
    icon: <Flame className="w-3 h-3" />,
    label: "On a Roll",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
  Century: {
    icon: <Trophy className="w-3 h-3" />,
    label: "Century",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  "Streak Master": {
    icon: <Zap className="w-3 h-3" />,
    label: "Streak Master",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  Achiever: {
    icon: <Award className="w-3 h-3" />,
    label: "Achiever",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  "Goal Crusher": {
    icon: <Target className="w-3 h-3" />,
    label: "Goal Crusher",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
};

function getLevelInfo(points: number) {
  if (points >= 1000)
    return {
      label: "ELITE",
      color: "text-yellow-300",
      border: "border-yellow-500/50",
      min: 1000,
      max: 2000,
      icon: <Trophy className="w-3.5 h-3.5" />,
    };
  if (points >= 500)
    return {
      label: "AGENT",
      color: "text-purple-400",
      border: "border-purple-500/50",
      min: 500,
      max: 1000,
      icon: <Shield className="w-3.5 h-3.5" />,
    };
  if (points >= 100)
    return {
      label: "OPERATOR",
      color: "text-cyan-400",
      border: "border-cyan-500/50",
      min: 100,
      max: 500,
      icon: <Zap className="w-3.5 h-3.5" />,
    };
  return {
    label: "ROOKIE",
    color: "text-slate-400",
    border: "border-slate-500/30",
    min: 0,
    max: 100,
    icon: <Star className="w-3.5 h-3.5" />,
  };
}

interface BadgeItemProps {
  name: string;
  isNew: boolean;
}

function BadgeItem({ name, isNew }: BadgeItemProps) {
  const config = BADGE_CONFIG[name] ?? {
    icon: <Award className="w-3 h-3" />,
    label: name,
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/30",
  };

  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-medium
        ${config.bg} ${config.color}
        ${isNew ? "animate-pulse shadow-[0_0_8px_currentColor]" : ""}`}
    >
      {config.icon}
      <span className="uppercase tracking-wider">{config.label}</span>
      {isNew && <span className="text-[9px] opacity-80">NEW</span>}
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
      <div className="rounded-xl border border-cyan-500/15 bg-slate-900/80 backdrop-blur-sm p-4 text-center">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Complete tasks to earn stats!
        </p>
      </div>
    );
  }

  const points = Number(stats.points);
  const streak = Number(stats.currentStreak);
  const level = getLevelInfo(points);
  const progressPct = Math.min(
    100,
    ((points - level.min) / (level.max - level.min)) * 100,
  );

  return (
    <div className="rounded-xl border border-cyan-500/15 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
      {/* HUD header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cyan-500/10 bg-cyan-500/5">
        <span className="w-1 h-4 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(0,212,255,0.7)]" />
        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
          Mission HUD
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Streak */}
          <div className="flex flex-col items-center rounded-lg border border-orange-500/20 bg-orange-500/5 p-2">
            <Flame className="w-3.5 h-3.5 text-orange-400 mb-1" />
            <span className="font-mono font-bold text-base text-orange-300 leading-none">
              {streak}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
              Streak
            </span>
          </div>

          {/* Credits */}
          <div className="flex flex-col items-center rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2">
            <Star className="w-3.5 h-3.5 text-cyan-400 mb-1" />
            <span className="font-mono font-bold text-base text-cyan-300 leading-none drop-shadow-[0_0_4px_rgba(0,212,255,0.6)]">
              {points}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
              CR
            </span>
          </div>

          {/* Done */}
          <div className="flex flex-col items-center rounded-lg border border-green-500/20 bg-green-500/5 p-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mb-1" />
            <span className="font-mono font-bold text-base text-green-300 leading-none">
              {Number(stats.totalCompleted)}
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
              Done
            </span>
          </div>
        </div>

        {/* Level badge + progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-1.5 font-mono text-xs font-bold ${level.color}`}
            >
              {level.icon}
              <span className="uppercase tracking-widest">{level.label}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {points} / {level.max} CR
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        {stats.unlockedBadges.length > 0 ? (
          <div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">
              Badges
            </p>
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
        ) : (
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center">
            Complete tasks to unlock badges
          </p>
        )}
      </div>
    </div>
  );
}
