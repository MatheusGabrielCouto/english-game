import { Text, View } from 'react-native';

type VaultSectionHeaderProps = {
  emoji: string;
  title: string;
  hint?: string;
  trailing?: string;
};

export const VaultSectionHeader = ({ emoji, title, hint, trailing }: VaultSectionHeaderProps) => (
  <View className="flex-row items-start justify-between gap-2">
    <View className="min-w-0 flex-1">
      <View className="flex-row items-center gap-2">
        <Text className="text-lg">{emoji}</Text>
        <Text className="text-base font-black text-foreground">{title}</Text>
      </View>
      {hint ? (
        <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary">{hint}</Text>
      ) : null}
    </View>
    {trailing ? (
      <Text className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
        {trailing}
      </Text>
    ) : null}
  </View>
);
