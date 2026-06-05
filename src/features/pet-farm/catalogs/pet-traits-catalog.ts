import { PetRarity, type PetRarityValue } from '@/types/pet';

export type PetTraitEffectKind =
  | 'xp_percent'
  | 'coin_percent'
  | 'loot_percent'
  | 'contract_percent';

export type PetTraitPoolRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export type PetTraitDefinition = {
  key: string;
  name: string;
  description: string;
  poolRarity: PetTraitPoolRarity;
  minSpeciesRarity: PetRarityValue;
  isNegative: boolean;
  /** Efeitos que entram no pipeline global de recompensas (companheiro ativo). */
  globalEffects: Partial<Record<PetTraitEffectKind, number>>;
};

const R = PetRarity;

const trait = (
  key: string,
  name: string,
  description: string,
  poolRarity: PetTraitPoolRarity,
  minSpeciesRarity: PetRarityValue,
  globalEffects: Partial<Record<PetTraitEffectKind, number>>,
  isNegative = false,
): PetTraitDefinition => ({
  key,
  name,
  description,
  poolRarity,
  minSpeciesRarity,
  isNegative,
  globalEffects,
});

const XP_TRAITS: PetTraitDefinition[] = [
  trait('fast_learner', 'Fast Learner', '+5% XP do jogador', 'common', R.COMMON, { xp_percent: 5 }),
  trait('study_addict', 'Study Addict', '+10% XP', 'uncommon', R.COMMON, { xp_percent: 10 }),
  trait('speaking_genius', 'Speaking Genius', '+15% XP em speaking farm', 'rare', R.RARE, {}),
  trait('reading_master', 'Reading Master', '+10% reading farm', 'rare', R.RARE, {}),
  trait('listening_pro', 'Listening Pro', '+10% listening farm', 'rare', R.RARE, {}),
  trait('vocab_sage', 'Vocab Sage', '+8% vocab farm', 'uncommon', R.RARE, {}),
  trait('focus_resonance', 'Focus Resonance', '+10% XP em sessão foco', 'rare', R.EPIC, {}),
  trait('daily_duo', 'Daily Duo', '+5% XP se daily completa', 'common', R.COMMON, { xp_percent: 5 }),
  trait('weekly_warrior', 'Weekly Warrior', '+8% XP em weekly', 'uncommon', R.RARE, { xp_percent: 8 }),
  trait('contract_mind', 'Contract Mind', '+10% XP em contrato', 'rare', R.RARE, { xp_percent: 10 }),
  trait('journal_scribe', 'Journal Scribe', '+5% XP por entrada diário', 'common', R.COMMON, { xp_percent: 5 }),
  trait('prestige_echo', 'Prestige Echo', '+12% XP pós-prestígio', 'epic', R.EPIC, { xp_percent: 12 }),
];

const ECONOMY_TRAITS: PetTraitDefinition[] = [
  trait('lucky_hunter', 'Lucky Hunter', '+10% loot luck', 'uncommon', R.COMMON, { loot_percent: 10 }),
  trait('golden_paw', 'Golden Paw', '+15% moedas', 'rare', R.RARE, { coin_percent: 15 }),
  trait('treasure_finder', 'Treasure Finder', '+20% chance item extra em loot', 'epic', R.EPIC, { loot_percent: 8 }),
  trait('coin_magnet', 'Coin Magnet', '+8% moedas', 'common', R.COMMON, { coin_percent: 8 }),
  trait('sp_saver', 'SP Saver', '+5% SP ganho', 'uncommon', R.RARE, {}),
  trait('shop_haggler', 'Shop Haggler', '-5% custo loja', 'rare', R.EPIC, {}),
  trait('loot_surge', 'Loot Surge', '+5% raridade em box', 'epic', R.EPIC, { loot_percent: 5 }),
  trait('shield_broker', 'Shield Broker', '+10% chance shield em reward', 'rare', R.RARE, {}),
  trait('farm_harvest', 'Farm Harvest', '+10% SP no farm inglês', 'uncommon', R.RARE, {}),
  trait('city_tax', 'City Tax', '+5% moedas da cidade', 'common', R.COMMON, { coin_percent: 5 }),
];

const UTILITY_TRAITS: PetTraitDefinition[] = [
  trait('guardian', 'Guardian', '+1 escudo/semana', 'rare', R.RARE, {}),
  trait('motivator', 'Motivator', '+5% motivação vital', 'common', R.COMMON, {}),
  trait('contract_expert', 'Contract Expert', '+10% progresso contrato', 'uncommon', R.RARE, {
    contract_percent: 10,
  }),
  trait('streak_guard', 'Streak Guard', '1 grace streak/mês', 'epic', R.EPIC, {}),
  trait('vital_bloom', 'Vital Bloom', '-10% decay fome', 'uncommon', R.RARE, {}),
  trait('night_owl', 'Night Owl', '+bônus rotina noite', 'common', R.COMMON, {}),
  trait('early_bird', 'Early Bird', '+bônus rotina manhã', 'common', R.COMMON, {}),
  trait('hybrid_affinity', 'Hybrid Affinity', '+5% chance híbrido', 'rare', R.EPIC, {}),
  trait('genetic_stability', 'Genetic Stability', '+10% herdar trait', 'rare', R.RARE, {}),
  trait('incubator_haste', 'Incubator Haste', '-8% hatch time', 'uncommon', R.RARE, {}),
];

const ADVENTURE_TRAITS: PetTraitDefinition[] = [
  trait('adventurer', 'Adventurer', '+10% sucesso aventura', 'uncommon', R.RARE, {}),
  trait('treasure_runner', 'Treasure Runner', '+15% loot aventura', 'rare', R.RARE, {}),
  trait('league_star', 'League Star', '+20 rating Liga', 'epic', R.EPIC, {}),
  trait('scout', 'Scout', 'Missões 8h+', 'rare', R.EPIC, {}),
  trait('pathfinder', 'Pathfinder', '+1 slot aventura', 'epic', R.LEGENDARY, {}),
  trait('academy_ace', 'Academy Ace', '+15% ganho academia', 'rare', R.RARE, {}),
  trait('mentor_spirit', 'Mentor Spirit', '+5% stats academia', 'uncommon', R.RARE, {}),
  trait('breed_master', 'Breed Master', '-5% cooldown breeding', 'rare', R.EPIC, {}),
];

const NEGATIVE_TRAITS: PetTraitDefinition[] = [
  trait('lazy', 'Lazy', '-5% XP', 'common', R.COMMON, { xp_percent: -5 }, true),
  trait('distracted', 'Distracted', '-5% focus (stat)', 'common', R.COMMON, {}, true),
  trait('sleepy', 'Sleepy', '-5% moedas', 'common', R.COMMON, { coin_percent: -5 }, true),
  trait('shy', 'Shy', '-5% speaking aventura', 'uncommon', R.RARE, {}, true),
  trait('glutton', 'Glutton', '+15% decay fome', 'common', R.COMMON, {}, true),
  trait('moody', 'Moody', '-5% felicidade max', 'uncommon', R.RARE, {}, true),
  trait('unlucky', 'Unlucky', '-8% loot', 'uncommon', R.COMMON, { loot_percent: -8 }, true),
  trait('slow_hatch', 'Slow Hatch', '+10% hatch time', 'common', R.COMMON, {}, true),
  trait('breed_shy', 'Breed Shy', '-5% herdar trait', 'uncommon', R.RARE, {}, true),
  trait('coin_sink', 'Coin Sink', '-3% moedas', 'common', R.COMMON, { coin_percent: -3 }, true),
];

export const PET_TRAITS_CATALOG: PetTraitDefinition[] = [
  ...XP_TRAITS,
  ...ECONOMY_TRAITS,
  ...UTILITY_TRAITS,
  ...ADVENTURE_TRAITS,
  ...NEGATIVE_TRAITS,
];

export const PET_TRAITS_BY_KEY = Object.fromEntries(
  PET_TRAITS_CATALOG.map((t) => [t.key, t]),
) as Record<string, PetTraitDefinition>;

const RARITY_ORDER: PetRarityValue[] = [R.COMMON, R.RARE, R.EPIC, R.LEGENDARY];

export const speciesRarityIndex = (rarity: PetRarityValue): number =>
  RARITY_ORDER.indexOf(rarity);

export const isEpicPlusTrait = (trait: PetTraitDefinition): boolean => trait.poolRarity === 'epic';

export const traitAppliesToSpecies = (
  trait: PetTraitDefinition,
  speciesRarity: PetRarityValue,
): boolean => speciesRarityIndex(speciesRarity) >= speciesRarityIndex(trait.minSpeciesRarity);

export const getTraitDefinition = (key: string): PetTraitDefinition | undefined =>
  PET_TRAITS_BY_KEY[key];
