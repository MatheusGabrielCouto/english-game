import { Text, View } from 'react-native';

import { getPersonalityDefinition } from '../catalogs/pet-personalities-catalog';
import { PET_PERSONALITY_UI } from '../constants/pet-personality-ui';

type PetPersonalityBadgeProps = {
  personalityKey: string;
  compact?: boolean;
};

export const PetPersonalityBadge = ({ personalityKey, compact }: PetPersonalityBadgeProps) => {
  const def = getPersonalityDefinition(personalityKey);

  return (
    <View className="rounded-xl border border-violet-500/30 bg-violet-950/20 px-3 py-2">
      <Text className="text-[10px] font-bold uppercase tracking-wider text-violet-300/90">
        {PET_PERSONALITY_UI.title}
      </Text>
      <Text className="text-sm font-black text-foreground">{def.name}</Text>
      {!compact ? (
        <>
          <Text className="text-[10px] text-muted">
            {PET_PERSONALITY_UI.tone}: {def.tone}
          </Text>
          <Text className="mt-1 text-[9px] text-muted/80">{PET_PERSONALITY_UI.fixedIdentity}</Text>
        </>
      ) : null}
    </View>
  );
};
