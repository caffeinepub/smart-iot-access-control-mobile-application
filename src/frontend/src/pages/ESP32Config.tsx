import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Clipboard,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  Lock,
  Radio,
  Settings2,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "esp32_config_v1";

interface ESP32ConfigState {
  wifiSsid: string;
  wifiPass: string;
  rfidUid: string;
  currentPin: string;
  newPin: string;
  confirmPin: string;
  hidePinLcd: boolean;
  autoLockDelay: number;
  maxWrongAttempts: number;
  systemLockTime: number;
  eepromEnabled: boolean;
  wsUrl: string;
  wsEnabled: boolean;
  wsReconnectInterval: number;
}

const DEFAULT_STATE: ESP32ConfigState = {
  wifiSsid: "",
  wifiPass: "",
  rfidUid: "",
  currentPin: "",
  newPin: "",
  confirmPin: "",
  hidePinLcd: true,
  autoLockDelay: 5,
  maxWrongAttempts: 3,
  systemLockTime: 30,
  eepromEnabled: true,
  wsUrl: "ws://192.168.1.100:81",
  wsEnabled: true,
  wsReconnectInterval: 5000,
};

function CodeBlock({ code, onCopy }: { code: string; onCopy?: () => void }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
    onCopy?.();
  };
  return (
    <div className="relative group">
      <pre className="bg-black/60 border border-primary/20 rounded p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
        onClick={handleCopy}
        data-ocid="esp32.copy_button"
      >
        <Clipboard className="w-3 h-3 mr-1" />
        Copy
      </Button>
    </div>
  );
}

function uidToHex(uid: string): string {
  const parts = uid
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  return parts.map((p) => `0x${p.toUpperCase().padStart(2, "0")}`).join(", ");
}

export default function ESP32Config() {
  const [config, setConfig] = useState<ESP32ConfigState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) };
    } catch (_) {}
    return DEFAULT_STATE;
  });

  const [showWifiPass, setShowWifiPass] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);

  useEffect(() => {
    const toSave = { ...config };
    toSave.currentPin = "";
    toSave.newPin = "";
    toSave.confirmPin = "";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [config]);

  const set = <K extends keyof ESP32ConfigState>(
    key: K,
    value: ESP32ConfigState[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const pinValid =
    config.newPin.length >= 4 && config.newPin === config.confirmPin;

  const handleSavePin = () => {
    if (!pinValid) {
      toast.error("PINs must match and be at least 4 characters.");
      return;
    }
    toast.success("PIN updated successfully!");
    setPinSaved(true);
    setConfig((prev) => ({
      ...prev,
      currentPin: "",
      newPin: "",
      confirmPin: "",
    }));
    setTimeout(() => setPinSaved(false), 3000);
  };

  const wifiCode = `// Wi-Fi Credentials
#define WIFI_SSID "${config.wifiSsid || "YOUR_SSID"}"
#define WIFI_PASS "${config.wifiPass || "YOUR_PASSWORD"}"`;

  const rfidHex = config.rfidUid
    ? uidToHex(config.rfidUid)
    : "0xDE, 0xAD, 0xBE, 0xEF";
  const rfidCode = `// RFID Admin Card UID
byte adminCard[] = {${rfidHex}};
// Card length
#define ADMIN_CARD_LEN ${
    config.rfidUid
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean).length || 4
  }`;

  const lockCode = `// Lock Parameters
#define AUTO_LOCK_DELAY  ${config.autoLockDelay}   // seconds
#define MAX_WRONG_ATTEMPTS ${config.maxWrongAttempts}   // attempts before lockout
#define SYSTEM_LOCK_TIME ${config.systemLockTime}  // seconds`;

  const eepromCode = `// EEPROM PIN Persistence - read at startup
#include <EEPROM.h>
#define EEPROM_SIZE 16
#define PIN_ADDR 0

void loadPinFromEEPROM(char* pinBuffer) {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < 8; i++) {
    pinBuffer[i] = EEPROM.read(PIN_ADDR + i);
    if (pinBuffer[i] == 0xFF) { pinBuffer[i] = 0; break; }
  }
  EEPROM.end();
}

void savePinToEEPROM(const char* pin) {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < strlen(pin) + 1; i++)
    EEPROM.write(PIN_ADDR + i, pin[i]);
  EEPROM.commit();
  EEPROM.end();
}`;

  const wsCode = `// WebSocket Configuration
#include <WebSocketsClient.h>
WebSocketsClient webSocket;

void setupWebSocket() {
  // URL: ${config.wsUrl || "ws://192.168.1.100:81"}
  webSocket.begin("${config.wsUrl.replace("ws://", "").split(":")[0] || "192.168.1.100"}",
                  ${config.wsUrl.split(":").pop() || "81"}, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(${config.wsReconnectInterval});
  webSocket.enableHeartbeat(15000, 3000, 2);
}

#define WS_ENABLED ${config.wsEnabled ? "true" : "false"}
#define WS_RECONNECT_MS ${config.wsReconnectInterval}`;

  const fullConfig = `/**
 * config.h — ESP32 Smart Lock Auto-Generated Config
 * Generated by IoTACCESS Dashboard
 * DO NOT EDIT MANUALLY — regenerate from the dashboard
 */

#ifndef CONFIG_H
#define CONFIG_H

// ── Wi-Fi ────────────────────────────────────────────
#define WIFI_SSID "${config.wifiSsid || "YOUR_SSID"}"
#define WIFI_PASS "${config.wifiPass || "YOUR_PASSWORD"}"

// ── RFID Admin Card ──────────────────────────────────
byte adminCard[] = {${rfidHex}};
#define ADMIN_CARD_LEN ${
    config.rfidUid
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean).length || 4
  }

// ── PIN (set via EEPROM at runtime) ──────────────────
#define HIDE_PIN_LCD ${config.hidePinLcd ? "true" : "false"}

// ── Lock Parameters ───────────────────────────────────
#define AUTO_LOCK_DELAY     ${config.autoLockDelay}
#define MAX_WRONG_ATTEMPTS  ${config.maxWrongAttempts}
#define SYSTEM_LOCK_TIME    ${config.systemLockTime}

// ── EEPROM ────────────────────────────────────────────
#define EEPROM_PIN_ENABLED  ${config.eepromEnabled ? "true" : "false"}
#define EEPROM_SIZE         16
#define PIN_ADDR            0

// ── WebSocket ─────────────────────────────────────────
#define WS_ENABLED          ${config.wsEnabled ? "true" : "false"}
#define WS_HOST             "${config.wsUrl.replace(/^ws:\/\//, "").split(":")[0] || "192.168.1.100"}"
#define WS_PORT             ${config.wsUrl.split(":").pop() || "81"}
#define WS_RECONNECT_MS     ${config.wsReconnectInterval}

#endif // CONFIG_H`;

  const handleDownload = () => {
    const blob = new Blob([fullConfig], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.h";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("config.h downloaded!");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded bg-primary/15 flex items-center justify-center border border-primary/30">
          <Cpu className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-foreground">
            ESP32 <span className="text-primary">CONFIG</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Configure firmware parameters for your ESP32 smart lock
          </p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto border-primary/40 text-primary font-mono text-xs"
        >
          <Zap className="w-3 h-3 mr-1" />
          LOCAL ONLY
        </Badge>
      </div>

      <Tabs defaultValue="wifi" className="space-y-4" data-ocid="esp32.tab">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-card border border-border p-1 rounded">
          <TabsTrigger
            value="wifi"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.wifi.tab"
          >
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi
          </TabsTrigger>
          <TabsTrigger
            value="rfid"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.rfid.tab"
          >
            <Radio className="w-3.5 h-3.5" /> RFID
          </TabsTrigger>
          <TabsTrigger
            value="pin"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.pin.tab"
          >
            <Lock className="w-3.5 h-3.5" /> PIN
          </TabsTrigger>
          <TabsTrigger
            value="lock"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.lock.tab"
          >
            <Settings2 className="w-3.5 h-3.5" /> Lock Params
          </TabsTrigger>
          <TabsTrigger
            value="eeprom"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.eeprom.tab"
          >
            <Database className="w-3.5 h-3.5" /> EEPROM
          </TabsTrigger>
          <TabsTrigger
            value="websocket"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.websocket.tab"
          >
            <Zap className="w-3.5 h-3.5" /> WebSocket
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="flex items-center gap-1.5 text-xs font-mono"
            data-ocid="esp32.output.tab"
          >
            <Download className="w-3.5 h-3.5" /> config.h
          </TabsTrigger>
        </TabsList>

        {/* ── Wi-Fi ── */}
        <TabsContent value="wifi">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Wifi className="w-4 h-4 text-primary" />
                Wi-Fi Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
                ⚠ These credentials are flashed to the ESP32 firmware. Keep them
                secure.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    SSID (Network Name)
                  </Label>
                  <Input
                    placeholder="MyHomeNetwork"
                    value={config.wifiSsid}
                    onChange={(e) => set("wifiSsid", e.target.value)}
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.wifi.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showWifiPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={config.wifiPass}
                      onChange={(e) => set("wifiPass", e.target.value)}
                      className="font-mono text-sm border-border bg-background/50 pr-10"
                      data-ocid="esp32.wifi_pass.input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowWifiPass((v) => !v)}
                    >
                      {showWifiPass ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Generated Arduino Code
                </Label>
                <CodeBlock code={wifiCode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RFID ── */}
        <TabsContent value="rfid">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Radio className="w-4 h-4 text-primary" />
                RFID Admin Card UID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded border border-blue-500/30 bg-blue-500/5 text-xs text-blue-400 font-mono">
                💡 Scan your card with the <strong>MFRC522 DumpInfo</strong>{" "}
                example sketch to find your card UID. It will print bytes like:{" "}
                <code className="bg-black/40 px-1 rounded">DE AD BE EF</code>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Card UID (space or comma separated hex bytes)
                </Label>
                <Input
                  placeholder="DE AD BE EF"
                  value={config.rfidUid}
                  onChange={(e) => set("rfidUid", e.target.value)}
                  className="font-mono text-sm border-border bg-background/50"
                  data-ocid="esp32.rfid.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Generated Arduino Code (updates live)
                </Label>
                <CodeBlock code={rfidCode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PIN ── */}
        <TabsContent value="pin">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Lock className="w-4 h-4 text-primary" />
                PIN Code Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Current PIN
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPin ? "text" : "password"}
                      placeholder="••••"
                      value={config.currentPin}
                      onChange={(e) => set("currentPin", e.target.value)}
                      className="font-mono text-sm border-border bg-background/50 pr-10"
                      data-ocid="esp32.current_pin.input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowCurrentPin((v) => !v)}
                    >
                      {showCurrentPin ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    New PIN (min 4 chars)
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPin ? "text" : "password"}
                      placeholder="••••"
                      value={config.newPin}
                      onChange={(e) => set("newPin", e.target.value)}
                      className="font-mono text-sm border-border bg-background/50 pr-10"
                      data-ocid="esp32.new_pin.input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowNewPin((v) => !v)}
                    >
                      {showNewPin ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Confirm New PIN
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••"
                    value={config.confirmPin}
                    onChange={(e) => set("confirmPin", e.target.value)}
                    className={`font-mono text-sm border-border bg-background/50 ${
                      config.confirmPin && !pinValid ? "border-destructive" : ""
                    }`}
                    data-ocid="esp32.confirm_pin.input"
                  />
                  {config.confirmPin && !pinValid && (
                    <p
                      className="text-xs text-destructive font-mono"
                      data-ocid="esp32.pin.error_state"
                    >
                      PINs don't match or too short
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded border border-border bg-muted/20">
                <Switch
                  checked={config.hidePinLcd}
                  onCheckedChange={(v) => set("hidePinLcd", v)}
                  data-ocid="esp32.hide_pin.switch"
                />
                <div>
                  <Label className="text-sm font-mono">Hide PIN on LCD</Label>
                  <p className="text-xs text-muted-foreground font-mono">
                    Show asterisks (****) instead of digits on the LCD display
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSavePin}
                disabled={!pinValid}
                className="font-mono text-sm"
                data-ocid="esp32.pin.save_button"
              >
                {pinSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> PIN
                    Updated
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Save PIN
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Lock Parameters ── */}
        <TabsContent value="lock">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Settings2 className="w-4 h-4 text-primary" />
                Lock Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Auto-Lock Delay (seconds)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={config.autoLockDelay}
                    onChange={(e) =>
                      set("autoLockDelay", Number(e.target.value))
                    }
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.auto_lock.input"
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    Range: 1–60 sec
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Max Wrong Attempts
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={config.maxWrongAttempts}
                    onChange={(e) =>
                      set("maxWrongAttempts", Number(e.target.value))
                    }
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.max_attempts.input"
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    Range: 1–10 attempts
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    System Lock Time (seconds)
                  </Label>
                  <Input
                    type="number"
                    min={10}
                    max={300}
                    value={config.systemLockTime}
                    onChange={(e) =>
                      set("systemLockTime", Number(e.target.value))
                    }
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.lock_time.input"
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    Range: 10–300 sec
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Generated Arduino Defines (updates live)
                </Label>
                <CodeBlock code={lockCode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EEPROM ── */}
        <TabsContent value="eeprom">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Database className="w-4 h-4 text-primary" />
                EEPROM PIN Persistence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded border border-green-500/30 bg-green-500/5 text-xs text-green-400 font-mono">
                🔋 When enabled, the PIN is stored in EEPROM and survives power
                loss or reboot. The PIN is read at startup before the lock
                becomes active.
              </div>

              <div className="flex items-center gap-3 p-3 rounded border border-border bg-muted/20">
                <Switch
                  checked={config.eepromEnabled}
                  onCheckedChange={(v) => set("eepromEnabled", v)}
                  data-ocid="esp32.eeprom.switch"
                />
                <div>
                  <Label className="text-sm font-mono">
                    Enable EEPROM PIN Storage
                  </Label>
                  <p className="text-xs text-muted-foreground font-mono">
                    Persist PIN across power cycles
                  </p>
                </div>
                <Badge
                  variant={config.eepromEnabled ? "default" : "outline"}
                  className="ml-auto font-mono text-xs"
                >
                  {config.eepromEnabled ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>

              {config.eepromEnabled && (
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Arduino EEPROM Code — add to your sketch
                  </Label>
                  <CodeBlock code={eepromCode} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── WebSocket ── */}
        <TabsContent value="websocket">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-mono">
                <Zap className="w-4 h-4 text-primary" />
                WebSocket Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded border border-border bg-muted/20">
                <Switch
                  checked={config.wsEnabled}
                  onCheckedChange={(v) => set("wsEnabled", v)}
                  data-ocid="esp32.ws_enabled.switch"
                />
                <div>
                  <Label className="text-sm font-mono">Enable WebSocket</Label>
                  <p className="text-xs text-muted-foreground font-mono">
                    Real-time bidirectional communication with the dashboard
                  </p>
                </div>
                <Badge
                  variant={config.wsEnabled ? "default" : "outline"}
                  className="ml-auto font-mono text-xs"
                >
                  {config.wsEnabled ? "ON" : "OFF"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    WebSocket Server URL
                  </Label>
                  <Input
                    placeholder="ws://192.168.1.100:81"
                    value={config.wsUrl}
                    onChange={(e) => set("wsUrl", e.target.value)}
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.ws_url.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">
                    Reconnect Interval (ms)
                  </Label>
                  <Input
                    type="number"
                    min={1000}
                    max={60000}
                    value={config.wsReconnectInterval}
                    onChange={(e) =>
                      set("wsReconnectInterval", Number(e.target.value))
                    }
                    className="font-mono text-sm border-border bg-background/50"
                    data-ocid="esp32.ws_reconnect.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  Generated WebSocket Setup Code
                </Label>
                <CodeBlock code={wsCode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Full config.h output ── */}
        <TabsContent value="output">
          <Card className="border-primary/20 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-mono">
                  <Download className="w-4 h-4 text-primary" />
                  Generated config.h
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-mono border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => {
                      navigator.clipboard.writeText(fullConfig);
                      toast.success("Full config copied!");
                    }}
                    data-ocid="esp32.copy_full_config.button"
                  >
                    <Clipboard className="w-3.5 h-3.5 mr-1" />
                    Copy Full Config
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-mono"
                    onClick={handleDownload}
                    data-ocid="esp32.download_config.button"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download config.h
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded border border-primary/20 bg-yellow-500/5 text-xs text-yellow-400 font-mono mb-4">
                📁 Place this file in your Arduino sketch folder as{" "}
                <strong>config.h</strong> and{" "}
                <code className="bg-black/40 px-1 rounded">
                  #include "config.h"
                </code>{" "}
                at the top of your .ino file.
              </div>
              <Textarea
                readOnly
                value={fullConfig}
                className="font-mono text-xs text-green-400 bg-black/60 border-primary/20 min-h-[420px] resize-none"
                data-ocid="esp32.config_output.editor"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
