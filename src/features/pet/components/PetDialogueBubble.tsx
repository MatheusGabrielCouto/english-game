import { Text } from 'react-native';

import { Card } from '@/components';

type PetDialogueBubbleProps = {
  message: string | null;
  petName: string;
};

export const PetDialogueBubble = ({ message, petName }: PetDialogueBubbleProps) => {
  if (!message) return null;

  return (
    <Card elevated accent className="border-accent/30">
      <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">{petName} diz:</Text>
      <Text className=" leading-6 text-foreground">{message}</Text>
    </Card>
  );
};
