import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AccessEvent,
  DeviceInfo,
  DeviceStatus,
  LogEvent,
  SmartRule,
  SmartRuleLog,
  Subtask,
  TimeSlot,
  ToDo,
  UserAccess,
  UserProfile,
  UserStats,
} from "../backend";
import { Priority, UserRole } from "../backend";
import { useActor } from "./useActor";

export type {
  ToDo,
  UserStats,
  UserProfile,
  UserAccess,
  SmartRule,
  DeviceStatus,
  DeviceInfo,
  LogEvent,
  SmartRuleLog,
  AccessEvent,
};
export { Priority, UserRole };

// ── User Profile ───────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["currentUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Todos ──────────────────────────────────────────────────────────────────────

export function useGetTodos() {
  const { actor, isFetching } = useActor();
  return useQuery<ToDo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      priority: Priority;
      category: string;
      dueDate: bigint | null;
      subtasks: Subtask[];
      timerSeconds: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTodo(
        params.title,
        params.description,
        params.priority,
        params.category,
        params.dueDate,
        params.subtasks,
        params.timerSeconds,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["myStats"] });
    },
  });
}

export function useUpdateTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title?: string | null;
      description?: string | null;
      completed?: boolean | null;
      priority?: Priority | null;
      category?: string | null;
      dueDate?: bigint | null;
      subtasks?: Subtask[] | null;
      timerSeconds?: bigint | null;
      timeSpent?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTodo(
        params.id,
        params.title ?? null,
        params.description ?? null,
        params.completed ?? null,
        params.priority ?? null,
        params.category ?? null,
        params.dueDate ?? null,
        params.subtasks ?? null,
        params.timerSeconds ?? null,
        params.timeSpent ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["myStats"] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTodo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Task deleted.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}

export function useFinishTimer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { todoId: bigint; timeSpent: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.finishTimer(params.todoId, params.timeSpent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useGetMyStats() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats | null>({
    queryKey: ["myStats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Devices ────────────────────────────────────────────────────────────────────

export function useGetAllDevices() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<[string, DeviceInfo][]>({
    queryKey: ["allDevices"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllDevices();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetDeviceList() {
  const { actor, isFetching } = useActor();
  return useQuery<DeviceInfo[]>({
    queryKey: ["deviceList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDeviceList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDeviceStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<DeviceStatus>({
    queryKey: ["deviceStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDefaultDeviceStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetDefaultDeviceStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<DeviceStatus>({
    queryKey: ["defaultDeviceStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDefaultDeviceStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGetAllDeviceStatuses() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<[string, DeviceStatus][]>({
    queryKey: ["allDeviceStatuses"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllDeviceStatuses();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deviceId,
      deviceName,
    }: { deviceId: string; deviceName: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addDevice(deviceId, deviceName, "simulated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      queryClient.invalidateQueries({ queryKey: ["deviceList"] });
    },
  });
}

export function useToggleDeviceLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleDeviceLock(deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
    },
  });
}

export function useToggleDefaultDeviceLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleDefaultDeviceLock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDeviceStatus"] });
    },
  });
}

export function useLockControl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleDefaultDeviceLock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDeviceStatus"] });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleDefaultDeviceLock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDeviceStatus"] });
    },
  });

  return { lockMutation, unlockMutation };
}

export function useUpdateDeviceFirmware() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deviceId,
      newStatus,
    }: { deviceId: string; newStatus: DeviceStatus }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateDeviceStatus(deviceId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDevices"] });
      queryClient.invalidateQueries({ queryKey: ["allDeviceStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["deviceStatus"] });
      toast.success("Firmware updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Firmware update failed: ${error.message}`);
    },
  });
}

// ── Users ──────────────────────────────────────────────────────────────────────

export function useGetUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserAccess[]>({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: UserAccess) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRemoveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDisableUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.disableUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useEnableUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.enableUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useSetUserAccessWindow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      uid,
      accessWindow,
    }: { uid: string; accessWindow: TimeSlot[] }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUserAccessWindow(uid, accessWindow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ── Access Events ──────────────────────────────────────────────────────────────

export function useGetAccessEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AccessEvent[]>({
    queryKey: ["accessEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccessEvents();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetFailedAccessEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<AccessEvent[]>({
    queryKey: ["failedAccessEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFailedAccessEventsLast24h();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useRecordAccessEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: AccessEvent) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordAccessEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessEvents"] });
      queryClient.invalidateQueries({ queryKey: ["failedAccessEvents"] });
    },
  });
}

export function useSimulateAccessAttempt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      rfidUid: string;
      userEmail: string;
      location: string;
      method: string;
      dayOfWeek: bigint;
      hourOfDay: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.simulateAccessAttempt(
        params.rfidUid,
        params.userEmail,
        params.location,
        params.method,
        params.dayOfWeek,
        params.hourOfDay,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessEvents"] });
    },
  });
}

// ── Smart Rules ────────────────────────────────────────────────────────────────

export function useGetSmartRules() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<SmartRule[]>({
    queryKey: ["smartRules"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSmartRules();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddSmartRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: SmartRule) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSmartRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smartRules"] });
    },
  });
}

export function useRemoveSmartRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ruleName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeSmartRule(ruleName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smartRules"] });
    },
  });
}

export function useGetSmartRuleExecutionLog() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<SmartRuleLog[]>({
    queryKey: ["smartRuleExecutionLog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSmartRuleExecutionLog();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useLogSmartRuleExecution() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ruleName,
      triggerCondition,
      actionTaken,
      outcome,
    }: {
      ruleName: string;
      triggerCondition: string;
      actionTaken: string;
      outcome: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.logSmartRuleExecution(
        ruleName,
        triggerCondition,
        actionTaken,
        outcome,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smartRuleExecutionLog"] });
    },
  });
}

// ── Vacation Mode ──────────────────────────────────────────────────────────────

export function useGetVacationModeStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["vacationMode"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getVacationModeStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

// Alias for backward compat
export const useGetVacationMode = useGetVacationModeStatus;

export function useEnableVacationMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.enableVacationMode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationMode"] });
    },
  });
}

export function useDisableVacationMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.disableVacationMode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationMode"] });
    },
  });
}

// ── Event Logs ─────────────────────────────────────────────────────────────────

export function useGetLogs() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<LogEvent[]>({
    queryKey: ["logs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventLogs();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetEventLogs() {
  return useGetLogs();
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────

export function useGetAdminDashboardData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdminDashboardData();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}
