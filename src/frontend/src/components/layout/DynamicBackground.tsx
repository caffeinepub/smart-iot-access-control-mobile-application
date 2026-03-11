import { type Theme, useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef } from "react";

type PatternConfig = {
  type: "particles" | "grid" | "hexagons" | "waves" | "matrix" | "bubbles";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  count: number;
  speed: number;
};

const THEME_PATTERNS: Record<Theme, PatternConfig> = {
  dark: {
    type: "particles",
    primaryColor: "220 70% 60%",
    secondaryColor: "220 50% 40%",
    accentColor: "200 80% 55%",
    count: 80,
    speed: 0.4,
  },
  light: {
    type: "grid",
    primaryColor: "220 60% 50%",
    secondaryColor: "200 50% 60%",
    accentColor: "240 70% 65%",
    count: 0,
    speed: 0.3,
  },
  amber: {
    type: "bubbles",
    primaryColor: "38 90% 55%",
    secondaryColor: "30 80% 50%",
    accentColor: "45 95% 60%",
    count: 60,
    speed: 0.35,
  },
  cyberpunk: {
    type: "matrix",
    primaryColor: "120 100% 50%",
    secondaryColor: "300 100% 55%",
    accentColor: "180 100% 50%",
    count: 50,
    speed: 1.2,
  },
  midnight: {
    type: "waves",
    primaryColor: "250 60% 50%",
    secondaryColor: "270 50% 45%",
    accentColor: "230 80% 60%",
    count: 5,
    speed: 0.5,
  },
  ocean: {
    type: "hexagons",
    primaryColor: "195 80% 50%",
    secondaryColor: "210 70% 45%",
    accentColor: "175 85% 55%",
    count: 30,
    speed: 0.3,
  },
};

export default function DynamicBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = THEME_PATTERNS[theme] ?? THEME_PATTERNS.dark;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    cancelAnimationFrame(animationRef.current);

    // ── PARTICLES (dark) ──────────────────────────────────────────────────
    if (config.type === "particles") {
      interface P {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        color: string;
        opacity: number;
      }
      const colors = [
        config.primaryColor,
        config.secondaryColor,
        config.accentColor,
      ];
      const pts: P[] = Array.from({ length: config.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        r: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.15,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of pts) {
          p.x = (p.x + p.vx + canvas.width) % canvas.width;
          p.y = (p.y + p.vy + canvas.height) % canvas.height;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${p.color} / ${p.opacity})`;
          ctx.fill();
        }
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `hsl(${config.primaryColor} / ${0.12 * (1 - d / 110)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── GRID (light) ──────────────────────────────────────────────────────
    else if (config.type === "grid") {
      let offset = 0;
      const cellSize = 40;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        offset = (offset + 0.2) % cellSize;
        ctx.strokeStyle = `hsl(${config.primaryColor} / 0.12)`;
        ctx.lineWidth = 0.8;
        for (
          let x = -cellSize + offset;
          x < canvas.width + cellSize;
          x += cellSize
        ) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (
          let y = -cellSize + offset;
          y < canvas.height + cellSize;
          y += cellSize
        ) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.fillStyle = `hsl(${config.accentColor} / 0.3)`;
        for (
          let x = -cellSize + offset;
          x < canvas.width + cellSize;
          x += cellSize
        ) {
          for (
            let y = -cellSize + offset;
            y < canvas.height + cellSize;
            y += cellSize
          ) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── BUBBLES (amber) ───────────────────────────────────────────────────
    else if (config.type === "bubbles") {
      interface B {
        x: number;
        y: number;
        r: number;
        vy: number;
        opacity: number;
        color: string;
        phase: number;
      }
      const colors = [
        config.primaryColor,
        config.secondaryColor,
        config.accentColor,
      ];
      const bubbles: B[] = Array.from({ length: config.count }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * canvas.height,
        r: Math.random() * 18 + 4,
        vy: -(Math.random() * config.speed + 0.2),
        opacity: Math.random() * 0.25 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const b of bubbles) {
          b.y += b.vy;
          b.x += Math.sin(b.phase + b.y * 0.01) * 0.4;
          if (b.y + b.r < 0) {
            b.y = canvas.height + b.r;
            b.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsl(${b.color} / ${b.opacity * 1.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          const grad = ctx.createRadialGradient(
            b.x - b.r * 0.3,
            b.y - b.r * 0.3,
            0,
            b.x,
            b.y,
            b.r,
          );
          grad.addColorStop(0, `hsl(${b.color} / ${b.opacity})`);
          grad.addColorStop(1, `hsl(${b.color} / 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── MATRIX (cyberpunk) ────────────────────────────────────────────────
    else if (config.type === "matrix") {
      const cols = Math.floor(canvas.width / 18);
      const drops = Array.from(
        { length: cols },
        () => (Math.random() * -canvas.height) / 14,
      );
      const chars = "01アイウエオカキクケコサシスセソABCDEF0123456789";
      const draw = () => {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "13px monospace";
        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * 18;
          ctx.fillStyle = `hsl(${config.accentColor} / 0.9)`;
          ctx.fillText(char, x, drops[i] * 14);
          ctx.fillStyle = `hsl(${config.primaryColor} / 0.45)`;
          ctx.fillText(
            chars[Math.floor(Math.random() * chars.length)],
            x,
            (drops[i] - 1) * 14,
          );
          if (drops[i] * 14 > canvas.height && Math.random() > 0.975)
            drops[i] = 0;
          drops[i] += config.speed * 0.8;
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── WAVES (midnight) ──────────────────────────────────────────────────
    else if (config.type === "waves") {
      let t = 0;
      const waveCount = 6;
      const waveColors = [
        config.primaryColor,
        config.secondaryColor,
        config.accentColor,
      ];
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let w = 0; w < waveCount; w++) {
          const amp = 30 + w * 12;
          const freq = 0.004 + w * 0.0008;
          const spd = config.speed * (0.5 + w * 0.15);
          const yBase = canvas.height * (0.3 + w * 0.08);
          const col = waveColors[w % waveColors.length];
          ctx.beginPath();
          ctx.moveTo(0, yBase);
          for (let x = 0; x <= canvas.width; x += 4) {
            const y =
              yBase +
              Math.sin(x * freq + t * spd) * amp +
              Math.sin(x * freq * 2 - t * spd * 0.7) * (amp * 0.4);
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `hsl(${col} / ${0.18 - w * 0.02})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        t += 1;
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ── HEXAGONS (ocean) ──────────────────────────────────────────────────
    else if (config.type === "hexagons") {
      let t = 0;
      const size = 36;
      const hw = size * 2;
      const hh = Math.sqrt(3) * size;
      const hexColors = [
        config.primaryColor,
        config.secondaryColor,
        config.accentColor,
      ];
      interface Hex {
        col: number;
        row: number;
        phase: number;
      }
      const hexes: Hex[] = [];
      for (let c = -1; c < Math.ceil(canvas.width / (hw * 0.75)) + 2; c++) {
        for (let r = -1; r < Math.ceil(canvas.height / hh) + 2; r++) {
          hexes.push({ col: c, row: r, phase: Math.random() * Math.PI * 2 });
        }
      }
      const drawHex = (
        cx: number,
        cy: number,
        s: number,
        fill: string,
        stroke: string,
      ) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx + s * Math.cos(angle);
          const py = cy + s * Math.sin(angle);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      };
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const { col, row, phase } of hexes) {
          const cx = col * hw * 0.75;
          const cy = row * hh + (col % 2 === 0 ? 0 : hh / 2);
          const pulse = (Math.sin(t * 0.02 + phase) + 1) / 2;
          const hcol =
            hexColors[(col + row + hexColors.length * 10) % hexColors.length];
          drawHex(
            cx,
            cy,
            size - 2,
            `hsl(${hcol} / ${0.04 + pulse * 0.08})`,
            `hsl(${hcol} / ${0.15 + pulse * 0.1})`,
          );
        }
        t++;
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.75 }}
    />
  );
}
