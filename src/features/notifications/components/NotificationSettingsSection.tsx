import { Switch, Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { theme } from '@/constants';
import {
    NotificationCategory,
    NotificationPermissionStatus,
    type NotificationSettings,
} from '@/types/notification';

import {
    CATEGORY_LABELS,
    MAX_DAILY_NOTIFICATIONS,
    STUDY_TIME_PRESETS,
} from '../constants/categories';
import { useNotifications } from '../hooks/use-notifications';

const PERMISSION_LABELS: Record<string, string> = {
  [NotificationPermissionStatus.GRANTED]: 'Ativada',
  [NotificationPermissionStatus.DENIED]: 'Negada',
  [NotificationPermissionStatus.UNDETERMINED]: 'Não solicitada',
  [NotificationPermissionStatus.UNAVAILABLE]: 'Indisponível neste dispositivo',
};

const CATEGORY_KEYS = [
  { key: 'dailyReminder' as const, category: NotificationCategory.DAILY_REMINDER },
  { key: 'streakReminder' as const, category: NotificationCategory.STREAK_REMINDER },
  { key: 'shieldWarning' as const, category: NotificationCategory.SHIELD_WARNING },
  { key: 'petReminder' as const, category: NotificationCategory.PET_REMINDER },
  { key: 'contractReminder' as const, category: NotificationCategory.CONTRACT_REMINDER },
  { key: 'achievementProgress' as const, category: NotificationCategory.ACHIEVEMENT_PROGRESS },
  { key: 'cityProgress' as const, category: NotificationCategory.CITY_PROGRESS },
];

export const NotificationSettingsSection = () => {
  const { settings, permissionStatus, isLoading, setEnabled, requestPermissions, updateSettings } =
    useNotifications();

  if (isLoading || !settings) {
    return null;
  }

  const handleToggleCategory = (key: keyof NotificationSettings, value: boolean) => {
    void updateSettings({ [key]: value });
  };

  const handleSelectTime = (hour: number, minute: number) => {
    void updateSettings({ preferredHour: hour, preferredMinute: minute });
  };

  const isTimeSelected = (hour: number, minute: number) =>
    settings.preferredHour === hour && settings.preferredMinute === minute;

  const permissionDenied = permissionStatus === NotificationPermissionStatus.DENIED;
  const permissionGranted = permissionStatus === NotificationPermissionStatus.GRANTED;

  return (
    <Card elevated accent className="border-primary/35">
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">🔔 Notificações</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">
        Lembretes inteligentes para manter sua jornada de estudos.
      </Text>

      <View className="mt-4 flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">Ativar lembretes</Text>
          <Text className="mt-1 text-xs text-muted">
            Status: {PERMISSION_LABELS[permissionStatus] ?? permissionStatus}
          </Text>
        </View>
        <Switch
          value={settings.enabled && permissionGranted}
          onValueChange={(value) => {
            void setEnabled(value);
          }}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.foreground}
          accessibilityLabel="Ativar notificações"
        />
      </View>

      {permissionDenied ? (
        <View className="mt-3">
          <Text className="text-xs text-warning">
            Permissão negada. O app continua funcionando normalmente — ative nas configurações do sistema
            se quiser receber lembretes.
          </Text>
          <View className="mt-3">
            <Button label="Tentar novamente" variant="secondary" onPress={() => void requestPermissions()} />
          </View>
        </View>
      ) : null}

      <Text className="mb-2 mt-5 text-sm font-semibold text-foreground">Horário preferido</Text>
      <View className="flex-row flex-wrap gap-2">
        {STUDY_TIME_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            label={preset.label}
            size="sm"
            variant={isTimeSelected(preset.hour, preset.minute) ? 'primary' : 'secondary'}
            onPress={() => handleSelectTime(preset.hour, preset.minute)}
          />
        ))}
      </View>

      <Text className="mb-2 mt-5 text-sm font-semibold text-foreground">Categorias</Text>
      <View className="gap-2">
        {CATEGORY_KEYS.map(({ key, category }) => (
          <View
            key={key}
            className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <Text className="flex-1 text-sm text-foreground">{CATEGORY_LABELS[category]}</Text>
            <Switch
              value={settings[key]}
              onValueChange={(value) => handleToggleCategory(key, value)}
              disabled={!settings.enabled || !permissionGranted}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.foreground}
              accessibilityLabel={`Ativar ${CATEGORY_LABELS[category]}`}
            />
          </View>
        ))}
      </View>

      <View className="mt-4 rounded-xl bg-primary/10 px-4 py-3">
        <Text className="text-xs font-semibold text-primary">
          Frequência: até {MAX_DAILY_NOTIFICATIONS} lembretes por dia · 1 por categoria
        </Text>
      </View>
    </Card>
  );
};
