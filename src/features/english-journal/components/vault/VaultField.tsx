import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

type VaultFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export const VaultField = ({ label, hint, children }: VaultFieldProps) => (
  <View>
    <Text className="text-sm font-semibold text-foreground">{label}</Text>
    {hint ? <Text className="mt-0.5 text-xs text-foreground-secondary">{hint}</Text> : null}
    <View className="mt-2">{children}</View>
  </View>
);
