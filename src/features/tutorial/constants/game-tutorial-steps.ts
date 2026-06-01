export type GameTutorialStep = {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  bullets: string[];
};

export const GAME_TUTORIAL_STEPS: GameTutorialStep[] = [
  {
    id: 'welcome',
    emoji: '🎮',
    title: 'Bem-vindo ao English Quest',
    summary: 'Um RPG de consistência — estude todos os dias e evolua seu personagem.',
    bullets: [
      'Complete missões diárias para ganhar XP e moedas.',
      'Mantenha sua streak para desbloquear bônus semanais.',
      'Seu pet, títulos e cidade evoluem com o seu progresso.',
    ],
  },
  {
    id: 'coins-shop',
    emoji: '🛒',
    title: 'Moedas e Loja',
    summary: 'Moedas vêm das missões. Gaste na Loja em escudos e loot boxes.',
    bullets: [
      'Escudos protegem sua streak se você perder um dia.',
      '3 loot boxes são compráveis com moedas: Comum, Rara e Épica.',
      'Itens comprados vão direto para o Inventário.',
    ],
  },
  {
    id: 'loot-boxes',
    emoji: '📦',
    title: 'As 7 Loot Boxes',
    summary: 'Existem 7 raridades. Na loja você vê todas — as trancadas explicam como liberar.',
    bullets: [
      'Incomum: Study Points, nível 10+ ou bônus semanal.',
      'Lendária: Prestígio II, nível 100 ou conquistas.',
      'Mítica e Ancestral: Prestígio alto ou upgrade com Study Points.',
    ],
  },
  {
    id: 'study-points',
    emoji: '⚡',
    title: 'Study Points e Collection Book',
    summary: 'Study Points (SP) são a moeda premium do endgame.',
    bullets: [
      'Ganhe SP estudando no Farm e completando atividades.',
      'No Collection Book você compra loot boxes e faz upgrade de raridade.',
      'Upgrade: gaste SP para transformar uma caixa que você já possui.',
    ],
  },
  {
    id: 'progression',
    emoji: '🏆',
    title: 'Progressão e Prestígio',
    summary: 'Várias fontes entregam loot boxes além da loja.',
    bullets: [
      'A cada 5 níveis: milestone com loot box (raridade sobe com o nível).',
      'Contratos, conquistas e missões semanais também recompensam caixas.',
      'Prestígio desbloqueia Lendária, Mítica e Ancestral automaticamente.',
    ],
  },
];

export const GAME_TUTORIAL_MESSAGES = {
  skip: 'Pular tutorial',
  previous: 'Anterior',
  next: 'Próximo',
  finish: 'Começar a jogar',
  reopen: 'Guia do jogo',
} as const;
