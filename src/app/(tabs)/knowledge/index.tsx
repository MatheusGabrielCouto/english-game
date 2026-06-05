import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { KnowledgeHubScreenContent } from '@/features/knowledge-hub'
import { KNOWLEDGE_HUB_UI } from '@/features/knowledge-hub/constants/knowledge-hub-ui'

export default function KnowledgeTabScreen() {
  return (
    <ScreenContainer scrollable={false} contentClassName="flex-1">
      <ScreenHeader
        title={KNOWLEDGE_HUB_UI.screenTitle}
        subtitle={KNOWLEDGE_HUB_UI.screenSubtitle}
        emoji="📓"
      />
      <KnowledgeHubScreenContent />
    </ScreenContainer>
  )
}
