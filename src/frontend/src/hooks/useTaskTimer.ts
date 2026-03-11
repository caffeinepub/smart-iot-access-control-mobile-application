import { useCallback, useEffect, useRef, useState } from "react";
import { useFinishTimer } from "./useQueries";

interface UseTaskTimerOptions {
  todoId: bigint;
  timerSeconds: number;
  onExpire?: () => void;
}

interface UseTaskTimerReturn {
  remaining: number;
  percentRemaining: number;
  isRunning: boolean;
  isExpired: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTaskTimer({
  todoId,
  timerSeconds,
  onExpire,
}: UseTaskTimerOptions): UseTaskTimerReturn {
  const storageKey = `timer_${todoId.toString()}`;

  const getInitialRemaining = (): number => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.remaining > 0) return parsed.remaining;
      }
    } catch {
      // ignore
    }
    return timerSeconds;
  };

  const [remaining, setRemaining] = useState<number>(getInitialRemaining);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimer = useFinishTimer();

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    setIsRunning(true);
  }, [remaining]);

  const reset = useCallback(() => {
    stop();
    setRemaining(timerSeconds);
    sessionStorage.removeItem(storageKey);
  }, [stop, timerSeconds, storageKey]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        sessionStorage.setItem(storageKey, JSON.stringify({ remaining: next }));
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          const spent = BigInt(timerSeconds);
          finishTimer.mutate({ todoId, timeSpent: spent });
          onExpire?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, storageKey, timerSeconds, todoId, onExpire, finishTimer]);

  const percentRemaining =
    timerSeconds > 0 ? (remaining / timerSeconds) * 100 : 0;
  const isExpired = remaining <= 0;

  return {
    remaining,
    percentRemaining,
    isRunning,
    isExpired,
    start,
    stop,
    reset,
  };
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
