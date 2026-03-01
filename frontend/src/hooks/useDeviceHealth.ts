import { useState, useEffect } from 'react';
import { useGetAllDevices } from './useQueries';
import type { DeviceHealthData } from '../utils/healthMetricsUtils';

function simulateTemperature(deviceId: string, seed: number): number {
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 40 + ((hash + seed) % 45);
}

function simulateCpuUsage(deviceId: string, seed: number): number {
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 20 + ((hash * 3 + seed) % 70);
}

function simulateMemoryUsage(deviceId: string, seed: number): number {
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 30 + ((hash * 7 + seed) % 60);
}

function simulateUptime(deviceId: string, seed: number): number {
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 85 + ((hash + seed) % 15);
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface DeviceHealthMetrics {
  temperature: number;
  memoryUsage: number;
  cpuLoad: number;
  uptime: number;
  status: HealthStatus;
}

export interface DeviceHealthSnapshot {
  deviceId: string;
  deviceName: string;
  temperature: number;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: number;
}

function deriveStatus(temperature: number, memoryUsage: number, cpuLoad: number): HealthStatus {
  if (temperature > 85 || memoryUsage > 95 || cpuLoad > 90) return 'critical';
  if (temperature > 70 || memoryUsage > 80 || cpuLoad > 75) return 'warning';
  return 'healthy';
}

export function useDeviceHealth() {
  const { data: devices = [] } = useGetAllDevices();
  const [seed, setSeed] = useState(0);
  const [history, setHistory] = useState<Map<string, DeviceHealthSnapshot[]>>(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      setSeed((s) => s + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (devices.length === 0) return;

    const now = Date.now();
    setHistory((prev) => {
      const next = new Map(prev);
      devices.forEach(([deviceId, deviceInfo]) => {
        const snap: DeviceHealthSnapshot = {
          deviceId,
          deviceName: deviceInfo.deviceName,
          temperature: simulateTemperature(deviceId, seed),
          cpuUsage: simulateCpuUsage(deviceId, seed),
          memoryUsage: simulateMemoryUsage(deviceId, seed),
          timestamp: now,
        };
        const existing = next.get(deviceId) ?? [];
        const updated = [...existing, snap].slice(-10);
        next.set(deviceId, updated);
      });
      return next;
    });
  }, [devices, seed]);

  const currentMetrics: DeviceHealthData[] = devices.map(([deviceId, deviceInfo]) => ({
    deviceId,
    deviceName: deviceInfo.deviceName,
    temperature: simulateTemperature(deviceId, seed),
    cpuUsage: simulateCpuUsage(deviceId, seed),
    memoryUsage: simulateMemoryUsage(deviceId, seed),
  }));

  // Per-device DeviceHealthMetrics map for DeviceHealthPanel usage
  const deviceMetricsMap = new Map<string, DeviceHealthMetrics>();
  devices.forEach(([deviceId]) => {
    const temp = simulateTemperature(deviceId, seed);
    const mem = simulateMemoryUsage(deviceId, seed);
    const cpu = simulateCpuUsage(deviceId, seed);
    const uptime = simulateUptime(deviceId, seed);
    deviceMetricsMap.set(deviceId, {
      temperature: temp,
      memoryUsage: mem,
      cpuLoad: cpu,
      uptime,
      status: deriveStatus(temp, mem, cpu),
    });
  });

  return { history, currentMetrics, devices, deviceMetricsMap };
}
