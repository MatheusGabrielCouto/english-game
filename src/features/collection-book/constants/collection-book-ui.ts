import { CollectibleCategory, type CollectibleCategoryValue } from '@/types/collectible';

export const COLLECTION_BOOK_UI = {
  screenTitle: 'Relíquias',
  screenSubtitle: 'Códex de artefatos, míticos e ultra raros',
  heroTitle: 'Códex do aventureiro',
  heroSubtitle: 'Colecione itens raros e complete sua Pokédex do English Quest',
  ratesTitle: 'Taxa por tipo',
  albumTitle: 'Álbum',
  discoveredLabel: 'descobertos no códex',
  howItWorks: [
    'Itens aparecem aqui quando você os obtém no jogo (loot, eventos, etc.).',
    'Use a lista de desejos para marcar o que você quer caçar.',
    'Categorias diferentes têm taxas de drop distintas nas loot boxes.',
  ],
} as const;

export const CATEGORY_SUBTITLES: Record<CollectibleCategoryValue, string> = {
  [CollectibleCategory.RELIC]: 'Relíquias e registros históricos',
  [CollectibleCategory.ARTIFACT]: 'Artefatos mágicos',
  [CollectibleCategory.MYTHIC]: 'Itens míticos de batalha',
  [CollectibleCategory.COSMETIC]: 'Cosméticos e visuais',
  [CollectibleCategory.PET_EXCLUSIVE]: 'Companheiros exclusivos',
  [CollectibleCategory.ULTRA_RARE]: 'Ultra raros da temporada',
};
