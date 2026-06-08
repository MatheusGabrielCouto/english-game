import { type Href, router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { motivationSparkHref } from '@/constants/routes'
import {
  MotivationSparkForm,
  MotivationSparkService,
  type MotivationSparkFormValues,
} from '@/features/motivation-spark'
import { MOTIVATION_UI } from '@/features/motivation-spark/constants/motivation-ui'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

export default function MotivationSparkEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const sparkId = typeof id === 'string' ? id : ''
  const [spark, setSpark] = useState<MotivationSparkRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSpark = useCallback(async () => {
    if (!sparkId) return
    setIsLoading(true)
    try {
      const record = await MotivationSparkService.getById(sparkId)
      setSpark(record)
    } finally {
      setIsLoading(false)
    }
  }, [sparkId])

  useEffect(() => {
    void loadSpark()
  }, [loadSpark])

  const handleSubmit = async (input: MotivationSparkFormValues) => {
    if (!sparkId) return
    await MotivationSparkService.update(sparkId, input)
    router.replace(motivationSparkHref(sparkId) as Href)
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title="Editar faísca"
        subtitle={MOTIVATION_UI.hub.title}
        emoji={MOTIVATION_UI.hub.emoji}
      />
      {isLoading ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : spark ? (
        <MotivationSparkForm
          sparkId={spark.id}
          initialTitle={spark.title}
          initialBody={spark.body ?? ''}
          initialImages={spark.images}
          initialAudioUri={spark.audioUri}
          initialAudioDurationMs={spark.audioDurationMs}
          initialLinks={spark.links}
          initialCollectionId={spark.collectionId}
          submitLabel="Salvar alterações"
          onSubmit={handleSubmit}
        />
      ) : null}
    </ScreenContainer>
  )
}
