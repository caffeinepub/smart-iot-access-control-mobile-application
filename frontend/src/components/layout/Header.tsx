import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ThemeSwitcher from './ThemeSwitcher';
import {
  Menu, X, LogOut, User, LayoutDashboard, Activity,
  Users, Zap, Settings, FileText, Shield, ChevronDown, Bell,
  ClipboardList, ShieldAlert
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: Activity },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/automation', label: 'Automation', icon: Zap },
  { to: '/todos', label: 'To-Do', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Header() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: role } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();
  const { notifications } = useNotifications();
  const isAdmin = role === 'admin';

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm text-foreground hidden sm:block font-mono tracking-wider">
            IoT<span className="text-primary">ACCESS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <Link
            to="/admin-dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Monitor
          </Link>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ThemeSwitcher />

          {/* Notifications */}
          {identity && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 p-0"
                onClick={() => setNotifOpen(v => !v)}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}

          {identity ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-border">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs max-w-[100px] truncate">
                    {userProfile?.name || identity.getPrincipal().toString().slice(0, 8) + '...'}
                  </span>
                  {isAdmin && <Badge variant="default" className="text-xs px-1 py-0 h-4">Admin</Badge>}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-foreground">{userProfile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/admin-dashboard" className="flex items-center gap-2 cursor-pointer">
                    <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                    Monitor Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              disabled={loginStatus === 'logging-in'}
              className="text-xs"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/admin-dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
          >
            <ShieldAlert className="w-4 h-4" />
            Monitor Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
