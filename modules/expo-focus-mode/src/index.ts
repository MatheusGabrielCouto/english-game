import { EventSubscription, requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type ForegroundAppEvent = { packageName: string };

type ExpoFocusModeNativeModule = {
  isAccessibilityServiceEnabled: () => Promise<boolean>;
  openAccessibilitySettings: () => Promise<void>;
  startMonitoring: (packages: string[], strictBlocking?: boolean) => Promise<void>;
  stopMonitoring: () => Promise<void>;
  getTrackingSnapshot: () => Promise<{
    isDistracted: boolean;
    packageName: string;
    foregroundPackage: string;
    distractedSeconds: number;
    trackingState: string;
  }>;
  addListener: (
    eventName: 'onForegroundAppChange',
    listener: (event: ForegroundAppEvent) => void,
  ) => EventSubscription;
};

let nativeModule: ExpoFocusModeNativeModule | null = null;

if (Platform.OS === 'android') {
  try {
    nativeModule = requireNativeModule<ExpoFocusModeNativeModule>('ExpoFocusMode');
  } catch {
    nativeModule = null;
  }
}

export const isAccessibilityServiceEnabled = async (): Promise<boolean> => {
  if (!nativeModule) return false;
  return nativeModule.isAccessibilityServiceEnabled();
};

export const openAccessibilitySettings = async (): Promise<void> => {
  if (!nativeModule) return;
  await nativeModule.openAccessibilitySettings();
};

export const startMonitoring = async (
  packages: string[],
  strictBlocking = true,
): Promise<void> => {
  if (!nativeModule) return;
  await nativeModule.startMonitoring(packages, strictBlocking);
};

export const stopMonitoring = async (): Promise<void> => {
  if (!nativeModule) return;
  await nativeModule.stopMonitoring();
};

export const getTrackingSnapshot = async () => {
  if (!nativeModule) return null;
  return nativeModule.getTrackingSnapshot();
};

export const addForegroundAppListener = (
  listener: (event: ForegroundAppEvent) => void,
): EventSubscription | null => {
  if (!nativeModule) return null;
  return nativeModule.addListener('onForegroundAppChange', listener);
};

export default {
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
  startMonitoring,
  stopMonitoring,
  getTrackingSnapshot,
  addForegroundAppListener,
};
