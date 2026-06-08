import { useState } from 'react'
import { ActivityIndicator, Alert, Switch, Text, View } from 'react-native'

import { Button, Card } from '@/components'
import { theme } from '@/constants'

import {
    MOTIVATION_AVOID_REPEAT_PRESETS,
    MOTIVATION_TIME_PRESETS,
} from '../constants/motivation-time-presets'
import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useMotivationSettings } from '../hooks/use-motivation-settings'
import { MotivationMediaExportService } from '../services/motivation-media-export-service'

const SettingRow = ({
  label,
  hint,
  value,
  onValueChange,
  trackColor = theme.colors.primary,
}: {
  label: string
  hint?: string
  value: boolean
  onValueChange: (value: boolean) => void
  trackColor?: string
}) => (
  <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
    <View className="flex-1 pr-3">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      {hint ? <Text className="mt-1 text-xs text-muted">{hint}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={(next) => void onValueChange(next)}
      trackColor={{ false: theme.colors.border, true: trackColor }}
      thumbColor={theme.colors.foreground}
      accessibilityLabel={label}
    />
  </View>
)

export const MotivationSettingsSection = () => {
  const { settings, isLoading, updateSettings } = useMotivationSettings()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportMedia = async () => {
    setIsExporting(true)
    try {
      await MotivationMediaExportService.exportZip()
    } catch (error) {
      Alert.alert(
        'Exportação falhou',
        error instanceof Error ? error.message : 'Tente novamente.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading || !settings) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    )
  }

  const isTimeSelected = (hour: number, minute: number) =>
    settings.preferredHour === hour && settings.preferredMinute === minute

  return (
    <View className="gap-4">
      <Card elevated accent className="gap-4 border-orange-500/30">
        <View>
          <Text className="text-xs font-bold uppercase tracking-widest text-streak">
            {MOTIVATION_UI.hub.emoji} {MOTIVATION_UI.settings.sectionTitle}
          </Text>
          <Text className="mt-1 text-sm text-foreground-secondary">
            {MOTIVATION_UI.settings.sectionBody}
          </Text>
        </View>

        <SettingRow
          label={MOTIVATION_UI.settings.enabledLabel}
          hint={MOTIVATION_UI.settings.enabledHint}
          value={settings.enabled}
          onValueChange={(value) => void updateSettings({ enabled: value })}
          trackColor={theme.colors.warning}
        />

        <SettingRow
          label={MOTIVATION_UI.settings.dailyNotificationLabel}
          hint={MOTIVATION_UI.settings.dailyNotificationHint}
          value={settings.dailyNotification}
          onValueChange={(value) => void updateSettings({ dailyNotification: value })}
          trackColor={theme.colors.warning}
        />

        <SettingRow
          label={MOTIVATION_UI.settings.showOnHomeLabel}
          hint={MOTIVATION_UI.settings.showOnHomeHint}
          value={settings.showOnHome}
          onValueChange={(value) => void updateSettings({ showOnHome: value })}
          trackColor={theme.colors.warning}
        />

        <SettingRow
          label={MOTIVATION_UI.settings.eveningNotificationLabel}
          hint={MOTIVATION_UI.settings.eveningNotificationHint}
          value={settings.eveningNotification}
          onValueChange={(value) => void updateSettings({ eveningNotification: value })}
          trackColor={theme.colors.warning}
        />

        <View>
          <Text className="mb-2 text-sm font-semibold text-foreground">
            {MOTIVATION_UI.settings.preferredTimeLabel}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {MOTIVATION_TIME_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                label={preset.label}
                size="sm"
                variant={isTimeSelected(preset.hour, preset.minute) ? 'primary' : 'secondary'}
                onPress={() =>
                  void updateSettings({
                    preferredHour: preset.hour,
                    preferredMinute: preset.minute,
                  })
                }
              />
            ))}
          </View>
        </View>

        {settings.eveningNotification ? (
          <View>
            <Text className="mb-2 text-sm font-semibold text-foreground">
              {MOTIVATION_UI.settings.eveningTimeLabel}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MOTIVATION_TIME_PRESETS.map((preset) => {
                const selected =
                  settings.eveningHour === preset.hour &&
                  settings.eveningMinute === preset.minute
                return (
                  <Button
                    key={`evening-${preset.label}`}
                    label={preset.label}
                    size="sm"
                    variant={selected ? 'primary' : 'secondary'}
                    onPress={() =>
                      void updateSettings({
                        eveningHour: preset.hour,
                        eveningMinute: preset.minute,
                      })
                    }
                  />
                )
              })}
            </View>
          </View>
        ) : null}

        <View>
          <Text className="text-sm font-semibold text-foreground">
            {MOTIVATION_UI.settings.avoidRepeatLabel}
          </Text>
          <Text className="mt-1 text-xs text-muted">{MOTIVATION_UI.settings.avoidRepeatHint}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {MOTIVATION_AVOID_REPEAT_PRESETS.map((days) => (
              <Button
                key={days}
                label={MOTIVATION_UI.settings.avoidRepeatDays(days)}
                size="sm"
                variant={settings.avoidRepeatDays === days ? 'primary' : 'secondary'}
                onPress={() => void updateSettings({ avoidRepeatDays: days })}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card className="gap-4 border-border/80">
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MOTIVATION_UI.settings.globalNotificationsHint}
        </Text>
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MOTIVATION_UI.settings.backupHint}
        </Text>
        <Button
          label={MOTIVATION_UI.settings.exportMediaCta}
          variant="secondary"
          loading={isExporting}
          onPress={handleExportMedia}
          accessibilityLabel={MOTIVATION_UI.settings.exportMediaCta}
        />
        <Text className="text-xs text-muted">{MOTIVATION_UI.settings.exportMediaHint}</Text>
      </Card>
    </View>
  )
}
