import { Text, View } from 'react-native'

import { Button } from '@/components'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useMotivationCollections } from '../hooks/use-motivation-collections'

type MotivationCollectionPickerProps = {
  value: string | null
  onChange: (collectionId: string | null) => void
  disabled?: boolean
}

export const MotivationCollectionPicker = ({
  value,
  onChange,
  disabled = false,
}: MotivationCollectionPickerProps) => {
  const { collections } = useMotivationCollections()

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-foreground-secondary">
        {MOTIVATION_UI.form.collectionLabel}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <Button
          label={MOTIVATION_UI.form.collectionNone}
          size="sm"
          variant={value == null ? 'primary' : 'secondary'}
          onPress={() => onChange(null)}
          disabled={disabled}
        />
        {collections.map((collection) => (
          <Button
            key={collection.id}
            label={`${collection.emoji} ${collection.name}`}
            size="sm"
            variant={value === collection.id ? 'primary' : 'secondary'}
            onPress={() => onChange(collection.id)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  )
}
