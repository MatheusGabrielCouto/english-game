import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/utils'
import { JOURNAL_UI } from '../constants/journal-ui'
import { translateEnglishToPortuguese } from '../services/journal-text-translation'
import { extractEnglishBodyForDisplay } from '../utils/journal-transcription-body'

type JournalEntryBodyTranslationProps = {
  body: string
  compact?: boolean
  className?: string
}

export const JournalEntryBodyTranslation = ({
  body,
  compact = false,
  className,
}: JournalEntryBodyTranslationProps) => {
  const [portugueseText, setPortugueseText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const englishSource = extractEnglishBodyForDisplay(body)
  if (!englishSource) return null

  const handleToggle = useCallback(async () => {
    if (portugueseText) {
      setPortugueseText(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await translateEnglishToPortuguese(englishSource)

    setIsLoading(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setPortugueseText(result.text)
  }, [englishSource, portugueseText])

  return (
    <View className={cn('gap-2', className)}>
      <Pressable
        onPress={() => void handleToggle()}
        disabled={isLoading}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          portugueseText ? JOURNAL_UI.hidePortugueseTranslation : JOURNAL_UI.viewInPortuguese
        }
        className="self-start rounded-lg border border-accent/35 bg-accent/10 px-2.5 py-1">
        <Text className="text-[10px] font-bold text-accent">
          {isLoading
            ? JOURNAL_UI.translatingToPortuguese
            : portugueseText
              ? JOURNAL_UI.hidePortugueseTranslation
              : JOURNAL_UI.viewInPortuguese}
        </Text>
      </Pressable>

      {error ? <Text className="text-xs text-warning">{error}</Text> : null}

      {portugueseText ? (
        <View className="rounded-xl border border-accent/25 bg-accent/5 px-3 py-2.5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-accent">
            {JOURNAL_UI.portugueseTranslationLabel}
          </Text>
          <Text
            className={cn('mt-1.5 text-foreground-secondary', compact ? 'text-xs leading-5' : 'text-sm leading-6')}
            numberOfLines={compact ? 4 : undefined}>
            {portugueseText}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
