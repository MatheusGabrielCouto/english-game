import { Text, View } from 'react-native';

import { VAULT_UI } from '../../constants/vault-ui';
import type { VaultOrganizeContext } from '../../utils/vault-organize-context';

type VaultOrganizeContextCardProps = {
  context: VaultOrganizeContext;
};

export const VaultOrganizeContextCard = ({ context }: VaultOrganizeContextCardProps) => (
  <View
    className="gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-3.5 py-3"
    accessibilityLabel={VAULT_UI.organizeContextA11y(context.spaceLabel, context.folderName)}>
    <View className="gap-1">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
        {VAULT_UI.organizeSpaceContextLabel}
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-base">{context.spaceEmoji}</Text>
        <Text className="text-sm font-black text-foreground">{context.spaceLabel}</Text>
      </View>
      <Text className="text-xs leading-5 text-foreground-secondary">{context.spaceDescription}</Text>
    </View>

    <View className="h-px bg-border/80" />

    <View className="gap-1">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-primary">
        {context.folderName ? VAULT_UI.organizeFolderContextLabel : VAULT_UI.organizeFolderNoneLabel}
      </Text>
      {context.folderName ? (
        <Text className="text-sm font-black text-foreground">{context.folderName}</Text>
      ) : null}
      <Text className="text-xs leading-5 text-foreground-secondary">{context.folderDescription}</Text>
    </View>
  </View>
);
