import { Button } from "@/components/ui/button";
import { useAppState } from "@/contexts/AppStateContext";
import { playCreditReward } from "@/utils/soundEffects";
import { Clock, Square, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function PomodoroTimer() {
  const { pomodoroActive, pomodoroSecondsLeft, startPomodoro, stopPomodoro } =
    useAppState();
  const prevActive = useRef(pomodoroActive);

  useEffect(() => {
    if (prevActive.current && !pomodoroActive && pomodoroSecondsLeft === 0) {
      playCreditReward();
      toast.success("🍅 Session complete! +50 bonus CR", {
        description: "Your Pomodoro focus session ended. Great work!",
      });
    }
    prevActive.current = pomodoroActive;
  }, [pomodoroActive, pomodoroSecondsLeft]);

  const minutes = Math.floor(pomodoroSecondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (pomodoroSecondsLeft % 60).toString().padStart(2, "0");
  const progress = (1 - pomodoroSecondsLeft / 1500) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div
      data-ocid="pomodoro.panel"
      className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3"
    >
      <div className="flex items-center gap-2 w-full">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-bold text-foreground tracking-wider">
          POMODORO TIMER
        </span>
        {pomodoroActive && (
          <span className="ml-auto text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded animate-pulse">
            2x CR ACTIVE
          </span>
        )}
      </div>

      {/* Circular Timer */}
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 120 120"
          aria-hidden="true"
          role="presentation"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={
              pomodoroActive
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground))"
            }
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
            style={{
              filter: pomodoroActive
                ? "drop-shadow(0 0 6px hsl(var(--primary)))"
                : "none",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-foreground">
            {minutes}:{seconds}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono tracking-widest">
            {pomodoroActive ? "FOCUS" : "READY"}
          </span>
        </div>
      </div>

      {pomodoroActive ? (
        <>
          <div className="text-center text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1.5">
            <Zap className="w-3 h-3 inline mr-1" />
            FOCUS MODE ACTIVE — 2x CR BONUS
          </div>
          <Button
            data-ocid="pomodoro.button"
            size="sm"
            variant="outline"
            className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={stopPomodoro}
          >
            <Square className="w-3.5 h-3.5 mr-2" />
            Stop Session
          </Button>
        </>
      ) : (
        <Button
          data-ocid="pomodoro.button"
          size="sm"
          className="w-full"
          onClick={startPomodoro}
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Start Focus Session
        </Button>
      )}
    </div>
  );
}
