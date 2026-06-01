import type { PetToyDefinition } from '@/types/pet-expansion';

export const PET_TOYS_CATALOG: PetToyDefinition[] = [
  { key: 'toy_ball', name: 'Bola', icon: '⚽', animationKey: 'happy_pulando_v1', affinityGain: 8, energyCost: 10, happinessBoost: 12 },
  { key: 'toy_frisbee', name: 'Frisbee', icon: '🥏', animationKey: 'happy_correndo_v1', affinityGain: 10, energyCost: 12, happinessBoost: 14 },
  { key: 'toy_book', name: 'Livro', icon: '📚', animationKey: 'idle_pensando_v1', affinityGain: 6, energyCost: 5, happinessBoost: 8 },
  { key: 'toy_laptop', name: 'Laptop', icon: '💻', animationKey: 'excited_recebendo_xp_v1', affinityGain: 7, energyCost: 8, happinessBoost: 10 },
  { key: 'toy_drone', name: 'Drone', icon: '🚁', animationKey: 'excited_surpresa_v1', affinityGain: 12, energyCost: 15, happinessBoost: 16 },
  { key: 'toy_rope', name: 'Corda', icon: '🪢', animationKey: 'happy_brincando_v1', affinityGain: 9, energyCost: 11, happinessBoost: 13 },
  { key: 'toy_puzzle', name: 'Quebra-cabeça', icon: '🧩', animationKey: 'idle_pensando_v2', affinityGain: 5, energyCost: 6, happinessBoost: 7 },
  { key: 'toy_guitar', name: 'Violão', icon: '🎸', animationKey: 'happy_dançando_v1', affinityGain: 11, energyCost: 10, happinessBoost: 15 },
  { key: 'toy_skate', name: 'Skate', icon: '🛹', animationKey: 'happy_correndo_v2', affinityGain: 10, energyCost: 14, happinessBoost: 14 },
  { key: 'toy_telescope', name: 'Telescópio', icon: '🔭', animationKey: 'idle_observando_v1', affinityGain: 6, energyCost: 5, happinessBoost: 9 },
  { key: 'toy_camera', name: 'Câmera', icon: '📷', animationKey: 'excited_ganhou_item_v1', affinityGain: 8, energyCost: 7, happinessBoost: 11 },
  { key: 'toy_yarn', name: 'Novelo', icon: '🧶', animationKey: 'happy_saltitando_v1', affinityGain: 7, energyCost: 9, happinessBoost: 10 },
];

export const PET_TOYS_BY_KEY = Object.fromEntries(
  PET_TOYS_CATALOG.map((toy) => [toy.key, toy]),
) as Record<string, PetToyDefinition>;

export const DEFAULT_TOY_KEY = 'toy_ball';
