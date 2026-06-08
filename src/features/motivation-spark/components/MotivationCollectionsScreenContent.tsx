import { type Href, router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Text, TextInput, View } from 'react-native'

import { Button, EmptyState } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { routes } from '@/constants'
import type { MotivationCollectionRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useMotivationCollections } from '../hooks/use-motivation-collections'
import { useMotivationSparks } from '../hooks/use-motivation-sparks'
import { MotivationCollectionService } from '../services/motivation-collection-service'

export const MotivationCollectionsScreenContent = () => {
  const { collections, refresh, isLoading } = useMotivationCollections()
  const { sparks } = useMotivationSparks()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🔥')
  const [isCreating, setIsCreating] = useState(false)

  const countForCollection = useCallback(
    (collectionId: string) => sparks.filter((spark) => spark.collectionId === collectionId).length,
    [sparks],
  )

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      await MotivationCollectionService.create({ name, emoji })
      setName('')
      setEmoji('🔥')
      await refresh()
    } catch (error) {
      Alert.alert(
        'Não foi possível criar',
        error instanceof Error ? error.message : 'Tente novamente.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = (collection: MotivationCollectionRecord) => {
    Alert.alert('Excluir coleção', `Remover "${collection.name}"? As faíscas ficam sem coleção.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: MOTIVATION_UI.collections.deleteCta,
        style: 'destructive',
        onPress: () => {
          void MotivationCollectionService.delete(collection.id).then(refresh)
        },
      },
    ])
  }

  const handleOpenHub = () => {
    router.push(routes.motivation.hub as Href)
  }

  if (isLoading) return null

  return (
    <View className="gap-6">
      <GameCard variant="reward" className="gap-3 border-orange-500/30">
        <Text className="text-xs font-bold uppercase tracking-widest text-streak">
          {MOTIVATION_UI.collections.emoji} {MOTIVATION_UI.collections.title}
        </Text>
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MOTIVATION_UI.collections.subtitle}
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            className={`flex-1 rounded-xl border bg-surface px-3 py-2 text-foreground ${formInputBorderClass(false)}`}
            value={name}
            onChangeText={setName}
            placeholder={MOTIVATION_UI.collections.namePlaceholder}
            accessibilityLabel={MOTIVATION_UI.collections.namePlaceholder}
          />
          <TextInput
            className={`w-14 rounded-xl border bg-surface px-2 py-2 text-center text-xl ${formInputBorderClass(false)}`}
            value={emoji}
            onChangeText={setEmoji}
            maxLength={2}
            accessibilityLabel={MOTIVATION_UI.collections.emojiLabel}
          />
        </View>
        <Button
          label={MOTIVATION_UI.collections.createCta}
          loading={isCreating}
          onPress={handleCreate}
        />
      </GameCard>

      {collections.length === 0 ? (
        <EmptyState
          variant="vault"
          emoji={MOTIVATION_UI.collections.emoji}
          title={MOTIVATION_UI.collections.emptyTitle}
          description={MOTIVATION_UI.collections.emptyBody}
          illustrated={false}
        />
      ) : (
        collections.map((collection) => (
          <PressableScale
            key={collection.id}
            onPress={handleOpenHub}
            accessibilityRole="button"
            accessibilityLabel={`${collection.name}, ${MOTIVATION_UI.collections.sparksCount(countForCollection(collection.id))}`}
          >
            <GameCard className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <Text className="text-2xl">{collection.emoji}</Text>
                <View className="flex-1">
                  <Text className="font-bold text-foreground">{collection.name}</Text>
                  <Text className="mt-1 text-xs text-muted">
                    {MOTIVATION_UI.collections.sparksCount(countForCollection(collection.id))}
                  </Text>
                </View>
              </View>
              <Button
                label={MOTIVATION_UI.detail.deleteCta}
                size="sm"
                variant="danger"
                onPress={() => handleDelete(collection)}
              />
            </GameCard>
          </PressableScale>
        ))
      )}
    </View>
  )
}
