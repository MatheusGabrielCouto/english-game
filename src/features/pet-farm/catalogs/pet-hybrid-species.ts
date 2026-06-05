import type { PetPassiveAbility, PetSpeciesDefinition } from '@/features/game-design/catalogs/pet-species-catalog';
import { PetRarity, type PetRarityValue } from '@/types/pet';

const hybrid = (
  key: string,
  name: string,
  emoji: string,
  rarity: PetRarityValue,
  passive: PetPassiveAbility,
  hatchHours = 48,
): PetSpeciesDefinition => ({
  key,
  name,
  emoji,
  rarity,
  description: `Híbrido exclusivo de cruzamento: ${name}.`,
  hatchHours,
  passive,
});

export const PET_HYBRID_SPECIES: PetSpeciesDefinition[] = [
  hybrid('owlyote', 'Owlyote', '🦉', PetRarity.RARE, { type: 'xp_boost', value: 9, label: '+9% XP' }),
  hybrid('ducktor', 'Ducktor', '🦆', PetRarity.RARE, { type: 'coin_boost', value: 9, label: '+9% Coins' }),
  hybrid('catshark', 'Catshark', '🦈', PetRarity.EPIC, { type: 'loot_luck', value: 13, label: '+13% Loot' }),
  hybrid('raptoracle', 'Raptoracle', '🦖', PetRarity.EPIC, { type: 'xp_boost', value: 14, label: '+14% XP' }),
  hybrid('phoenixbee', 'Phoenix Bee', '🐝', PetRarity.EPIC, { type: 'coin_boost', value: 14, label: '+14% Coins' }),
  hybrid('griffwhale', 'Griffwhale', '🐋', PetRarity.LEGENDARY, { type: 'loot_luck', value: 22, label: '+22% Loot' }, 120),
  hybrid('quantumserpent', 'Quantum Serpent', '🐉', PetRarity.LEGENDARY, { type: 'xp_boost', value: 28, label: '+28% XP' }, 144),
  hybrid('fullstackling', 'Fullstackling', '🐧', PetRarity.LEGENDARY, {
    type: 'shield_weekly',
    value: 2,
    label: '+2 Shields/semana',
  }, 120),
];

export const PET_HYBRID_BY_KEY = Object.fromEntries(
  PET_HYBRID_SPECIES.map((s) => [s.key, s]),
) as Record<string, PetSpeciesDefinition>;
