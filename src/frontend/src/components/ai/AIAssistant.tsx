import { useAppState } from "@/contexts/AppStateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
};

type SuggestionChip = {
  label: string;
  query: string;
};

const IMPROVEMENT_TIPS = [
  "Schedule regular firmware updates during off-peak hours to minimize disruption.",
  "Enable intrusion alerts with a secondary notification email for critical events.",
  "Use the Pomodoro-style task timer in To-Do to boost focus and earn bonus CR.",
  "Set recurring access windows for trusted users instead of permanent access.",
  "Review the peak-hours heatmap weekly to optimize lock scheduling.",
  "Add subtasks to break complex projects into smaller, credit-rewarding steps.",
  "Use the Cyberpunk theme for late-night monitoring sessions – easier on the eyes.",
  "Check device memory health weekly; ESP32 RAM below 20% can cause instability.",
  "Use task priority levels (High/Medium/Low) to focus on critical items first.",
  "Export access logs monthly for compliance and audit trail documentation.",
];

const KB: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["hello", "hi", "hey", "greet", "start"],
    response:
      "Hello! I'm ARIA \u2014 your AI assistant for this Smart IoT Access Control system. I can help you navigate the dashboard, understand device status, manage tasks, earn credits, and suggest improvements. What would you like to know?",
  },
  {
    keywords: ["lock", "unlock", "door", "control", "esp32", "device"],
    response:
      "The Lock/Unlock control is on the main Dashboard. Click LOCK or UNLOCK to send a command to your ESP32 device. The system communicates via REST API (`/control` endpoint). Real-time status is polled from `/status`. Make sure your ESP32 IP is configured in Settings for reliable connection.",
  },
  {
    keywords: [
      "user",
      "add user",
      "remove user",
      "access",
      "rfid",
      "credential",
    ],
    response:
      "Go to User Management to add or remove users. Each user can be assigned an RFID UID and an access role (admin/user/guest). You can also set timed access windows so a user only has access during specific hours. Tip: regularly audit user list to revoke access for inactive members.",
  },
  {
    keywords: ["log", "event", "history", "audit", "activity", "monitor"],
    response:
      "The Event Monitoring page shows a full tamper-proof access log with timestamps, user IDs, and door states. Use the search and filter tools to find specific events. Logs are stored in Firebase Firestore for real-time sync. I recommend reviewing failed access attempts daily for security.",
  },
  {
    keywords: ["health", "memory", "uptime", "temperature", "cpu", "firmware"],
    response:
      "Device health metrics (RAM usage, temperature, uptime) are shown in the Device Health Panel on the Dashboard. If RAM drops below 20KB, consider restarting the ESP32. Firmware updates can be triggered from the Firmware Update Panel \u2014 always test updates on a non-critical device first.",
  },
  {
    keywords: [
      "analytics",
      "chart",
      "heatmap",
      "statistics",
      "trend",
      "report",
    ],
    response:
      "The Reports page has advanced analytics: access frequency charts, failed attempt tracking, peak-hours heatmap, and weekly stats. Use the heatmap to identify unusual access patterns, which may indicate a security concern. Tip: set threshold alerts if failed attempts exceed 5 per hour.",
  },
  {
    keywords: [
      "todo",
      "task",
      "credit",
      "cr",
      "gamification",
      "level",
      "streak",
      "badge",
    ],
    response:
      "The To-Do list has a full gamification system! Complete tasks to earn CR (credits): High priority = 30 CR, Medium = 20 CR, Low = 10 CR. Use the Pomodoro timer for 2x CR bonus. Your level progresses from ROOKIE \u2192 OPERATOR \u2192 AGENT \u2192 ELITE. Keep your daily streak alive for bonus rewards!",
  },
  {
    keywords: ["pomodoro", "focus", "timer", "session"],
    response:
      "The Pomodoro timer is in the To-Do list sidebar. Start a 25-minute focus session to activate 2x CR multiplier. All tasks completed during the session earn double credits! On session completion, you get a +50 bonus CR reward.",
  },
  {
    keywords: ["combo", "chain", "streak", "bonus"],
    response:
      "The Combo system rewards rapid task completion! Complete 2+ tasks within 60 seconds of each other to trigger a COMBO bonus. The combo counter shows near the task list. Higher combos give bigger visual effects!",
  },
  {
    keywords: [
      "store",
      "shop",
      "spend",
      "buy",
      "item",
      "badge",
      "theme",
      "unlock",
    ],
    response:
      'The CR Store lets you spend earned credits on special items: Cyberpunk Badge (50 CR), Elite Theme Unlock (100 CR), Double CR Day (75 CR), Custom Avatar Frame (30 CR). Access it via the "CR Store" button in the To-Do list.',
  },
  {
    keywords: ["challenge", "daily", "mission", "quest"],
    response:
      'Daily Challenges appear on the Dashboard and To-Do list. Complete the challenge for a bonus CR reward. Challenges refresh daily (e.g., "Complete 3 tasks", "Complete a High priority task"). Track progress on the Dashboard\'s challenge widget.',
  },
  {
    keywords: ["architecture", "iot", "pipeline", "mqtt", "firebase"],
    response:
      "The IoT Architecture page shows the full data pipeline: ESP32 \u2192 MQTT \u2192 Cloud/Firestore \u2192 Backend Canister \u2192 Dashboard UI. Events flow in real-time using Firebase's live listener. The animated data flow diagram visualizes this pipeline and is great for academic presentations (viva).",
  },
  {
    keywords: [
      "improve",
      "suggest",
      "feature",
      "enhance",
      "upgrade",
      "next",
      "add",
      "recommend",
    ],
    response:
      "Here are my top improvement suggestions for your system:\n\n** Security**: Add geo-fencing simulation to auto-unlock when your device is nearby.\n**Analytics**: Set up webhook forwarding to receive alerts on external platforms.\n**Productivity**: Use the Pomodoro timer with 2x CR multiplier for focus sessions.\n**Gamification**: Complete the Daily Challenge for bonus CR each day.\n**Store**: Spend earned CR in the CR Store for badges and theme unlocks.\n**IoT**: Check the Architecture page for a live animated IoT data flow visualization.\n**Alerts**: Configure emergency contacts for critical intrusion event notifications.",
  },
  {
    keywords: ["wokwi", "simulation", "academic", "viva", "project", "present"],
    response:
      "This system uses Wokwi to simulate ESP32 hardware for academic validation. During a viva, highlight the modular architecture (separate components for devices, users, events, analytics), the real-time Firebase sync, and the MQTT communication pattern. The IoT Architecture diagram is a strong visual aid.",
  },
  {
    keywords: ["tip", "help", "how", "what", "guide", "explain"],
    response:
      "I can help you with: \n\u2022 Lock/unlock device control\n\u2022 User and access management\n\u2022 Event monitoring and audit logs\n\u2022 Device health and firmware\n\u2022 Analytics and reports\n\u2022 To-Do list and gamification\n\u2022 Credits, combos, and Pomodoro\n\u2022 Themes and backgrounds\n\u2022 Security and settings\n\nJust ask me anything about the system!",
  },
];

const PAGE_CHIPS: Record<string, SuggestionChip[]> = {
  "/": [
    {
      label: "How do I lock/unlock?",
      query: "How do I lock or unlock the door?",
    },
    { label: "Device health tips", query: "Tell me about device health" },
    { label: "Improve my setup", query: "Suggest improvements for my system" },
  ],
  "/events": [
    { label: "How to read logs?", query: "How do I read the access logs?" },
    {
      label: "Security alerts",
      query: "Tell me about security and intrusion alerts",
    },
    { label: "Export logs", query: "How do I export access logs?" },
  ],
  "/users": [
    { label: "Add a user", query: "How do I add a new user?" },
    { label: "RFID setup", query: "How does RFID access work?" },
    { label: "Access windows", query: "How do timed access windows work?" },
  ],
  "/todos": [
    { label: "How to earn CR?", query: "How do I earn credits?" },
    { label: "Pomodoro tips", query: "Tell me about the Pomodoro timer" },
    { label: "CR Store", query: "What can I buy in the CR store?" },
  ],
  "/reports": [
    { label: "Reading heatmap", query: "How do I read the access heatmap?" },
    { label: "Export reports", query: "How do I export reports?" },
    { label: "Security tips", query: "Give me security tips" },
  ],
  "/architecture": [
    { label: "IoT pipeline", query: "Explain the IoT data pipeline" },
    { label: "MQTT vs REST", query: "What is MQTT and how is it used?" },
    {
      label: "Security layers",
      query: "What security layers does this system have?",
    },
  ],
};

const DEFAULT_CHIPS: SuggestionChip[] = [
  { label: "What can you help with?", query: "What can you help me with?" },
  { label: "Improvement tips", query: "Suggest improvements for my system" },
  { label: "Security tips", query: "Give me security tips" },
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  const tip =
    IMPROVEMENT_TIPS[Math.floor(Math.random() * IMPROVEMENT_TIPS.length)];
  return `I'm not sure about that specific query, but here's a useful tip: ${tip}\n\nTry asking about: lock control, user management, analytics, to-do list, credit system, themes, or security.`;
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm ARIA, your AI assistant. I can help you with device control, user management, analytics, tasks, credits, and more. Ask me anything or pick a suggestion below!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const location = useLocation();
  const { todoStats, dailyChallenge } = useAppState();

  const contextChips: SuggestionChip[] = [];
  if (todoStats.overdue > 0) {
    contextChips.push({
      label: `${todoStats.overdue} overdue tasks`,
      query: `I have ${todoStats.overdue} overdue tasks. How should I prioritize them?`,
    });
  }
  if (todoStats.streak > 0) {
    contextChips.push({
      label: `${todoStats.streak}-day streak - keep it going`,
      query: `How can I keep my ${todoStats.streak}-day streak going? Should I start a Pomodoro session?`,
    });
  }
  if (!dailyChallenge.completed) {
    contextChips.push({
      label: `Daily challenge: +${dailyChallenge.rewardCR} CR`,
      query: `How can I complete today's challenge: "${dailyChallenge.title}"?`,
    });
  }

  const pageChips = PAGE_CHIPS[location.pathname] ?? DEFAULT_CHIPS;
  const chips = [...contextChips, ...pageChips].slice(0, 5);

  const accentColor =
    theme === "cyberpunk"
      ? "#ff00ff"
      : theme === "ocean"
        ? "#00bfff"
        : theme === "amber"
          ? "#ffb300"
          : theme === "midnight"
            ? "#8b5cf6"
            : theme === "light"
              ? "#2563eb"
              : "#00d4ff";

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, minimized]);

  useEffect(() => {
    if (messages.length > 1 && open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        const resp = getResponse(text);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: resp,
            timestamp: new Date(),
          },
        ]);
        setTyping(false);
      },
      600 + Math.random() * 500,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage(input);
  }

  const floatBg =
    theme === "light" ? "rgba(255,255,255,0.97)" : "rgba(8,12,24,0.97)";

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          type="button"
          data-ocid="ai_assistant.button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${accentColor}33 0%, ${accentColor}66 100%)`,
            border: `1.5px solid ${accentColor}88`,
            boxShadow: `0 0 24px ${accentColor}44`,
          }}
          aria-label="Open AI assistant"
        >
          <span className="text-xl">ARIA</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          data-ocid="ai_assistant.dialog"
          className="fixed bottom-6 right-6 z-50 rounded-2xl flex flex-col overflow-hidden"
          style={{
            width: 340,
            height: minimized ? 52 : 480,
            background: floatBg,
            border: `1.5px solid ${accentColor}44`,
            boxShadow: `0 0 40px ${accentColor}22, 0 8px 32px rgba(0,0,0,0.4)`,
            transition: "height 0.2s ease",
          }}
        >
          {/* Header */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0 cursor-pointer select-none w-full text-left"
            style={{
              borderBottom: minimized ? "none" : `1px solid ${accentColor}22`,
              background: `linear-gradient(90deg, ${accentColor}11 0%, transparent 100%)`,
            }}
            onClick={() => setMinimized((v) => !v)}
            aria-label={minimized ? "Expand assistant" : "Minimize assistant"}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `${accentColor}33`,
                border: `1px solid ${accentColor}66`,
                color: accentColor,
              }}
            >
              A
            </div>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: accentColor }}
            >
              ARIA
            </span>
            <span className="text-[9px] font-mono opacity-60 ml-1">
              AI Assistant
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                data-ocid="ai_assistant.close_button"
                className="text-xs opacity-60 hover:opacity-100 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                aria-label="Close assistant"
              >
                X
              </button>
            </div>
          </button>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line"
                      style={{
                        background:
                          msg.role === "user"
                            ? `${accentColor}22`
                            : "rgba(255,255,255,0.05)",
                        border:
                          msg.role === "user"
                            ? `1px solid ${accentColor}44`
                            : "1px solid rgba(255,255,255,0.08)",
                        color:
                          msg.role === "user"
                            ? accentColor
                            : theme === "light"
                              ? "#334155"
                              : "#cbd5e1",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-xl px-3 py-2 text-xs"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: accentColor,
                      }}
                    >
                      <span className="animate-pulse">ARIA is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Context Suggestion Chips */}
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {chips.map((chip) => (
                  <button
                    type="button"
                    data-ocid="ai_assistant.secondary_button"
                    key={chip.label}
                    onClick={() => sendMessage(chip.query)}
                    className="text-[10px] font-mono px-2 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: `${accentColor}15`,
                      border: `1px solid ${accentColor}44`,
                      color: accentColor,
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div
                className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
                style={{ borderTop: `1px solid ${accentColor}22` }}
              >
                <input
                  data-ocid="ai_assistant.input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-xs font-mono placeholder-gray-500 outline-none px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${accentColor}33`,
                    color: theme === "light" ? "#334155" : "#cbd5e1",
                  }}
                />
                <button
                  type="button"
                  data-ocid="ai_assistant.submit_button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || typing}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
                  style={{
                    background: `${accentColor}33`,
                    border: `1px solid ${accentColor}66`,
                  }}
                >
                  <span className="text-sm" style={{ color: accentColor }}>
                    &gt;
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
