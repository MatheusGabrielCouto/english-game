import { router, type Href } from 'expo-router'
import { Text, View } from 'react-native'

import { Button, ProgressBar } from '@/components'
import { GameCard } from '@/components/ui/game'
import { LearningUnitStatus, type LearningCurriculumUnitView } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningCurriculumService } from '../services/learning-curriculum-service'

type LearningCurriculumUnitCardProps = {
  unit: LearningCurriculumUnitView
  onUpdated?: () => void
  featured?: boolean
}

export const LearningCurriculumUnitCard = ({
  unit,
  onUpdated,
  featured = false,
}: LearningCurriculumUnitCardProps) => {
  const { progress } = unit
  const isLocked = progress.status === LearningUnitStatus.LOCKED
  const isCompleted = progress.status === LearningUnitStatus.COMPLETED
  const kindLabel = LEARNING_GPS_UI.unitKind[unit.kind]

  const handlePractice = () => {
    router.push(unit.practiceRoute as Href)
  }

  const handleMarkDone = () => {
    void LearningCurriculumService.completeUnitManually(unit.key).then(() => onUpdated?.())
  }

  return (
    <GameCard
      variant={featured && !isCompleted && !isLocked ? 'quest' : 'default'}
      glow={featured && !isCompleted && !isLocked}
      className={
        isCompleted
          ? 'border-success/35 bg-success/5'
          : isLocked
            ? 'border-dashed border-border/60 opacity-60'
            : featured
              ? 'border-primary/35'
              : 'border-border/80'
      }>
      <View className="flex-row items-start gap-3">
        <Text className="text-2xl">{unit.emoji}</Text>
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-bold text-foreground">{unit.title}</Text>
            <Text className="text-[10px] font-black uppercase tracking-widest text-muted">{kindLabel}</Text>
          </View>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{unit.description}</Text>

          {isLocked ? (
            <Text className="mt-2 text-xs text-muted">{LEARNING_GPS_UI.screen.unitLocked}</Text>
          ) : isCompleted ? (
            <Text className="mt-2 text-xs font-semibold text-success">
              {LEARNING_GPS_UI.screen.unitCompleted}
            </Text>
          ) : (
            <>
              <Text className="mt-2 text-xs font-semibold text-accent">
                {LEARNING_GPS_UI.screen.unitPractice(
                  progress.practiceProgress,
                  unit.requiredPracticeAmount,
                )}
              </Text>
              <View className="mt-2">
                <ProgressBar
                  value={progress.practiceProgress}
                  max={unit.requiredPracticeAmount}
                  height="sm"
                />
              </View>
              <View className="mt-3 gap-2">
                <Button
                  label={unit.practiceLabel}
                  size={featured ? 'md' : 'sm'}
                  variant={featured ? 'primary' : 'secondary'}
                  onPress={handlePractice}
                />
                <Button
                  label={LEARNING_GPS_UI.screen.markUnitDone}
                  size="sm"
                  variant="ghost"
                  onPress={handleMarkDone}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </GameCard>
  )
}
