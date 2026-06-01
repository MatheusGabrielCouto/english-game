import type { CityBuildingDefinition } from '@/types/city';

import { EXTENDED_BUILDINGS } from '@/features/game-design/catalogs/extended-content';
import { INTERMEDIATE_CITY_BUILDINGS } from './balance-buildings';

export const CITY_MESSAGES = {
  cityGrown: 'Sua cidade cresceu.',
  buildingUnlocked: 'Um novo edifício foi desbloqueado.',
  nextMilestone: 'Continue estudando para expandir sua cidade.',
} as const;

export const BUILDING_DEFINITIONS: CityBuildingDefinition[] = [
  {
    key: 'house',
    name: 'House',
    description: 'O primeiro lar da sua jornada internacional.',
    requiredLevel: 1,
    icon: '🏠',
    linkedTitleKey: 'local_developer',
  },
  {
    key: 'office',
    name: 'Office',
    description: 'O início da sua vida profissional remota.',
    requiredLevel: 5,
    icon: '🏢',
    linkedTitleKey: 'junior_remote_developer',
  },
  {
    key: 'startup',
    name: 'Startup',
    description: 'Crescimento, ambição e novas oportunidades.',
    requiredLevel: 10,
    icon: '🚀',
    linkedTitleKey: 'mid_remote_developer',
  },
  {
    key: 'company',
    name: 'Company',
    description: 'Consolidação profissional e impacto duradouro.',
    requiredLevel: 20,
    icon: '🏬',
    linkedTitleKey: 'senior_remote_developer',
  },
  {
    key: 'airport',
    name: 'Airport',
    description: 'Portas abertas para oportunidades internacionais.',
    requiredLevel: 30,
    icon: '✈️',
    linkedTitleKey: 'international_developer',
  },
  {
    key: 'skyscraper',
    name: 'Skyscraper',
    description: 'Sucesso global visível no horizonte.',
    requiredLevel: 50,
    icon: '🏙️',
    linkedTitleKey: 'global_engineer',
  },
  ...INTERMEDIATE_CITY_BUILDINGS,
  {
    key: 'financial_center',
    name: 'Financial Center',
    description: 'O ápice da sua cidade internacional.',
    requiredLevel: 100,
    icon: '🏦',
    linkedTitleKey: 'world_class_engineer',
  },
  ...EXTENDED_BUILDINGS,
];

export const BUILDINGS_BY_KEY = Object.fromEntries(
  BUILDING_DEFINITIONS.map((building) => [building.key, building]),
) as Record<string, CityBuildingDefinition>;

export const DEFAULT_BUILDING_KEY = 'house';
