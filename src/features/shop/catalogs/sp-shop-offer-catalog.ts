import { ShopOfferKind, type ShopOfferCatalogEntry } from '@/types/shop-offer';

/** Ofertas narrativas da loja de Study Points. */
export const SP_SHOP_OFFER_CATALOG: ShopOfferCatalogEntry[] = [
  {
    id: 'sp_academy_common',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Bolsa da academia',
    story:
      'A academia distribuiu bolsas de estudo em forma de caixas comuns. O diretor disse que Study Points bem gastos valem mais que sorte — mas hoje há um abatimento simbólico.',
    merchantName: 'Diretor da Academia',
    merchantEmoji: '🎓',
    productKey: 'box_common',
    discountPercent: 12,
    weight: 12,
  },
  {
    id: 'sp_greenhouse_uncommon',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Estufa de cristal',
    story:
      'Botânicos cultivam caixas incomuns em estufas mágicas. Uma delas ficou pronta antes do previsto e foi colocada na loja SP com desconto para os primeiros compradores.',
    merchantName: 'Botânico da Estufa',
    merchantEmoji: '🌱',
    productKey: 'box_uncommon',
    discountPercent: 12,
    weight: 10,
  },
  {
    id: 'sp_scholar_rare',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Prêmio do erudito',
    story:
      'Um erudito aposentado trocou uma caixa rara por horas de revisão no cofre. Ele pediu apenas que a oferta chegasse a quem ainda está montando seu próprio ritual de estudo.',
    merchantName: 'Erudito Aposentado',
    merchantEmoji: '📜',
    productKey: 'box_rare',
    discountPercent: 10,
    weight: 8,
  },
  {
    id: 'sp_epic_constellation',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Constelação épica',
    story:
      'Quando três estrelas se alinham sobre a torre de estudo, a loja SP libera uma caixa épica com subsídio. Os astrônomos juram que isso acontece em dias de oferta — coincidência ou não.',
    merchantName: 'Astrônoma da Torre',
    merchantEmoji: '🌟',
    productKey: 'box_epic',
    discountPercent: 10,
    weight: 5,
  },
  {
    id: 'sp_legendary_summit',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Cume lendário',
    story:
      'Alpinistas trouxeram uma caixa lendária do topo da montanha do foco. O ar rarefeito preservou o mistério — e o conselho de SP decidiu vendê-la com moderação para não esgotar o estoque sagrado.',
    merchantName: 'Alpinista do Foco',
    merchantEmoji: '🏔️',
    productKey: 'box_legendary',
    discountPercent: 10,
    weight: 3,
  },
  {
    id: 'sp_golden_ticket_arcade',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Arcade dourado',
    story:
      'Um fliperama antigo foi convertido em sala de estudo. O último ticket dourado da máquina arcade ficou na vitrine SP — quem estudar 25 minutos merece um clique de sorte com desconto.',
    merchantName: 'Dono do Fliperama',
    merchantEmoji: '🕹️',
    productKey: 'golden_ticket',
    discountPercent: 12,
    weight: 9,
  },
  {
    id: 'sp_free_loot_gift',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Presente surpresa',
    story:
      'Voluntários embrulharam tickets de loot para estudantes que completaram missões diárias esta semana. Sobrou um pacote — e a guilda SP repassou com um preço amigo.',
    merchantName: 'Voluntários da Guilda',
    merchantEmoji: '🎁',
    productKey: 'free_loot_ticket',
    discountPercent: 15,
    weight: 8,
  },
  {
    id: 'sp_booster_midnight',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Booster da meia-noite',
    story:
      'Quem estuda após a meia-noite conhece o booster azul que pulsa suavemente na prateleira SP. Hoje ele está com desconto — "para quem transforma cansaço em progresso".',
    merchantName: 'Vigia Noturno',
    merchantEmoji: '🌙',
    productKey: 'booster_study',
    discountPercent: 15,
    weight: 9,
  },
  {
    id: 'sp_xp_potion_lab',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Laboratório de soro',
    story:
      'O laboratório de alquimia estudantil produziu um lote extra de soro de XP. O cheiro é de biblioteca e determinação — e o preço saiu mais baixo que o normal.',
    merchantName: 'Alquimista Estudante',
    merchantEmoji: '🧪',
    productKey: 'xp_potion_small',
    discountPercent: 12,
    weight: 10,
  },
  {
    id: 'sp_collector_magnet',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Ímã do colecionador',
    story:
      'Colecionadores lendários usam um ímã especial para atrair loot raro. Um deles emprestou o item à loja SP por um dia, com desconto para quem sonha em completar o álbum.',
    merchantName: 'Colecionador Mestre',
    merchantEmoji: '🧲',
    productKey: 'legendary_collector',
    discountPercent: 12,
    weight: 5,
  },
  {
    id: 'sp_double_xp_eclipse',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Eclipse de XP',
    story:
      'Durante o eclipse, os elixires de XP em dobro brilham sozinhos. Os astrônomos confirmaram: é seguro usar — e hoje o frasco está com preço de observação especial.',
    merchantName: 'Observador do Eclipse',
    merchantEmoji: '🌑',
    productKey: 'double_xp_1h',
    discountPercent: 10,
    weight: 4,
  },
  {
    id: 'sp_kit_escudo_guard',
    shopKind: ShopOfferKind.STUDY_POINTS,
    title: 'Kit do guarda',
    story:
      'O guarda da biblioteca guarda kits de escudo para emergências de streak. Ele abriu um hoje e disse: "Melhor na mão de quem estuda do que na gaveta."',
    merchantName: 'Guarda da Biblioteca',
    merchantEmoji: '🧰',
    productKey: 'kit_escudo',
    discountPercent: 15,
    weight: 8,
  },
];

export const SP_SHOP_OFFER_CATALOG_BY_ID = Object.fromEntries(
  SP_SHOP_OFFER_CATALOG.map((entry) => [entry.id, entry]),
) as Record<string, ShopOfferCatalogEntry>;
