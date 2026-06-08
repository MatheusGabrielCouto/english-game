import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { Button, ProgressBar } from '@/components'
import { GameCard } from '@/components/ui/game'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { LearningUnitStatus, type LearningCurriculumSnapshot } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { getWorldCheckpointCopy } from '../constants/world-checkpoints'
import { LearningCurriculumUnitCard } from './LearningCurriculumUnitCard'

type LearningCurriculumSectionProps = {
  curriculum: LearningCurriculumSnapshot
  worldName: string
  worldEmoji: string
  onUpdated?: () => void
}

export const LearningCurriculumSection = ({
  curriculum,
  worldName,
  worldEmoji,
  onUpdated,
}: LearningCurriculumSectionProps) => {
  const [showAll, setShowAll] = useState(false)
  const checkpointCopy = getWorldCheckpointCopy(curriculum.worldKey)

  const { activeUnit, completedUnits, lockedUnits, visibleUnits, defaultVisible } = useMemo(() => {
    const active = curriculum.units.find(
      (unit) =>
        unit.progress.status === LearningUnitStatus.AVAILABLE ||
        unit.progress.status === LearningUnitStatus.IN_PROGRESS,
    )
    const completed = curriculum.units.filter(
      (unit) => unit.progress.status === LearningUnitStatus.COMPLETED,
    )
    const locked = curriculum.units.filter(
      (unit) => unit.progress.status === LearningUnitStatus.LOCKED,
    )

    const defaultVisible = active ? [active] : []

    return {
      activeUnit: active,
      completedUnits: completed,
      lockedUnits: locked,
      defaultVisible,
      visibleUnits: showAll ? curriculum.units : defaultVisible,
    }
  }, [curriculum.units, showAll])

  const progressPercent = Math.round(
    (curriculum.completedCount / Math.max(curriculum.totalCount, 1)) * 100,
  )

  return (
    <View className="gap-3">
      <HomeSectionLabel
        emoji={worldEmoji}
        title={LEARNING_GPS_UI.screen.curriculumTitle(worldName)}
        subtitle={LEARNING_GPS_UI.screen.curriculumSubtitle(
          curriculum.completedCount,
          curriculum.totalCount,
        )}
        tone="accent"
      />

      <GameCard className="border-accent/25">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Progresso do mundo</Text>
          <Text className="text-sm font-bold text-accent">{progressPercent}%</Text>
        </View>
        <View className="mt-2">
          <ProgressBar value={curriculum.completedCount} max={curriculum.totalCount} height="sm" />
        </View>
      </GameCard>

      {curriculum.checkpointCompleted ? (
        <GameCard variant="reward" className="border-success/35 bg-success/5">
          <Text className="text-sm font-semibold text-success">{checkpointCopy.done}</Text>
        </GameCard>
      ) : activeUnit?.kind === 'checkpoint' ? (
        <GameCard variant="quest" glow className="border-accent/35 bg-accent/5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
            Meta do mundo
          </Text>
          <Text className="mt-2 text-sm leading-6 text-foreground-secondary">
            {checkpointCopy.pending}
          </Text>
        </GameCard>
      ) : (
        <GameCard className="border-accent/15 bg-accent/5">
          <Text className="text-sm leading-6 text-foreground-secondary">{checkpointCopy.pending}</Text>
        </GameCard>
      )}

      {!showAll && completedUnits.length > 0 ? (
        <Text className="text-xs font-semibold text-success">
          {LEARNING_GPS_UI.screen.completedUnits(completedUnits.length)}
        </Text>
      ) : null}

      <View className="gap-2">
        {visibleUnits.map((unit) => (
          <LearningCurriculumUnitCard
            key={unit.key}
            unit={unit}
            featured={unit.key === activeUnit?.key}
            onUpdated={onUpdated}
          />
        ))}
      </View>

      {!showAll && lockedUnits.length > 0 ? (
        <Text className="text-xs text-muted">{LEARNING_GPS_UI.screen.lockedUnits(lockedUnits.length)}</Text>
      ) : null}

      {curriculum.units.length > defaultVisible.length || showAll ? (
        <Button
          label={
            showAll
              ? LEARNING_GPS_UI.screen.collapseUnits
              : LEARNING_GPS_UI.screen.expandUnits(curriculum.units.length)
          }
          size="sm"
          variant="ghost"
          onPress={() => setShowAll((value) => !value)}
        />
      ) : null}
    </View>
  )
}
