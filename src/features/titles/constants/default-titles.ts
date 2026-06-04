import type { TitleDefinition } from '@/types/title';

import { EXTENDED_TITLES } from '@/features/game-design/catalogs/extended-content';

export const TITLE_MESSAGES = {
  newTitle: 'Parabéns! Você conquistou um novo título.',
  promotion: 'Você foi promovido!',
  nextMilestone: 'Continue estudando para alcançar o próximo marco da carreira.',
} as const;

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  {
    key: 'local_developer',
    name: 'Local Developer',
    description: 'O início da jornada rumo à carreira internacional.',
    requiredLevel: 1,
    icon: '💻',
  },
  {
    key: 'junior_remote_developer',
    name: 'Junior Remote Developer',
    description: 'Sua primeira grande evolução no mercado remoto.',
    requiredLevel: 5,
    icon: '🌍',
  },
  {
    key: 'mid_remote_developer',
    name: 'Mid Remote Developer',
    description: 'Crescimento profissional consolidado no trabalho remoto.',
    requiredLevel: 10,
    icon: '🚀',
  },
  {
    key: 'senior_remote_developer',
    name: 'Senior Remote Developer',
    description: 'Experiência sólida e impacto técnico reconhecido.',
    requiredLevel: 20,
    icon: '⭐',
  },
  {
    key: 'international_developer',
    name: 'International Developer',
    description: 'Seu primeiro grande marco internacional.',
    requiredLevel: 30,
    icon: '🌐',
  },
  {
    key: 'global_engineer',
    name: 'Global Engineer',
    description: 'Atuação em escala global com visão ampliada.',
    requiredLevel: 50,
    icon: '🛰️',
  },
  {
    key: 'tech_lead',
    name: 'Tech Lead',
    description: 'Maturidade técnica e liderança de equipes.',
    requiredLevel: 75,
    icon: '🎯',
  },
  {
    key: 'world_class_engineer',
    name: 'World Class Engineer',
    description: 'Excelência de longo prazo — o ápice da jornada.',
    requiredLevel: 100,
    icon: '👑',
  },
  {
    key: 'veteran_learner',
    name: 'Veteran Learner',
    description: 'Título exclusivo de Prestígio I.',
    requiredLevel: 50,
    icon: '🏅',
  },
  {
    key: 'global_professional',
    name: 'Global Professional',
    description: 'Título exclusivo de Prestígio II.',
    requiredLevel: 100,
    icon: '🌐',
  },
  {
    key: 'elite_engineer',
    name: 'Elite Engineer',
    description: 'Título exclusivo de Prestígio III.',
    requiredLevel: 200,
    icon: '🎯',
  },
  {
    key: 'legacy_architect',
    name: 'Legacy Architect',
    description: 'Título exclusivo de Prestígio V — legado eterno.',
    requiredLevel: 500,
    icon: '🏛️',
  },
  {
    key: 'season_scholar',
    name: 'Estudante Sazonal',
    description: 'Desbloqueado no Tier 4 do Passe de Temporada mensal.',
    requiredLevel: 1,
    icon: '🏛️',
  },
  {
    key: 'note_taker',
    name: 'Note Taker',
    description: 'Começou a registrar conhecimento no English Journal.',
    requiredLevel: 1,
    icon: '📝',
  },
  {
    key: 'knowledge_collector',
    name: 'Knowledge Collector',
    description: 'Revisa e acumula aprendizado no journal.',
    requiredLevel: 1,
    icon: '📚',
  },
  {
    key: 'study_historian',
    name: 'Study Historian',
    description: 'Histórico rico de estudos em inglês.',
    requiredLevel: 1,
    icon: '📜',
  },
  {
    key: 'memory_master',
    name: 'Memory Master',
    description: 'Domina a revisão espaçada do journal.',
    requiredLevel: 1,
    icon: '🧠',
  },
  {
    key: 'english_scholar',
    name: 'English Scholar',
    description: 'Biblioteca pessoal de inglês em expansão.',
    requiredLevel: 1,
    icon: '🎓',
  },
  {
    key: 'second_brain',
    name: 'Second Brain',
    description: 'Rede densa de conhecimento no Knowledge Vault.',
    requiredLevel: 1,
    icon: '🧠',
  },
  ...EXTENDED_TITLES,
];

export const TITLES_BY_KEY = Object.fromEntries(
  TITLE_DEFINITIONS.map((title) => [title.key, title]),
) as Record<string, TitleDefinition>;

export const DEFAULT_TITLE_KEY = 'local_developer';

export const DEFAULT_TITLE_NAME =
  TITLES_BY_KEY[DEFAULT_TITLE_KEY]?.name ?? 'Local Developer';
