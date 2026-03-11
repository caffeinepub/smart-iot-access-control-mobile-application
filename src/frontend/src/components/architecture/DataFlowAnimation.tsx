import { useEffect, useState } from "react";

interface DataFlowAnimationProps {
  isLive: boolean;
}

interface Packet {
  id: number;
  path: "esp-backend" | "backend-frontend" | "frontend-backend" | "backend-esp";
  progress: number;
}

export default function DataFlowAnimation({ isLive }: DataFlowAnimationProps) {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [_nextId, setNextId] = useState(0);

  useEffect(() => {
    if (!isLive) {
      setPackets([]);
      return;
    }

    const interval = setInterval(() => {
      const paths: Packet["path"][] = [
        "esp-backend",
        "backend-frontend",
        "frontend-backend",
        "backend-esp",
      ];
      const path = paths[Math.floor(Math.random() * paths.length)];
      setNextId((prev) => {
        const id = prev + 1;
        setPackets((pkts) => [...pkts.slice(-8), { id, path, progress: 0 }]);
        return id;
      });
    }, 800);

    const animInterval = setInterval(() => {
      setPackets((pkts) =>
        pkts
          .map((p) => ({ ...p, progress: p.progress + 4 }))
          .filter((p) => p.progress <= 100),
      );
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(animInterval);
    };
  }, [isLive]);

  const nodes = {
    esp: { x: 100, y: 150, label: "ESP32", sublabel: "IoT Device" },
    backend: { x: 400, y: 150, label: "Backend", sublabel: "ICP Canister" },
    frontend: { x: 700, y: 150, label: "Frontend", sublabel: "React App" },
  };

  function getPacketPosition(packet: Packet) {
    const t = packet.progress / 100;
    switch (packet.path) {
      case "esp-backend":
        return { x: nodes.esp.x + (nodes.backend.x - nodes.esp.x) * t, y: 130 };
      case "backend-esp":
        return {
          x: nodes.backend.x + (nodes.esp.x - nodes.backend.x) * t,
          y: 170,
        };
      case "backend-frontend":
        return {
          x: nodes.backend.x + (nodes.frontend.x - nodes.backend.x) * t,
          y: 130,
        };
      case "frontend-backend":
        return {
          x: nodes.frontend.x + (nodes.backend.x - nodes.frontend.x) * t,
          y: 170,
        };
    }
  }

  return (
    <svg
      viewBox="0 0 800 300"
      className="w-full h-full"
      style={{ minHeight: 220 }}
      role="img"
      aria-label="IoT data flow animation showing ESP32, Backend, and Frontend nodes"
    >
      <line
        x1={nodes.esp.x + 50}
        y1={130}
        x2={nodes.backend.x - 50}
        y2={130}
        stroke="oklch(0.72 0.18 195 / 0.4)"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      <line
        x1={nodes.backend.x - 50}
        y1={170}
        x2={nodes.esp.x + 50}
        y2={170}
        stroke="oklch(0.72 0.18 195 / 0.25)"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      <line
        x1={nodes.backend.x + 50}
        y1={130}
        x2={nodes.frontend.x - 50}
        y2={130}
        stroke="oklch(0.72 0.18 195 / 0.4)"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      <line
        x1={nodes.frontend.x - 50}
        y1={170}
        x2={nodes.backend.x + 50}
        y2={170}
        stroke="oklch(0.72 0.18 195 / 0.25)"
        strokeWidth="2"
        strokeDasharray="8 4"
      />
      <text
        x={(nodes.esp.x + nodes.backend.x) / 2}
        y={118}
        textAnchor="middle"
        fontSize="10"
        fill="oklch(0.72 0.18 195 / 0.7)"
      >
        sensor data →
      </text>
      <text
        x={(nodes.esp.x + nodes.backend.x) / 2}
        y={188}
        textAnchor="middle"
        fontSize="10"
        fill="oklch(0.72 0.18 195 / 0.5)"
      >
        ← commands
      </text>
      <text
        x={(nodes.backend.x + nodes.frontend.x) / 2}
        y={118}
        textAnchor="middle"
        fontSize="10"
        fill="oklch(0.72 0.18 195 / 0.7)"
      >
        query results →
      </text>
      <text
        x={(nodes.backend.x + nodes.frontend.x) / 2}
        y={188}
        textAnchor="middle"
        fontSize="10"
        fill="oklch(0.72 0.18 195 / 0.5)"
      >
        ← update calls
      </text>
      {Object.entries(nodes).map(([key, node]) => (
        <g key={key}>
          <rect
            x={node.x - 50}
            y={node.y - 35}
            width={100}
            height={70}
            rx={12}
            fill="oklch(0.17 0.018 240)"
            stroke="oklch(0.72 0.18 195 / 0.5)"
            strokeWidth="1.5"
          />
          <text
            x={node.x}
            y={node.y - 8}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="oklch(0.93 0.01 200)"
          >
            {node.label}
          </text>
          <text
            x={node.x}
            y={node.y + 10}
            textAnchor="middle"
            fontSize="10"
            fill="oklch(0.58 0.02 220)"
          >
            {node.sublabel}
          </text>
          {isLive && (
            <circle
              cx={node.x + 38}
              cy={node.y - 28}
              r={4}
              fill="oklch(0.72 0.18 162)"
            >
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      ))}
      {isLive &&
        packets.map((packet) => {
          const pos = getPacketPosition(packet);
          return (
            <circle
              key={packet.id}
              cx={pos.x}
              cy={pos.y}
              r={5}
              fill="oklch(0.72 0.18 195)"
              opacity={0.9}
            >
              <animate
                attributeName="r"
                values="5;7;5"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
    </svg>
  );
}
