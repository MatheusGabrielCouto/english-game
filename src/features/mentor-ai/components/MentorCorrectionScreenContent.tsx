import { Text, TextInput, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants/input-ui'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorCorrection } from '../hooks/use-mentor-correction'
import { useMentorGpsStudyLaunch } from '../hooks/use-mentor-gps-study-launch'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { stripMentorMarkdown } from '../utils/render-mentor-text'
import { MentorCorrectionResultCard } from './MentorCorrectionResultCard'
import { MentorGpsStudyBanner } from './MentorGpsStudyBanner'

const INPUT_CLASS =
  'min-h-[96px] rounded-xl border bg-surface px-4 py-3 text-base text-foreground'

export const MentorCorrectionScreenContent = () => {
  useMentorGpsStudyLaunch()
  const {
    input,
    result,
    isGenerating,
    streamingText,
    error,
    savedErrorId,
    setInput,
    correctSentence,
    reset,
    cancelGeneration,
  } = useMentorCorrection()
  const llmStatus = useMentorLlmStore((state) => state.status)

  return (
    <View className="gap-4 pb-6">
      <MentorGpsStudyBanner />
      <GameCard variant="default" className="gap-3">
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MENTOR_AI_UI.correct.intro}
        </Text>
        <View className="self-start rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-accent">
            {llmStatus === 'ready'
              ? MENTOR_AI_UI.chat.llmReady
              : MENTOR_AI_UI.correct.offlineEngine}
          </Text>
        </View>
      </GameCard>

      <GameCard variant="default" className="gap-3">
        <Text className="text-sm font-black uppercase tracking-widest text-muted">
          {MENTOR_AI_UI.correct.inputLabel}
        </Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={MENTOR_AI_UI.correct.inputPlaceholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          multiline
          editable={!isGenerating}
          className={`${INPUT_CLASS} ${formInputBorderClass(false)}`}
          accessibilityLabel={MENTOR_AI_UI.correct.inputA11y}
        />
        <Button
          label={isGenerating ? MENTOR_AI_UI.correct.cancel : MENTOR_AI_UI.correct.submit}
          onPress={isGenerating ? cancelGeneration : () => void correctSentence()}
          disabled={!isGenerating && !input.trim()}
          loading={isGenerating}
          loadingLabel={MENTOR_AI_UI.correct.thinking}
        />
      </GameCard>

      {isGenerating && streamingText ? (
        <GameCard variant="default" className="gap-2">
          <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
            {MENTOR_AI_UI.characterName}
          </Text>
          <Text className="text-sm leading-6 text-foreground-secondary">
            {stripMentorMarkdown(streamingText)}
          </Text>
          <Text className="text-xs text-muted">{MENTOR_AI_UI.correct.thinking}</Text>
        </GameCard>
      ) : null}

      {error ? (
        <Text className="text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {result ? (
        <>
          <MentorCorrectionResultCard result={result} onPracticeAnother={reset} />
          {savedErrorId ? (
            <Text className="text-center text-xs text-muted">{MENTOR_AI_UI.correct.savedNote}</Text>
          ) : null}
        </>
      ) : null}

      {!result && !isGenerating ? (
        <View className="gap-2">
          <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
            {MENTOR_AI_UI.correct.examplesTitle}
          </Text>
          {MENTOR_AI_UI.correct.examples.map((example) => (
            <Button
              key={example}
              label={example}
              size="sm"
              variant="ghost"
              onPress={() => {
                setInput(example)
                void correctSentence()
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}
