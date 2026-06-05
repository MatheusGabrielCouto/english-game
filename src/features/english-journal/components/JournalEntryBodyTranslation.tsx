import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/utils'
import { JOURNAL_UI } from '../constants/journal-ui'
import {
    translateEnglishToPortuguese,
    translatePortugueseToEnglish,
} from '../services/journal-text-translation'
import { parseJournalBody } from '../utils/journal-transcription-body'

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
  const [translationText, setTranslationText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { primaryText, primaryLanguage, embeddedPortuguese } = parseJournalBody(body)
  const isPortugueseNote = primaryLanguage === 'portuguese'

  if (!primaryText) return null

  const viewLabel = isPortugueseNote ? JOURNAL_UI.viewInEnglish : JOURNAL_UI.viewInPortuguese
  const loadingLabel = isPortugueseNote
    ? JOURNAL_UI.translatingToEnglish
    : JOURNAL_UI.translatingToPortuguese
  const translationLabel = isPortugueseNote
    ? JOURNAL_UI.englishTranslationLabel
    : JOURNAL_UI.portugueseTranslationLabel

  const handleToggle = useCallback(async () => {
    if (translationText) {
      setTranslationText(null)
      setError(null)
      return
    }

    if (!isPortugueseNote && embeddedPortuguese) {
      setTranslationText(embeddedPortuguese)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = isPortugueseNote
      ? await translatePortugueseToEnglish(primaryText)
      : await translateEnglishToPortuguese(primaryText)

    setIsLoading(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setTranslationText(result.text)
  }, [embeddedPortuguese, isPortugueseNote, primaryText, translationText])

  return (
    <View className={cn('gap-2', className)}>
      <Pressable
        onPress={() => void handleToggle()}
        disabled={isLoading}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={translationText ? JOURNAL_UI.hideTranslation : viewLabel}
        className="self-start rounded-lg border border-accent/35 bg-accent/10 px-2.5 py-1">
        <Text className="text-[10px] font-bold text-accent">
          {isLoading ? loadingLabel : translationText ? JOURNAL_UI.hideTranslation : viewLabel}
        </Text>
      </Pressable>

      {error ? <Text className="text-xs text-warning">{error}</Text> : null}

      {translationText ? (
        <View className="rounded-xl border border-accent/25 bg-accent/5 px-3 py-2.5">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-accent">
            {translationLabel}
          </Text>
          <Text
            className={cn(
              'mt-1.5 text-foreground-secondary',
              compact ? 'text-xs leading-5' : 'text-sm leading-6',
            )}
            numberOfLines={compact ? 4 : undefined}>
            {translationText}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
