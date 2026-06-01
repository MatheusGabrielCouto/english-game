import type { AchievementDefinition, AchievementMetricType } from '@/types/achievement';
import { AchievementCategory, AchievementRewardType } from '@/types/achievement';
import type { CityBuildingDefinition } from '@/types/city';
import { ContractRewardType } from '@/types/contract';
import { LootBoxRarity } from '@/types/inventory';
import type { TitleDefinition } from '@/types/title';

const METRICS: AchievementMetricType[] = [
  'total_study_days',
  'best_streak',
  'total_missions_completed',
  'total_xp_earned',
  'player_level',
  'pet_stage',
  'total_loot_boxes_opened',
];

const CATEGORIES = [
  AchievementCategory.STREAK,
  AchievementCategory.MISSIONS,
  AchievementCategory.XP,
  AchievementCategory.LEVEL,
  AchievementCategory.PET,
  AchievementCategory.LOOT_BOXES,
] as const;

export const EXTENDED_ACHIEVEMENTS: AchievementDefinition[] = Array.from({ length: 50 }, (_, index) => {
  const tier = index + 1;
  const category = CATEGORIES[index % CATEGORIES.length];
  const metric = METRICS[index % METRICS.length];
  const target = 5 + tier * (category === AchievementCategory.XP ? 500 : category === AchievementCategory.LEVEL ? 2 : 3);

  return {
    key: `extended_achievement_${tier}`,
    name: `Marco ${tier}`,
    description: `Alcance ${target} em ${category.replace('_', ' ')}.`,
    category,
    metric,
    target,
    icon: ['🏅', '⭐', '🎯', '🔥', '💎'][index % 5],
    rewards: [
      {
        type: AchievementRewardType.COINS,
        amount: 25 + tier * 15,
        label: `${25 + tier * 15} moedas`,
      },
      ...(tier % 5 === 0
        ? [
            {
              type: AchievementRewardType.LOOT_BOX,
              rarity: tier >= 40 ? LootBoxRarity.EPIC : LootBoxRarity.RARE,
              label: 'Loot Box bônus',
            },
          ]
        : []),
    ],
  };
});

export const EXTENDED_TITLES: TitleDefinition[] = Array.from({ length: 30 }, (_, index) => {
  const tier = index + 1;
  return {
    key: `extended_title_${tier}`,
    name: `Global Talent ${tier}`,
    description: `Título desbloqueado no nível ${3 + tier * 2}.`,
    requiredLevel: 3 + tier * 2,
    icon: ['🌍', '🚀', '💼', '🏆', '👑'][index % 5],
  };
});

export const EXTENDED_CONTRACTS = Array.from({ length: 20 }, (_, index) => {
  const days = 3 + index * 2;
  return {
    key: `extended_contract_${index + 1}`,
    name: `Challenge ${days}D`,
    description: `Estude ${days} dias consecutivos.`,
    objective: `Estudar ${days} dias consecutivos`,
    targetDays: days,
    stakeAmount: 50 + index * 25,
    icon: ['🌱', '🔥', '💪', '👑'][index % 4],
    rewards: [
      { type: ContractRewardType.COINS, amount: days * 40, label: `${days * 40} moedas` },
    ],
  };
});

export const EXTENDED_BUILDINGS: CityBuildingDefinition[] = Array.from({ length: 20 }, (_, index) => {
  const level = 30 + index * 5;
  return {
    key: `extended_building_${index + 1}`,
    name: `District ${index + 1}`,
    description: `Nova região internacional desbloqueada.`,
    requiredLevel: level,
    icon: ['🏙️', '🌉', '🏗️', '🛫', '🗼'][index % 5],
    linkedTitleKey: `extended_title_${Math.min(index + 1, 30)}`,
  };
});
