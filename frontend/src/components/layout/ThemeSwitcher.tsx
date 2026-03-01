import React from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon, Zap, Sunset, Waves, Sparkles } from 'lucide-react';

const THEMES: { value: Theme; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Default dark theme' },
  { value: 'light', label: 'Light', icon: Sun, description: 'Clean light theme' },
  { value: 'amber', label: 'Amber', icon: Sunset, description: 'Warm amber tones' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: Zap, description: 'Neon green & magenta' },
  { value: 'midnight', label: 'Midnight', icon: Sparkles, description: 'Deep navy & indigo' },
  { value: 'ocean', label: 'Ocean', icon: Waves, description: 'Teal & cyan depths' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const current = THEMES.find(t => t.value === theme) || THEMES[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-border">
          <CurrentIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">{current.label}</span>
          <Palette className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map(t => {
          const Icon = t.icon;
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex items-center gap-2 cursor-pointer ${theme === t.value ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <div className="flex-1">
                <div className="text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
              {theme === t.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
