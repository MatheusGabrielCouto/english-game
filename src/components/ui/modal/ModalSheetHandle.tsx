import { View } from 'react-native'

export const ModalSheetHandle = () => (
  <View className="items-center py-3" accessibilityRole="adjustable" accessibilityLabel="Arraste para fechar">
    <View className="h-1.5 w-12 rounded-full bg-border" />
  </View>
)
