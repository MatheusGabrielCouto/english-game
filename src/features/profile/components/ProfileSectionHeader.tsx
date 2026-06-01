import { Text, View } from 'react-native';

type ProfileSectionHeaderProps = {
  title: string;
  subtitle?: string;
  emoji?: string;
};

export const ProfileSectionHeader = ({ title, subtitle, emoji }: ProfileSectionHeaderProps) => (
  <View className="mb-1">
    <Text className="text-xs font-bold uppercase tracking-widest text-muted">
      {emoji ? `${emoji} ` : ''}{title}
    </Text>
    {subtitle ? <Text className="mt-1 text-sm text-foreground-secondary">{subtitle}</Text> : null}
  </View>
);
