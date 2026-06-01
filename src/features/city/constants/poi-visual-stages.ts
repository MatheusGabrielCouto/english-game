import { theme } from '@/constants';

export type PoiVisualStageStyle = {
  stageLabel: string;
  pinBorderColor: string;
  pinBackgroundColor: string;
  stageBadge: string | null;
  usePulse: boolean;
  iconScale: number;
};

export const POI_VISUAL_STAGE_STYLES: Record<number, PoiVisualStageStyle> = {
  1: {
    stageLabel: 'Início',
    pinBorderColor: `${theme.colors.border}`,
    pinBackgroundColor: theme.colors.surface,
    stageBadge: null,
    usePulse: false,
    iconScale: 1,
  },
  2: {
    stageLabel: 'Crescendo',
    pinBorderColor: `${theme.colors.primary}55`,
    pinBackgroundColor: theme.colors.surfaceElevated,
    stageBadge: '✨',
    usePulse: false,
    iconScale: 1.02,
  },
  3: {
    stageLabel: 'Estabelecido',
    pinBorderColor: theme.colors.primary,
    pinBackgroundColor: `${theme.colors.primary}18`,
    stageBadge: '🏷️',
    usePulse: false,
    iconScale: 1.04,
  },
  4: {
    stageLabel: 'Vibrante',
    pinBorderColor: theme.colors.accent,
    pinBackgroundColor: `${theme.colors.accent}15`,
    stageBadge: '🚩',
    usePulse: true,
    iconScale: 1.06,
  },
  5: {
    stageLabel: 'Landmark',
    pinBorderColor: theme.colors.gold,
    pinBackgroundColor: `${theme.colors.gold}18`,
    stageBadge: '👑',
    usePulse: true,
    iconScale: 1.08,
  },
};

export const getPoiVisualStageStyle = (visualStage: number): PoiVisualStageStyle =>
  POI_VISUAL_STAGE_STYLES[Math.min(5, Math.max(1, visualStage))] ?? POI_VISUAL_STAGE_STYLES[1];
