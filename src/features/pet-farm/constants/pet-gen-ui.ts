import type { PetGenVisualTier } from '../utils/pet-generation';

export const PET_GEN_UI = {
  badge: (gen: number) => `GEN ${gen}`,
  lineageTitle: 'Linhagem',
  treeTitle: 'Árvore genealógica',
  openTree: 'Ver árvore genealógica',
  treeLocked: 'Disponível após o primeiro cruzamento (GEN 2+).',
  unknownAncestor: 'Desconhecido',
  maxGenInCollection: 'Maior GEN da coleção',
  legacyTitle: 'Legacy',
} as const;

export const PET_GEN_TIER_STYLES: Record<
  PetGenVisualTier,
  { badge: string; frame: string; name: string }
> = {
  base: {
    badge: 'bg-muted/30 border-border',
    frame: 'border-border',
    name: 'text-foreground',
  },
  bronze: {
    badge: 'bg-amber-950/40 border-amber-700/50',
    frame: 'border-amber-600/60',
    name: 'text-amber-100',
  },
  silver: {
    badge: 'bg-slate-400/20 border-slate-300/50',
    frame: 'border-slate-300/70',
    name: 'text-slate-100',
  },
  gold: {
    badge: 'bg-yellow-500/15 border-yellow-400/60',
    frame: 'border-yellow-400/70',
    name: 'text-yellow-100',
  },
  mythic: {
    badge: 'bg-violet-600/25 border-violet-400/60',
    frame: 'border-violet-400/80',
    name: 'text-violet-200',
  },
  legacy: {
    badge: 'bg-fuchsia-600/30 border-fuchsia-300/70',
    frame: 'border-fuchsia-300/90',
    name: 'text-fuchsia-100',
  },
};
