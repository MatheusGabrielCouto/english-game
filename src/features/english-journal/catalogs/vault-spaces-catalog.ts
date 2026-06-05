import { JournalCategory } from '@/types/journal';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

export type VaultFolderDef = {
  name: string;
  slug: string;
  description: string;
};

export type VaultSpaceDef = {
  key: VaultSpaceKey;
  label: string;
  emoji: string;
  description: string;
  defaultCategory: (typeof JournalCategory)[keyof typeof JournalCategory];
  defaultFolders: VaultFolderDef[];
};

export const VAULT_SPACES: VaultSpaceDef[] = [
  {
    key: 'grammar',
    label: 'Grammar',
    emoji: '📐',
    description: 'Regras, tempos verbais e estruturas',
    defaultCategory: JournalCategory.GRAMMAR,
    defaultFolders: [
      {
        name: 'Verb Tenses',
        slug: 'verb-tenses',
        description: 'Present, past, perfect, continuous — regras e exemplos de cada tempo.',
      },
      {
        name: 'Conditionals',
        slug: 'conditionals',
        description: 'Zero, first, second, third conditional e variações (unless, as long as…).',
      },
      {
        name: 'Conjunctions',
        slug: 'conjunctions',
        description: 'Although, however, moreover — conectores e como encadear ideias.',
      },
      {
        name: 'Prepositions',
        slug: 'prepositions',
        description: 'In/on/at, dependências verbais e erros comuns de preposição.',
      },
      {
        name: 'Phrasal Verbs',
        slug: 'phrasal-verbs',
        description: 'Verbos com partícula (give up, look into) e uso em contexto.',
      },
      {
        name: 'Passive Voice',
        slug: 'passive-voice',
        description: 'Voz passiva, foco no objeto e quando soa natural em inglês.',
      },
    ],
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary',
    emoji: '📖',
    description: 'Palavras, expressões e collocations',
    defaultCategory: JournalCategory.VOCABULARY,
    defaultFolders: [
      {
        name: 'Daily Words',
        slug: 'daily-words',
        description: 'Palavras novas do dia, flashcards e revisão rápida.',
      },
      {
        name: 'Phrasal Verbs',
        slug: 'phrasal-verbs',
        description: 'Expressões verbais fixas que você quer memorizar como vocabulário.',
      },
      {
        name: 'Idioms',
        slug: 'idioms',
        description: 'Expressões idiomáticas (break the ice, piece of cake) e significado real.',
      },
      {
        name: 'Collocations',
        slug: 'collocations',
        description: 'Combinações naturais: make a decision, heavy rain, strongly agree.',
      },
    ],
  },
  {
    key: 'speaking',
    label: 'Speaking',
    emoji: '🗣️',
    description: 'Pronúncia, fluência e prática oral',
    defaultCategory: JournalCategory.SPEAKING,
    defaultFolders: [
      {
        name: 'Practice Log',
        slug: 'practice-log',
        description: 'Registro de práticas orais, feedback de pronúncia e frases treinadas.',
      },
    ],
  },
  {
    key: 'listening',
    label: 'Listening',
    emoji: '👂',
    description: 'Compreensão auditiva e podcasts',
    defaultCategory: JournalCategory.LISTENING,
    defaultFolders: [
      {
        name: 'Media Notes',
        slug: 'media-notes',
        description: 'Trechos de séries, podcasts, vídeos — vocabulário e ideias que ouviu.',
      },
    ],
  },
  {
    key: 'reading',
    label: 'Reading',
    emoji: '📚',
    description: 'Textos, artigos e leitura guiada',
    defaultCategory: JournalCategory.READING,
    defaultFolders: [
      {
        name: 'Articles',
        slug: 'articles',
        description: 'Resumos, vocabulário e insights de artigos, blogs ou notícias.',
      },
    ],
  },
  {
    key: 'writing',
    label: 'Writing',
    emoji: '✍️',
    description: 'Redação, emails e estrutura textual',
    defaultCategory: JournalCategory.WRITING,
    defaultFolders: [
      {
        name: 'Drafts',
        slug: 'drafts',
        description: 'Rascunhos, parágrafos modelos e versões de textos que você escreve.',
      },
    ],
  },
  {
    key: 'interview_english',
    label: 'Interview English',
    emoji: '💼',
    description: 'Perguntas, respostas e pitch',
    defaultCategory: JournalCategory.INTERVIEW,
    defaultFolders: [
      {
        name: 'Behavioral',
        slug: 'behavioral',
        description: 'Perguntas comportamentais, storytelling e respostas no formato STAR.',
      },
      {
        name: 'Technical',
        slug: 'technical',
        description: 'Perguntas técnicas de entrevista e como explicar conceitos em inglês.',
      },
      {
        name: 'STAR Stories',
        slug: 'star-stories',
        description: 'Histórias prontas (Situation, Task, Action, Result) para reutilizar.',
      },
    ],
  },
  {
    key: 'programming_english',
    label: 'Programming English',
    emoji: '💻',
    description: 'Termos técnicos e entrevistas dev',
    defaultCategory: JournalCategory.PROGRAMMING_ENGLISH,
    defaultFolders: [
      {
        name: 'React',
        slug: 'react',
        description: 'Hooks, componentes, estado — termos e frases que você usa no dia a dia.',
      },
      {
        name: 'Node.js',
        slug: 'node',
        description: 'Backend, APIs, middleware — vocabulário de Node e ecossistema.',
      },
      {
        name: 'System Design',
        slug: 'system-design',
        description: 'Escalabilidade, trade-offs e como discutir arquitetura em entrevistas.',
      },
      {
        name: 'Architecture',
        slug: 'architecture',
        description: 'Padrões, camadas, microsserviços — conceitos e como nomeá-los em inglês.',
      },
      {
        name: 'Interviews',
        slug: 'interviews',
        description: 'Perguntas de entrevista dev, whiteboard talk e respostas ensaiadas.',
      },
      {
        name: 'Backend',
        slug: 'backend',
        description: 'Banco de dados, filas, auth — termos de backend para falar com fluência.',
      },
    ],
  },
  {
    key: 'career_english',
    label: 'Career English',
    emoji: '🌍',
    description: 'Carreira internacional e workplace',
    defaultCategory: JournalCategory.CAREER,
    defaultFolders: [
      {
        name: 'Workplace',
        slug: 'workplace',
        description: 'Reuniões, feedback, emails profissionais e cultura de time remoto.',
      },
    ],
  },
  {
    key: 'teacher_feedback',
    label: 'Teacher Feedback',
    emoji: '👩‍🏫',
    description: 'Correções e orientações do professor',
    defaultCategory: JournalCategory.GRAMMAR,
    defaultFolders: [
      {
        name: 'Corrections',
        slug: 'corrections',
        description: 'Erros corrigidos pelo professor, regras explicadas e exemplos certos.',
      },
    ],
  },
  {
    key: 'english_course',
    label: 'English Course',
    emoji: '🎓',
    description: 'Aulas, módulos e lições do curso',
    defaultCategory: JournalCategory.VOCABULARY,
    defaultFolders: [
      {
        name: 'Lesson Summaries',
        slug: 'lesson-summaries',
        description: 'Resumo do que viu em aula, pontos principais e dúvidas para revisar.',
      },
      {
        name: 'Homework',
        slug: 'homework',
        description: 'Exercícios, tarefas e anotações de lição de casa.',
      },
    ],
  },
  {
    key: 'personal_notes',
    label: 'Personal Notes',
    emoji: '🧠',
    description: 'Insights gerais e anotações livres',
    defaultCategory: JournalCategory.PERSONAL,
    defaultFolders: [
      {
        name: 'Inbox',
        slug: 'inbox',
        description: 'Captura rápida — ideias soltas para organizar depois em outra área ou pasta.',
      },
    ],
  },
];

export const VAULT_SPACE_BY_KEY = Object.fromEntries(
  VAULT_SPACES.map((space) => [space.key, space]),
) as Record<VaultSpaceKey, VaultSpaceDef>;

export const VAULT_NAME = 'English Knowledge Vault';
export const VAULT_SUBTITLE = 'My English Brain — seu second brain de inglês';
