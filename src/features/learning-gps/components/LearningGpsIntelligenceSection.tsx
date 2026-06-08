import { type Href, router } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import type { LearningIntelligenceSnapshot } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { LearningGpsMissionCard } from './LearningGpsMissionCard'

type LearningGpsIntelligenceSectionProps = {
  intelligence: LearningIntelligenceSnapshot
  compact?: boolean
}

export const LearningGpsIntelligenceSection = ({
  intelligence,
  compact = false,
}: LearningGpsIntelligenceSectionProps) => {
  const { weaknesses, missions, weeklyPlan, monthlyReport } = intelligence
  const todayPlan = weeklyPlan.days.find((day) => day.isToday)
  const [showWeekly, setShowWeekly] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)

  const handleOpenJournal = () => {
    router.push(routes.englishJournal as Href)
  }

  const secondaryMissions = compact ? missions.slice(1) : missions

  return (
    <View className="gap-5">
      <HomeSectionLabel
        emoji="🧠"
        title={LEARNING_GPS_UI.screen.intelligenceTitle}
        subtitle={LEARNING_GPS_UI.screen.intelligenceSubtitle}
        tone="gold"
      />

      {weaknesses.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-black uppercase tracking-widest text-muted">
            {LEARNING_GPS_UI.screen.weaknessesTitle}
          </Text>
          {weaknesses.slice(0, compact ? 2 : weaknesses.length).map((weakness) => {
            const skill = LEARNING_SKILL_BY_KEY[weakness.skillKey]
            return (
              <GameCard key={weakness.skillKey} className="border-warning/30 bg-warning/5">
                <Text className="font-bold text-foreground">
                  {skill.emoji} {skill.label} · {weakness.level}/100
                </Text>
                <Text className="mt-1 text-sm text-foreground-secondary">
                  {LEARNING_GPS_UI.screen.weaknessGap(weakness.gapPercent)}
                </Text>
              </GameCard>
            )
          })}
        </View>
      ) : (
        <GameCard className="border-success/25 bg-success/5">
          <Text className="text-sm text-foreground-secondary">{LEARNING_GPS_UI.screen.weaknessesEmpty}</Text>
        </GameCard>
      )}

      {!compact && secondaryMissions.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-black uppercase tracking-widest text-muted">
            {LEARNING_GPS_UI.screen.missionsTitle}
          </Text>
          {secondaryMissions.map((mission) => (
            <LearningGpsMissionCard key={mission.id} mission={mission} />
          ))}
        </View>
      ) : null}

      {todayPlan ? (
        <GameCard className="border-primary/25 bg-primary/5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
            {LEARNING_GPS_UI.screen.weeklyToday}
          </Text>
          <Text className="mt-2 font-bold text-foreground">{todayPlan.label}</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">
            {todayPlan.isProjectDay
              ? weeklyPlan.projectTitle
              : todayPlan.isReviewDay
                ? LEARNING_GPS_UI.screen.weeklyReviewDay
                : todayPlan.isSpeakingDay
                  ? LEARNING_GPS_UI.screen.weeklySpeakingDay
                  : todayPlan.focusSkills.map((key) => LEARNING_SKILL_BY_KEY[key].label).join(' + ')}
          </Text>
          {todayPlan.isProjectDay ? (
            <View className="mt-3">
              <Button label="Abrir English Journal" size="sm" variant="secondary" onPress={handleOpenJournal} />
            </View>
          ) : null}
        </GameCard>
      ) : null}

      <Pressable onPress={() => setShowWeekly((value) => !value)} accessibilityRole="button">
        <Text className="text-sm font-bold text-accent">
          {showWeekly ? LEARNING_GPS_UI.screen.hideWeeklyPlan : LEARNING_GPS_UI.screen.showWeeklyPlan}
        </Text>
      </Pressable>

      {showWeekly ? (
        <GameCard className="gap-2 border-border/80">
          {weeklyPlan.days.map((day) => (
            <View
              key={day.weekday}
              className={`rounded-lg px-3 py-2 ${day.isToday ? 'bg-accent/10' : 'bg-background/40'}`}>
              <Text className={`text-sm font-bold ${day.isToday ? 'text-accent' : 'text-foreground'}`}>
                {day.label}
              </Text>
              <Text className="mt-0.5 text-xs text-foreground-secondary">
                {day.isProjectDay
                  ? LEARNING_GPS_UI.screen.weeklyProjectTitle
                  : day.isReviewDay
                    ? LEARNING_GPS_UI.screen.weeklyReviewDay
                    : day.isSpeakingDay
                      ? LEARNING_GPS_UI.screen.weeklySpeakingDay
                      : day.focusSkills.map((key) => LEARNING_SKILL_BY_KEY[key].label).join(' + ')}
              </Text>
            </View>
          ))}
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {weeklyPlan.projectEmoji} {weeklyPlan.projectTitle}
          </Text>
        </GameCard>
      ) : null}

      <GameCard variant="reward" className="border-success/30">
        <Text className="text-[10px] font-black uppercase tracking-widest text-success">
          {LEARNING_GPS_UI.screen.monthlyGenerated(monthlyReport.monthKey)}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-foreground-secondary" numberOfLines={showMonthly ? undefined : 3}>
          {monthlyReport.summary}
        </Text>

        {showMonthly ? (
          <>
            <Text className="mt-4 text-xs font-black uppercase tracking-widest text-muted">
              {LEARNING_GPS_UI.screen.monthlyGoalsTitle}
            </Text>
            <View className="mt-2 gap-1">
              {monthlyReport.goals.map((goal) => (
                <Text key={goal} className="text-sm text-foreground-secondary">
                  • {goal}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        <Pressable
          className="mt-3"
          onPress={() => setShowMonthly((value) => !value)}
          accessibilityRole="button">
          <Text className="text-sm font-bold text-success">
            {showMonthly ? LEARNING_GPS_UI.screen.hideMonthlyReport : LEARNING_GPS_UI.screen.showMonthlyReport}
          </Text>
        </Pressable>
      </GameCard>
    </View>
  )
}
