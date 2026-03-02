import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DeviceStatus {
    batteryLevel: bigint;
    tamperDetected: boolean;
    wifiSignalStrength: bigint;
    isLocked: boolean;
    emergencyMode: boolean;
    firmwareVersion: string;
    lastSync: bigint;
    currentUsers: bigint;
}
export interface TimeSlot {
    day: bigint;
    endHour: bigint;
    startHour: bigint;
}
export interface UserAccess {
    accessLevel: UserRole;
    rfidUid: string;
    accessWindow: Array<TimeSlot>;
    name: string;
    role: UserRole;
    isActive: boolean;
    email: string;
    pinCode: string;
    failedAttempts: bigint;
    lastAccess: bigint;
}
export type Time = bigint;
export interface DeviceInfo {
    status: DeviceStatus;
    isConnected: boolean;
    deviceId: string;
    deviceName: string;
    lastSync: Time;
}
export interface LogEvent {
    code: string;
    level: string;
    message: string;
    deviceId: string;
    timestamp: Time;
}
export interface ToDo {
    id: bigint;
    title: string;
    owner: Principal;
    createdAt: bigint;
    completed: boolean;
    description: string;
}
export interface AccessEvent {
    rfidUid: string;
    method: string;
    userEmail: string;
    timestamp: bigint;
    success: boolean;
    location: string;
    eventType: string;
}
export interface SmartRuleLog {
    ruleName: string;
    triggerCondition: string;
    timestamp: Time;
    outcome: boolean;
    actionTaken: string;
}
export interface UserProfile {
    rfidUid: string;
    name: string;
    email: string;
}
export interface SmartRule {
    ruleName: string;
    action: string;
    active: boolean;
    createdBy: string;
    deviceId: string;
    users: Array<string>;
    schedule: string;
    triggers: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDevice(deviceId: string, deviceName: string, encryptedCredentials: string): Promise<void>;
    addSmartRule(rule: SmartRule): Promise<void>;
    addUser(user: UserAccess): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignDeviceToAdmin(deviceId: string): Promise<void>;
    createTodo(title: string, description: string): Promise<bigint>;
    deleteTodo(id: bigint): Promise<void>;
    disableUser(uid: string): Promise<void>;
    disableVacationMode(): Promise<void>;
    enableUser(uid: string): Promise<void>;
    enableVacationMode(): Promise<void>;
    getAccessEvents(): Promise<Array<AccessEvent>>;
    getAdminDashboardData(): Promise<{
        activeUsers: bigint;
        vacationMode: boolean;
        disabledUsers: bigint;
        failedAccessLast24h: bigint;
        accessEventFeed: Array<AccessEvent>;
        deviceStatuses: Array<[string, DeviceStatus]>;
        guestUsers: bigint;
        totalUsers: bigint;
        activeSmartRulesCount: bigint;
    }>;
    getAllDeviceStatuses(): Promise<Array<[string, DeviceStatus]>>;
    getAllDevices(): Promise<Array<[string, DeviceInfo]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDefaultDeviceStatus(): Promise<DeviceStatus>;
    getDeviceById(deviceId: string): Promise<{
        id: string;
        status: DeviceStatus;
        name: string;
        isConnected: boolean;
        lastSync: Time;
    }>;
    getDeviceCount(): Promise<bigint>;
    getDeviceList(): Promise<Array<DeviceInfo>>;
    getDeviceNameCache(): Promise<Array<[string, string]>>;
    getDeviceStatsById(deviceId: string): Promise<DeviceStatus | null>;
    getDeviceStatusById(deviceId: string): Promise<DeviceStatus | null>;
    getEventLogs(): Promise<Array<LogEvent>>;
    getFailedAccessEventsLast24h(): Promise<Array<AccessEvent>>;
    getSecurityDecoyStatus(): Promise<boolean>;
    getSmartRuleExecutionLog(): Promise<Array<SmartRuleLog>>;
    getSmartRules(): Promise<Array<SmartRule>>;
    getTodos(): Promise<Array<ToDo>>;
    getUserAccessWindow(uid: string): Promise<Array<TimeSlot>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(): Promise<Array<UserAccess>>;
    getVacationModeStatus(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isDeviceAdmin(deviceId: string): Promise<void>;
    logSmartRuleExecution(ruleName: string, triggerCondition: string, actionTaken: string, outcome: boolean): Promise<void>;
    recordAccessEvent(event: AccessEvent): Promise<void>;
    removeSmartRule(ruleName: string): Promise<void>;
    removeUser(uid: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserAccessWindow(uid: string, accessWindow: Array<TimeSlot>): Promise<void>;
    simulateAccessAttempt(rfidUid: string, userEmail: string, location: string, method: string, dayOfWeek: bigint, hourOfDay: bigint): Promise<boolean>;
    syncDevice(deviceId: string): Promise<void>;
    toggleDefaultDeviceLock(): Promise<void>;
    toggleDeviceLock(deviceId: string): Promise<void>;
    toggleHolidayLights(status: boolean): Promise<void>;
    updateDeviceStatus(deviceId: string, newStatus: DeviceStatus): Promise<void>;
    updateTodo(id: bigint, newTitle: string | null, newDescription: string | null, completed: boolean | null): Promise<void>;
}
