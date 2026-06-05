import { PET_HYBRID_BY_KEY } from './pet-hybrid-species';

export type BreedingOutcome = {
  speciesKey: string;
  weight: number;
};

export type BreedingPairKey = `${string}__${string}`;

const pair = (mother: string, father: string, outcomes: BreedingOutcome[]): BreedingPairKey => {
  const key = `${mother}__${father}` as BreedingPairKey;
  PET_BREEDING_OUTCOMES[key] = outcomes;
  return key;
};

export const PET_BREEDING_OUTCOMES: Partial<Record<BreedingPairKey, BreedingOutcome[]>> = {};

pair('codeowl', 'stackfox', [
  { speciesKey: 'owlyote', weight: 35 },
  { speciesKey: 'codeowl', weight: 40 },
  { speciesKey: 'stackfox', weight: 15 },
  { speciesKey: 'bytebunny', weight: 10 },
]);

pair('codeowl', 'debugduck', [
  { speciesKey: 'codeowl', weight: 55 },
  { speciesKey: 'debugduck', weight: 30 },
  { speciesKey: 'ducktor', weight: 10 },
  { speciesKey: 'owlyote', weight: 5 },
]);

pair('quantumowl', 'worldserpent', [
  { speciesKey: 'quantumserpent', weight: 40 },
  { speciesKey: 'quantumowl', weight: 25 },
  { speciesKey: 'worldserpent', weight: 20 },
  { speciesKey: 'openowl', weight: 10 },
  { speciesKey: 'passportphoenix', weight: 5 },
]);

pair('quantumowl', 'stackfox', [
  { speciesKey: 'quantumowl', weight: 45 },
  { speciesKey: 'owlyote', weight: 25 },
  { speciesKey: 'stackfox', weight: 20 },
  { speciesKey: 'codeowl', weight: 10 },
]);

pair('devdolphin', 'apishark', [
  { speciesKey: 'catshark', weight: 30 },
  { speciesKey: 'devdolphin', weight: 35 },
  { speciesKey: 'apishark', weight: 25 },
  { speciesKey: 'gitcat', weight: 10 },
]);

pair('celestialwhale', 'remotegriffin', [
  { speciesKey: 'griffwhale', weight: 35 },
  { speciesKey: 'celestialwhale', weight: 30 },
  { speciesKey: 'remotegriffin', weight: 25 },
  { speciesKey: 'kernelkraken', weight: 10 },
]);

pair('mergepenguin', 'fullstacktiger', [
  { speciesKey: 'fullstackling', weight: 30 },
  { speciesKey: 'mergepenguin', weight: 40 },
  { speciesKey: 'fullstacktiger', weight: 25 },
  { speciesKey: 'deploydragon', weight: 5 },
]);

pair('bugbee', 'asyncphoenix', [
  { speciesKey: 'phoenixbee', weight: 35 },
  { speciesKey: 'bugbee', weight: 35 },
  { speciesKey: 'asyncphoenix', weight: 20 },
  { speciesKey: 'aiphoenix', weight: 10 },
]);

pair('asyncphoenix', 'bugbee', [
  { speciesKey: 'phoenixbee', weight: 35 },
  { speciesKey: 'asyncphoenix', weight: 35 },
  { speciesKey: 'bugbee', weight: 20 },
  { speciesKey: 'passportphoenix', weight: 10 },
]);

pair('debugduck', 'loopfrog', [
  { speciesKey: 'ducktor', weight: 25 },
  { speciesKey: 'debugduck', weight: 40 },
  { speciesKey: 'loopfrog', weight: 25 },
  { speciesKey: 'dockerdog', weight: 10 },
]);

pair('gitcat', 'apishark', [
  { speciesKey: 'catshark', weight: 30 },
  { speciesKey: 'gitcat', weight: 35 },
  { speciesKey: 'apishark', weight: 25 },
  { speciesKey: 'dockerdog', weight: 10 },
]);

pair('reactraptor', 'sqlsnake', [
  { speciesKey: 'raptoracle', weight: 28 },
  { speciesKey: 'reactraptor', weight: 35 },
  { speciesKey: 'sqlsnake', weight: 27 },
  { speciesKey: 'vimviper', weight: 10 },
]);

pair('dockerdog', 'gitcat', [
  { speciesKey: 'dockerdog', weight: 40 },
  { speciesKey: 'gitcat', weight: 35 },
  { speciesKey: 'catshark', weight: 15 },
  { speciesKey: 'debugduck', weight: 10 },
]);

pair('rustcrab', 'vimviper', [
  { speciesKey: 'rustcrab', weight: 40 },
  { speciesKey: 'vimviper', weight: 35 },
  { speciesKey: 'sqlsnake', weight: 15 },
  { speciesKey: 'loopfrog', weight: 10 },
]);

pair('legendarylion', 'globalhawk', [
  { speciesKey: 'legendarylion', weight: 40 },
  { speciesKey: 'globalhawk', weight: 35 },
  { speciesKey: 'griffwhale', weight: 8 },
  { speciesKey: 'quantumserpent', weight: 12 },
  { speciesKey: 'passportphoenix', weight: 5 },
]);

const HYBRID_PAIRS: [string, string, string][] = [
  ['codeowl', 'stackfox', 'owlyote'],
  ['debugduck', 'loopfrog', 'ducktor'],
  ['gitcat', 'apishark', 'catshark'],
  ['reactraptor', 'sqlsnake', 'raptoracle'],
  ['asyncphoenix', 'bugbee', 'phoenixbee'],
  ['remotegriffin', 'celestialwhale', 'griffwhale'],
  ['quantumowl', 'worldserpent', 'quantumserpent'],
  ['fullstacktiger', 'mergepenguin', 'fullstackling'],
];

export const getHybridForPair = (mother: string, father: string): string | null => {
  for (const [a, b, hybrid] of HYBRID_PAIRS) {
    if ((mother === a && father === b) || (mother === b && father === a)) return hybrid;
  }
  return null;
};

export const getBreedingOutcomes = (
  motherSpecies: string,
  fatherSpecies: string,
): BreedingOutcome[] => {
  const key = `${motherSpecies}__${fatherSpecies}` as BreedingPairKey;
  const explicit = PET_BREEDING_OUTCOMES[key];
  if (explicit?.length) return explicit;

  if (motherSpecies === fatherSpecies) {
    return [{ speciesKey: motherSpecies, weight: 100 }];
  }

  const hybrid = getHybridForPair(motherSpecies, fatherSpecies);
  const fallback: BreedingOutcome[] = [
    { speciesKey: motherSpecies, weight: 50 },
    { speciesKey: fatherSpecies, weight: 40 },
  ];
  if (hybrid && PET_HYBRID_BY_KEY[hybrid]) {
    fallback.push({ speciesKey: hybrid, weight: 10 });
  }
  return fallback;
};

export const rollBreedingSpecies = (
  motherSpecies: string,
  fatherSpecies: string,
): { speciesKey: string; outcomes: BreedingOutcome[] } => {
  const outcomes = getBreedingOutcomes(motherSpecies, fatherSpecies);
  const total = outcomes.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * total;
  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll <= 0) return { speciesKey: outcome.speciesKey, outcomes };
  }
  return { speciesKey: outcomes[outcomes.length - 1].speciesKey, outcomes };
};
