export interface DeviceHealthData {
  deviceId: string;
  temperature: number;
  cpuUsage: number;
  memoryUsage: number;
}

export function calculateAverageTemperature(
  devices: DeviceHealthData[],
): number {
  if (devices.length === 0) return 0;
  return Math.round(
    devices.reduce((sum, d) => sum + d.temperature, 0) / devices.length,
  );
}

export function calculateAverageMemoryUsage(
  devices: DeviceHealthData[],
): number {
  if (devices.length === 0) return 0;
  return Math.round(
    devices.reduce((sum, d) => sum + d.memoryUsage, 0) / devices.length,
  );
}

export function countWarningDevices(devices: DeviceHealthData[]): number {
  return devices.filter(
    (d) =>
      (d.temperature > 70 || d.memoryUsage > 80) &&
      d.temperature <= 85 &&
      d.memoryUsage <= 95,
  ).length;
}

export function countCriticalDevices(devices: DeviceHealthData[]): number {
  return devices.filter((d) => d.temperature > 85 || d.memoryUsage > 95).length;
}

export function calculateHealthScore(devices: DeviceHealthData[]): number {
  const warnings = countWarningDevices(devices);
  const criticals = countCriticalDevices(devices);
  const score = 100 - warnings * 5 - criticals * 10;
  return Math.max(0, Math.min(100, score));
}
