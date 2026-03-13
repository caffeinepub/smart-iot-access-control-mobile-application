import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import EmergencyContactsPanel from "@/components/settings/EmergencyContactsPanel";
import WebhookForwardingPanel from "@/components/settings/WebhookForwardingPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/contexts/AppStateContext";
import { Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";

export default function Settings() {
  const { soundEnabled, setSoundEnabled } = useAppState();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose a color theme for the application.
            </p>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        {/* UI Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">UI Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="sound-toggle" className="text-sm font-medium">
                    Sound Effects
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds on lock/unlock and credit rewards
                  </p>
                </div>
              </div>
              <Switch
                id="sound-toggle"
                data-ocid="settings.switch"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Forwarding */}
      <WebhookForwardingPanel />

      {/* Emergency Contacts */}
      <EmergencyContactsPanel />
    </div>
  );
}
