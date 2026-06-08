import { useEffect, useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { Button } from '@/components'
import { GameCard, PressableScale } from '@/components/ui/game'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants/input-ui'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorExercise } from '../hooks/use-mentor-exercise'
import { useMentorFlashcards } from '../hooks/use-mentor-flashcards'
import { useMentorGpsStudyLaunch } from '../hooks/use-mentor-gps-study-launch'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { stripMentorMarkdown } from '../utils/render-mentor-text'
import { MentorExerciseSession } from './MentorExerciseSession'
import { MentorFlashcardPreviewList } from './MentorFlashcardPreviewList'
import { MentorFlashcardStudySession } from './MentorFlashcardStudySession'
import { MentorGpsStudyBanner } from './MentorGpsStudyBanner'

type MentorPracticeTab = 'exercise' | 'flashcards'

const INPUT_CLASS =
  'min-h-[48px] rounded-xl border bg-surface px-4 py-3 text-base text-foreground'

export const MentorExerciseScreenContent = () => {
  const gpsStudy = useMentorGpsStudyLaunch()
  const [tab, setTab] = useState<MentorPracticeTab>('exercise')
  const [isExporting, setIsExporting] = useState(false)
  const llmStatus = useMentorLlmStore((state) => state.status)

  const exercise = useMentorExercise()
  const flashcards = useMentorFlashcards()

  useEffect(() => {
    if (gpsStudy.tab === 'flashcards') {
      setTab('flashcards')
    }
  }, [gpsStudy.tab])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await flashcards.exportToDeck()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <View className="gap-4 pb-6">
      <MentorGpsStudyBanner />

      <GameCard variant="default" className="gap-3">
        <Text className="text-sm leading-6 text-foreground-secondary">
          {MENTOR_AI_UI.exercise.intro}
        </Text>
        <View className="self-start rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-accent">
            {llmStatus === 'ready'
              ? MENTOR_AI_UI.chat.llmReady
              : MENTOR_AI_UI.exercise.offlineEngine}
          </Text>
        </View>
      </GameCard>

      <View className="flex-row gap-2">
        {(['exercise', 'flashcards'] as const).map((key) => (
          <PressableScale
            key={key}
            onPress={() => setTab(key)}
            accessibilityRole="button"
            accessibilityLabel={MENTOR_AI_UI.exercise.tabs[key]}
            accessibilityState={{ selected: tab === key }}
            className={`flex-1 rounded-xl border px-3 py-2.5 ${
              tab === key ? 'border-accent bg-accent/15' : 'border-border/70 bg-background/60'
            }`}>
            <Text
              className={`text-center text-xs font-bold ${
                tab === key ? 'text-accent' : 'text-foreground-secondary'
              }`}>
              {MENTOR_AI_UI.exercise.tabs[key]}
            </Text>
          </PressableScale>
        ))}
      </View>

      {tab === 'exercise' ? (
        <>
          {exercise.phase === 'session' || exercise.phase === 'result' ? (
            <MentorExerciseSession />
          ) : (
            <>
              <GameCard variant="default" className="gap-3">
                <Text className="text-sm font-black uppercase tracking-widest text-muted">
                  {MENTOR_AI_UI.exercise.topicLabel}
                </Text>
                <TextInput
                  value={exercise.topic}
                  onChangeText={exercise.setTopic}
                  placeholder={MENTOR_AI_UI.exercise.topicPlaceholder}
                  placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                  editable={!exercise.isGenerating}
                  className={`${INPUT_CLASS} ${formInputBorderClass(false)}`}
                  accessibilityLabel={MENTOR_AI_UI.exercise.topicA11y}
                />
                <Button
                  label={
                    exercise.isGenerating
                      ? MENTOR_AI_UI.exercise.cancel
                      : MENTOR_AI_UI.exercise.generate
                  }
                  onPress={
                    exercise.isGenerating
                      ? exercise.cancelGeneration
                      : () => void exercise.generateExercise()
                  }
                  disabled={!exercise.isGenerating && !exercise.topic.trim()}
                  loading={exercise.isGenerating}
                  loadingLabel={MENTOR_AI_UI.exercise.thinking}
                />
              </GameCard>

              {exercise.isGenerating && exercise.streamingText ? (
                <GameCard variant="default" className="gap-2">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {MENTOR_AI_UI.characterName}
                  </Text>
                  <Text className="text-sm leading-6 text-foreground-secondary">
                    {stripMentorMarkdown(exercise.streamingText)}
                  </Text>
                </GameCard>
              ) : null}

              {exercise.error ? (
                <Text className="text-sm text-danger" accessibilityRole="alert">
                  {exercise.error}
                </Text>
              ) : null}

              {exercise.phase === 'preview' && exercise.exerciseSet ? (
                <View className="gap-3">
                  <GameCard variant="default" className="gap-2">
                    <Text className="text-sm font-black uppercase tracking-widest text-muted">
                      {MENTOR_AI_UI.exercise.previewTitle}
                    </Text>
                    <Text className="text-lg font-bold text-foreground">
                      {exercise.exerciseSet.title}
                    </Text>
                    <Text className="text-xs text-muted">
                      {MENTOR_AI_UI.exercise.previewCount(exercise.exerciseSet.questions.length)}
                    </Text>
                    {exercise.exerciseSet.questions.map((question, index) => (
                      <View key={`${question.prompt}-${index}`} className="mt-2 gap-1">
                        <Text className="text-xs font-bold text-accent">
                          {index + 1}. {question.prompt}
                        </Text>
                        <Text className="text-xs text-muted">
                          {question.options.join(' · ')}
                        </Text>
                      </View>
                    ))}
                  </GameCard>
                  <Button
                    label={MENTOR_AI_UI.exercise.startSession}
                    onPress={exercise.startSession}
                  />
                  <Button
                    label={MENTOR_AI_UI.exercise.generateAnother}
                    variant="secondary"
                    onPress={exercise.reset}
                  />
                </View>
              ) : null}

              {!exercise.exerciseSet && !exercise.isGenerating ? (
                <View className="gap-2">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
                    {MENTOR_AI_UI.exercise.examplesTitle}
                  </Text>
                  {MENTOR_AI_UI.exercise.examples.map((example) => (
                    <Button
                      key={example}
                      label={example}
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        exercise.setTopic(example)
                        void exercise.generateExercise()
                      }}
                    />
                  ))}
                </View>
              ) : null}
            </>
          )}
        </>
      ) : flashcards.phase === 'study' ? (
        <MentorFlashcardStudySession />
      ) : (
        <>
          <GameCard variant="default" className="gap-3">
            <Text className="text-sm font-black uppercase tracking-widest text-muted">
              {MENTOR_AI_UI.flashcards.topicLabel}
            </Text>
            <TextInput
              value={flashcards.topic}
              onChangeText={flashcards.setTopic}
              placeholder={MENTOR_AI_UI.flashcards.topicPlaceholder}
              placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
              editable={!flashcards.isGenerating}
              className={`${INPUT_CLASS} ${formInputBorderClass(false)}`}
              accessibilityLabel={MENTOR_AI_UI.flashcards.topicA11y}
            />
            <Text className="text-xs text-muted">{MENTOR_AI_UI.flashcards.countHint}</Text>
            <Button
              label={
                flashcards.isGenerating
                  ? MENTOR_AI_UI.flashcards.cancel
                  : MENTOR_AI_UI.flashcards.generate
              }
              onPress={
                flashcards.isGenerating
                  ? flashcards.cancelGeneration
                  : () => void flashcards.generateFlashcards()
              }
              disabled={!flashcards.isGenerating && !flashcards.topic.trim()}
              loading={flashcards.isGenerating}
              loadingLabel={MENTOR_AI_UI.flashcards.thinking}
            />
          </GameCard>

          {flashcards.isGenerating && flashcards.streamingText ? (
            <GameCard variant="default" className="gap-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
                {MENTOR_AI_UI.characterName}
              </Text>
              <Text className="text-sm leading-6 text-foreground-secondary">
                {stripMentorMarkdown(flashcards.streamingText)}
              </Text>
            </GameCard>
          ) : null}

          {flashcards.error ? (
            <Text className="text-sm text-danger" accessibilityRole="alert">
              {flashcards.error}
            </Text>
          ) : null}

          {flashcards.flashcardSet ? (
            <MentorFlashcardPreviewList
              flashcardSet={flashcards.flashcardSet}
              savedCount={flashcards.savedCount}
              savedDeckId={flashcards.savedDeckId}
              isExporting={isExporting}
              onStartStudy={() => flashcards.startStudy(0)}
              onOpenCard={flashcards.openCardAt}
              onExport={() => void handleExport()}
              onGenerateAnother={flashcards.reset}
            />
          ) : !flashcards.isGenerating ? (
            <View className="gap-2">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
                {MENTOR_AI_UI.flashcards.examplesTitle}
              </Text>
              {MENTOR_AI_UI.flashcards.examples.map((example) => (
                <Button
                  key={example}
                  label={example}
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    flashcards.setTopic(example)
                    void flashcards.generateFlashcards()
                  }}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  )
}
