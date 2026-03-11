import LoginForm from "@/components/auth/LoginForm";
import ProfileSetupModal from "@/components/auth/ProfileSetupModal";
import MainLayout from "@/components/layout/MainLayout";
import OnboardingWalkthrough from "@/components/onboarding/OnboardingWalkthrough";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useOnboarding } from "@/hooks/useOnboarding";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminDashboardCredentialGated from "@/pages/AdminDashboardCredentialGated";
import Dashboard from "@/pages/Dashboard";
import EventMonitoring from "@/pages/EventMonitoring";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import ToDoList from "@/pages/ToDoList";
import UserManagement from "@/pages/UserManagement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<{
    name: string;
    email: string;
    rfidUid: string;
  } | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const _queryClientHook = useQueryClient();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { showWalkthrough, markComplete } = useOnboarding();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showOnboarding =
    isAuthenticated &&
    !profileLoading &&
    isFetched &&
    userProfile !== null &&
    showWalkthrough;

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-mono">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  return (
    <>
      {showOnboarding && <OnboardingWalkthrough onComplete={markComplete} />}
      {children}
    </>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <MainLayout />
    </AuthGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const eventMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: EventMonitoring,
});

const userManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UserManagement,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: ToDoList,
});

const adminDashboardCredentialGatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-dashboard",
  component: AdminDashboardCredentialGated,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  eventMonitoringRoute,
  userManagementRoute,
  settingsRoute,
  reportsRoute,
  adminRoute,
  todosRoute,
  adminDashboardCredentialGatedRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
