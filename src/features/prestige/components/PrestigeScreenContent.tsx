import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { useContractsStore } from '@/features/contracts/store/contracts-store';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';
import {
  getNextPrestigeTier,
  MAX_PRESTIGE_LEVEL,
  PRESTIGE_CATALOG,
} from '@/features/prestige/constants/prestige-catalog';
import { usePlayerStore } from '@/features/player/store/player-store';
import type { PrestigeAscensionPreview } from '@/types/prestige';

import { PRESTIGE_UI } from '../constants/prestige-ui';
import { PrestigeAscensionService } from '../services/prestige-ascension-service';
import { summarizePrestigeBonuses } from '../utils/summarize-prestige-bonuses';
import { PrestigeAscensionModal } from './PrestigeAscensionModal';
import { PrestigeRoadmap } from './PrestigeRoadmap';
import { PrestigeShowcaseHero } from './PrestigeShowcaseHero';
import { PrestigeTierDetailModal } from './PrestigeTierDetailModal';
import { usePrestigeScreenStore } from '../store/prestige-screen-store';
import type { PrestigeTierDefinition } from '@/types/prestige';

export const PrestigeScreenContent = () => {
  const playerLevel = usePlayerStore((s) => s.level);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const state = useMetagameStore((s) => s.state);
  const canPrestige = useMetagameStore((s) => s.canPrestige);
  const activeContract = useContractsStore((s) => s.activeContract);
  const openAscension = usePrestigeScreenStore((s) => s.openAscension);

  const [selectedTier, setSelectedTier] = useState<PrestigeTierDefinition | null>(null);
  const [preview, setPreview] = useState<PrestigeAscensionPreview | null>(null);

  const refreshPreview = useCallback(async () => {
    const next = await PrestigeAscensionService.buildPreview();
    setPreview(next);
  }, []);

  useEffect(() => {
    void refreshPreview();
  }, [playerLevel, currentStreak, refreshPreview]);

  if (!state) return null;

  const currentTier = PRESTIGE_CATALOG.find((tier) => tier.level === state.prestigeLevel) ?? null;
  const nextTier = getNextPrestigeTier(state.prestigeLevel);
  const levelProgress = nextTier
    ? Math.min(100, Math.round((playerLevel / nextTier.requiredPlayerLevel) * 100))
    : 100;
  const activeBonuses = summarizePrestigeBonuses(state.prestigeLevel);
  const maxPrestige = state.prestigeLevel >= MAX_PRESTIGE_LEVEL;

  return (
    <View className="gap-5 pb-4">
      <PrestigeShowcaseHero
        prestigeLevel={state.prestigeLevel}
        currentTier={currentTier}
        nextTier={nextTier}
        playerLevel={playerLevel}
        currentStreak={currentStreak}
        levelProgress={levelProgress}
        canAscend={canPrestige && !activeContract}
        maxPrestige={maxPrestige}
        onStartAscension={openAscension}
      />

      {activeContract ? (
        <View className="rounded-xl border border-warning/35 bg-warning/10 px-4 py-3">
          <Text className="text-xs font-bold uppercase text-warning">Contrato ativo</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">
            Encerre seu contrato antes de ascender — o sacrifício exige foco total na nova run.
          </Text>
        </View>
      ) : null}

      {activeBonuses.length > 0 ? (
        <Card elevated accent>
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            {PRESTIGE_UI.activeBonusesTitle}
          </Text>
          <View className="mt-3 gap-2">
            {activeBonuses.map((bonus) => (
              <View key={bonus.label} className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground-secondary">{bonus.label}</Text>
                <Text className="text-sm font-black text-gold">{bonus.value}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 text-[10px] leading-4 text-muted">{PRESTIGE_UI.bonusesNote}</Text>
        </Card>
      ) : null}

      <Card elevated>
        <Text className="text-xs font-bold uppercase tracking-widest text-muted">
          {PRESTIGE_UI.roadmapTitle}
        </Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{PRESTIGE_UI.roadmapHint}</Text>
        <PrestigeRoadmap
          currentPrestige={state.prestigeLevel}
          playerLevel={playerLevel}
          onSelectTier={setSelectedTier}
        />
      </Card>

      <PrestigeAscensionModal preview={preview} />

      <PrestigeTierDetailModal
        tier={selectedTier}
        currentPrestige={state.prestigeLevel}
        playerLevel={playerLevel}
        canClaim={false}
        onClaim={() => {}}
        onClose={() => setSelectedTier(null)}
      />
    </View>
  );
};
