import { Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetMyStats } from "../../hooks/useQueries";

function getLevelTier(points: number): {
  label: string;
  color: string;
  glowColor: string;
  min: number;
  max: number;
} {
  if (points >= 1000)
    return {
      label: "ELITE",
      color: "text-yellow-300",
      glowColor: "shadow-yellow-500/40",
      min: 1000,
      max: 2000,
    };
  if (points >= 500)
    return {
      label: "AGENT",
      color: "text-purple-400",
      glowColor: "shadow-purple-500/40",
      min: 500,
      max: 1000,
    };
  if (points >= 100)
    return {
      label: "OPERATOR",
      color: "text-cyan-400",
      glowColor: "shadow-cyan-500/40",
      min: 100,
      max: 500,
    };
  return {
    label: "ROOKIE",
    color: "text-slate-400",
    glowColor: "shadow-slate-500/20",
    min: 0,
    max: 100,
  };
}

export default function CreditWallet() {
  const { data: stats } = useGetMyStats();
  const credits = stats ? Number(stats.points) : 0;
  const prevCredits = useRef(credits);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (credits !== prevCredits.current) {
      setIsPulsing(true);
      const t = setTimeout(() => setIsPulsing(false), 1200);
      prevCredits.current = credits;
      return () => clearTimeout(t);
    }
  }, [credits]);

  const tier = getLevelTier(credits);
  const progress = Math.min(
    100,
    ((credits - tier.min) / (tier.max - tier.min)) * 100,
  );

  return (
    <div
      data-ocid="credit.wallet.card"
      className="relative flex items-center gap-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-lg shadow-cyan-500/10"
    >
      {/* Animated corner accent */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60 rounded-tl-xl" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60 rounded-br-xl" />

      <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
        <Coins className="w-4 h-4 text-cyan-400" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-mono font-bold text-lg leading-none tracking-tight text-cyan-300 transition-all duration-300 ${
              isPulsing
                ? "drop-shadow-[0_0_8px_rgba(0,212,255,0.9)] scale-110"
                : "drop-shadow-[0_0_4px_rgba(0,212,255,0.4)]"
            }`}
          >
            {credits.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">
            CR
          </span>
        </div>

        {/* Level progress bar */}
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1 py-0 rounded border ${
              tier.color
            } border-current/40 bg-current/5`}
          >
            {tier.label}
          </span>
          <div className="w-16 h-0.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
