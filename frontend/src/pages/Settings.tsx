import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import SimulationModeToggle from '@/components/settings/SimulationModeToggle';
import ThemeSwitcher from '@/components/layout/ThemeSwitcher';
import WebhookForwardingPanel from '@/components/settings/WebhookForwardingPanel';
import EmergencyContactsPanel from '@/components/settings/EmergencyContactsPanel';

export default function Settings() {
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
            <p className="text-sm text-muted-foreground">Choose a color theme for the application.</p>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        {/* Simulation Mode */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Simulation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <SimulationModeToggle />
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
