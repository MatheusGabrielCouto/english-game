export type PetInstanceMemoryKey =
  | 'born'
  | 'first_level_up'
  | 'first_evolution'
  | 'first_breed'
  | 'gen_milestone_5'
  | 'league_debut'
  | 'adventure_epic'
  | 'trait_legendary'
  | 'hall_inducted';

export type PetInstanceMemoryRecord = {
  instanceId: number;
  memoryKey: PetInstanceMemoryKey;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
};
