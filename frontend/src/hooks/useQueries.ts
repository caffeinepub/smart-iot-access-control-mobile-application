import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, DeviceStatus, UserAccess, SmartRule, LogEvent, DeviceInfo, SmartRuleLog } from '../backend';
import type { AccessEvent } from '../types/accessEvent';
import { toast } from 'sonner';

export type { AccessEvent };

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetDeviceStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DeviceStatus>({
    queryKey: ['deviceStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDefaultDeviceStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetAllDevices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, DeviceInfo][]>({
    queryKey: ['allDevices'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDevices();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetAllDeviceStatuses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[string, DeviceStatus][]>({
    queryKey: ['allDeviceStatuses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    mutationFn: async ({ deviceId, deviceName }: { deviceId: string; deviceName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDevice(deviceId, deviceName, 'simulated');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useToggleDeviceLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDeviceLock(deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useLockControl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDefaultDeviceLock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDefaultDeviceLock();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  return { lockMutation, unlockMutation };
}

export function useGetUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserAccess[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserAccess) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useRemoveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useEnableUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.enableUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useDisableUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.disableUser(uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useGetAccessEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AccessEvent[]>({
    queryKey: ['accessEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const logs = await actor.getEventLogs();
      return logs.map((log): AccessEvent => ({
        rfidUid: '',
        timestamp: log.timestamp,
        success: log.level !== 'ERROR',
        eventType: log.code,
        location: log.deviceId,
        method: log.code,
        userEmail: log.message,
      }));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LogEvent[]>({
    queryKey: ['logs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEventLogs();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetSmartRules() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SmartRule[]>({
    queryKey: ['smartRules'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.addSmartRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartRules'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useRemoveSmartRule() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeSmartRule(ruleName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartRules'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useGetVacationModeStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['vacationMode'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVacationModeStatus();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

export function useEnableVacationMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.enableVacationMode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationMode'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useDisableVacationMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.disableVacationMode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationMode'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}

export function useGetSmartRuleExecutionLog() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SmartRuleLog[]>({
    queryKey: ['smartRuleExecutionLog'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.logSmartRuleExecution(ruleName, triggerCondition, actionTaken, outcome);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartRuleExecutionLog'] });
    },
  });
}

export function useUpdateDeviceFirmware() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, newStatus }: { deviceId: string; newStatus: DeviceStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDeviceStatus(deviceId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
      queryClient.invalidateQueries({ queryKey: ['allDeviceStatuses'] });
      queryClient.invalidateQueries({ queryKey: ['deviceStatus'] });
      toast.success('Firmware updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Firmware update failed: ${error.message}`);
    },
  });
}
