import { Platform } from 'react-native';

import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useCityStore } from '@/features/city/store/city-store';
import { useContractsStore } from '@/features/contracts/store/contracts-store';
import { useFarmStore } from '@/features/farm/store/farm-store';
import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';
import { useFocusModeStore } from '@/features/focus-mode/store/focus-mode-store';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';
import { usePlayerStore } from '@/features/player';
import { useTitlesStore } from '@/features/titles/store/titles-store';

import type { ExploreItemId } from '../constants/profile-explore-catalog';

export type ExploreBadgeTone = 'default' | 'live' | 'reward' | 'quest' | 'locked';

export type ExploreBadge = {
  label: string;
  tone: ExploreBadgeTone;
};

const pct = (unlocked: number, total: number): number =>
  total > 0 ? Math.round((unlocked / total) * 100) : 0;

export const useExploreBadges = (): Record<ExploreItemId, ExploreBadge> => {
  const level = usePlayerStore((s) => s.level);
  const achievementSummary = useAchievementsStore((s) => s.summary);
  const titleSummary = useTitlesStore((s) => s.summary);
  const citySummary = useCityStore((s) => s.summary);
  const activeContract = useContractsStore((s) => s.activeContract);
  const todayStudyPoints = useFarmStore((s) => s.todayStudyPoints);
  const flashDueCount = useFlashDeckStore((s) => s.totalDueCount);
  const activeFocus = useFocusModeStore((s) => s.activeSession);
  const claimableSeasonTiers = useMetagameStore((s) => s.claimableSeasonTiers);

  const snapshot = InventoryService.getCachedSnapshot();
  const unopenedLoot = snapshot?.lootBoxes.total ?? 0;
  const petLevel = snapshot?.pet?.level;

  const achievementPct = pct(achievementSummary.unlocked, achievementSummary.total);
  const cityPct = pct(citySummary.unlocked, citySummary.total);
  const titlePct = pct(titleSummary.unlocked, titleSummary.total);

  const contractBadge: ExploreBadge = activeContract
    ? { label: 'Em andamento', tone: 'live' }
    : { label: 'Novo desafio', tone: 'quest' };

  const focusBadge: ExploreBadge =
    Platform.OS !== 'android'
      ? { label: 'Indisponível', tone: 'locked' }
      : activeFocus
        ? { label: 'AO VIVO', tone: 'live' }
        : { label: 'Pronto', tone: 'quest' };

  const lootBadge: ExploreBadge =
    unopenedLoot > 0
      ? { label: `${unopenedLoot} abrir`, tone: 'reward' }
      : { label: 'Vazio', tone: 'default' };

  return {
    pet: petLevel
      ? { label: `Nv. ${petLevel}`, tone: 'quest' }
      : { label: 'Visitar', tone: 'default' },
    farm:
      todayStudyPoints > 0
        ? { label: `+${todayStudyPoints} SP`, tone: 'reward' }
        : { label: 'Coletar', tone: 'quest' },
    'flash-deck':
      flashDueCount > 0
        ? { label: `${flashDueCount} na mesa`, tone: 'quest' }
        : { label: 'Baralho', tone: 'default' },
    duels: { label: 'Arena', tone: 'quest' },
    'learning-insights': { label: '§C local', tone: 'default' },
    focus: focusBadge,
    city: { label: `${cityPct}%`, tone: cityPct >= 50 ? 'reward' : 'quest' },
    contracts: contractBadge,
    inventory:
      unopenedLoot > 0
        ? lootBadge
        : { label: `${snapshot?.shields.quantity ?? 0} escudos`, tone: 'default' },
    loot: lootBadge,
    achievements: { label: `${achievementPct}%`, tone: achievementPct >= 80 ? 'reward' : 'quest' },
    titles: { label: `${titleSummary.unlocked}/${titleSummary.total}`, tone: 'quest' },
    'collection-book': { label: 'Códex', tone: 'default' },
    statistics: { label: `Nv. ${level}`, tone: 'default' },
    career: { label: 'Global', tone: 'default' },
    prestige: { label: 'Roadmap', tone: 'default' },
    'loot-catalog': { label: 'Odds', tone: 'default' },
    metagame:
      claimableSeasonTiers > 0
        ? { label: `${claimableSeasonTiers} resgatar`, tone: 'reward' }
        : { label: 'Temporada', tone: 'default' },
  };
};

export const useWorldExplorationPercent = (): number => {
  const achievementSummary = useAchievementsStore((s) => s.summary);
  const titleSummary = useTitlesStore((s) => s.summary);
  const citySummary = useCityStore((s) => s.summary);

  const parts = [
    pct(achievementSummary.unlocked, achievementSummary.total),
    pct(citySummary.unlocked, citySummary.total),
    pct(titleSummary.unlocked, titleSummary.total),
  ];

  return Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length);
};
