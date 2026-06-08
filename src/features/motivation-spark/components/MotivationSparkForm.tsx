import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { Button } from '@/components'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import type { MotivationLink } from '@/types/motivation-spark'

import { MOTIVATION_MAX_BODY_LENGTH, MOTIVATION_MAX_TITLE_LENGTH } from '../constants/motivation-limits'
import { MOTIVATION_UI } from '../constants/motivation-ui'
import type { CreateMotivationSparkInput } from '../services/motivation-spark-service'
import {
  validateMotivationBody,
  validateMotivationSparkContent,
  validateMotivationTitle,
} from '../utils/motivation-form'
import { MotivationCollectionPicker } from './MotivationCollectionPicker'
import { MotivationImageAttachments } from './MotivationImageAttachments'
import { MotivationLinkEditor } from './MotivationLinkEditor'
import { MotivationSparkAudioSection } from './MotivationSparkAudioSection'

export type MotivationSparkFormValues = CreateMotivationSparkInput & {
  removeAudio?: boolean
}

type MotivationSparkFormProps = {
  sparkId?: string
  initialTitle?: string
  initialBody?: string
  initialImages?: string[]
  initialAudioUri?: string | null
  initialAudioDurationMs?: number | null
  initialLinks?: MotivationLink[]
  initialCollectionId?: string | null
  submitLabel?: string
  onSubmit: (input: MotivationSparkFormValues) => Promise<void>
}

const INPUT_CLASS =
  'w-full rounded-xl border bg-surface px-4 py-3  text-foreground'

export const MotivationSparkForm = ({
  sparkId,
  initialTitle = '',
  initialBody = '',
  initialImages = [],
  initialAudioUri = null,
  initialAudioDurationMs = 0,
  initialLinks = [],
  initialCollectionId = null,
  submitLabel = MOTIVATION_UI.form.saveCta,
  onSubmit,
}: MotivationSparkFormProps) => {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [images, setImages] = useState(initialImages)
  const [audioUri, setAudioUri] = useState<string | null>(initialAudioUri)
  const [audioDurationMs, setAudioDurationMs] = useState(initialAudioDurationMs ?? 0)
  const [persistedAudioUri] = useState(initialAudioUri)
  const [removeAudio, setRemoveAudio] = useState(false)
  const [links, setLinks] = useState<MotivationLink[]>(initialLinks)
  const [collectionId, setCollectionId] = useState<string | null>(initialCollectionId)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleAudioChange = (uri: string | null, durationMs: number) => {
    setAudioUri(uri)
    setAudioDurationMs(durationMs)
    setRemoveAudio(uri == null)
  }

  const handleSubmit = async () => {
    const titleError = validateMotivationTitle(title)
    if (titleError) {
      setError(titleError)
      return
    }

    if (body.trim()) {
      const bodyError = validateMotivationBody(body)
      if (bodyError) {
        setError(bodyError)
        return
      }
    }

    const contentError = validateMotivationSparkContent({
      body,
      images,
      audioUri: removeAudio ? null : audioUri,
      links,
    })
    if (contentError) {
      setError(contentError)
      return
    }

    setError(null)
    setIsSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim() || undefined,
        imageUris: images,
        audioTempUri: removeAudio ? null : audioUri,
        audioDurationMs: removeAudio ? null : audioDurationMs || null,
        links,
        collectionId,
        removeAudio,
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <View className="gap-6">
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground-secondary">
          {MOTIVATION_UI.form.titleLabel}
        </Text>
        <TextInput
          className={`${INPUT_CLASS} ${formInputBorderClass(error != null && !title.trim())}`}
          value={title}
          onChangeText={setTitle}
          placeholder={MOTIVATION_UI.form.titlePlaceholder}
          maxLength={MOTIVATION_MAX_TITLE_LENGTH}
          accessibilityLabel={MOTIVATION_UI.form.titleLabel}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-foreground-secondary">
          {MOTIVATION_UI.form.bodyLabel}
        </Text>
        <TextInput
          className={`${INPUT_CLASS} min-h-[140px]`}
          value={body}
          onChangeText={setBody}
          placeholder={MOTIVATION_UI.form.bodyPlaceholder}
          maxLength={MOTIVATION_MAX_BODY_LENGTH}
          multiline
          textAlignVertical="top"
          accessibilityLabel={MOTIVATION_UI.form.bodyLabel}
        />
      </View>

      <MotivationImageAttachments images={images} onChange={setImages} disabled={isSaving} />

      <MotivationSparkAudioSection
        sparkId={sparkId}
        recordingUri={audioUri}
        durationMs={audioDurationMs}
        persistedUri={persistedAudioUri}
        persistedDurationMs={initialAudioDurationMs ?? 0}
        onRecordingChange={handleAudioChange}
      />

      <MotivationCollectionPicker
        value={collectionId}
        onChange={setCollectionId}
        disabled={isSaving}
      />

      <MotivationLinkEditor links={links} onChange={setLinks} disabled={isSaving} />

      {error ? (
        <Text className="text-sm text-destructive" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={submitLabel}
        loading={isSaving}
        loadingLabel="Salvando…"
        onPress={handleSubmit}
      />
    </View>
  )
}
