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
      "Hello! I'm ARIA — your AI assistant for this Smart IoT Access Control system. I can help you navigate the dashboard, understand device status, manage tasks, earn credits, and suggest improvements. What would you like to know?",
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
      "Device health metrics (RAM usage, temperature, uptime) are shown in the Device Health Panel on the Dashboard. If RAM drops below 20KB, consider restarting the ESP32. Firmware updates can be triggered from the Firmware Update Panel — always test updates on a non-critical device first.",
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
      "to-do",
      "list",
      "productivity",
      "timer",
      "subtask",
    ],
    response:
      "The To-Do List supports categories, priority levels, due dates, subtasks, and drag-and-drop reordering. Each task has a built-in timer — start it to track completion time and earn bonus CR. Complete tasks before their deadline to maximize your credit score.",
  },
  {
    keywords: [
      "credit",
      "cr",
      "level",
      "rookie",
      "elite",
      "reward",
      "points",
      "badge",
    ],
    response:
      "The Credit (CR) system rewards you for completing tasks. Your level progresses from ROOKIE → CADET → AGENT → SPECIALIST → ELITE. Completing tasks on time earns base CR; finishing before the timer runs out gives bonus CR. Watch for animated CR bursts — those are milestone rewards!",
  },
  {
    keywords: ["streak", "gamification", "achievement", "combo"],
    response:
      "Streaks are built by completing at least one task per day. A longer streak multiplies your daily CR gain. Completing multiple tasks in a row triggers a Combo Bonus. Check the Gamification Panel on the To-Do page to track your current streak, badges, and level progress.",
  },
  {
    keywords: [
      "theme",
      "background",
      "dark",
      "light",
      "cyberpunk",
      "midnight",
      "ocean",
      "amber",
      "color",
    ],
    response:
      "There are 6 live animated themes: Dark (Quantum Neural Web), Light (Aurora Prism), Amber (Solar Plasma), Cyberpunk (Holo-Grid Glitch), Midnight (Cosmic Nebula), and Ocean (Bioluminescent Abyss). Switch themes from the Settings page or the theme toggle in the header.",
  },
  {
    keywords: [
      "admin",
      "dashboard",
      "monitor",
      "manage",
      "credential",
      "gated",
    ],
    response:
      "The Admin Dashboard is credential-gated (email: aahanvarma42@gmail.com). It provides a system-wide view of task activity, user logs, and access stats. Only the admin can view and delete any user's tasks. Use this to monitor productivity and security from a single pane.",
  },
  {
    keywords: ["security", "intrusion", "alert", "tamper", "protect", "safe"],
    response:
      "Security features include: intrusion detection alerts, tamper-proof access logs, auto-logout after inactivity, role-based access control, and admin-only dashboard access. Tip: enable 2FA from Settings for an extra layer of protection. Review the Intrusion Alerts Panel daily.",
  },
  {
    keywords: ["setting", "configure", "setup", "wifi", "mqtt", "ip"],
    response:
      "The Settings page lets you configure ESP32 IP/API endpoint, MQTT broker, notification preferences, theme, and security options like 2FA and auto-logout. Make sure the device IP matches your ESP32's local network address. MQTT is recommended for faster, event-driven communication.",
  },
  {
    keywords: ["notification", "alert", "remind", "bell"],
    response:
      "Notifications appear in the bell icon in the header. You'll receive alerts for: door access events, intrusion attempts, task due dates, and device health warnings. Click any notification to navigate to the relevant section. Tip: don't dismiss intrusion alerts without reviewing them first.",
  },
  {
    keywords: [
      "architecture",
      "iot",
      "diagram",
      "flow",
      "pipeline",
      "mqtt",
      "firebase",
    ],
    response:
      "The IoT Architecture view (in Reports) shows the full data pipeline: ESP32 → REST/MQTT → Frontend → Firebase Firestore. Events flow in real-time using Firebase's live listener. The animated data flow diagram visualizes this pipeline and is great for academic presentations (viva).",
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
    response: `Here are my top improvement suggestions for your system:

🔒 **Security**: Add geo-fencing simulation to auto-unlock when your device is nearby.
📊 **Analytics**: Set up webhook forwarding to receive alerts on external platforms.
✅ **Productivity**: Implement a Pomodoro timer with 2x CR multiplier for focus sessions.
🎮 **Gamification**: Add a Daily Challenge system with bonus missions and CR rewards.
🛒 **Store**: Create a CR Spending Store to redeem credits for theme unlocks or badges.
📡 **IoT**: Animate the data flow pipeline in real-time to visualize live MQTT events.
🔔 **Alerts**: Add emergency contact simulation to notify on critical intrusion events.`,
  },
  {
    keywords: ["wokwi", "simulation", "academic", "viva", "project", "present"],
    response:
      "This system uses Wokwi to simulate ESP32 hardware for academic validation. During a viva, highlight the modular architecture (separate components for devices, users, events, analytics), the real-time Firebase sync, and the MQTT communication pattern. The IoT Architecture diagram is a strong visual aid.",
  },
  {
    keywords: ["vacation", "holiday", "lockdown", "emergency"],
    response:
      "Vacation/Holiday Lockdown mode can be toggled from the User Management section to restrict all non-admin access during a specified period. Emergency contacts can be configured in Settings > Emergency Contacts to receive alerts for critical security events.",
  },
  {
    keywords: ["tip", "help", "how", "what", "guide", "explain"],
    response:
      "I can help you with: \n• Lock/unlock device control\n• User and access management\n• Event monitoring and audit logs\n• Device health and firmware\n• Analytics and reports\n• To-Do list and gamification\n• Credits and level system\n• Themes and backgrounds\n• Security and settings\n\nJust ask me anything about the system!",
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
    { label: "How to earn CR?", query: "How does the credit system work?" },
    { label: "Level system", query: "Tell me about levels and badges" },
    { label: "Task timer tips", query: "How do task timers help me?" },
  ],
  "/reports": [
    { label: "Read the heatmap", query: "How do I use the access heatmap?" },
    { label: "IoT architecture", query: "Explain the IoT architecture" },
    { label: "Analytics tips", query: "Give me analytics tips" },
  ],
  "/settings": [
    { label: "Configure ESP32", query: "How do I configure the ESP32 IP?" },
    { label: "Enable 2FA", query: "How do I enable 2FA security?" },
    { label: "Theme help", query: "Tell me about the different themes" },
  ],
  "/admin-dashboard": [
    { label: "Admin features", query: "What can I do in the admin dashboard?" },
    { label: "Monitor users", query: "How do I monitor user activity?" },
    { label: "Improvement ideas", query: "Suggest improvements for my system" },
  ],
};

const DEFAULT_CHIPS: SuggestionChip[] = [
  { label: "What can you do?", query: "What can you help me with?" },
  {
    label: "Suggest improvements",
    query: "Suggest improvements for my system",
  },
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

  const chips = PAGE_CHIPS[location.pathname] ?? DEFAULT_CHIPS;

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, minimized]);

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
      600 + Math.random() * 600,
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage(input);
  }

  const accentColor =
    theme === "cyberpunk"
      ? "#ff00ff"
      : theme === "midnight"
        ? "#6c63ff"
        : theme === "ocean"
          ? "#00e5ff"
          : theme === "amber"
            ? "#f59e0b"
            : theme === "light"
              ? "#6366f1"
              : "#00ff88";

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          type="button"
          data-ocid="ai_assistant.open_modal_button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 20px ${accentColor}55, 0 0 40px ${accentColor}22`,
          }}
          title="Open AI Assistant"
        >
          <span className="text-2xl">🤖</span>
          <span
            className="absolute top-0 right-0 w-3 h-3 rounded-full animate-pulse"
            style={{ background: accentColor }}
          />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          data-ocid="ai_assistant.panel"
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            width: "360px",
            height: minimized ? "56px" : "520px",
            background: "rgba(10, 10, 20, 0.97)",
            border: `1px solid ${accentColor}55`,
            boxShadow: `0 0 30px ${accentColor}33, 0 8px 32px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Header */}
          <button
            type="button"
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer w-full text-left"
            style={{
              background: `linear-gradient(90deg, ${accentColor}22, transparent)`,
              borderBottom: minimized ? "none" : `1px solid ${accentColor}33`,
            }}
            onClick={() => setMinimized((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p
                  className="text-xs font-bold font-mono"
                  style={{ color: accentColor }}
                >
                  ARIA
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  AI Assistant • Online
                </p>
              </div>
              <span
                className="ml-1 w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                style={{ background: accentColor }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="ai_assistant.toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((v) => !v);
                }}
                className="text-gray-400 hover:text-white text-lg leading-none px-1"
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? "▲" : "▼"}
              </button>
              <button
                type="button"
                data-ocid="ai_assistant.close_button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  setMinimized(false);
                }}
                className="text-gray-400 hover:text-red-400 text-lg leading-none px-1"
                title="Close"
              >
                ✕
              </button>
            </div>
          </button>

          {!minimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
                style={{ scrollbarWidth: "thin" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="mr-2 mt-1 text-sm flex-shrink-0">
                        🤖
                      </span>
                    )}
                    <div
                      className="max-w-[80%] rounded-xl px-3 py-2 text-xs font-mono leading-relaxed whitespace-pre-wrap"
                      style={
                        msg.role === "user"
                          ? {
                              background: `${accentColor}22`,
                              border: `1px solid ${accentColor}44`,
                              color: "#e0e0e0",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#c8c8d0",
                            }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <span className="mr-2 mt-1 text-sm">🤖</span>
                    <div
                      className="rounded-xl px-4 py-3 text-xs font-mono"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: accentColor,
                      }}
                    >
                      <span className="animate-pulse">● ● ●</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
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
                  className="flex-1 bg-transparent text-xs font-mono text-gray-200 placeholder-gray-500 outline-none px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${accentColor}33`,
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
                    ▶
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
