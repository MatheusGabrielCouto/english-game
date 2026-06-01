import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { routes } from '@/constants';

export type ExploreCategoryId = 'adventure' | 'collection' | 'meta';

export type ExploreItemId =
  | 'pet'
  | 'farm'
  | 'flash-deck'
  | 'duels'
  | 'learning-insights'
  | 'focus'
  | 'city'
  | 'contracts'
  | 'inventory'
  | 'loot'
  | 'achievements'
  | 'titles'
  | 'collection-book'
  | 'statistics'
  | 'career'
  | 'prestige'
  | 'loot-catalog'
  | 'metagame';

export type ExploreItemDef = {
  id: ExploreItemId;
  label: string;
  emoji: string;
  route: Href;
  tagline: string;
  featured?: boolean;
};

export type ExploreCategoryDef = {
  id: ExploreCategoryId;
  title: string;
  emoji: string;
  subtitle: string;
  items: ExploreItemDef[];
};

const focusTagline = Platform.OS === 'android' ? 'Bloqueio de apps' : 'Só no Android';

export const EXPLORE_CATEGORIES: ExploreCategoryDef[] = [
  {
    id: 'adventure',
    title: 'Aventura',
    emoji: '⚔️',
    subtitle: 'Estudo, mundo e missões ativas',
    items: [
      { id: 'pet', label: 'Pet', emoji: '🐾', route: routes.pet as Href, tagline: 'Companheiro', featured: true },
      { id: 'farm', label: 'Farm', emoji: '🌾', route: routes.farm as Href, tagline: 'Study Points', featured: true },
      {
        id: 'flash-deck',
        label: 'Baralho',
        emoji: '📒',
        route: routes.flashDeck as Href,
        tagline: 'Flashcards',
        featured: true,
      },
      {
        id: 'duels',
        label: 'Duelos',
        emoji: '⚔️',
        route: routes.duels as Href,
        tagline: 'MCQ em batalha',
        featured: true,
      },
      {
        id: 'learning-insights',
        label: 'Métricas',
        emoji: '📊',
        route: routes.learningInsights as Href,
        tagline: 'Duelos & baralho',
      },
      { id: 'focus', label: 'Focus', emoji: '🎯', route: routes.focusMode as Href, tagline: focusTagline, featured: true },
      { id: 'city', label: 'Cidade', emoji: '🏙️', route: routes.city as Href, tagline: 'Skyline', featured: true },
      { id: 'contracts', label: 'Contratos', emoji: '📜', route: routes.contracts as Href, tagline: 'Desafios', featured: true },
    ],
  },
  {
    id: 'collection',
    title: 'Coleção',
    emoji: '🎒',
    subtitle: 'Itens, loot e progresso pessoal',
    items: [
      { id: 'inventory', label: 'Inventário', emoji: '🎒', route: '/(tabs)/inventory' as Href, tagline: 'Bolsa', featured: true },
      { id: 'loot', label: 'Loot', emoji: '🎁', route: routes.lootBoxes as Href, tagline: 'Abrir caixas', featured: true },
      { id: 'achievements', label: 'Conquistas', emoji: '🏆', route: routes.achievements as Href, tagline: 'Badges', featured: true },
      { id: 'titles', label: 'Títulos', emoji: '👑', route: routes.titles as Href, tagline: 'Ranks', featured: true },
      { id: 'collection-book', label: 'Relíquias', emoji: '📖', route: routes.collectionBook as Href, tagline: 'Códex' },
    ],
  },
  {
    id: 'meta',
    title: 'Endgame',
    emoji: '🏛️',
    subtitle: 'Carreira, prestígio e temporada',
    items: [
      { id: 'statistics', label: 'Stats', emoji: '📊', route: routes.statistics as Href, tagline: 'Painel' },
      { id: 'career', label: 'Carreira', emoji: '💼', route: routes.career as Href, tagline: 'Global' },
      { id: 'prestige', label: 'Prestígio', emoji: '⭐', route: routes.prestige as Href, tagline: 'Roadmap' },
      { id: 'loot-catalog', label: 'Loot Cat.', emoji: '📋', route: routes.lootBoxCatalog as Href, tagline: 'Chances' },
      { id: 'metagame', label: 'Metagame', emoji: '🏛️', route: routes.metagame as Href, tagline: 'Temporada' },
    ],
  },
];
