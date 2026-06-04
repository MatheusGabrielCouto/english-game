import { Text, View } from 'react-native'

import { GRAPH_UI } from '../../constants/vault-graph-ui'

type KnowledgeMapSummaryProps = {
  totalNotes: number
  totalConnections: number
  reviewsDue: number
}

export const KnowledgeMapSummary = ({
  totalNotes,
  totalConnections,
  reviewsDue,
}: KnowledgeMapSummaryProps) => (
  <View className="flex-row flex-wrap gap-2">
    <SummaryChip label={GRAPH_UI.summaryNotes(totalNotes)} />
    <SummaryChip label={GRAPH_UI.summaryLinks(totalConnections)} />
    <SummaryChip
      label={GRAPH_UI.summaryReviews(reviewsDue)}
      highlight={reviewsDue > 0}
    />
  </View>
)

const SummaryChip = ({ label, highlight }: { label: string; highlight?: boolean }) => (
  <View
    className={`rounded-full px-3 py-1.5 ${
      highlight ? 'bg-warning/20' : 'border border-border bg-surface'
    }`}
  >
    <Text
      className={`text-xs font-semibold ${highlight ? 'text-warning' : 'text-foreground'}`}
    >
      {label}
    </Text>
  </View>
)
