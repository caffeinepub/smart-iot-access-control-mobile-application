import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef } from "react";

interface Node {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  color: string;
  glowColor: string;
  desc: string;
}

const NODES: Node[] = [
  {
    id: "esp32",
    label: "ESP32 Device",
    icon: "⚙️",
    x: 80,
    y: 50,
    color: "#22c55e",
    glowColor: "rgba(34,197,94,0.4)",
    desc: "Embedded microcontroller controlling the physical lock",
  },
  {
    id: "mqtt",
    label: "MQTT Broker",
    icon: "📡",
    x: 260,
    y: 50,
    color: "#f97316",
    glowColor: "rgba(249,115,22,0.4)",
    desc: "Message queue for real-time IoT event delivery",
  },
  {
    id: "cloud",
    label: "Cloud / Firestore",
    icon: "☁️",
    x: 440,
    y: 50,
    color: "#3b82f6",
    glowColor: "rgba(59,130,246,0.4)",
    desc: "Firebase Firestore stores logs and user data",
  },
  {
    id: "canister",
    label: "Backend Canister",
    icon: "🔮",
    x: 620,
    y: 50,
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.4)",
    desc: "ICP backend canister processes access logic",
  },
  {
    id: "dashboard",
    label: "Dashboard UI",
    icon: "🖥️",
    x: 800,
    y: 50,
    color: "#06b6d4",
    glowColor: "rgba(6,182,212,0.4)",
    desc: "React frontend visualizes real-time data",
  },
];

export default function AnimatedDataFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { theme } = useTheme();
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const scaleX = W / 900;
    const scaleY = H / 160;

    const scaledNodes = NODES.map((n) => ({
      ...n,
      sx: n.x * scaleX,
      sy: n.y * scaleY + H / 2 - 25,
    }));

    const isDark = theme !== "light";
    // const _bgColor = isDark ? "rgba(10,15,25,0)" : "rgba(255,255,255,0)";

    function drawRoundedRect(
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
    ) {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y);
      ctx!.lineTo(x + w - r, y);
      ctx!.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx!.lineTo(x + w, y + h - r);
      ctx!.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx!.lineTo(x + r, y + h);
      ctx!.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx!.lineTo(x, y + r);
      ctx!.quadraticCurveTo(x, y, x + r, y);
      ctx!.closePath();
    }

    function draw(tick: number) {
      ctx!.clearRect(0, 0, W, H);

      // Draw connecting lines
      for (let i = 0; i < scaledNodes.length - 1; i++) {
        const from = scaledNodes[i];
        const to = scaledNodes[i + 1];
        // const _cx = (from.sx + to.sx) / 2;
        // const _cy = (from.sy + to.sy) / 2;

        // Dashed line
        ctx!.save();
        ctx!.strokeStyle = isDark
          ? "rgba(255,255,255,0.15)"
          : "rgba(0,0,0,0.15)";
        ctx!.lineWidth = 2;
        ctx!.setLineDash([6, 4]);
        ctx!.lineDashOffset = -(tick * 0.5);
        ctx!.beginPath();
        ctx!.moveTo(from.sx + 55, from.sy + 25);
        ctx!.lineTo(to.sx - 5, to.sy + 25);
        ctx!.stroke();
        ctx!.restore();

        // Animated packet
        const t = (tick * 0.008) % 1;
        const px = from.sx + 55 + (to.sx - 5 - (from.sx + 55)) * t;
        const py = from.sy + 25 + (to.sy + 25 - (from.sy + 25)) * t;
        ctx!.save();
        ctx!.beginPath();
        ctx!.arc(px, py, 4, 0, Math.PI * 2);
        ctx!.fillStyle = from.color;
        ctx!.shadowColor = from.glowColor;
        ctx!.shadowBlur = 12;
        ctx!.fill();
        ctx!.restore();
      }

      // Draw nodes
      for (const node of scaledNodes) {
        const nodeW = 100 * scaleX;
        const nodeH = 50;
        const nx = node.sx - nodeW / 2 + 5;
        const ny = node.sy;

        // Glow
        ctx!.save();
        ctx!.shadowColor = node.glowColor;
        ctx!.shadowBlur = 20 + Math.sin(tick * 0.05) * 5;
        drawRoundedRect(nx, ny, nodeW, nodeH, 8);
        const grad = ctx!.createLinearGradient(nx, ny, nx, ny + nodeH);
        grad.addColorStop(
          0,
          isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        );
        grad.addColorStop(
          1,
          isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        );
        ctx!.fillStyle = grad;
        ctx!.fill();
        ctx!.strokeStyle = node.color;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.restore();

        // Icon + label
        ctx!.font = `${Math.max(16, 18 * scaleX)}px serif`;
        ctx!.textAlign = "center";
        ctx!.fillText(node.icon, node.sx + 5, ny + 22);
        ctx!.font = `bold ${Math.max(8, 9 * scaleX)}px monospace`;
        ctx!.fillStyle = node.color;
        ctx!.textAlign = "center";
        ctx!.fillText(node.label.toUpperCase(), node.sx + 5, ny + 38);
      }
    }

    function loop() {
      tickRef.current++;
      draw(tickRef.current);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [theme]);

  return (
    <div data-ocid="architecture.canvas_target" className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ height: "160px" }}
      />
      {/* Node Descriptions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
        {NODES.map((node) => (
          <div
            key={node.id}
            className="flex flex-col gap-1 p-3 rounded-lg border bg-card/50"
            style={{ borderColor: `${node.color}40` }}
          >
            <span className="text-lg">{node.icon}</span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: node.color }}
            >
              {node.label}
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {node.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
