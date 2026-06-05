import { ShopOfferKind, type ShopOfferCatalogEntry } from '@/types/shop-offer';

/** Descontos fixos por oferta — calibrados para não quebrar a economia da loja de moedas. */
export const SHOP_OFFER_CATALOG: ShopOfferCatalogEntry[] = [
  {
    id: 'fog_merchant_shield',
    shopKind: ShopOfferKind.COINS,
    title: 'O mercador do nevoeiro',
    story:
      'Nas manhãs frias, um viajante encapuzado aparece na praça com escudos enferrujados que, segundo ele, já protegeram três reinos. Hoje ele quer apenas moedas suficientes para o café — e deixou um escudo com desconto.',
    merchantName: 'Mercador do Nevoeiro',
    merchantEmoji: '🌫️',
    productKey: 'shield_1',
    discountPercent: 10,
    weight: 12,
  },
  {
    id: 'guardian_legacy',
    shopKind: ShopOfferKind.COINS,
    title: 'Legado do guardião',
    story:
      'Um aprendiz encontrou o baú de um guardião aposentado. Dentro havia um único escudo polido e uma nota: "Passe adiante a proteção que me salvou no dia em que quase desisti de estudar."',
    merchantName: 'Aprendiz do Guardião',
    merchantEmoji: '⚔️',
    productKey: 'shield_1',
    discountPercent: 12,
    weight: 10,
  },
  {
    id: 'streak_rescue',
    shopKind: ShopOfferKind.COINS,
    title: 'Resgate da sequência',
    story:
      'Depois de uma semana difícil, a guilda dos estudantes decidiu subsidiar escudos para quem quase perdeu a streak. A oferta dura só até o sol se pôr — metaforicamente, claro.',
    merchantName: 'Guilda dos Estudantes',
    merchantEmoji: '📚',
    productKey: 'shield_1',
    discountPercent: 15,
    weight: 8,
  },
  {
    id: 'shield_duo_twins',
    shopKind: ShopOfferKind.COINS,
    title: 'Gêmeos da fortaleza',
    story:
      'Dois escudos idênticos foram forjados na mesma noite de tempestade. O ferreiro jurou que protegem melhor em par — e decidiu vendê-los juntos com um desconto fraterno.',
    merchantName: 'Ferreiro das Gêmeas',
    merchantEmoji: '🛡️',
    productKey: 'shield_duo',
    discountPercent: 10,
    weight: 9,
  },
  {
    id: 'shield_pack_bulk',
    shopKind: ShopOfferKind.COINS,
    title: 'Feira do arsenal',
    story:
      'O ferreiro da cidade trouxe um lote de escudos em trio — o mesmo preço de sempre, mas com um desconto de atacado porque precisa liberar espaço no depósito antes da temporada de duelos.',
    merchantName: 'Ferreiro da Cidade',
    merchantEmoji: '🔨',
    productKey: 'shield_pack',
    discountPercent: 10,
    weight: 9,
  },
  {
    id: 'shield_mega_vault',
    shopKind: ShopOfferKind.COINS,
    title: 'Cofre do mega pack',
    story:
      'O arsenal municipal abriu um cofre esquecido com cinco escudos empilhados. A prefeitura vende o lote com desconto para financiar novos livros na biblioteca da cidade.',
    merchantName: 'Tesoureiro da Cidade',
    merchantEmoji: '🏛️',
    productKey: 'shield_mega_pack',
    discountPercent: 12,
    weight: 6,
  },
  {
    id: 'common_box_market',
    shopKind: ShopOfferKind.COINS,
    title: 'Bazar das descobertas',
    story:
      'Uma caixa comum caiu do carroção de um comerciante distraído. Ele riu, disse que sorte boa merece preço bom, e colocou a caixa na vitrine com um adesivo de "achado do dia".',
    merchantName: 'Comerciante do Bazar',
    merchantEmoji: '🏪',
    productKey: 'loot_box_common',
    discountPercent: 12,
    weight: 11,
  },
  {
    id: 'uncommon_box_trail',
    shopKind: ShopOfferKind.COINS,
    title: 'Trilha do colecionador',
    story:
      'Um rastreador voltou da floresta com uma caixa incomum ainda coberta de musgo. Ele disse que quem estuda todos os dias merece um degrau acima do comum — por um preço justo.',
    merchantName: 'Rastreador Verde',
    merchantEmoji: '🌿',
    productKey: 'loot_box_uncommon',
    discountPercent: 12,
    weight: 8,
  },
  {
    id: 'rare_box_captain',
    shopKind: ShopOfferKind.COINS,
    title: 'Carga do capitão',
    story:
      'Um capitão de navio trocou uma caixa rara por provisões. A madeira ainda cheira a sal e aventura. Ele garante que dentro há algo digno de quem já completou missões difíceis esta semana.',
    merchantName: 'Capitão Marés',
    merchantEmoji: '⚓',
    productKey: 'loot_box_rare',
    discountPercent: 10,
    weight: 8,
  },
  {
    id: 'epic_box_dragon',
    shopKind: ShopOfferKind.COINS,
    title: 'Relíquia do dragão adormecido',
    story:
      'Exploradores trouxeram uma caixa épica selada com cera vermelha. O dragão não acordou — felizmente — mas a guilda decidiu vendê-la com moderação para não inflacionar o mercado de relíquias.',
    merchantName: 'Exploradores da Guilda',
    merchantEmoji: '🐉',
    productKey: 'loot_box_epic',
    discountPercent: 10,
    weight: 4,
  },
  {
    id: 'golden_ticket_fair',
    shopKind: ShopOfferKind.COINS,
    title: 'Feira dourada',
    story:
      'Um mágico de rua transformou moedas de cobre em confete — mas guardou um ticket dourado real para quem assistiu o show inteiro sem olhar o celular. Hoje ele vende o ticket com desconto.',
    merchantName: 'Mágico de Rua',
    merchantEmoji: '🎩',
    productKey: 'golden_ticket_coin',
    discountPercent: 12,
    weight: 7,
  },
  {
    id: 'booster_study_dawn',
    shopKind: ShopOfferKind.COINS,
    title: 'Alvorecer do estudante',
    story:
      'A biblioteca abriu mais cedo e encontrou boosters de estudo vencendo ao meio-dia. Em vez de descartar, o bibliotecário oferece um com desconto para quem chegou primeiro.',
    merchantName: 'Bibliotecário Matinal',
    merchantEmoji: '📖',
    productKey: 'booster_study_coin',
    discountPercent: 15,
    weight: 7,
  },
  {
    id: 'cafe_expresso_morning',
    shopKind: ShopOfferKind.COINS,
    title: 'Café da vitrine',
    story:
      'O café da esquina fechou temporariamente e doou o estoque à loja. Um expresso quente, um desconto honesto e a promessa de que a cafeína ajuda na próxima sessão de estudo.',
    merchantName: 'Barista Viajante',
    merchantEmoji: '☕',
    productKey: 'cafe_expresso_coin',
    discountPercent: 15,
    weight: 8,
  },
  {
    id: 'common_box_owl',
    shopKind: ShopOfferKind.COINS,
    title: 'Entrega da coruja',
    story:
      'Uma coruja mensageira deixou uma caixa comum na soleira da loja. O bilhete estava em inglês: "For the one who keeps showing up." A tradução veio com um pequeno desconto de boas-vindas.',
    merchantName: 'Coruja Mensageira',
    merchantEmoji: '🦉',
    productKey: 'loot_box_common',
    discountPercent: 12,
    weight: 10,
  },
];

export const SHOP_OFFER_CATALOG_BY_ID = Object.fromEntries(
  SHOP_OFFER_CATALOG.map((entry) => [entry.id, entry]),
) as Record<string, ShopOfferCatalogEntry>;

export const SHOP_OFFER_MESSAGES = {
  purchaseCompleted: 'Oferta do dia resgatada!',
  itemReceived: 'Item adicionado ao seu inventário.',
  insufficientCoins: 'Moedas insuficientes para esta oferta.',
  alreadyPurchased: 'Você já aproveitou a oferta de moedas de hoje.',
  unavailable: 'Esta oferta não está mais disponível.',
  noOfferToday: 'Hoje não há oferta especial na loja de moedas.',
} as const;
