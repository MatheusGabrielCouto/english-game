import { useEffect, useState } from 'react';
import { AppState, Linking, Switch, Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { theme } from '@/constants';
import { getFocusBlockedApps, setBlockedAppEnabled } from '@/storage/repositories/focus-blocked-apps-repository';
import type { FocusAccessibilityStatusValue, FocusBlockedApp } from '@/types/focus-mode';
import { FocusAccessibilityStatus } from '@/types/focus-mode';

import { FOCUS_DURATION_OPTIONS, FOCUS_MESSAGES } from '../constants/focus-config';
import { useFocusMode } from '../hooks/use-focus-mode';
import { FocusMonitorBridge } from '../services/focus-monitor-bridge';

export const FocusSettingsSection = () => {
  const { settings, updateSettings, acceptDisclosure } = useFocusMode();
  const [apps, setApps] = useState<FocusBlockedApp[]>([]);
  const [accessibilityStatus, setAccessibilityStatus] = useState<FocusAccessibilityStatusValue | 'checking'>('checking');

  useEffect(() => {
    void getFocusBlockedApps().then(setApps);

    const refreshAccessibility = () => {
      void FocusMonitorBridge.getAccessibilityStatus().then(setAccessibilityStatus);
    };

    refreshAccessibility();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshAccessibility();
    });

    return () => subscription.remove();
  }, []);

  if (!settings) return null;

  const accessibilityLabel =
    accessibilityStatus === FocusAccessibilityStatus.ENABLED
      ? 'Ativado'
      : accessibilityStatus === FocusAccessibilityStatus.DISABLED
        ? 'Desativado — toque abaixo para configurar'
        : 'Indisponível neste dispositivo';

  const handleOpenAppSettings = () => {
    void Linking.openSettings();
  };

  const showRestrictedGuide =
    FocusMonitorBridge.isSupported() &&
    accessibilityStatus === FocusAccessibilityStatus.DISABLED;

  const handleToggleApp = async (packageName: string, enabled: boolean) => {
    await setBlockedAppEnabled(packageName, enabled);
    setApps((current) =>
      current.map((app) => (app.packageName === packageName ? { ...app, enabled } : app)),
    );
  };

  return (
    <Card elevated accent className="border-accent/30">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">🎯 Focus Mode</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">{FOCUS_MESSAGES.disclosureBody}</Text>

      <View className="mt-4 flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="flex-1 text-sm font-semibold text-foreground">Ativar Focus Mode</Text>
        <Switch
          value={settings.enabled}
          onValueChange={(value) => void updateSettings({ enabled: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
        />
      </View>

      <View className="mt-3 flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">Modo hardcore</Text>
          <Text className="mt-1 text-xs text-muted">Penalidades leves maiores por distração</Text>
        </View>
        <Switch
          value={settings.hardcoreMode}
          onValueChange={(value) => void updateSettings({ hardcoreMode: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.warning }}
        />
      </View>

      <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-muted">
        Duração padrão
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {FOCUS_DURATION_OPTIONS.map((minutes) => (
          <Button
            key={minutes}
            label={`${minutes}m`}
            variant={settings.defaultDurationMinutes === minutes ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => void updateSettings({ defaultDurationMinutes: minutes })}
          />
        ))}
      </View>

      <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-muted">
        Apps monitorados
      </Text>
      <View className="gap-2">
        {apps.slice(0, 8).map((app) => (
          <View
            key={app.packageName}
            className="flex-row items-center justify-between rounded-lg border border-border px-3 py-2">
            <Text className="text-sm text-foreground">{app.label}</Text>
            <Switch
              value={app.enabled}
              onValueChange={(value) => void handleToggleApp(app.packageName, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        ))}
      </View>

      <Text className="mt-4 text-xs text-muted">Acessibilidade: {accessibilityLabel}</Text>

      {showRestrictedGuide ? (
        <View className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
          <Text className="text-xs font-bold uppercase tracking-widest text-warning">
            {FOCUS_MESSAGES.restrictedSettingsTitle}
          </Text>
          <Text className="mt-2 text-xs leading-5 text-foreground-secondary">
            {FOCUS_MESSAGES.restrictedSettingsBody}
          </Text>
          <View className="mt-3 gap-1">
            {FOCUS_MESSAGES.restrictedSettingsSteps.map((step) => (
              <Text key={step} className="text-xs leading-5 text-muted">
                {step}
              </Text>
            ))}
          </View>
          <View className="mt-3">
            <Button
              label="Abrir configurações do app"
              variant="secondary"
              onPress={handleOpenAppSettings}
            />
          </View>
        </View>
      ) : null}

      {!settings.accessibilityDisclosureAccepted ? (
        <View className="mt-4">
          <Button label="Entendi — continuar" onPress={() => void acceptDisclosure()} />
        </View>
      ) : null}

      {FocusMonitorBridge.isSupported() ? (
        <View className="mt-3 gap-2">
          {showRestrictedGuide ? null : (
            <Button
              label="Abrir configurações do app"
              variant="secondary"
              onPress={handleOpenAppSettings}
            />
          )}
          <Button
            label="Abrir acessibilidade"
            variant="secondary"
            onPress={() => void FocusMonitorBridge.openAccessibilitySettings()}
          />
        </View>
      ) : null}
    </Card>
  );
};
