import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, LayoutDashboard, Activity, Settings, Zap, Users } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to IoT Access Control',
    description: 'This system lets you manage smart door locks, monitor access events, and automate security rules — all on the Internet Computer.',
    icon: LayoutDashboard,
    highlight: 'Dashboard',
  },
  {
    title: 'Monitor Access Events',
    description: 'The Event Monitoring page shows real-time access logs, analytics charts, and heatmaps of activity patterns.',
    icon: Activity,
    highlight: 'Event Monitoring',
  },
  {
    title: 'Manage Users',
    description: 'As an admin, you can add/remove users, set RFID UIDs, assign roles, and configure recurring access windows per user.',
    icon: Users,
    highlight: 'User Management',
  },
  {
    title: 'Automate with Smart Rules',
    description: 'Create automation rules to lock/unlock doors on schedules, trigger alerts, and log rule executions automatically.',
    icon: Zap,
    highlight: 'Automation Rules',
  },
  {
    title: 'Configure Settings',
    description: 'Customize themes, enable simulation mode, set up webhooks, and manage emergency contacts from the Settings page.',
    icon: Settings,
    highlight: 'Settings',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingWalkthrough({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="bg-card border-border w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs font-mono">
              Step {step + 1} / {STEPS.length}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={onComplete}
              className="h-7 w-7 p-0 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-primary/20">
              <Icon className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{current.description}</p>
            </div>
            <Badge className="text-xs">{current.highlight}</Badge>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 my-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onComplete} className="flex-1 text-muted-foreground">
              Skip Tour
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (isLast) {
                  onComplete();
                } else {
                  setStep(s => s + 1);
                }
              }}
              className="flex-1 flex items-center gap-1.5"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
