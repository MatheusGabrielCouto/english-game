import { EmptyState } from '@/components'

type VaultEmptyStateProps = {
  emoji: string
  title: string
  body: string
  ctaLabel?: string
  onCta?: () => void
}

/** @deprecated Use `<EmptyState variant="vault" />` from `@/components`. */
export const VaultEmptyState = ({ emoji, title, body, ctaLabel, onCta }: VaultEmptyStateProps) => (
  <EmptyState
    variant="vault"
    emoji={emoji}
    title={title}
    description={body}
    actionLabel={ctaLabel}
    onAction={onCta}
  />
)
