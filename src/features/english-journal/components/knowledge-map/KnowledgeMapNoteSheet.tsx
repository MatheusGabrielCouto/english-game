import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { Button } from '@/components'
import { vaultEntryHref } from '@/constants'
import { GRAPH_UI } from '../../constants/vault-graph-ui'
import type { MindMapEntryMeta } from '../../utils/vault-map-builder'

type KnowledgeMapNoteSheetProps = {
  title: string
  entryId: string
  meta: MindMapEntryMeta
  relatedTitles: { id: string; title: string }[]
  onClose: () => void
}

const REVIEW_LABEL: Record<MindMapEntryMeta['reviewStatus'], string> = {
  ok: GRAPH_UI.reviewOk,
  due_soon: GRAPH_UI.reviewSoon,
  overdue: GRAPH_UI.reviewOverdue,
  none: '',
}

const REVIEW_TONE: Record<MindMapEntryMeta['reviewStatus'], string> = {
  ok: 'text-success',
  due_soon: 'text-warning',
  overdue: 'text-danger',
  none: 'text-muted',
}

export const KnowledgeMapNoteSheet = ({
  title,
  entryId,
  meta,
  relatedTitles,
  onClose,
}: KnowledgeMapNoteSheetProps) => {
  const router = useRouter()
  const reviewLabel = REVIEW_LABEL[meta.reviewStatus]

  return (
    <View className="gap-3 rounded-2xl border border-primary/30 bg-surface-elevated p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-foreground">{title}</Text>
          {reviewLabel ? (
            <Text className={`mt-1 text-xs font-semibold ${REVIEW_TONE[meta.reviewStatus]}`}>
              {reviewLabel}
            </Text>
          ) : null}
          {meta.connectionCount > 0 ? (
            <Text className="mt-1 text-xs text-muted">
              {GRAPH_UI.connections(meta.connectionCount)}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={GRAPH_UI.close}>
          <Text className="text-lg text-muted">✕</Text>
        </Pressable>
      </View>

      {relatedTitles.length > 0 ? (
        <View>
          <Text className="text-xs font-bold text-foreground-secondary">{GRAPH_UI.related}</Text>
          {relatedTitles.map((item) => (
            <Text key={item.id} className="mt-1 text-sm text-primary">
              · {item.title}
            </Text>
          ))}
        </View>
      ) : (
        <Text className="text-xs text-muted">{GRAPH_UI.noRelated}</Text>
      )}

      <Button
        label={GRAPH_UI.openNote}
        size="sm"
        onPress={() => router.push(vaultEntryHref(entryId))}
      />
    </View>
  )
}
