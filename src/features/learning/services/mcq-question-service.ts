import { LEMMA_POOL } from '@/data/loaders/lemma-pool';

import { pickLemmasWithWeakSpacedMix } from '../utils/lemma-picker';
import {
  buildMcqQuestion,
  type BuildMcqInput,
  isMcqTypeAllowedForPatent,
  validateMcqAnswer,
} from './mcq-question-builder';
import { LemmaCompetenceService } from './lemma-competence-service';

export type { BuildMcqInput };

export const McqQuestionService = {
  isTypeAllowedForPatent: isMcqTypeAllowedForPatent,

  buildMcq: buildMcqQuestion,

  validateAnswer: validateMcqAnswer,

  async pickLemmasForSession(count: number, seed: string): Promise<string[]> {
    const weakLimit = Math.max(count, Math.ceil(count * 0.7) + 2);
    const spacedLimit = Math.max(count, Math.ceil(count * 0.3) + 2);

    const [weakRecords, spacedRecords] = await Promise.all([
      LemmaCompetenceService.getWeakLemmas(weakLimit),
      LemmaCompetenceService.getSpacedLemmas(spacedLimit),
    ]);

    const weakLemmas = weakRecords.map((record) => record.lemma);
    const spacedLemmas = spacedRecords.map((record) => record.lemma);

    if (weakLemmas.length === 0 && spacedLemmas.length === 0) {
      return LEMMA_POOL.slice(0, count).map((entry) => entry.lemma);
    }

    const { picked } = pickLemmasWithWeakSpacedMix(weakLemmas, spacedLemmas, count, seed);
    return picked;
  },
};
