import { type Theme, useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef } from "react";

export default function DynamicBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    cancelAnimationFrame(animRef.current);

    // ─────────────────────────────────────────────────────────────────────
    // DARK — Quantum Neural Web
    // 3D-depth particle nodes, glowing synaptic connections, electric arcs
    // ─────────────────────────────────────────────────────────────────────
    if (theme === "dark") {
      interface Node {
        x: number;
        y: number;
        z: number;
        vx: number;
        vy: number;
        vz: number;
        r: number;
        baseR: number;
        hue: number;
        pulse: number;
        pulseSpeed: number;
        energy: number;
      }
      const W = () => canvas.width;
      const H = () => canvas.height;
      const COUNT = 90;
      const nodes: Node[] = Array.from({ length: COUNT }, () => ({
        x: Math.random() * 1400 - 200,
        y: Math.random() * 900 - 100,
        z: Math.random() * 600 + 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.3,
        r: 0,
        baseR: Math.random() * 3 + 1.5,
        hue: Math.random() * 80 + 190,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.01,
        energy: 0,
      }));

      let arcTimer = 0;
      let arcSrc = -1;
      let arcDst = -1;
      let arcLife = 0;

      const project = (n: Node) => {
        const fov = 500;
        const scale = fov / (fov + n.z);
        return {
          sx: n.x * scale + W() / 2,
          sy: n.y * scale + H() / 2,
          scale,
        };
      };

      const draw = () => {
        ctx.clearRect(0, 0, W(), H());
        arcTimer++;
        if (arcTimer > 90 && Math.random() < 0.03) {
          arcSrc = Math.floor(Math.random() * COUNT);
          arcDst = Math.floor(Math.random() * COUNT);
          arcLife = 30;
          arcTimer = 0;
          nodes[arcSrc].energy = 1;
        }
        if (arcLife > 0) arcLife--;

        for (const n of nodes) {
          n.pulse += n.pulseSpeed;
          n.energy *= 0.96;
          const { x: mx, y: my } = mouseRef.current;
          const p = project(n);
          const dx = mx - p.sx;
          const dy = my - p.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            n.vx += (dx / dist) * 0.004;
            n.vy += (dy / dist) * 0.004;
          }
          n.vx *= 0.995;
          n.vy *= 0.995;
          n.vz *= 0.995;
          n.x += n.vx;
          n.y += n.vy;
          n.z += n.vz;
          if (n.x < -300 || n.x > 1700) n.vx *= -1;
          if (n.y < -200 || n.y > 1100) n.vy *= -1;
          if (n.z < 50 || n.z > 800) n.vz *= -1;
          n.r = n.baseR * (500 / (500 + n.z)) * (1 + 0.3 * Math.sin(n.pulse));
        }

        // connections
        for (let i = 0; i < COUNT; i++) {
          const pi = project(nodes[i]);
          for (let j = i + 1; j < COUNT; j++) {
            const pj = project(nodes[j]);
            const dx = pi.sx - pj.sx;
            const dy = pi.sy - pj.sy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 130) {
              const alpha =
                (1 - d / 130) * 0.25 * Math.min(pi.scale, pj.scale) * 4;
              const hue = (nodes[i].hue + nodes[j].hue) / 2;
              ctx.beginPath();
              ctx.moveTo(pi.sx, pi.sy);
              ctx.lineTo(pj.sx, pj.sy);
              ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
              ctx.lineWidth = pi.scale * 1.2;
              ctx.stroke();
            }
          }
        }

        // electric arc
        if (arcLife > 0 && arcSrc >= 0 && arcDst >= 0) {
          const ps = project(nodes[arcSrc]);
          const pd = project(nodes[arcDst]);
          ctx.save();
          ctx.shadowColor = "#00ffff";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(ps.sx, ps.sy);
          const segs = 8;
          for (let s = 1; s <= segs; s++) {
            const t = s / segs;
            const ex =
              ps.sx +
              (pd.sx - ps.sx) * t +
              (Math.random() - 0.5) * 40 * Math.sin(t * Math.PI);
            const ey =
              ps.sy +
              (pd.sy - ps.sy) * t +
              (Math.random() - 0.5) * 40 * Math.sin(t * Math.PI);
            ctx.lineTo(ex, ey);
          }
          ctx.strokeStyle = `hsla(185, 100%, 70%, ${arcLife / 30})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        // nodes
        for (const n of nodes) {
          const p = project(n);
          const glow = ctx.createRadialGradient(
            p.sx,
            p.sy,
            0,
            p.sx,
            p.sy,
            n.r * 5,
          );
          const energy = n.energy;
          glow.addColorStop(
            0,
            `hsla(${n.hue}, 90%, ${60 + energy * 40}%, ${0.9 + energy * 0.1})`,
          );
          glow.addColorStop(0.4, `hsla(${n.hue}, 80%, 60%, ${0.25 * p.scale})`);
          glow.addColorStop(1, `hsla(${n.hue}, 70%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, n.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${n.hue}, 100%, 85%, ${0.8 + 0.2 * Math.sin(n.pulse)})`;
          ctx.fill();
        }

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ─────────────────────────────────────────────────────────────────────
    // LIGHT — Aurora Prism
    // Flowing aurora bands with spectral color refraction + bokeh spheres
    // ─────────────────────────────────────────────────────────────────────
    else if (theme === "light") {
      let t = 0;
      interface Bokeh {
        x: number;
        y: number;
        r: number;
        vx: number;
        vy: number;
        hue: number;
        alpha: number;
      }
      const boks: Bokeh[] = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 30 + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        hue: Math.random() * 260 + 180,
        alpha: Math.random() * 0.12 + 0.03,
      }));

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.008;

        // aurora bands
        for (let band = 0; band < 6; band++) {
          const bandT = t + band * 1.1;
          const y0 =
            H * (0.15 + band * 0.12) + Math.sin(bandT * 0.7) * H * 0.06;
          const hueBase = (220 + band * 30 + t * 15) % 360;
          const grad = ctx.createLinearGradient(0, y0 - 80, 0, y0 + 80);
          grad.addColorStop(0, `hsla(${hueBase}, 70%, 65%, 0)`);
          grad.addColorStop(0.3, `hsla(${hueBase}, 75%, 70%, 0.18)`);
          grad.addColorStop(
            0.5,
            `hsla(${(hueBase + 20) % 360}, 80%, 75%, 0.28)`,
          );
          grad.addColorStop(
            0.7,
            `hsla(${(hueBase + 40) % 360}, 70%, 65%, 0.18)`,
          );
          grad.addColorStop(1, `hsla(${hueBase}, 60%, 60%, 0)`);

          ctx.beginPath();
          ctx.moveTo(0, y0);
          for (let x = 0; x <= W; x += 6) {
            const wave =
              Math.sin(x * 0.006 + bandT) * 35 +
              Math.sin(x * 0.012 - bandT * 0.6) * 20 +
              Math.sin(x * 0.003 + bandT * 1.3) * 15;
            ctx.lineTo(x, y0 + wave);
          }
          ctx.lineTo(W, y0 + 80);
          ctx.lineTo(0, y0 + 80);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // prismatic shards
        for (let i = 0; i < 8; i++) {
          const cx = W * (0.05 + i * 0.13) + Math.sin(t * 0.4 + i) * 30;
          const cy = H * 0.5 + Math.cos(t * 0.3 + i * 1.2) * H * 0.2;
          const hue = (i * 45 + t * 20) % 360;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * 0.2 + i * 0.8);
          const pts = 3;
          ctx.beginPath();
          for (let p = 0; p < pts; p++) {
            const a = (p / pts) * Math.PI * 2;
            const r = 15 + Math.sin(t + p) * 5;
            p === 0
              ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
              : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
          }
          ctx.closePath();
          const sg = ctx.createLinearGradient(-15, -15, 15, 15);
          sg.addColorStop(0, `hsla(${hue}, 90%, 75%, 0.35)`);
          sg.addColorStop(1, `hsla(${(hue + 60) % 360}, 80%, 70%, 0.1)`);
          ctx.fillStyle = sg;
          ctx.fill();
          ctx.restore();
        }

        // bokeh
        for (const b of boks) {
          b.x = (b.x + b.vx + W) % W;
          b.y = (b.y + b.vy + H) % H;
          const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          bg.addColorStop(0, `hsla(${b.hue}, 70%, 80%, ${b.alpha * 1.5})`);
          bg.addColorStop(0.6, `hsla(${b.hue}, 60%, 75%, ${b.alpha})`);
          bg.addColorStop(1, `hsla(${b.hue}, 50%, 70%, 0)`);
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = bg;
          ctx.fill();
        }

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ─────────────────────────────────────────────────────────────────────
    // AMBER — Solar Plasma
    // Perlin-noise plasma field + fire particle tendrils rising upward
    // ─────────────────────────────────────────────────────────────────────
    else if (theme === "amber") {
      let t = 0;
      interface Flame {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        size: number;
        hue: number;
      }
      const flames: Flame[] = [];
      const spawnFlame = () => {
        flames.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(Math.random() * 2.5 + 1.5),
          life: 0,
          maxLife: Math.random() * 100 + 80,
          size: Math.random() * 8 + 3,
          hue: Math.random() * 40 + 20,
        });
      };

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.012;

        // plasma field using layered sin waves
        const iw = 80;
        const ih = 50;
        const cellW = W / iw;
        const cellH = H / ih;
        for (let yi = 0; yi < ih; yi++) {
          for (let xi = 0; xi < iw; xi++) {
            const nx = xi / iw;
            const ny = yi / ih;
            const v =
              Math.sin((nx * 8 + t) * 1.2) +
              Math.sin((ny * 6 - t * 0.8) * 1.1) +
              Math.sin((nx * 4 + ny * 4 + t * 1.5) * 0.9) +
              Math.sin(
                Math.sqrt(
                  (nx - 0.5 + Math.sin(t * 0.4) * 0.2) ** 2 +
                    (ny - 0.5 + Math.cos(t * 0.3) * 0.2) ** 2,
                ) * 12,
              );
            const norm = (v + 4) / 8;
            const hue = 15 + norm * 45;
            const sat = 90 + norm * 10;
            const light = 35 + norm * 30;
            ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.22)`;
            ctx.fillRect(xi * cellW, yi * cellH, cellW + 1, cellH + 1);
          }
        }

        // spawn flames
        if (Math.random() < 0.4) spawnFlame();
        for (let i = flames.length - 1; i >= 0; i--) {
          const f = flames[i];
          f.life++;
          f.x += f.vx + Math.sin(f.life * 0.15) * 0.6;
          f.y += f.vy;
          f.vy -= 0.012;
          f.vx *= 0.99;
          const progress = f.life / f.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.7;
          const sz = f.size * (1 - progress * 0.5);
          const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, sz * 2);
          fg.addColorStop(0, `hsla(${f.hue + 20}, 100%, 85%, ${alpha})`);
          fg.addColorStop(0.4, `hsla(${f.hue}, 100%, 60%, ${alpha * 0.7})`);
          fg.addColorStop(1, `hsla(${f.hue - 10}, 90%, 40%, 0)`);
          ctx.beginPath();
          ctx.arc(f.x, f.y, sz * 2, 0, Math.PI * 2);
          ctx.fillStyle = fg;
          ctx.fill();
          if (f.life >= f.maxLife) flames.splice(i, 1);
        }

        // solar corona rings
        for (let ring = 0; ring < 3; ring++) {
          const cx = W / 2 + Math.sin(t * 0.3 + ring * 2) * 80;
          const cy = H / 2 + Math.cos(t * 0.25 + ring * 1.5) * 50;
          const r = 80 + ring * 60 + Math.sin(t + ring) * 20;
          const rg = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
          rg.addColorStop(0, `hsla(${40 + ring * 15}, 100%, 70%, 0.06)`);
          rg.addColorStop(0.7, `hsla(${30 + ring * 10}, 100%, 60%, 0.12)`);
          rg.addColorStop(1, "hsla(20, 90%, 50%, 0)");
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = rg;
          ctx.fill();
        }

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ─────────────────────────────────────────────────────────────────────
    // CYBERPUNK — Holo-Grid Glitch
    // Tron perspective grid + scanlines + glitch blocks + neon data streams
    // ─────────────────────────────────────────────────────────────────────
    else if (theme === "cyberpunk") {
      let t = 0;
      interface DataStream {
        x: number;
        y: number;
        length: number;
        speed: number;
        chars: string[];
        hue: number;
        alpha: number;
      }
      interface GlitchBlock {
        x: number;
        y: number;
        w: number;
        h: number;
        life: number;
        hue: number;
      }
      const CHARS = "01アイウエカキクABCDEF$#@!";
      const streams: DataStream[] = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.floor(Math.random() * 12 + 5),
        speed: Math.random() * 3 + 1.5,
        chars: Array.from(
          { length: 17 },
          () => CHARS[Math.floor(Math.random() * CHARS.length)],
        ),
        hue: Math.random() < 0.5 ? 120 : 300,
        alpha: Math.random() * 0.6 + 0.2,
      }));
      const glitches: GlitchBlock[] = [];

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, 0, W, H);
        t += 1;

        // perspective grid floor
        const vx = W / 2;
        const vy = H * 0.55;
        ctx.save();
        for (let i = -20; i <= 20; i++) {
          const x = vx + i * (W / 24);
          ctx.beginPath();
          ctx.moveTo(vx + i * 5, vy);
          ctx.lineTo(x < 0 ? 0 : x > W ? W : x, H);
          ctx.strokeStyle = `hsla(${i % 2 === 0 ? 120 : 300}, 100%, 55%, 0.15)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        for (let i = 0; i < 16; i++) {
          const frac = (i / 16) ** 2;
          const y = vy + (H - vy) * frac;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.strokeStyle = `hsla(180, 100%, 55%, ${0.08 + frac * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
        ctx.restore();

        // horizon glow
        const hg = ctx.createLinearGradient(0, vy - 30, 0, vy + 30);
        hg.addColorStop(0, "rgba(0,255,255,0)");
        hg.addColorStop(0.5, "rgba(0,255,255,0.12)");
        hg.addColorStop(1, "rgba(0,255,255,0)");
        ctx.fillStyle = hg;
        ctx.fillRect(0, vy - 30, W, 60);

        // data streams (falling characters)
        for (const s of streams) {
          s.y += s.speed;
          if (s.y > H + 200) {
            s.y = -s.length * 16;
            s.x = Math.random() * W;
          }
          if (Math.random() < 0.08)
            s.chars[Math.floor(Math.random() * s.chars.length)] =
              CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.font = "bold 13px 'Courier New', monospace";
          for (let c = 0; c < s.length; c++) {
            const alpha = (1 - c / s.length) * s.alpha;
            const bright = c === 0 ? 95 : 55 + c * 2;
            ctx.fillStyle = `hsla(${s.hue}, 100%, ${bright}%, ${alpha})`;
            ctx.fillText(s.chars[c % s.chars.length], s.x, s.y - c * 16);
          }
        }

        // scanlines
        const scanY = (t * 2) % (H + 4);
        const sg = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
        sg.addColorStop(0, "rgba(0,255,200,0)");
        sg.addColorStop(0.5, "rgba(0,255,200,0.06)");
        sg.addColorStop(1, "rgba(0,255,200,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 2, W, 4);

        // glitch blocks
        if (Math.random() < 0.025) {
          glitches.push({
            x: Math.random() * W,
            y: Math.random() * H,
            w: Math.random() * 200 + 40,
            h: Math.random() * 12 + 3,
            life: Math.floor(Math.random() * 8 + 3),
            hue: Math.random() < 0.5 ? 120 : 300,
          });
        }
        for (let i = glitches.length - 1; i >= 0; i--) {
          const g = glitches[i];
          ctx.fillStyle = `hsla(${g.hue}, 100%, 60%, 0.35)`;
          ctx.fillRect(g.x, g.y, g.w, g.h);
          ctx.fillStyle = `hsla(${(g.hue + 180) % 360}, 100%, 70%, 0.15)`;
          ctx.fillRect(g.x + 3, g.y, g.w, g.h);
          g.life--;
          if (g.life <= 0) glitches.splice(i, 1);
        }

        // neon corner brackets
        ctx.save();
        ctx.strokeStyle = "rgba(0,255,200,0.4)";
        ctx.lineWidth = 2;
        const b = 20;
        const bl = 40;
        [
          [b, b],
          [W - b, b],
          [b, H - b],
          [W - b, H - b],
        ].forEach(([cx, cy], idx) => {
          const sx = idx % 2 === 0 ? 1 : -1;
          const sy = idx < 2 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(cx, cy + sy * bl);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + sx * bl, cy);
          ctx.stroke();
        });
        ctx.restore();

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ─────────────────────────────────────────────────────────────────────
    // MIDNIGHT — Cosmic Nebula
    // Deep space parallax starfield + nebula clouds + shooting stars
    // ─────────────────────────────────────────────────────────────────────
    else if (theme === "midnight") {
      interface Star {
        x: number;
        y: number;
        r: number;
        twinkle: number;
        twinkleSpeed: number;
        layer: number;
      }
      interface ShootingStar {
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
      }
      let t = 0;

      const stars: Star[] = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        layer: Math.floor(Math.random() * 3),
      }));

      const shoots: ShootingStar[] = [];
      let shootTimer = 0;

      // nebula cloud positions
      const nebulae = [
        { cx: 0.25, cy: 0.35, r: 0.35, hue: 260, sat: 70 },
        { cx: 0.7, cy: 0.55, r: 0.3, hue: 220, sat: 65 },
        { cx: 0.5, cy: 0.7, r: 0.28, hue: 290, sat: 60 },
        { cx: 0.15, cy: 0.75, r: 0.22, hue: 200, sat: 70 },
        { cx: 0.85, cy: 0.25, r: 0.25, hue: 250, sat: 55 },
      ];

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t++;

        // nebula clouds
        for (const neb of nebulae) {
          const cx = neb.cx * W + Math.sin(t * 0.003 + neb.hue) * 15;
          const cy = neb.cy * H + Math.cos(t * 0.002 + neb.hue) * 10;
          const r = neb.r * Math.min(W, H);
          for (let layer = 0; layer < 4; layer++) {
            const lr = r * (1 - layer * 0.18);
            const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, lr);
            lg.addColorStop(
              0,
              `hsla(${neb.hue + layer * 10}, ${neb.sat}%, ${30 + layer * 5}%, ${0.12 - layer * 0.025})`,
            );
            lg.addColorStop(
              0.5,
              `hsla(${neb.hue - 10}, ${neb.sat - 10}%, 25%, ${0.07 - layer * 0.01})`,
            );
            lg.addColorStop(1, `hsla(${neb.hue}, 60%, 20%, 0)`);
            ctx.beginPath();
            ctx.arc(cx, cy, lr, 0, Math.PI * 2);
            ctx.fillStyle = lg;
            ctx.fill();
          }
        }

        // stars with parallax
        const layerSpeeds = [0.08, 0.2, 0.4];
        for (const s of stars) {
          s.twinkle += s.twinkleSpeed;
          const brightness = 0.5 + 0.5 * Math.sin(s.twinkle);
          const sX = (s.x + t * layerSpeeds[s.layer] + W * 10) % W;
          ctx.beginPath();
          ctx.arc(sX, s.y, s.r * (0.7 + 0.3 * brightness), 0, Math.PI * 2);
          const hue = s.layer === 2 ? 220 : s.layer === 1 ? 240 : 200;
          ctx.fillStyle = `hsla(${hue}, 30%, ${70 + 30 * brightness}%, ${0.4 + 0.6 * brightness})`;
          ctx.fill();
          // bright stars get a cross glow
          if (s.r > 1.4 && brightness > 0.8) {
            ctx.save();
            ctx.strokeStyle = `hsla(${hue}, 50%, 90%, ${brightness * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(sX - s.r * 5, s.y);
            ctx.lineTo(sX + s.r * 5, s.y);
            ctx.moveTo(sX, s.y - s.r * 5);
            ctx.lineTo(sX, s.y + s.r * 5);
            ctx.stroke();
            ctx.restore();
          }
        }

        // shooting stars
        shootTimer++;
        if (shootTimer > 120 && Math.random() < 0.04) {
          shoots.push({
            x: Math.random() * canvas.width * 0.7,
            y: Math.random() * canvas.height * 0.5,
            vx: Math.random() * 6 + 4,
            vy: Math.random() * 3 + 1.5,
            life: 0,
            maxLife: 50,
          });
          shootTimer = 0;
        }
        for (let i = shoots.length - 1; i >= 0; i--) {
          const ss = shoots[i];
          ss.life++;
          ss.x += ss.vx;
          ss.y += ss.vy;
          const alpha = Math.sin((ss.life / ss.maxLife) * Math.PI) * 0.9;
          const tailLen = 80;
          const sg = ctx.createLinearGradient(
            ss.x - (ss.vx * tailLen) / ss.vx,
            ss.y - (ss.vy * tailLen) / ss.vx,
            ss.x,
            ss.y,
          );
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(1, `rgba(200,220,255,${alpha})`);
          ctx.beginPath();
          ctx.moveTo(ss.x - ss.vx * 12, ss.y - ss.vy * 12);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = sg;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          if (ss.life >= ss.maxLife) shoots.splice(i, 1);
        }

        // galaxy spiral hint
        const gcx = canvas.width * 0.62;
        const gcy = canvas.height * 0.38;
        for (let arm = 0; arm < 2; arm++) {
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 4; a += 0.08) {
            const r = a * 18;
            const angle = a + arm * Math.PI + t * 0.001;
            const px = gcx + r * Math.cos(angle);
            const py = gcy + r * Math.sin(angle) * 0.55;
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `hsla(${240 + arm * 30}, 60%, 60%, 0.06)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    // ─────────────────────────────────────────────────────────────────────
    // OCEAN — Bioluminescent Abyss
    // Caustic light patterns + glowing jellyfish + aurora curtains + plankton
    // ─────────────────────────────────────────────────────────────────────
    else if (theme === "ocean") {
      let t = 0;
      interface Jelly {
        x: number;
        y: number;
        vy: number;
        r: number;
        phase: number;
        hue: number;
        alpha: number;
        tentacles: number;
      }
      interface Plankton {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        hue: number;
        pulse: number;
      }

      const jellies: Jelly[] = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 25 + 12,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() * 80 + 160,
        alpha: Math.random() * 0.3 + 0.1,
        tentacles: Math.floor(Math.random() * 5 + 4),
      }));

      const plankton: Plankton[] = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 0.5,
        hue: Math.random() * 80 + 160,
        pulse: Math.random() * Math.PI * 2,
      }));

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        t += 0.012;

        // deep ocean caustic light from above
        for (let c = 0; c < 8; c++) {
          const cx = W * (0.05 + c * 0.13) + Math.sin(t * 0.4 + c * 1.3) * 40;
          const causticH = H * 0.15 + Math.sin(t * 0.3 + c) * H * 0.05;
          const cg = ctx.createLinearGradient(cx - 30, 0, cx + 30, causticH);
          cg.addColorStop(0, `hsla(${190 + c * 8}, 80%, 65%, 0.15)`);
          cg.addColorStop(0.6, `hsla(${185 + c * 8}, 70%, 55%, 0.06)`);
          cg.addColorStop(1, "hsla(195, 60%, 50%, 0)");
          ctx.beginPath();
          ctx.moveTo(cx - 20, 0);
          for (let y = 0; y < causticH; y += 8) {
            const spread = 20 + (y / causticH) * 60;
            const wobble = Math.sin(y * 0.05 + t) * spread * 0.3;
            ctx.lineTo(cx + wobble + spread * 0.5, y);
          }
          ctx.lineTo(cx + 20, 0);
          ctx.closePath();
          ctx.fillStyle = cg;
          ctx.fill();
        }

        // aurora borealis curtains
        for (let a = 0; a < 4; a++) {
          ctx.beginPath();
          ctx.moveTo(0, H * 0.1);
          for (let x = 0; x <= W; x += 5) {
            const y =
              H * 0.1 +
              Math.sin(x * 0.006 + t + a) * H * 0.08 +
              Math.sin(x * 0.012 - t * 0.7 + a) * H * 0.04;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W, 0);
          ctx.lineTo(0, 0);
          ctx.closePath();
          const ag = ctx.createLinearGradient(0, 0, 0, H * 0.2);
          const hue = 170 + a * 25;
          ag.addColorStop(0, `hsla(${hue}, 85%, 55%, ${0.1 - a * 0.015})`);
          ag.addColorStop(1, `hsla(${hue}, 75%, 50%, 0)`);
          ctx.fillStyle = ag;
          ctx.fill();
        }

        // jellyfish
        for (const j of jellies) {
          j.phase += 0.03;
          j.y += j.vy + Math.sin(j.phase * 0.5) * 0.3;
          j.x += Math.sin(j.phase * 0.3) * 0.4;
          if (j.y < -j.r * 3) {
            j.y = H + j.r;
            j.x = Math.random() * W;
          }
          if (j.y > H + j.r * 3) {
            j.y = -j.r;
            j.x = Math.random() * W;
          }

          // bell dome
          const pulse = 1 + 0.12 * Math.sin(j.phase * 2);
          const jg = ctx.createRadialGradient(
            j.x,
            j.y,
            0,
            j.x,
            j.y,
            j.r * pulse,
          );
          jg.addColorStop(0, `hsla(${j.hue}, 90%, 80%, ${j.alpha * 1.5})`);
          jg.addColorStop(0.5, `hsla(${j.hue}, 80%, 65%, ${j.alpha})`);
          jg.addColorStop(1, `hsla(${j.hue}, 70%, 55%, 0)`);
          ctx.beginPath();
          ctx.ellipse(j.x, j.y, j.r * pulse, j.r * pulse * 0.7, 0, Math.PI, 0);
          ctx.fillStyle = jg;
          ctx.fill();
          // rim glow
          ctx.beginPath();
          ctx.ellipse(j.x, j.y, j.r * pulse, j.r * pulse * 0.7, 0, Math.PI, 0);
          ctx.strokeStyle = `hsla(${j.hue}, 100%, 80%, ${j.alpha * 2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          // tentacles
          for (let ten = 0; ten < j.tentacles; ten++) {
            const tx =
              j.x + (ten - j.tentacles / 2) * ((j.r * 1.8) / j.tentacles);
            const tentLen = j.r * (1.5 + 0.5 * Math.sin(j.phase + ten));
            ctx.beginPath();
            ctx.moveTo(tx, j.y);
            for (let seg = 1; seg <= 8; seg++) {
              const sy = j.y + (tentLen / 8) * seg;
              const sx =
                tx + Math.sin(j.phase * 1.5 + ten * 0.8 + seg * 0.4) * 5;
              ctx.lineTo(sx, sy);
            }
            ctx.strokeStyle = `hsla(${j.hue + 20}, 80%, 75%, ${j.alpha * 0.8})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // plankton
        for (const p of plankton) {
          p.pulse += 0.05;
          p.x = (p.x + p.vx + W) % W;
          p.y = (p.y + p.vy + H) % H;
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          const brightness = 0.5 + 0.5 * Math.sin(p.pulse);
          glow.addColorStop(
            0,
            `hsla(${p.hue}, 100%, 75%, ${0.8 * brightness})`,
          );
          glow.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
