import { router, type Href } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { Button, EmptyState } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { AchievementStatsRepository } from '@/storage/repositories/achievement-stats-repository'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useArchivedMotivationSparks } from '../hooks/use-archived-motivation-sparks'
import { useDailyMotivationSpark } from '../hooks/use-daily-motivation-spark'
import { useMotivationSparks } from '../hooks/use-motivation-sparks'
import { MotivationArchivedSparkCard } from './MotivationArchivedSparkCard'
import { MotivationDailySpotlightCard } from './MotivationDailySpotlightCard'
import { MotivationHubFilters, type MotivationHubFilterMode } from './MotivationHubFilters'
import { MotivationHubHero } from './MotivationHubHero'
import { MotivationSparkCard } from './MotivationSparkCard'

export const MotivationHubScreenContent = () => {
  const { sparks, hasHydrated, isSyncing } = useMotivationSparks()
  const { spark: dailySpark, hasHydrated: dailyHydrated, isSyncing: dailySyncing } =
    useDailyMotivationSpark()
  const {
    sparks: archivedSparks,
    archivedCount,
    isLoading: archivedLoading,
    refresh: refreshArchived,
  } = useArchivedMotivationSparks()
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<MotivationHubFilterMode>('all')
  const [openStreak, setOpenStreak] = useState(0)

  const isArchivedView = filterMode === 'archived'

  const handleCreate = useCallback(() => {
    router.push(routes.motivation.create as Href)
  }, [])

  const handleOpenCollections = useCallback(() => {
    router.push(routes.motivation.collections as Href)
  }, [])

  const handleOpenArchived = useCallback(() => {
    router.push(routes.motivation.archived as Href)
  }, [])

  const filteredActiveSparks = useMemo(() => {
    let list = sparks

    if (filterMode === 'favorites') {
      list = list.filter((spark) => spark.isFavorite)
    } else if (filterMode === 'pinned') {
      list = list.filter((spark) => spark.isPinned)
    }

    const query = search.trim().toLowerCase()
    if (!query) return list

    return list.filter(
      (spark) =>
        spark.title.toLowerCase().includes(query) ||
        (spark.body?.toLowerCase().includes(query) ?? false),
    )
  }, [filterMode, search, sparks])

  const filteredArchivedSparks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return archivedSparks

    return archivedSparks.filter(
      (spark) =>
        spark.title.toLowerCase().includes(query) ||
        (spark.body?.toLowerCase().includes(query) ?? false),
    )
  }, [archivedSparks, search])

  const isLoading =
    !hasHydrated || isSyncing || !dailyHydrated || dailySyncing || (isArchivedView && archivedLoading)

  useEffect(() => {
    if (!hasHydrated || sparks.length === 0) return
    void AchievementStatsRepository.getOrCreate().then((stats) => {
      setOpenStreak(stats.motivationOpenStreak)
    })
  }, [hasHydrated, sparks.length])

  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    )
  }

  if (sparks.length === 0 && !isArchivedView && archivedCount === 0) {
    return (
      <View className="gap-6">
        <MotivationHubHero sparks={[]} />
        <EmptyState
          variant="vault"
          emoji={MOTIVATION_UI.hub.emoji}
          title={MOTIVATION_UI.hub.emptyTitle}
          description={MOTIVATION_UI.hub.emptySubtitle}
          actionLabel={MOTIVATION_UI.hub.createCta}
          onAction={handleCreate}
          illustrated={false}
          className="border-orange-500/25"
        />
      </View>
    )
  }

  const libraryTitle = isArchivedView
    ? MOTIVATION_UI.archived.title
    : MOTIVATION_UI.hub.librarySectionTitle
  const librarySubtitle = isArchivedView
    ? MOTIVATION_UI.archived.subtitle
    : MOTIVATION_UI.hub.librarySectionSubtitle
  const libraryEmoji = isArchivedView ? MOTIVATION_UI.archived.emoji : MOTIVATION_UI.hub.emoji
  const visibleSparks = isArchivedView ? filteredArchivedSparks : filteredActiveSparks

  return (
    <View className="gap-6">
      {!isArchivedView ? <MotivationHubHero sparks={sparks} /> : null}

      {!isArchivedView && openStreak > 0 ? (
        <GameCard className="border-orange-500/25 bg-orange-500/5">
          <Text className="text-center text-sm font-semibold text-streak">
            {MOTIVATION_UI.hub.openStreak(openStreak)}
          </Text>
        </GameCard>
      ) : null}

      {!isArchivedView && dailySpark ? <MotivationDailySpotlightCard spark={dailySpark} /> : null}

      <View className="gap-4">
        <View className="flex-row items-end justify-between gap-3">
          <HomeSectionLabel
            emoji={libraryEmoji}
            title={libraryTitle}
            subtitle={librarySubtitle}
            tone={isArchivedView ? 'primary' : 'gold'}
          />
          <View className="flex-row gap-2">
            {!isArchivedView && archivedCount > 0 ? (
              <Button
                label={`${MOTIVATION_UI.hub.archivedCta} (${archivedCount})`}
                size="sm"
                variant="ghost"
                onPress={handleOpenArchived}
              />
            ) : null}
            {!isArchivedView ? (
              <>
                <Button
                  label={MOTIVATION_UI.hub.collectionsCta}
                  size="sm"
                  variant="secondary"
                  onPress={handleOpenCollections}
                />
                <Button
                  label={MOTIVATION_UI.hub.createCta}
                  size="sm"
                  variant="secondary"
                  onPress={handleCreate}
                />
              </>
            ) : null}
          </View>
        </View>

        <MotivationHubFilters
          search={search}
          mode={filterMode}
          onSearchChange={setSearch}
          onModeChange={setFilterMode}
        />

        {visibleSparks.length === 0 ? (
          <EmptyState
            variant="vault"
            emoji={isArchivedView ? MOTIVATION_UI.archived.emoji : MOTIVATION_UI.hub.emoji}
            title={
              isArchivedView
                ? MOTIVATION_UI.archived.emptyTitle
                : sparks.length === 0 && archivedCount > 0
                  ? MOTIVATION_UI.hub.allArchivedTitle
                  : 'Nenhuma faísca encontrada com esse filtro.'
            }
            description={
              isArchivedView
                ? MOTIVATION_UI.archived.emptyBody
                : sparks.length === 0 && archivedCount > 0
                  ? MOTIVATION_UI.hub.allArchivedBody
                  : undefined
            }
            actionLabel={
              sparks.length === 0 && archivedCount > 0 && !isArchivedView
                ? MOTIVATION_UI.hub.filterArchived
                : undefined
            }
            onAction={
              sparks.length === 0 && archivedCount > 0 && !isArchivedView
                ? () => setFilterMode('archived')
                : undefined
            }
            illustrated={false}
            className={isArchivedView ? 'border-border/80' : 'border-orange-500/20'}
          />
        ) : isArchivedView ? (
          visibleSparks.map((spark) => (
            <MotivationArchivedSparkCard
              key={spark.id}
              spark={spark}
              onUnarchived={refreshArchived}
            />
          ))
        ) : (
          visibleSparks.map((spark) => <MotivationSparkCard key={spark.id} spark={spark} />)
        )}
      </View>

      {!isArchivedView ? (
        <GameCard variant="reward" className="border-orange-500/20 bg-orange-500/5">
          <Text className="text-center text-sm leading-6 text-foreground-secondary">
            {MOTIVATION_UI.hub.heroBody}
          </Text>
          <View className="mt-4">
            <Button label={MOTIVATION_UI.hub.createCta} onPress={handleCreate} />
          </View>
        </GameCard>
      ) : null}
    </View>
  )
}
