import AsyncStorage from '@react-native-async-storage/async-storage'

import { buildMotivationNotificationSnippet } from '@/features/motivation-spark/utils/motivation-snippet'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

export const MOTIVATION_WIDGET_SNAPSHOT_KEY = 'eq.widget.motivation_snapshot.v1'

export type MotivationWidgetSnapshot = {
  schemaVersion: 1
  updatedAt: string
  sparkId: string | null
  title: string | null
  snippet: string | null
  imageUri: string | null
}

export const EMPTY_MOTIVATION_WIDGET_SNAPSHOT: MotivationWidgetSnapshot = {
  schemaVersion: 1,
  updatedAt: new Date(0).toISOString(),
  sparkId: null,
  title: null,
  snippet: null,
  imageUri: null,
}

export const buildMotivationWidgetSnapshot = (
  spark: MotivationSparkRecord | null,
): MotivationWidgetSnapshot => {
  if (!spark) return { ...EMPTY_MOTIVATION_WIDGET_SNAPSHOT, updatedAt: new Date().toISOString() }

  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    sparkId: spark.id,
    title: spark.title,
    snippet: buildMotivationNotificationSnippet(spark),
    imageUri: spark.images[0] ?? null,
  }
}

export const persistMotivationWidgetSnapshot = async (
  spark: MotivationSparkRecord | null,
): Promise<void> => {
  const snapshot = buildMotivationWidgetSnapshot(spark)
  await AsyncStorage.setItem(MOTIVATION_WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot))
}
