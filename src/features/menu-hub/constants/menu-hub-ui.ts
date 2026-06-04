import type { MenuHubCategoryId } from './menu-hub-catalog'

export const MENU_HUB_UI = {
  screenTitle: 'Menu',
  screenSubtitle: 'Tudo que você pode fazer no app',
  heroTitle: 'Seu painel',
  heroGreeting: (name: string) => `Olá, ${name}`,
  heroBody: 'Todos os modos do app em um lugar. Fixe atalhos com o marcador nos cards.',
  heroModesLabel: 'Modos',
  heroFavoritesLabel: 'Favoritos',
  heroFavoritesValue: (pinned: number, max: number) => `${pinned}/${max}`,
  heroModesCount: (n: number) => `${n} modos disponíveis`,
  heroPinTip: (pinned: number, max: number) => {
    if (pinned === 0) return `Fixe até ${max} atalhos com o marcador nos cards.`
    if (pinned >= max) return 'Favoritos cheios. Remova um para fixar outro.'
    return `${pinned} de ${max} favoritos fixados — espaço para mais.`
  },
  searchLabel: 'Buscar',
  searchPlaceholder: 'Pet, loja, diário, rotinas…',
  searchEmpty: 'Nada encontrado. Tente outra palavra.',
  searchClear: 'Limpar busca',
  favoritesTitle: 'Favoritos',
  favoritesHint: 'Fixados no topo · use o marcador para adicionar ou remover',
  favoritesPin: 'Adicionar aos favoritos',
  favoritesUnpin: 'Remover dos favoritos',
  favoritesMax: 'Você pode fixar no máximo 5 itens.',
  quickActionsTitle: 'Começar agora',
  quickActionsHint: 'Atalhos para o dia a dia',
  openMode: 'Abrir',
  sectionExpand: (title: string) => `${title}, expandir seção`,
  sectionCollapse: (title: string) => `${title}, recolher seção`,
  categories: {
    progression: { title: 'Mundo e progresso', emoji: '⚔️', subtitle: 'Cidade, pet, loja e recompensas' },
    knowledge: { title: 'Estudo e conhecimento', emoji: '📓', subtitle: 'Diário, mapa e coleções' },
    productivity: { title: 'Foco e rotina', emoji: '🎯', subtitle: 'Hábitos, métricas e bloqueio de apps' },
    collection: { title: 'Coleção e conquistas', emoji: '🎒', subtitle: 'Itens, badges e relíquias' },
    meta: { title: 'Carreira e temporada', emoji: '🏛️', subtitle: 'Prestígio, passe e metagame' },
  },
} as const

export const MENU_CATEGORY_ACCENT: Record<
  MenuHubCategoryId,
  { border: string; bg: string; glow: string; label: string }
> = {
  progression: {
    border: 'border-primary/40',
    bg: 'bg-primary/12',
    glow: 'shadow-primary/20',
    label: 'text-primary',
  },
  knowledge: {
    border: 'border-success/40',
    bg: 'bg-success/10',
    glow: 'shadow-success/15',
    label: 'text-success',
  },
  productivity: {
    border: 'border-accent/40',
    bg: 'bg-accent/10',
    glow: 'shadow-accent/15',
    label: 'text-accent',
  },
  collection: {
    border: 'border-gold/40',
    bg: 'bg-gold/10',
    glow: 'shadow-gold/15',
    label: 'text-gold',
  },
  meta: {
    border: 'border-legendary/40',
    bg: 'bg-legendary/10',
    glow: 'shadow-legendary/15',
    label: 'text-legendary',
  },
}
