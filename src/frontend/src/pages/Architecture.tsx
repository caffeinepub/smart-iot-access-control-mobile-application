import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layers, Network, Pause, Play } from "lucide-react";
import { useState } from "react";
import DataFlowAnimation from "../components/architecture/DataFlowAnimation";

export default function Architecture() {
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-accent" />
            IoT Architecture
          </h1>
          <p className="text-muted-foreground mt-1">
            System topology and data flow visualization
          </p>
        </div>
        <Button
          onClick={() => setIsLive((v) => !v)}
          className={`gap-2 ${isLive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}
        >
          {isLive ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isLive ? "Stop Live Mode" : "Start Live Mode"}
        </Button>
      </div>

      {/* Architecture diagram */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                System Architecture
              </CardTitle>
              <CardDescription>
                ESP32 → ICP Backend → React Frontend
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                isLive
                  ? "border-success/40 text-success bg-success/10 animate-pulse"
                  : ""
              }
            >
              {isLive ? "● Live" : "○ Static"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Static diagram image */}
          <div className="relative rounded-xl overflow-hidden border border-accent/10 bg-muted/20">
            <img
              src="/assets/generated/iot-architecture-diagram.dim_1200x600.png"
              alt="IoT Architecture Diagram"
              className={`w-full object-cover transition-opacity duration-300 ${isLive ? "opacity-30" : "opacity-100"}`}
            />
            {isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <DataFlowAnimation isLive={isLive} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-accent">
              ESP32 Device
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• RFID reader (RC522)</p>
            <p>• Keypad input (4×4)</p>
            <p>• Servo motor lock</p>
            <p>• WiFi connectivity</p>
            <p>• Wokwi simulation support</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-accent">
              ICP Backend
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• Motoko smart contract</p>
            <p>• On-chain state storage</p>
            <p>• Role-based access control</p>
            <p>• Query & update calls</p>
            <p>• Tamper-proof audit logs</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-accent">
              React Frontend
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>• Internet Identity auth</p>
            <p>• Real-time dashboard</p>
            <p>• Event monitoring</p>
            <p>• Automation rules</p>
            <p>• Multi-device management</p>
          </CardContent>
        </Card>
      </div>

      {/* Data flow legend */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-sm">Data Flow Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              {
                label: "Sensor Data",
                dir: "ESP32 → Backend",
                color: "text-accent",
              },
              {
                label: "Commands",
                dir: "Backend → ESP32",
                color: "text-warning",
              },
              {
                label: "Query Results",
                dir: "Backend → Frontend",
                color: "text-success",
              },
              {
                label: "Update Calls",
                dir: "Frontend → Backend",
                color: "text-destructive",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30 border border-border"
              >
                <span className={`font-semibold ${item.color}`}>
                  {item.label}
                </span>
                <span className="text-muted-foreground">{item.dir}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
