import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

import { VAULT_UI } from '../../constants/vault-ui';

type VaultHelpCardProps = {
  title?: string;
  body: string;
  defaultOpen?: boolean;
  className?: string;
};

export const VaultHelpCard = ({
  title = VAULT_UI.howItWorksTitle,
  body,
  defaultOpen = false,
  className,
}: VaultHelpCardProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View className={cn('rounded-2xl border border-border/80 bg-surface/80', className)}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between px-4 py-3"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}>
        <View className="flex-row items-center gap-2">
          <Text className="text-base">💡</Text>
          <Text className="text-sm font-semibold text-foreground">{title}</Text>
        </View>
        <Text className="text-xs text-muted">{open ? 'Ocultar' : 'Ver'}</Text>
      </Pressable>
      {open ? (
        <Text className="border-t border-border/60 px-4 pb-3 pt-2 text-sm leading-5 text-foreground-secondary">
          {body}
        </Text>
      ) : null}
    </View>
  );
};
