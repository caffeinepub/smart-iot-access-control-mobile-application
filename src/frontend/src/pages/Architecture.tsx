import AnimatedDataFlow from "@/components/architecture/AnimatedDataFlow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

export default function Architecture() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Network className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            IoT Architecture
          </h1>
          <p className="text-muted-foreground text-sm">
            Animated data flow visualization
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto border-primary/40 text-primary font-mono text-xs"
        >
          LIVE VIEW
        </Badge>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono text-muted-foreground">
            DATA PIPELINE FLOW
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatedDataFlow />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">
              COMMUNICATION PROTOCOLS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "ESP32 ↔ MQTT",
                proto: "MQTT over TCP/IP",
                color: "text-green-400",
                desc: "Lightweight pub/sub messaging for IoT",
              },
              {
                label: "MQTT ↔ Cloud",
                proto: "WebSocket / REST",
                color: "text-orange-400",
                desc: "Firebase Firestore real-time sync",
              },
              {
                label: "Cloud ↔ Canister",
                proto: "HTTP Outcalls",
                color: "text-blue-400",
                desc: "ICP backend fetches cloud data",
              },
              {
                label: "Canister ↔ UI",
                proto: "ICP Agent",
                color: "text-purple-400",
                desc: "Candid-encoded query/update calls",
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${row.color.replace("text", "bg")}`}
                />
                <div>
                  <p className={`text-xs font-mono font-bold ${row.color}`}>
                    {row.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.proto} — {row.desc}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">SECURITY LAYERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Physical Layer",
                desc: "ESP32 hardware PIN and RFID UID authentication",
                badge: "L1",
              },
              {
                label: "Network Layer",
                desc: "TLS encryption for all MQTT and REST traffic",
                badge: "L2",
              },
              {
                label: "Application Layer",
                desc: "Role-based access control (admin/user/guest)",
                badge: "L3",
              },
              {
                label: "Data Layer",
                desc: "Tamper-proof audit logs in Firestore + ICP",
                badge: "L4",
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] border-primary/40 text-primary shrink-0 mt-0.5"
                >
                  {row.badge}
                </Badge>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {row.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
