export type McqQuestionType =
  | 'mcq_meaning'
  | 'mcq_translation'
  | 'mcq_grammar'
  | 'mcq_cloze'
  | 'mcq_register'
  | 'mcq_collocation'
  | 'mcq_inference';

export type McqPrompt = {
  stem: string;
  choices: string[];
  correctIndex: number;
  hint?: string;
};

export type McqQuestion = {
  id: string;
  type: McqQuestionType;
  lemma?: string;
  patent: string;
  theme?: string;
  prompt: McqPrompt;
};

export type McqQuestionPack = {
  version: number;
  packKey: string;
  patent: string;
  theme?: string;
  questions: McqQuestion[];
};
