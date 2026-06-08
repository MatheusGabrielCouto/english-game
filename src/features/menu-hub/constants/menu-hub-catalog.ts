import type { Href } from 'expo-router'
import { Platform } from 'react-native'

import { DOMAIN_GLOSSARY, routes } from '@/constants'
import { isDuelsEnabled, isFlashDeckEnabled } from '@/constants/feature-flags'
import type { ExploreItemId } from '@/features/profile/constants/profile-explore-catalog'

export type MenuHubCategoryId = 'progression' | 'knowledge' | 'productivity' | 'collection' | 'meta'

export type MenuHubItemId =
  | ExploreItemId
  | 'shop'
  | 'pet-farm'
  | 'knowledge-map'
  | 'knowledge-collections'

export type MenuHubItemDef = {
  id: MenuHubItemId
  label: string
  emoji: string
  route: Href
  /** Texto curto e amigável na lista */
  hint: string
  category: MenuHubCategoryId
  searchKeywords: string[]
  exploreId?: ExploreItemId
  pinnable?: boolean
  /** Nível mínimo do jogador para abrir o modo (omitir = disponível desde o início). */
  requiredLevel?: number
  isEnabled?: () => boolean
}

const focusEnabled = () => Platform.OS === 'android'

export const MENU_HUB_ITEMS: MenuHubItemDef[] = [
  {
    id: 'city',
    label: 'Cidade',
    emoji: '🏙️',
    route: routes.city as Href,
    hint: 'Veja sua cidade evoluir',
    category: 'progression',
    searchKeywords: ['cidade', 'city', 'skyline', 'evolução'],
    exploreId: 'city',
    pinnable: true,
    requiredLevel: 5,
  },
  {
    id: 'pet',
    label: DOMAIN_GLOSSARY.petCompanion.shortLabel,
    emoji: DOMAIN_GLOSSARY.petCompanion.emoji,
    route: routes.pet as Href,
    hint: 'Cuide do seu companheiro',
    category: 'progression',
    searchKeywords: ['pet', 'companheiro', 'mascote'],
    exploreId: 'pet',
    pinnable: true,
  },
  {
    id: 'pet-farm',
    label: DOMAIN_GLOSSARY.petFarm.shortLabel,
    emoji: DOMAIN_GLOSSARY.petFarm.emoji,
    route: routes.petFarm as Href,
    hint: 'Pasto, cruzamento e coleção',
    category: 'progression',
    searchKeywords: ['fazenda', 'pet', 'breeding', 'cruzar', 'pasto'],
    pinnable: true,
    requiredLevel: 30,
  },
  {
    id: 'inventory',
    label: 'Inventário',
    emoji: '🎒',
    route: routes.inventory as Href,
    hint: 'Itens, escudos e loot',
    category: 'progression',
    searchKeywords: ['inventário', 'inventory', 'itens', 'bolsa'],
    exploreId: 'inventory',
    pinnable: true,
    requiredLevel: 5,
  },
  {
    id: 'loot',
    label: 'Caixas surpresa',
    emoji: '🎁',
    route: routes.lootBoxes as Href,
    hint: 'Abra e ganhe recompensas',
    category: 'progression',
    searchKeywords: ['loot', 'caixa', 'box', 'recompensa'],
    exploreId: 'loot',
    pinnable: true,
    requiredLevel: 10,
  },
  {
    id: 'shop',
    label: 'Loja',
    emoji: '🛒',
    route: routes.shop as Href,
    hint: 'Compre upgrades e itens',
    category: 'progression',
    searchKeywords: ['loja', 'shop', 'comprar', 'moedas'],
    pinnable: true,
    requiredLevel: 10,
  },
  {
    id: 'contracts',
    label: 'Contratos',
    emoji: '📜',
    route: routes.contracts as Href,
    hint: 'Desafios com recompensa extra',
    category: 'progression',
    searchKeywords: ['contratos', 'contracts', 'desafio', 'aposta'],
    exploreId: 'contracts',
    pinnable: true,
    requiredLevel: 15,
  },
  {
    id: 'achievements',
    label: 'Conquistas',
    emoji: '🏆',
    route: routes.achievements as Href,
    hint: 'Marcos da sua jornada',
    category: 'progression',
    searchKeywords: ['conquistas', 'achievements', 'badge'],
    exploreId: 'achievements',
    requiredLevel: 5,
  },
  {
    id: 'titles',
    label: 'Títulos',
    emoji: '👑',
    route: routes.titles as Href,
    hint: 'Como o mundo te vê',
    category: 'progression',
    searchKeywords: ['títulos', 'titles', 'rank', 'international'],
    exploreId: 'titles',
    requiredLevel: 10,
  },
  {
    id: 'prestige',
    label: 'Prestígio',
    emoji: '⭐',
    route: routes.prestige as Href,
    hint: 'Evolução de endgame',
    category: 'progression',
    searchKeywords: ['prestígio', 'prestige', 'endgame'],
    exploreId: 'prestige',
    requiredLevel: 50,
  },
  {
    id: 'english-journal',
    label: 'Diário em inglês',
    emoji: '📓',
    route: routes.tabs.knowledge as Href,
    hint: 'Notas, áudio e revisões',
    category: 'knowledge',
    searchKeywords: ['vault', 'knowledge', 'notas', 'journal', 'inglês'],
    exploreId: 'english-journal',
    pinnable: true,
  },
  {
    id: 'motivation-spark',
    label: 'Chama Interior',
    emoji: '🔥',
    route: routes.motivation.hub as Href,
    hint: 'Suas faíscas de motivação',
    category: 'knowledge',
    searchKeywords: ['chama', 'motivação', 'motivation', 'faísca', 'spark', 'interior', 'cofre'],
    exploreId: 'motivation-spark',
    pinnable: true,
  },
  {
    id: 'knowledge-map',
    label: 'Mapa de ideias',
    emoji: '🗺️',
    route: routes.vault.map as Href,
    hint: 'Conecte o que você aprendeu',
    category: 'knowledge',
    searchKeywords: ['mapa', 'map', 'grafo', 'conexões'],
    pinnable: true,
  },
  {
    id: 'knowledge-collections',
    label: 'Coleções',
    emoji: '📚',
    route: routes.vault.collections as Href,
    hint: 'Organize temas de estudo',
    category: 'knowledge',
    searchKeywords: ['coleções', 'collections', 'listas'],
  },
  {
    id: 'routines',
    label: 'Rotinas',
    emoji: '📋',
    route: routes.routines as Href,
    hint: 'Lembretes do seu dia',
    category: 'productivity',
    searchKeywords: ['rotinas', 'routines', 'hábitos', 'habits'],
    exploreId: 'routines',
    pinnable: true,
  },
  {
    id: 'focus',
    label: 'Modo foco',
    emoji: '🎯',
    route: routes.focusMode as Href,
    hint: Platform.OS === 'android' ? 'Bloqueie distrações' : 'Disponível no Android',
    category: 'productivity',
    searchKeywords: ['focus', 'foco', 'bloqueio', 'concentração'],
    exploreId: 'focus',
    requiredLevel: 5,
    isEnabled: focusEnabled,
  },
  {
    id: 'statistics',
    label: 'Insights',
    emoji: '📊',
    route: routes.statistics as Href,
    hint: 'Veja seu progresso geral',
    category: 'productivity',
    searchKeywords: ['estatísticas', 'statistics', 'stats', 'métricas'],
    exploreId: 'statistics',
    requiredLevel: 20,
  },
  {
    id: 'farm',
    label: DOMAIN_GLOSSARY.studyFarm.shortLabel,
    emoji: DOMAIN_GLOSSARY.studyFarm.emoji,
    route: routes.farm as Href,
    hint: DOMAIN_GLOSSARY.studyFarm.tagline,
    category: 'productivity',
    searchKeywords: ['farm', 'study points', 'sp'],
    exploreId: 'farm',
    requiredLevel: 10,
  },
  {
    id: 'flash-deck',
    label: 'Baralho',
    emoji: '📒',
    route: routes.flashDeck as Href,
    hint: 'Revise cartas de vocabulário',
    category: 'knowledge',
    searchKeywords: ['baralho', 'flash', 'cards', 'deck'],
    exploreId: 'flash-deck',
    requiredLevel: 15,
    isEnabled: isFlashDeckEnabled,
  },
  {
    id: 'duels',
    label: 'Duelos',
    emoji: '⚔️',
    route: routes.duels as Href,
    hint: 'Batalhas de inglês',
    category: 'productivity',
    searchKeywords: ['duelos', 'duels', 'arena', 'batalha'],
    exploreId: 'duels',
    requiredLevel: 20,
    isEnabled: isDuelsEnabled,
  },
  {
    id: 'learning-insights',
    label: 'Painel de estudo',
    emoji: '📈',
    route: routes.learningInsights as Href,
    hint: 'Duelos, baralho e mais',
    category: 'productivity',
    searchKeywords: ['métricas', 'insights', 'learning'],
    exploreId: 'learning-insights',
    requiredLevel: 20,
  },
  {
    id: 'collection-book',
    label: 'Relíquias',
    emoji: '📖',
    route: routes.collectionBook as Href,
    hint: 'Coleção de relíquias',
    category: 'collection',
    searchKeywords: ['relíquias', 'códex', 'collection'],
    exploreId: 'collection-book',
    requiredLevel: 15,
  },
  {
    id: 'career',
    label: 'Carreira',
    emoji: '💼',
    route: routes.career as Href,
    hint: 'Carreira internacional',
    category: 'meta',
    searchKeywords: ['carreira', 'career', 'profissional'],
    exploreId: 'career',
    requiredLevel: 30,
  },
  {
    id: 'metagame',
    label: 'Temporada',
    emoji: '🏛️',
    route: routes.metagame as Href,
    hint: 'Passe de temporada',
    category: 'meta',
    searchKeywords: ['temporada', 'metagame', 'season'],
    exploreId: 'metagame',
    requiredLevel: 50,
  },
  {
    id: 'loot-catalog',
    label: 'Chances de loot',
    emoji: '📋',
    route: routes.lootBoxCatalog as Href,
    hint: 'Veja probabilidades das caixas',
    category: 'meta',
    searchKeywords: ['loot', 'catálogo', 'odds'],
    exploreId: 'loot-catalog',
    requiredLevel: 10,
  },
]

export type MenuQuickActionDef = {
  id: string
  label: string
  emoji: string
  route: Href
  isEnabled?: () => boolean
}

export const MENU_HUB_QUICK_ACTIONS: MenuQuickActionDef[] = [
  {
    id: 'note',
    label: 'Nova nota',
    emoji: '✍️',
    route: routes.tabs.knowledge as Href,
  },
  {
    id: 'loot',
    label: 'Abrir loot',
    emoji: '🎁',
    route: routes.lootBoxes as Href,
  },
  {
    id: 'pet',
    label: 'Cuidar do pet',
    emoji: '🐾',
    route: routes.pet as Href,
  },
  {
    id: 'focus',
    label: 'Iniciar foco',
    emoji: '🎯',
    route: routes.focusMode as Href,
    isEnabled: focusEnabled,
  },
  {
    id: 'contract',
    label: 'Contratos',
    emoji: '📜',
    route: routes.contracts as Href,
  },
]

export const getEnabledMenuHubItems = (): MenuHubItemDef[] =>
  MENU_HUB_ITEMS.filter((item) => item.isEnabled?.() ?? true)
