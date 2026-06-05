import { ChoiceChip } from '@/components/ui/ChoiceChip'

type VaultChoiceChipProps = {
  label: string
  emoji?: string
  selected?: boolean
  onPress: () => void
  compact?: boolean
}

export const VaultChoiceChip = (props: VaultChoiceChipProps) => <ChoiceChip {...props} />
