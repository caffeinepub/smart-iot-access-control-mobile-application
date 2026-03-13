import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface TodoStats {
  total: number;
  completed: number;
  overdue: number;
  streak: number;
  totalCR: number;
  level: string;
}

export interface RecentAccessEvent {
  id: string;
  success: boolean;
  userEmail: string;
  method: string;
  timestamp: number;
  location: string;
}

export interface DeviceStatusCache {
  isLocked: boolean;
  batteryLevel: number;
  wifiSignalStrength: number;
}

export interface DailyChallenge {
  title: string;
  target: number;
  current: number;
  rewardCR: number;
  completed: boolean;
}

export interface WebhookEntry {
  timestamp: number;
  eventType: string;
  status: "success" | "error";
  payload: string;
}

interface AppStateCtx {
  todoStats: TodoStats;
  recentAccessEvents: RecentAccessEvent[];
  deviceStatus: DeviceStatusCache;
  dailyChallenge: DailyChallenge;
  soundEnabled: boolean;
  pomodoroActive: boolean;
  pomodoroSecondsLeft: number;
  comboCount: number;
  webhookLog: WebhookEntry[];
  setSoundEnabled: (v: boolean) => void;
  startPomodoro: () => void;
  stopPomodoro: () => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  addWebhookEntry: (entry: Omit<WebhookEntry, "timestamp">) => void;
  updateTodoStats: (stats: Partial<TodoStats>) => void;
  updateDeviceStatus: (status: Partial<DeviceStatusCache>) => void;
  updateRecentEvents: (events: RecentAccessEvent[]) => void;
}

const AppStateContext = createContext<AppStateCtx | null>(null);

function getLevelFromCR(cr: number): string {
  if (cr >= 1000) return "ELITE";
  if (cr >= 500) return "AGENT";
  if (cr >= 100) return "OPERATOR";
  return "ROOKIE";
}

function generateDailyChallenge(dateStr: string): DailyChallenge {
  const seed = dateStr.split("-").reduce((a, b) => a + Number.parseInt(b), 0);
  const challenges = [
    { title: "Complete 3 tasks today", target: 3, rewardCR: 30 },
    { title: "Complete a High priority task", target: 1, rewardCR: 50 },
    { title: "Check the lock status", target: 1, rewardCR: 10 },
    { title: "Complete 5 tasks today", target: 5, rewardCR: 60 },
    { title: "Add 2 new tasks to your list", target: 2, rewardCR: 20 },
    { title: "Complete 2 Medium priority tasks", target: 2, rewardCR: 40 },
    { title: "Log in and review your dashboard", target: 1, rewardCR: 15 },
  ];
  const base = challenges[seed % challenges.length];
  return { ...base, current: 0, completed: false };
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const today = new Date().toISOString().slice(0, 10);

  const [todoStats, setTodoStats] = useState<TodoStats>(() =>
    loadFromStorage("gamification_stats", {
      total: 0,
      completed: 0,
      overdue: 0,
      streak: 0,
      totalCR: 0,
      level: "ROOKIE",
    }),
  );

  const [recentAccessEvents, setRecentAccessEvents] = useState<
    RecentAccessEvent[]
  >(() => loadFromStorage("recent_access_events", []));

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusCache>(() =>
    loadFromStorage("device_status_cache", {
      isLocked: true,
      batteryLevel: 85,
      wifiSignalStrength: 72,
    }),
  );

  const [dailyChallenge, _setDailyChallenge] = useState<DailyChallenge>(() => {
    const saved = loadFromStorage<{
      date: string;
      challenge: DailyChallenge;
    } | null>("daily_challenge", null);
    if (saved && saved.date === today) return saved.challenge;
    return generateDailyChallenge(today);
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() =>
    loadFromStorage("sound_enabled", true),
  );
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(1500);
  const [comboCount, setComboCount] = useState(0);
  const [webhookLog, setWebhookLog] = useState<WebhookEntry[]>(() =>
    loadFromStorage("webhook_log", []),
  );

  const pomodoroInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist changes
  useEffect(() => {
    localStorage.setItem("gamification_stats", JSON.stringify(todoStats));
  }, [todoStats]);
  useEffect(() => {
    localStorage.setItem(
      "recent_access_events",
      JSON.stringify(recentAccessEvents),
    );
  }, [recentAccessEvents]);
  useEffect(() => {
    localStorage.setItem("device_status_cache", JSON.stringify(deviceStatus));
  }, [deviceStatus]);
  useEffect(() => {
    localStorage.setItem(
      "daily_challenge",
      JSON.stringify({ date: today, challenge: dailyChallenge }),
    );
  }, [dailyChallenge, today]);
  useEffect(() => {
    localStorage.setItem("sound_enabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);
  useEffect(() => {
    localStorage.setItem("webhook_log", JSON.stringify(webhookLog));
  }, [webhookLog]);

  const setSoundEnabled = useCallback(
    (v: boolean) => setSoundEnabledState(v),
    [],
  );

  const startPomodoro = useCallback(() => {
    setPomodoroActive(true);
    setPomodoroSecondsLeft(1500);
    pomodoroInterval.current = setInterval(() => {
      setPomodoroSecondsLeft((prev) => {
        if (prev <= 1) {
          if (pomodoroInterval.current) clearInterval(pomodoroInterval.current);
          setPomodoroActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopPomodoro = useCallback(() => {
    if (pomodoroInterval.current) clearInterval(pomodoroInterval.current);
    setPomodoroActive(false);
    setPomodoroSecondsLeft(1500);
  }, []);

  const incrementCombo = useCallback(() => {
    setComboCount((prev) => prev + 1);
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setComboCount(0), 60000);
  }, []);

  const resetCombo = useCallback(() => {
    setComboCount(0);
    if (comboTimer.current) clearTimeout(comboTimer.current);
  }, []);

  const addWebhookEntry = useCallback(
    (entry: Omit<WebhookEntry, "timestamp">) => {
      const newEntry: WebhookEntry = { ...entry, timestamp: Date.now() };
      setWebhookLog((prev) => [newEntry, ...prev].slice(0, 50));
    },
    [],
  );

  const updateTodoStats = useCallback((stats: Partial<TodoStats>) => {
    setTodoStats((prev) => {
      const next = { ...prev, ...stats };
      next.level = getLevelFromCR(next.totalCR);
      return next;
    });
  }, []);

  const updateDeviceStatus = useCallback(
    (status: Partial<DeviceStatusCache>) => {
      setDeviceStatus((prev) => ({ ...prev, ...status }));
    },
    [],
  );

  const updateRecentEvents = useCallback((events: RecentAccessEvent[]) => {
    setRecentAccessEvents(events.slice(0, 5));
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        todoStats,
        recentAccessEvents,
        deviceStatus,
        dailyChallenge,
        soundEnabled,
        pomodoroActive,
        pomodoroSecondsLeft,
        comboCount,
        webhookLog,
        setSoundEnabled,
        startPomodoro,
        stopPomodoro,
        incrementCombo,
        resetCombo,
        addWebhookEntry,
        updateTodoStats,
        updateDeviceStatus,
        updateRecentEvents,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be inside AppStateProvider");
  return ctx;
}
