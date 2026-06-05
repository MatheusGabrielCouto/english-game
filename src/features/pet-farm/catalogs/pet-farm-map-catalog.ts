import type { Href } from 'expo-router';

import { routes } from '@/constants';

export type PetFarmMapBuildingKey =
  | 'hall'
  | 'academy'
  | 'league'
  | 'pasture'
  | 'breeding'
  | 'incubator'
  | 'barn'
  | 'adventures'
  | 'upgrades'
  | 'encyclopedia'
  | 'glossary';

export type PetFarmMapBuildingDef = {
  key: PetFarmMapBuildingKey;
  label: string;
  emoji: string;
  /** Centro do pin no viewBox da ilha (360×620). */
  x: number;
  y: number;
  route: Href;
  comingSoon?: boolean;
  size?: 'md' | 'sm';
};

export const PET_FARM_MAP_BUILDINGS: PetFarmMapBuildingDef[] = [
  {
    key: 'hall',
    label: 'Hall da Fama',
    emoji: '👑',
    x: 180,
    y: 188,
    route: routes.petFarmHall as Href,
  },
  {
    key: 'academy',
    label: 'Academia',
    emoji: '🎓',
    x: 92,
    y: 228,
    route: routes.petFarmAcademy as Href,
  },
  {
    key: 'league',
    label: 'Liga',
    emoji: '🏆',
    x: 268,
    y: 228,
    route: routes.petFarmLeague as Href,
  },
  {
    key: 'pasture',
    label: 'Pasto',
    emoji: '🌿',
    x: 68,
    y: 318,
    route: routes.petFarmPasture as Href,
  },
  {
    key: 'breeding',
    label: 'Laboratório',
    emoji: '💕',
    x: 180,
    y: 288,
    route: routes.petFarmBreeding as Href,
  },
  {
    key: 'incubator',
    label: 'Incubadora',
    emoji: '🥚',
    x: 292,
    y: 318,
    route: routes.petFarmIncubator as Href,
  },
  {
    key: 'barn',
    label: 'Celeiro',
    emoji: '🏠',
    x: 180,
    y: 358,
    route: routes.petFarmBarn as Href,
  },
  {
    key: 'adventures',
    label: 'Aventuras',
    emoji: '🗺️',
    x: 180,
    y: 408,
    route: routes.petFarmAdventures as Href,
  },
  {
    key: 'upgrades',
    label: 'Melhorias',
    emoji: '⬆️',
    x: 54,
    y: 348,
    route: routes.petFarmUpgrades as Href,
    size: 'sm',
  },
  {
    key: 'encyclopedia',
    label: 'Enciclopédia',
    emoji: '📖',
    x: 112,
    y: 438,
    route: routes.petFarmEncyclopedia as Href,
    size: 'sm',
  },
  {
    key: 'glossary',
    label: 'Glossário',
    emoji: '📚',
    x: 248,
    y: 438,
    route: routes.petFarmGlossary as Href,
    size: 'sm',
  },
];
