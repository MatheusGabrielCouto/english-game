import { JournalCategory } from '@/types/journal';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

export type VaultSpaceDef = {
  key: VaultSpaceKey;
  label: string;
  emoji: string;
  description: string;
  defaultCategory: (typeof JournalCategory)[keyof typeof JournalCategory];
  defaultFolders: { name: string; slug: string }[];
};

export const VAULT_SPACES: VaultSpaceDef[] = [
  {
    key: 'grammar',
    label: 'Grammar',
    emoji: '📐',
    description: 'Regras, tempos verbais e estruturas',
    defaultCategory: JournalCategory.GRAMMAR,
    defaultFolders: [
      { name: 'Verb Tenses', slug: 'verb-tenses' },
      { name: 'Conditionals', slug: 'conditionals' },
      { name: 'Conjunctions', slug: 'conjunctions' },
      { name: 'Prepositions', slug: 'prepositions' },
      { name: 'Phrasal Verbs', slug: 'phrasal-verbs' },
      { name: 'Passive Voice', slug: 'passive-voice' },
    ],
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary',
    emoji: '📖',
    description: 'Palavras, expressões e collocations',
    defaultCategory: JournalCategory.VOCABULARY,
    defaultFolders: [
      { name: 'Daily Words', slug: 'daily-words' },
      { name: 'Phrasal Verbs', slug: 'phrasal-verbs' },
      { name: 'Idioms', slug: 'idioms' },
      { name: 'Collocations', slug: 'collocations' },
    ],
  },
  {
    key: 'speaking',
    label: 'Speaking',
    emoji: '🗣️',
    description: 'Pronúncia, fluência e prática oral',
    defaultCategory: JournalCategory.SPEAKING,
    defaultFolders: [{ name: 'Practice Log', slug: 'practice-log' }],
  },
  {
    key: 'listening',
    label: 'Listening',
    emoji: '👂',
    description: 'Compreensão auditiva e podcasts',
    defaultCategory: JournalCategory.LISTENING,
    defaultFolders: [{ name: 'Media Notes', slug: 'media-notes' }],
  },
  {
    key: 'reading',
    label: 'Reading',
    emoji: '📚',
    description: 'Textos, artigos e leitura guiada',
    defaultCategory: JournalCategory.READING,
    defaultFolders: [{ name: 'Articles', slug: 'articles' }],
  },
  {
    key: 'writing',
    label: 'Writing',
    emoji: '✍️',
    description: 'Redação, emails e estrutura textual',
    defaultCategory: JournalCategory.WRITING,
    defaultFolders: [{ name: 'Drafts', slug: 'drafts' }],
  },
  {
    key: 'interview_english',
    label: 'Interview English',
    emoji: '💼',
    description: 'Perguntas, respostas e pitch',
    defaultCategory: JournalCategory.INTERVIEW,
    defaultFolders: [
      { name: 'Behavioral', slug: 'behavioral' },
      { name: 'Technical', slug: 'technical' },
      { name: 'STAR Stories', slug: 'star-stories' },
    ],
  },
  {
    key: 'programming_english',
    label: 'Programming English',
    emoji: '💻',
    description: 'Termos técnicos e entrevistas dev',
    defaultCategory: JournalCategory.PROGRAMMING_ENGLISH,
    defaultFolders: [
      { name: 'React', slug: 'react' },
      { name: 'Node.js', slug: 'node' },
      { name: 'System Design', slug: 'system-design' },
      { name: 'Architecture', slug: 'architecture' },
      { name: 'Interviews', slug: 'interviews' },
      { name: 'Backend', slug: 'backend' },
    ],
  },
  {
    key: 'career_english',
    label: 'Career English',
    emoji: '🌍',
    description: 'Carreira internacional e workplace',
    defaultCategory: JournalCategory.CAREER,
    defaultFolders: [{ name: 'Workplace', slug: 'workplace' }],
  },
  {
    key: 'teacher_feedback',
    label: 'Teacher Feedback',
    emoji: '👩‍🏫',
    description: 'Correções e orientações do professor',
    defaultCategory: JournalCategory.GRAMMAR,
    defaultFolders: [{ name: 'Corrections', slug: 'corrections' }],
  },
  {
    key: 'english_course',
    label: 'English Course',
    emoji: '🎓',
    description: 'Aulas, módulos e lições do curso',
    defaultCategory: JournalCategory.VOCABULARY,
    defaultFolders: [
      { name: 'Lesson Summaries', slug: 'lesson-summaries' },
      { name: 'Homework', slug: 'homework' },
    ],
  },
  {
    key: 'personal_notes',
    label: 'Personal Notes',
    emoji: '🧠',
    description: 'Insights gerais e anotações livres',
    defaultCategory: JournalCategory.PERSONAL,
    defaultFolders: [{ name: 'Inbox', slug: 'inbox' }],
  },
];

export const VAULT_SPACE_BY_KEY = Object.fromEntries(
  VAULT_SPACES.map((space) => [space.key, space]),
) as Record<VaultSpaceKey, VaultSpaceDef>;

export const VAULT_NAME = 'English Knowledge Vault';
export const VAULT_SUBTITLE = 'My English Brain — seu second brain de inglês';
