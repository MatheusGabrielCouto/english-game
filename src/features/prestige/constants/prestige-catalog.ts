import type { PrestigeTierDefinition } from '@/types/prestige';
import { LootBoxRarity } from '@/types/inventory';

export const PRESTIGE_CATALOG: PrestigeTierDefinition[] = [
  {
    level: 1,
    roman: 'I',
    name: 'Veteran Learner',
    subtitle: 'Primeiro marco além do casual — dedicação comprovada.',
    requiredPlayerLevel: 50,
    exclusiveTitle: 'Veteran Learner',
    rewards: ['Moldura Rara exclusiva', '200 moedas', 'Loot Box Épica'],
    permanentBonuses: [
      { label: 'XP Global', value: '+2%' },
      { label: 'Moedas', value: '+2%' },
    ],
    exclusiveItems: [
      { key: 'prestige_frame_rare', name: 'Moldura Veteran', icon: '🖼️', category: 'frame' },
      { key: 'veteran_learner', name: 'Título: Veteran Learner', icon: '🏅', category: 'title' },
      { key: 'relic_15', name: 'Relíquia de Prestígio I', icon: '📕', category: 'relic' },
    ],
    frameKey: 'rare',
  },
  {
    level: 2,
    roman: 'II',
    name: 'Global Professional',
    subtitle: 'Profissional reconhecido em escala internacional.',
    requiredPlayerLevel: 100,
    exclusiveTitle: 'Global Professional',
    rewards: ['Moldura Lendária', '400 moedas', 'Loot Box Lendária', 'Relíquia épica'],
    permanentBonuses: [
      { label: 'XP Global', value: '+4%' },
      { label: 'Moedas', value: '+4%' },
      { label: 'Chance de raros', value: '+1%' },
    ],
    exclusiveItems: [
      { key: 'prestige_frame_legendary', name: 'Moldura Global', icon: '👑', category: 'frame' },
      { key: 'global_professional', name: 'Título: Global Professional', icon: '🌐', category: 'title' },
      { key: 'cosmetic_10', name: 'Aura Global', icon: '✨', category: 'cosmetic' },
      { key: 'relic_50', name: 'Relíquia Global', icon: '💎', category: 'relic' },
    ],
    frameKey: 'legendary',
  },
  {
    level: 3,
    roman: 'III',
    name: 'Elite Engineer',
    subtitle: 'Engenheiro de elite com bônus permanentes ampliados.',
    requiredPlayerLevel: 200,
    exclusiveTitle: 'Elite Engineer',
    rewards: ['Avatar exclusivo', '600 moedas', 'Loot Box Mítica', 'Pet exclusivo'],
    permanentBonuses: [
      { label: 'XP Global', value: '+6%' },
      { label: 'Moedas', value: '+6%' },
      { label: 'Slot de Contrato', value: '+1' },
      { label: 'Chance de raros', value: '+2%' },
    ],
    exclusiveItems: [
      { key: 'prestige_frame_mythic', name: 'Moldura Elite', icon: '⚔️', category: 'frame' },
      { key: 'elite_engineer', name: 'Título: Elite Engineer', icon: '🎯', category: 'title' },
      { key: 'exclusive_pet_5', name: 'FAANG Eagle', icon: '🦅', category: 'pet' },
      { key: 'mythic_10', name: 'Essência Elite', icon: '💫', category: 'relic' },
    ],
    frameKey: 'mythic',
  },
  {
    level: 4,
    roman: 'IV',
    name: 'World Class Engineer',
    subtitle: 'Classe mundial — recompensas lendárias permanentes.',
    requiredPlayerLevel: 350,
    exclusiveTitle: 'World Class Engineer',
    rewards: ['Moldura Ancestral', '800 moedas', 'Loot Box Mítica x2', 'Relíquia lendária'],
    permanentBonuses: [
      { label: 'XP Global', value: '+8%' },
      { label: 'Moedas', value: '+8%' },
      { label: 'Slot de Pet', value: '+1' },
      { label: 'Chance de raros', value: '+3%' },
    ],
    exclusiveItems: [
      { key: 'prestige_frame_ancient', name: 'Moldura World Class', icon: '🔥', category: 'frame' },
      { key: 'world_class_engineer', name: 'Título: World Class Engineer', icon: '👑', category: 'title' },
      { key: 'legendary_dragon_pet', name: 'Legendary Dragon Pet', icon: '🐉', category: 'pet' },
      { key: 'world_class_engineer_medal', name: 'World Class Engineer Medal', icon: '🏅', category: 'relic' },
    ],
    frameKey: 'ancient',
  },
  {
    level: 5,
    roman: 'V',
    name: 'Legacy Architect',
    subtitle: 'Ápice do English Quest — legado eterno.',
    requiredPlayerLevel: 500,
    exclusiveTitle: 'Legacy Architect',
    rewards: ['Coroa Ancestral', '1200 moedas', 'Loot Box Ancestral', 'Todos bônus máximos'],
    permanentBonuses: [
      { label: 'XP Global', value: '+10%' },
      { label: 'Moedas', value: '+10%' },
      { label: 'Slots de Contrato', value: '+2' },
      { label: 'Slots de Pet', value: '+2' },
      { label: 'Chance de raros', value: '+5%' },
    ],
    exclusiveItems: [
      { key: 'ancient_developer_crown', name: 'Ancient Developer Crown', icon: '👑', category: 'relic' },
      { key: 'legacy_architect', name: 'Título: Legacy Architect', icon: '🏛️', category: 'title' },
      { key: 'faang_invitation', name: 'FAANG Invitation', icon: '✉️', category: 'relic' },
      { key: 'cosmetic_50', name: 'Cosmético Ancestral', icon: '🎨', category: 'cosmetic' },
    ],
    frameKey: 'ancient',
  },
];

export const MAX_PRESTIGE_LEVEL = PRESTIGE_CATALOG.length;

export const getPrestigeTier = (level: number): PrestigeTierDefinition | null =>
  PRESTIGE_CATALOG.find((tier) => tier.level === level) ?? null;

export const getNextPrestigeTier = (currentLevel: number): PrestigeTierDefinition | null =>
  PRESTIGE_CATALOG.find((tier) => tier.level === currentLevel + 1) ?? null;

export const getPrestigeLootBoxRarity = (tierLevel: number) => {
  if (tierLevel >= 5) return LootBoxRarity.ANCIENT;
  if (tierLevel >= 3) return LootBoxRarity.MYTHIC;
  if (tierLevel >= 2) return LootBoxRarity.LEGENDARY;
  return LootBoxRarity.EPIC;
};

export const getAccumulatedPrestigeBonuses = (prestigeLevel: number) => {
  const tiers = PRESTIGE_CATALOG.filter((tier) => tier.level <= prestigeLevel);
  return tiers.flatMap((tier) => tier.permanentBonuses);
};
