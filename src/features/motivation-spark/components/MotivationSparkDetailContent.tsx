import { type Href, router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'
import { JournalEntryImageGallery } from '@/features/english-journal/components/JournalEntryImageGallery'
import { JournalVoicePlayer } from '@/features/english-journal/components/JournalVoicePlayer'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { MotivationDailyPickService } from '../services/motivation-daily-pick-service'
import { MotivationSparkService } from '../services/motivation-spark-service'
import { MotivationDetailSection } from './MotivationDetailSection'
import { MotivationLinkCard } from './MotivationLinkCard'
import { MotivationSparkDetailHero } from './MotivationSparkDetailHero'

type MotivationSparkDetailContentProps = {
  sparkId: string
}

export const MotivationSparkDetailContent = ({ sparkId }: MotivationSparkDetailContentProps) => {
  const [spark, setSpark] = useState<MotivationSparkRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSpark = useCallback(async () => {
    setIsLoading(true)
    try {
      const record = await MotivationSparkService.getById(sparkId)
      setSpark(record)
      if (record) {
        void MotivationDailyPickService.markOpenedForSpark(record.id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [sparkId])

  useEffect(() => {
    void loadSpark()
  }, [loadSpark])

  const handleEdit = () => {
    router.push(`${routes.motivation.detail}/${sparkId}/edit` as Href)
  }

  const handleArchive = () => {
    Alert.alert('Arquivar faísca', 'Ela sairá da rotação diária, mas continua salva.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: MOTIVATION_UI.detail.archiveCta,
        onPress: () => {
          void MotivationSparkService.archive(sparkId).then(() => {
            router.back()
          })
        },
      },
    ])
  }

  const handleUnarchive = () => {
    void MotivationSparkService.unarchive(sparkId).then((updated) => setSpark(updated))
  }

  const handleDelete = () => {
    Alert.alert('Excluir faísca', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: MOTIVATION_UI.detail.deleteCta,
        style: 'destructive',
        onPress: () => {
          void MotivationSparkService.delete(sparkId).then(() => {
            router.back()
          })
        },
      },
    ])
  }

  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    )
  }

  if (!spark) {
    return (
      <GameCard variant="hero" className="items-center border-dashed border-orange-500/30 py-10">
        <Text className="text-4xl">{MOTIVATION_UI.hub.emoji}</Text>
        <Text className="mt-4 text-center text-foreground-secondary">
          {MOTIVATION_UI.detail.notFound}
        </Text>
      </GameCard>
    )
  }

  const extraImages = spark.images.length > 1 ? spark.images.slice(1) : []

  return (
    <View className="gap-6">
      {spark.isArchived ? (
        <GameCard className="border-dashed border-border/80 bg-surface/60">
          <Text className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
            {MOTIVATION_UI.detail.archivedBadge}
          </Text>
          <Text className="mt-2 text-sm leading-6 text-foreground-secondary">
            {MOTIVATION_UI.detail.archivedBanner}
          </Text>
        </GameCard>
      ) : null}

      <MotivationSparkDetailHero spark={spark} />

      {extraImages.length > 0 ? (
        <MotivationDetailSection label="Galeria">
          <JournalEntryImageGallery images={extraImages} />
        </MotivationDetailSection>
      ) : null}

      {spark.body ? (
        <MotivationDetailSection label={MOTIVATION_UI.detail.messageSection}>
          <GameCard className="border-l-4 border-l-orange-500/50 bg-surface-elevated">
            <Text className="text-base italic leading-7 text-foreground-secondary">{spark.body}</Text>
          </GameCard>
        </MotivationDetailSection>
      ) : null}

      {spark.audioUri ? (
        <MotivationDetailSection label={MOTIVATION_UI.detail.voiceSection}>
          <JournalVoicePlayer
            entryId={`motivation-${spark.id}`}
            audioUri={spark.audioUri}
            durationMs={spark.audioDurationMs}
            awardReplayXp={false}
          />
        </MotivationDetailSection>
      ) : null}

      {spark.links.length > 0 ? (
        <MotivationDetailSection label={MOTIVATION_UI.detail.linksSection}>
          <View className="gap-3">
            {spark.links.map((link, index) => (
              <MotivationLinkCard key={`${link.url}-${index}`} link={link} />
            ))}
          </View>
        </MotivationDetailSection>
      ) : null}

      <GameCard className="gap-3 border-border/80">
        <Button
          variant="secondary"
          label={spark.isPinned ? MOTIVATION_UI.detail.unpinCta : MOTIVATION_UI.detail.pinCta}
          onPress={() => {
            void MotivationSparkService.togglePinned(sparkId).then((updated) => setSpark(updated))
          }}
        />
        <Button
          variant="secondary"
          label={
            spark.isFavorite ? MOTIVATION_UI.detail.unfavoriteCta : MOTIVATION_UI.detail.favoriteCta
          }
          onPress={() => {
            void MotivationSparkService.toggleFavorite(sparkId).then((updated) => setSpark(updated))
          }}
        />
        <Button variant="secondary" label={MOTIVATION_UI.detail.editCta} onPress={handleEdit} />
        {spark.isArchived ? (
          <Button
            variant="secondary"
            label={MOTIVATION_UI.detail.unarchiveCta}
            onPress={handleUnarchive}
          />
        ) : (
          <Button variant="secondary" label={MOTIVATION_UI.detail.archiveCta} onPress={handleArchive} />
        )}
      </GameCard>

      <Button variant="danger" label={MOTIVATION_UI.detail.deleteCta} onPress={handleDelete} />
    </View>
  )
}
