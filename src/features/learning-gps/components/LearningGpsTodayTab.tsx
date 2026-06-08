import { Text, View } from 'react-native'

import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import type { DailyStudyBlock } from '@/types/learning-gps'
import type { RoutineTodayItem } from '@/types/routine'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsDailyBlockRow } from './LearningGpsDailyBlockRow'
import { LearningGpsRoutinesSection } from './LearningGpsRoutinesSection'

type LearningGpsTodayTabProps = {
  todayBlocks: DailyStudyBlock[]
  todayRoutines: RoutineTodayItem[]
  completedBlocksCount: number
  totalBlocksCount: number
  completedRoutinesCount: number
  totalRoutinesCount: number
  targetMinutes: number
  prioritySkillKeys: string[]
  onUpdated?: () => void
}

export const LearningGpsTodayTab = ({
  todayBlocks,
  todayRoutines,
  completedBlocksCount,
  totalBlocksCount,
  completedRoutinesCount,
  totalRoutinesCount,
  targetMinutes,
  prioritySkillKeys,
  onUpdated,
}: LearningGpsTodayTabProps) => {
  const allBlocksDone = totalBlocksCount > 0 && completedBlocksCount === totalBlocksCount

  return (
    <View className="gap-5">
      <View className="gap-3">
        <HomeSectionLabel
          emoji="📅"
          title={LEARNING_GPS_UI.screen.todayTitle}
          subtitle={`${LEARNING_GPS_UI.home.todaySubtitle(targetMinutes)} · ${LEARNING_GPS_UI.home.blocksProgress(completedBlocksCount, totalBlocksCount)}`}
          tone="primary"
        />

        {allBlocksDone ? (
          <View className="rounded-xl border border-success/35 bg-success/5 px-4 py-3">
            <Text className="text-sm font-semibold text-success">
              Todos os blocos de hoje concluídos
            </Text>
          </View>
        ) : null}

        <View className="gap-2">
          {todayBlocks.map((block) => (
            <LearningGpsDailyBlockRow
              key={block.id}
              block={block}
              isPriority={prioritySkillKeys.includes(block.skillKey)}
              onUpdated={onUpdated}
            />
          ))}
        </View>
      </View>

      <LearningGpsRoutinesSection
        routines={todayRoutines}
        completedCount={completedRoutinesCount}
        totalCount={totalRoutinesCount}
        onUpdated={onUpdated}
      />
    </View>
  )
}
