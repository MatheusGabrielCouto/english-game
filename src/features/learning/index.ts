export { LEARNING_UI } from './constants/learning-ui';
export {
  McqPromptSchema,
  McqQuestionPackSchema,
  McqQuestionSchema,
} from './schemas/mcq-question-schema';
export { LemmaCompetenceService } from './services/lemma-competence-service';
export { McqQuestionService } from './services/mcq-question-service';
export { buildMcqQuestion, validateMcqAnswer } from './services/mcq-question-builder';
export type { BuildMcqInput } from './services/mcq-question-builder';
export { normalizeLemma } from './utils/lemma-normalize';
export { computeWeaknessScore } from './utils/weakness-score';
export { pickLemmasWithWeakSpacedMix } from './utils/lemma-picker';
export { pickLemmaDistractors, choicesAreDistinct } from './utils/mcq-distractors';
