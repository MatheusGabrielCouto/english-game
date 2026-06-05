import type { PetInstanceMemoryKey } from '@/types/pet-instance-memory';

export type PetInstanceMemoryDefinition = {
  key: PetInstanceMemoryKey;
  title: string;
  description: string;
  icon: string;
};

export const PET_INSTANCE_MEMORY_DEFINITIONS: PetInstanceMemoryDefinition[] = [
  {
    key: 'born',
    title: 'Born on the farm',
    description: 'Joined your roster and started their story.',
    icon: '🐣',
  },
  {
    key: 'first_level_up',
    title: 'First level up',
    description: 'Reached level 2 as your companion.',
    icon: '⬆️',
  },
  {
    key: 'first_evolution',
    title: 'First evolution',
    description: 'Grew into a new life stage.',
    icon: '✨',
  },
  {
    key: 'first_breed',
    title: 'First breeding',
    description: 'Helped create the next generation.',
    icon: '💞',
  },
  {
    key: 'gen_milestone_5',
    title: 'GEN 5 milestone',
    description: 'Lineage reached generation 5.',
    icon: '🧬',
  },
  {
    key: 'trait_legendary',
    title: 'Epic trait',
    description: 'Rolled an epic-tier trait.',
    icon: '💎',
  },
  {
    key: 'league_debut',
    title: 'League debut',
    description: 'Entered the weekly pet league.',
    icon: '🏆',
  },
  {
    key: 'adventure_epic',
    title: 'Epic adventure',
    description: 'Completed a 24h adventure.',
    icon: '🗺️',
  },
  {
    key: 'hall_inducted',
    title: 'Hall of Fame',
    description: 'Inducted into the farm hall of fame.',
    icon: '👑',
  },
];

export const PET_INSTANCE_MEMORY_BY_KEY = Object.fromEntries(
  PET_INSTANCE_MEMORY_DEFINITIONS.map((d) => [d.key, d]),
) as Record<PetInstanceMemoryKey, PetInstanceMemoryDefinition>;

export const getInstanceMemoryDefinition = (
  key: string,
): PetInstanceMemoryDefinition | undefined =>
  PET_INSTANCE_MEMORY_BY_KEY[key as PetInstanceMemoryKey];
