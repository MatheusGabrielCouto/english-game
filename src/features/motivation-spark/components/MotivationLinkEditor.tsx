import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Button } from '@/components'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import type { MotivationLink } from '@/types/motivation-spark'

import { MOTIVATION_MAX_LINKS_PER_SPARK } from '../constants/motivation-limits'
import { MOTIVATION_UI } from '../constants/motivation-ui'
import { normalizeMotivationUrl, validateMotivationLink } from '../utils/motivation-form'

type MotivationLinkEditorProps = {
  links: MotivationLink[]
  onChange: (links: MotivationLink[]) => void
  disabled?: boolean
}

const INPUT_CLASS =
  'w-full rounded-xl border bg-surface px-4 py-3  text-foreground'

export const MotivationLinkEditor = ({
  links,
  onChange,
  disabled = false,
}: MotivationLinkEditorProps) => {
  const [urlDraft, setUrlDraft] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const atLimit = links.length >= MOTIVATION_MAX_LINKS_PER_SPARK

  const handleAdd = () => {
    const validationError = validateMotivationLink(urlDraft)
    if (validationError) {
      setError(validationError)
      return
    }

    const normalized = normalizeMotivationUrl(urlDraft)
    if (!normalized) {
      setError('Link inválido.')
      return
    }

    onChange([
      ...links,
      {
        url: normalized,
        title: titleDraft.trim() || null,
        description: null,
      },
    ])
    setUrlDraft('')
    setTitleDraft('')
    setError(null)
  }

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index))
  }

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-semibold text-foreground">{MOTIVATION_UI.form.linksLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{MOTIVATION_UI.form.linksHint}</Text>
      </View>

      {links.map((link, index) => (
        <View
          key={`${link.url}-${index}`}
          className="rounded-xl border border-border bg-surface/80 px-4 py-3"
        >
          <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
            {link.title || link.url}
          </Text>
          {link.title ? (
            <Text className="mt-1 text-xs text-foreground-secondary" numberOfLines={1}>
              {link.url}
            </Text>
          ) : null}
          <Pressable
            onPress={() => handleRemove(index)}
            disabled={disabled}
            className="mt-2 self-start"
            accessibilityRole="button"
            accessibilityLabel={MOTIVATION_UI.form.removeLink}
          >
            <Text className="text-xs font-semibold text-danger">{MOTIVATION_UI.form.removeLink}</Text>
          </Pressable>
        </View>
      ))}

      {!atLimit ? (
        <View className="gap-3">
          <TextInput
            className={`${INPUT_CLASS} ${formInputBorderClass(error != null)}`}
            value={urlDraft}
            onChangeText={setUrlDraft}
            placeholder={MOTIVATION_UI.form.linkUrlPlaceholder}
            autoCapitalize="none"
            keyboardType="url"
            editable={!disabled}
            accessibilityLabel="URL do link"
          />
          <TextInput
            className={INPUT_CLASS}
            value={titleDraft}
            onChangeText={setTitleDraft}
            placeholder={MOTIVATION_UI.form.linkTitlePlaceholder}
            editable={!disabled}
            accessibilityLabel="Título do link"
          />
          {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
          <Button
            variant="secondary"
            label={MOTIVATION_UI.form.addLink}
            onPress={handleAdd}
            disabled={disabled}
          />
        </View>
      ) : null}
    </View>
  )
}
