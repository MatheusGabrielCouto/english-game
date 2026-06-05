/**
 * Nomes canônicos na UI — três domínios distintos (P-25).
 * Código interno mantém `pet`, `pet-farm`, `farm`; usuário vê estes rótulos.
 */
export const DOMAIN_GLOSSARY = {
  petCompanion: {
    shortLabel: 'Companheiro',
    title: 'Meu Companheiro',
    emoji: '🐾',
    tagline: 'Pet ativo — humor, XP e interações',
  },
  petFarm: {
    shortLabel: 'Fazenda de Pets',
    title: 'Fazenda de Pets',
    emoji: '🏝️',
    tagline: 'Ilha com pasto, cruzamento e coleção',
  },
  studyFarm: {
    shortLabel: 'Farm de Estudo',
    title: 'Farm de Estudo',
    emoji: '🌾',
    tagline: 'Registre estudo extra e ganhe Study Points',
  },
} as const

export type DomainGlossaryBannerVariant = keyof typeof DOMAIN_GLOSSARY_BANNERS

export const DOMAIN_GLOSSARY_BANNERS: Record<
  DomainGlossaryBannerVariant,
  { title: string; body: string }
> = {
  petCompanion: {
    title: 'Companheiro ≠ Fazenda',
    body: 'Aqui você cuida do pet ativo. Pasto, cruzamento e incubadora ficam na Fazenda de Pets.',
  },
  petFarm: {
    title: 'Fazenda de Pets',
    body: 'Ilha de coleção e cruzamento — diferente do Companheiro (pet ativo) e do Farm de Estudo (ganhar SP).',
  },
  studyFarm: {
    title: 'Farm de Estudo',
    body: 'Registre prática extra para Study Points — não é a Fazenda de Pets (ilha dos pets).',
  },
}
