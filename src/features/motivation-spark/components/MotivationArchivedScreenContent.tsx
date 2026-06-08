import { useMemo, useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { EmptyState } from '@/components'
import { formInputBorderClass } from '@/constants/form-validation-ui'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useArchivedMotivationSparks } from '../hooks/use-archived-motivation-sparks'
import { MotivationArchivedSparkCard } from './MotivationArchivedSparkCard'

export const MotivationArchivedScreenContent = () => {
  const { sparks, isLoading, refresh } = useArchivedMotivationSparks()
  const [search, setSearch] = useState('')

  const filteredSparks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return sparks

    return sparks.filter(
      (spark) =>
        spark.title.toLowerCase().includes(query) ||
        (spark.body?.toLowerCase().includes(query) ?? false),
    )
  }, [search, sparks])

  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    )
  }

  if (sparks.length === 0) {
    return (
      <EmptyState
        variant="vault"
        emoji={MOTIVATION_UI.archived.emoji}
        title={MOTIVATION_UI.archived.emptyTitle}
        description={MOTIVATION_UI.archived.emptyBody}
        illustrated={false}
        className="border-border/80"
      />
    )
  }

  return (
    <View className="gap-4">
      <TextInput
        className={`w-full rounded-xl border bg-surface px-4 py-3 text-foreground ${formInputBorderClass(false)}`}
        value={search}
        onChangeText={setSearch}
        placeholder={MOTIVATION_UI.hub.searchPlaceholder}
        accessibilityLabel={MOTIVATION_UI.hub.searchPlaceholder}
        clearButtonMode="while-editing"
      />

      {filteredSparks.length === 0 ? (
        <Text className="text-center text-sm text-foreground-secondary">
          Nenhuma faísca encontrada com essa busca.
        </Text>
      ) : (
        filteredSparks.map((spark) => (
          <MotivationArchivedSparkCard key={spark.id} spark={spark} onUnarchived={refresh} />
        ))
      )}
    </View>
  )
}
