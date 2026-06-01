import { Platform } from 'react-native';
import type { EventSubscription } from 'expo-modules-core';

import {
  addForegroundAppListener,
  getTrackingSnapshot as nativeGetTrackingSnapshot,
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
  startMonitoring as nativeStartMonitoring,
  stopMonitoring as nativeStopMonitoring,
} from 'expo-focus-mode';

import {
  FocusAccessibilityStatus,
  type FocusAccessibilityStatusValue,
} from '@/types/focus-mode';

type ForegroundListener = (packageName: string) => void;

export type FocusTrackingSnapshot = {
  isDistracted: boolean;
  packageName: string;
  foregroundPackage: string;
  distractedSeconds: number;
  trackingState: 'focusing' | 'distracted' | 'idle' | 'paused';
};

let foregroundListener: ForegroundListener | null = null;
let monitoringActive = false;
let nativeSubscription: EventSubscription | null = null;

const parseSnapshot = (raw: Record<string, unknown>): FocusTrackingSnapshot => ({
  isDistracted: Boolean(raw.isDistracted),
  packageName: String(raw.packageName ?? ''),
  foregroundPackage: String(raw.foregroundPackage ?? ''),
  distractedSeconds: Number(raw.distractedSeconds ?? 0),
  trackingState:
    raw.trackingState === 'distracted' ||
    raw.trackingState === 'focusing' ||
    raw.trackingState === 'paused'
      ? raw.trackingState
      : 'idle',
});

export const FocusMonitorBridge = {
  isSupported(): boolean {
    return Platform.OS === 'android';
  },

  async getAccessibilityStatus(): Promise<FocusAccessibilityStatusValue> {
    if (!this.isSupported()) return FocusAccessibilityStatus.UNSUPPORTED;
    try {
      const enabled = await isAccessibilityServiceEnabled();
      return enabled ? FocusAccessibilityStatus.ENABLED : FocusAccessibilityStatus.DISABLED;
    } catch {
      return FocusAccessibilityStatus.DISABLED;
    }
  },

  async openAccessibilitySettings(): Promise<void> {
    try {
      await openAccessibilitySettings();
    } catch {
      // Native module unavailable in this build
    }
  },

  async getTrackingSnapshot(): Promise<FocusTrackingSnapshot | null> {
    if (!monitoringActive) return null;
    try {
      const snapshot = await nativeGetTrackingSnapshot();
      if (!snapshot) return null;
      return parseSnapshot(snapshot as Record<string, unknown>);
    } catch {
      return null;
    }
  },

  async startMonitoring(blockedPackages: string[], strictBlocking = true): Promise<void> {
    monitoringActive = true;
    try {
      await nativeStartMonitoring(blockedPackages, strictBlocking);
      nativeSubscription?.remove();
      nativeSubscription = addForegroundAppListener(({ packageName }) => {
        foregroundListener?.(packageName);
      });
    } catch {
      monitoringActive = false;
      nativeSubscription?.remove();
      nativeSubscription = null;
    }
  },

  async stopMonitoring(): Promise<void> {
    monitoringActive = false;
    nativeSubscription?.remove();
    nativeSubscription = null;

    try {
      await nativeStopMonitoring();
    } catch {
      // ignore
    }
    foregroundListener = null;
  },

  onForegroundApp(listener: ForegroundListener): () => void {
    foregroundListener = listener;
    return () => {
      if (foregroundListener === listener) foregroundListener = null;
    };
  },

  isMonitoring(): boolean {
    return monitoringActive;
  },
};
