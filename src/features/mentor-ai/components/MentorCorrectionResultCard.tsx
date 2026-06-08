import { Share, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import type { CorrectionResult } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { stripMentorMarkdown } from '../utils/render-mentor-text'

type MentorCorrectionResultCardProps = {
  result: CorrectionResult
  onPracticeAnother: () => void
}

const CorrectionBlock = ({
  emoji,
  label,
  text,
  tone,
}: {
  emoji: string
  label: string
  text: string
  tone: 'danger' | 'success' | 'muted'
}) => {
  const toneClass =
    tone === 'danger'
      ? 'border-danger/30 bg-danger/5'
      : tone === 'success'
        ? 'border-success/30 bg-success/5'
        : 'border-border/60 bg-surface/60'

  const textClass =
    tone === 'danger'
      ? 'text-danger line-through'
      : tone === 'success'
        ? 'text-success'
        : 'text-foreground-secondary'

  return (
    <View className={`rounded-xl border px-3.5 py-3 ${toneClass}`}>
      <Text className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
        {emoji} {label}
      </Text>
      <Text className={`text-sm leading-6 ${textClass}`} accessibilityLabel={`${label}: ${text}`}>
        {stripMentorMarkdown(text)}
      </Text>
    </View>
  )
}

export const MentorCorrectionResultCard = ({
  result,
  onPracticeAnother,
}: MentorCorrectionResultCardProps) => {
  const handleShare = async () => {
    const explanationLines = result.explanationEn
      ? [
          `🇬🇧 ${stripMentorMarkdown(result.explanationEn)}`,
          `🇧🇷 ${stripMentorMarkdown(result.explanation)}`,
        ]
      : [`💡 ${stripMentorMarkdown(result.explanation)}`]

    await Share.share({
      message: [
        MENTOR_AI_UI.correct.shareTitle,
        `❌ ${result.original}`,
        `✅ ${result.corrected}`,
        ...explanationLines,
      ].join('\n'),
    })
  }

  return (
    <GameCard variant="default" className="gap-3">
      <CorrectionBlock
        emoji="❌"
        label={MENTOR_AI_UI.correct.wrongLabel}
        text={result.original}
        tone="danger"
      />
      <CorrectionBlock
        emoji="✅"
        label={MENTOR_AI_UI.correct.rightLabel}
        text={result.corrected}
        tone="success"
      />
      {result.explanationEn ? (
        <>
          <CorrectionBlock
            emoji="🇬🇧"
            label={MENTOR_AI_UI.correct.tipLabelEn}
            text={result.explanationEn}
            tone="muted"
          />
          <CorrectionBlock
            emoji="🇧🇷"
            label={MENTOR_AI_UI.correct.tipLabelPt}
            text={result.explanation}
            tone="muted"
          />
        </>
      ) : (
        <CorrectionBlock
          emoji="💡"
          label={MENTOR_AI_UI.correct.tipLabel}
          text={result.explanation}
          tone="muted"
        />
      )}

      {result.practiceTip ? (
        <CorrectionBlock
          emoji="📝"
          label={MENTOR_AI_UI.correct.practiceLabel}
          text={result.practiceTip}
          tone="muted"
        />
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        <Button
          label={MENTOR_AI_UI.correct.share}
          size="sm"
          variant="secondary"
          onPress={() => void handleShare()}
        />
        <Button
          label={MENTOR_AI_UI.correct.practiceAnother}
          size="sm"
          variant="ghost"
          onPress={onPracticeAnother}
        />
      </View>
    </GameCard>
  )
}
