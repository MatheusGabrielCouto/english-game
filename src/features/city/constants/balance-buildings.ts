import type { CityBuildingDefinition } from '@/types/city';

/** Construction costs: 500 × tier coins; SP for mid/late game buildings. */
export const getBuildingConstructionCost = (
  building: Pick<CityBuildingDefinition, 'requiredLevel'>,
): { coins: number; studyPoints: number } => {
  if (building.requiredLevel <= 1) {
    return { coins: 0, studyPoints: 0 };
  }

  const tier = Math.max(1, Math.ceil(building.requiredLevel / 5));
  return {
    coins: 500 * tier,
    studyPoints: building.requiredLevel >= 30 ? 100 : 0,
  };
};

export const INTERMEDIATE_CITY_BUILDINGS: CityBuildingDefinition[] = [
  {
    key: 'co_working_hub',
    name: 'Co-working Hub',
    description: 'Espaço colaborativo para devs remotos.',
    requiredLevel: 35,
    icon: '🏗️',
    linkedTitleKey: 'extended_title_1',
  },
  {
    key: 'tech_campus',
    name: 'Tech Campus',
    description: 'Campus de inovação e aprendizado contínuo.',
    requiredLevel: 45,
    icon: '🎓',
    linkedTitleKey: 'extended_title_2',
  },
  {
    key: 'innovation_lab',
    name: 'Innovation Lab',
    description: 'Laboratório de produtos globais.',
    requiredLevel: 60,
    icon: '🔬',
    linkedTitleKey: 'extended_title_3',
  },
  {
    key: 'global_hq',
    name: 'Global HQ',
    description: 'Sede global da sua carreira internacional.',
    requiredLevel: 80,
    icon: '🌐',
    linkedTitleKey: 'extended_title_4',
  },
];
