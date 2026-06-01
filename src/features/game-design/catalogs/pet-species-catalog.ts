import { PetRarity, type PetRarityValue } from '@/types/pet';

export type PetPassiveAbility = {
  type: 'xp_boost' | 'coin_boost' | 'shield_weekly' | 'loot_luck';
  value: number;
  label: string;
};

export type PetSpeciesDefinition = {
  key: string;
  name: string;
  emoji: string;
  rarity: PetRarityValue;
  description: string;
  hatchHours: number;
  passive: PetPassiveAbility;
};

const createSpecies = (
  key: string,
  name: string,
  emoji: string,
  rarity: PetRarityValue,
  passive: PetPassiveAbility,
  hatchHours = 24,
): PetSpeciesDefinition => ({
  key,
  name,
  emoji,
  rarity,
  description: `Um companheiro ${rarity} para sua jornada internacional.`,
  hatchHours,
  passive,
});

export const PET_SPECIES_CATALOG: PetSpeciesDefinition[] = [
  createSpecies('codeowl', 'Code Owl', '🦉', PetRarity.COMMON, { type: 'xp_boost', value: 5, label: '+5% XP' }),
  createSpecies('debugduck', 'Debug Duck', '🦆', PetRarity.COMMON, { type: 'coin_boost', value: 5, label: '+5% Coins' }),
  createSpecies('gitcat', 'Git Cat', '🐱', PetRarity.COMMON, { type: 'loot_luck', value: 3, label: '+3% Loot' }),
  createSpecies('bytebunny', 'Byte Bunny', '🐰', PetRarity.COMMON, { type: 'xp_boost', value: 4, label: '+4% XP' }),
  createSpecies('stackfox', 'Stack Fox', '🦊', PetRarity.COMMON, { type: 'coin_boost', value: 4, label: '+4% Coins' }),
  createSpecies('loopfrog', 'Loop Frog', '🐸', PetRarity.COMMON, { type: 'shield_weekly', value: 0, label: '+1 Shield/semana' }, 18),
  createSpecies('cachebear', 'Cache Bear', '🐻', PetRarity.COMMON, { type: 'xp_boost', value: 6, label: '+6% XP' }),
  createSpecies('pingpanda', 'Ping Panda', '🐼', PetRarity.COMMON, { type: 'coin_boost', value: 6, label: '+6% Coins' }),
  createSpecies('mergepenguin', 'Merge Penguin', '🐧', PetRarity.RARE, { type: 'xp_boost', value: 8, label: '+8% XP' }, 36),
  createSpecies('deploydragon', 'Deploy Dragon', '🐲', PetRarity.RARE, { type: 'coin_boost', value: 8, label: '+8% Coins' }, 36),
  createSpecies('cloudkoala', 'Cloud Koala', '🐨', PetRarity.RARE, { type: 'loot_luck', value: 5, label: '+5% Loot' }, 36),
  createSpecies('apishark', 'API Shark', '🦈', PetRarity.RARE, { type: 'xp_boost', value: 10, label: '+10% XP' }, 48),
  createSpecies('reactraptor', 'React Raptor', '🦖', PetRarity.RARE, { type: 'coin_boost', value: 10, label: '+10% Coins' }, 48),
  createSpecies('nodeunicorn', 'Node Unicorn', '🦄', PetRarity.RARE, { type: 'shield_weekly', value: 1, label: '+1 Shield/semana' }, 48),
  createSpecies('sqlsnake', 'SQL Snake', '🐍', PetRarity.RARE, { type: 'loot_luck', value: 8, label: '+8% Loot' }, 48),
  createSpecies('devdolphin', 'Dev Dolphin', '🐬', PetRarity.RARE, { type: 'xp_boost', value: 9, label: '+9% XP' }, 42),
  createSpecies('bugbee', 'Bug Bee', '🐝', PetRarity.EPIC, { type: 'coin_boost', value: 12, label: '+12% Coins' }, 72),
  createSpecies('scal_eagle', 'Scale Eagle', '🦅', PetRarity.EPIC, { type: 'xp_boost', value: 12, label: '+12% XP' }, 72),
  createSpecies('kernelkraken', 'Kernel Kraken', '🐙', PetRarity.EPIC, { type: 'loot_luck', value: 10, label: '+10% Loot' }, 72),
  createSpecies('asyncphoenix', 'Async Phoenix', '🔥', PetRarity.EPIC, { type: 'xp_boost', value: 15, label: '+15% XP' }, 96),
  createSpecies('remotegriffin', 'Remote Griffin', '🦁', PetRarity.EPIC, { type: 'coin_boost', value: 15, label: '+15% Coins' }, 96),
  createSpecies('fullstacktiger', 'Fullstack Tiger', '🐯', PetRarity.EPIC, { type: 'shield_weekly', value: 1, label: '+1 Shield/semana' }, 96),
  createSpecies('microservicewolf', 'Micro Wolf', '🐺', PetRarity.EPIC, { type: 'loot_luck', value: 12, label: '+12% Loot' }, 96),
  createSpecies('globalhawk', 'Global Hawk', '🦅', PetRarity.LEGENDARY, { type: 'xp_boost', value: 20, label: '+20% XP' }, 120),
  createSpecies('legendarylion', 'Legendary Lion', '🦁', PetRarity.LEGENDARY, { type: 'coin_boost', value: 20, label: '+20% Coins' }, 120),
  createSpecies('celestialwhale', 'Celestial Whale', '🐋', PetRarity.LEGENDARY, { type: 'loot_luck', value: 15, label: '+15% Loot' }, 120),
  createSpecies('quantumowl', 'Quantum Owl', '🦉', PetRarity.LEGENDARY, { type: 'xp_boost', value: 25, label: '+25% XP' }, 168),
  createSpecies('passportphoenix', 'Passport Phoenix', '🐦‍🔥', PetRarity.LEGENDARY, { type: 'coin_boost', value: 25, label: '+25% Coins' }, 168),
  createSpecies('worldserpent', 'World Serpent', '🐉', PetRarity.LEGENDARY, { type: 'shield_weekly', value: 2, label: '+2 Shields/semana' }, 168),
];

export const PET_SPECIES_BY_KEY = Object.fromEntries(
  PET_SPECIES_CATALOG.map((species) => [species.key, species]),
) as Record<string, PetSpeciesDefinition>;
