import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStage, type PetStageValue } from '@/types/pet';
import { PetGender, type PetGenderValue } from '@/types/pet-instance';
import { PetStatsService } from './pet-stats-service';

const DEMO_NICKNAME_PREFIX = '[Demo]';

type DemoPetSeed = {
  speciesKey: string;
  gender: PetGenderValue;
  nickname: string;
  stage: PetStageValue;
  level: number;
};

/** Instâncias extras para testar pasto, troca de companheiro e breeding (somente dev). */
const DEMO_PET_SEEDS: DemoPetSeed[] = [
  {
    speciesKey: 'debugduck',
    gender: PetGender.FEMALE,
    nickname: `${DEMO_NICKNAME_PREFIX} Debug ♀`,
    stage: PetStage.ADULT,
    level: 12,
  },
  {
    speciesKey: 'gitcat',
    gender: PetGender.MALE,
    nickname: `${DEMO_NICKNAME_PREFIX} Git ♂`,
    stage: PetStage.ADULT,
    level: 10,
  },
  {
    speciesKey: 'stackfox',
    gender: PetGender.MALE,
    nickname: `${DEMO_NICKNAME_PREFIX} Stack`,
    stage: PetStage.TEEN,
    level: 6,
  },
  {
    speciesKey: 'bytebunny',
    gender: PetGender.FEMALE,
    nickname: `${DEMO_NICKNAME_PREFIX} Byte`,
    stage: PetStage.BABY,
    level: 2,
  },
];

const linkDemoLineage = async (): Promise<void> => {
  const all = await PetInstanceRepository.listAll();
  const byNickname = new Map(all.map((i) => [i.nickname, i]));
  const byte = byNickname.get(`${DEMO_NICKNAME_PREFIX} Byte`);
  const mother = byNickname.get(`${DEMO_NICKNAME_PREFIX} Debug ♀`);
  const father = byNickname.get(`${DEMO_NICKNAME_PREFIX} Git ♂`);
  if (!byte || !mother || !father) return;
  if (byte.parentMotherId === mother.id && byte.parentFatherId === father.id) return;

  byte.parentMotherId = mother.id;
  byte.parentFatherId = father.id;
  byte.generation = 2;
  byte.traitKeys = ['study_addict'];
  await PetInstanceRepository.update(byte);

  if (mother && mother.traitKeys.length === 0) {
    mother.traitKeys = ['fast_learner'];
    mother.personalityKey = 'mentor';
    await PetInstanceRepository.update(mother);
  }
  if (father && father.traitKeys.length === 0) {
    father.traitKeys = ['coin_magnet'];
    father.personalityKey = 'techie';
    await PetInstanceRepository.update(father);
  }
  if (byte) {
    byte.personalityKey = 'playful';
    await PetInstanceRepository.update(byte);
  }
};

const isDemoNickname = (nickname: string) => nickname.startsWith(DEMO_NICKNAME_PREFIX);

export const PetRosterDemoSeed = {
  async seedMissingDemoInstances(): Promise<number> {
    const existing = await PetInstanceRepository.listAll();
    const existingNicknames = new Set(existing.map((i) => i.nickname));
    let created = 0;

    for (const seed of DEMO_PET_SEEDS) {
      if (existingNicknames.has(seed.nickname)) continue;

      const stats = PetStatsService.rollInitialStats(seed.speciesKey);

      await PetInstanceRepository.create({
        speciesKey: seed.speciesKey,
        gender: seed.gender,
        nickname: seed.nickname,
        stage: seed.stage,
        level: seed.level,
        stats,
        isActive: false,
      });

      existingNicknames.add(seed.nickname);
      created += 1;
    }

    await linkDemoLineage();
    return created;
  },

  async ensureMinimumForTesting(minTotal = 4): Promise<number> {
    const created = await PetRosterDemoSeed.seedMissingDemoInstances();
    const all = await PetInstanceRepository.listAll();
    if (all.length >= minTotal) return created;

    const extras: DemoPetSeed[] = [
      {
        speciesKey: 'codeowl',
        gender: PetGender.MALE,
        nickname: `${DEMO_NICKNAME_PREFIX} Owl`,
        stage: PetStage.ADULT,
        level: 8,
      },
      {
        speciesKey: 'loopfrog',
        gender: PetGender.FEMALE,
        nickname: `${DEMO_NICKNAME_PREFIX} Frog`,
        stage: PetStage.ADULT,
        level: 7,
      },
    ];

    const nicknames = new Set(all.map((i) => i.nickname));
    let more = 0;
    for (const seed of extras) {
      if (all.length + more >= minTotal) break;
      if (nicknames.has(seed.nickname)) continue;
      await PetInstanceRepository.create({
        speciesKey: seed.speciesKey,
        gender: seed.gender,
        nickname: seed.nickname,
        stage: seed.stage,
        level: seed.level,
        stats: PetStatsService.rollInitialStats(seed.speciesKey),
        isActive: false,
      });
      nicknames.add(seed.nickname);
      more += 1;
    }

    await linkDemoLineage();
    return created + more;
  },

  listDemoNicknames(): string[] {
    return DEMO_PET_SEEDS.map((s) => s.nickname);
  },

  isDemoInstance(nickname: string): boolean {
    return isDemoNickname(nickname);
  },
};
