import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { routes, theme } from '@/constants';

import { isFlashDeckEnabled } from '@/constants/feature-flags';
import { DEFAULT_DUEL_ENEMY_KEY, getDuelEnemy } from '@/data/loaders/duel-enemies';
import { useFlashDeckStore } from '@/features/flash-deck/store/flash-deck-store';
import {
    LearningHeroPanel,
    LearningModeTile,
    LearningSectionHeader,
} from '@/features/learning/components/ui';
import { LearningIntegrationService } from '@/features/learning/services/learning-integration-service';
import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';
import { usesA1TravelPack } from '../constants/duel-progression-config';
import { DUEL_UI } from '../constants/duel-ui';
import { DuelCombatService } from '../services/duel-combat-service';
import { DuelPatentService } from '../services/duel-patent-service';
import { DuelService } from '../services/duel-service';
import { DuelWeeklyBossService } from '../services/duel-weekly-boss-service';
import { getPlayerMaxHp, useDuelStore } from '../store/duel-store';
import { DuelPatentBadge } from './DuelPatentBadge';
import { DuelStaminaCard } from './DuelStaminaCard';

const enemy = getDuelEnemy(DEFAULT_DUEL_ENEMY_KEY);

export const DuelArenaContent = () => {
  const profileView = useDuelStore((s) => s.profileView);
  const setProfileView = useDuelStore((s) => s.setProfileView);
  const setBattle = useDuelStore((s) => s.setBattle);
  const resetBattle = useDuelStore((s) => s.resetBattle);

  const [loadingMode, setLoadingMode] = useState<
    'ranked' | 'dojo' | 'rematch' | 'card_duel' | 'weekly_boss' | null
  >(null);
  const [arenaBonusMessage, setArenaBonusMessage] = useState<string | null>(null);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [lastLostSessionId, setLastLostSessionId] = useState<string | null>(null);
  const totalDueCount = useFlashDeckStore((s) => s.totalDueCount);

  const refresh = useCallback(async () => {
    const [profile, lostId, bossStatus] = await Promise.all([
      DuelService.getProfile(),
      DuelService.getLastLostSessionId(),
      DuelWeeklyBossService.getStatus(),
    ]);
    setProfileView(profile);
    setLastLostSessionId(lostId);
    setBossDefeated(bossStatus.defeatedThisWeek);
  }, [setProfileView]);

  useFocusEffect(
    useCallback(() => {
      resetBattle();
      void refresh();
      void useFlashDeckStore.getState().refresh();
      void LearningIntegrationService.claimDailyArenaBonus().then((result) => {
        if (result.granted && result.message) {
          setArenaBonusMessage(result.message);
        }
      });
      void LearningIntegrationService.checkFlashDuePetNudge();
    }, [refresh, resetBattle]),
  );

  const beginSession = useCallback(
    async (mode: 'ranked' | 'dojo' | 'rematch' | 'card_duel' | 'weekly_boss') => {
      if (!enemy || loadingMode) return;

      setLoadingMode(mode);
      try {
        const started =
          mode === 'card_duel'
            ? await DuelService.startCardDuelSession()
            : mode === 'weekly_boss'
              ? await DuelService.startWeeklyBossSession()
              : await DuelService.startSession({
                  mode: mode === 'rematch' ? 'rematch_review' : mode,
                  enemyKey: DEFAULT_DUEL_ENEMY_KEY,
                  sourceSessionId: mode === 'rematch' ? (lastLostSessionId ?? undefined) : undefined,
                });

        const combat = DuelCombatService.createInitialState(
          getPlayerMaxHp(),
          mode === 'rematch' ? 1 : enemy.hp,
        );

        setBattle({
          sessionId: started.session.id,
          enemyKey: enemy.key,
          enemyName: started.enemyName,
          enemyEmoji: started.enemyEmoji,
          patent: started.session.patentAtStart,
          mode: started.mode,
          playerMaxHp: getPlayerMaxHp(),
          enemyMaxHp: mode === 'rematch' ? 1 : enemy.hp,
          questions: started.questions,
          combat,
          questionIndex: 0,
        });

        if (mode === 'rematch') {
          router.push(routes.duelsRematchReview as Href);
        } else {
          router.push(routes.duelsBattle as Href);
        }

        await refresh();
      } catch (err) {
        Alert.alert(
          'Duelo',
          err instanceof Error ? err.message : 'Não foi possível iniciar',
        );
      } finally {
        setLoadingMode(null);
      }
    },
    [enemy, lastLostSessionId, loadingMode, refresh, setBattle],
  );

  if (!enemy) {
    return <Text className="text-center text-sm text-muted">Inimigo não configurado.</Text>;
  }

  const patent = profileView?.currentPatent ?? 'tourist';
  const canRanked = profileView?.canStartRanked ?? false;
  const canExam = DuelPatentService.canTakePatentExam(patent);
  const isBusy = loadingMode !== null;

  return (
    <View className="gap-5">
      {profileView ? <DuelStaminaCard profile={profileView} /> : null}

      {arenaBonusMessage ? (
        <View className="rounded-xl border border-success/40 bg-success/10 px-3 py-2">
          <Text className="text-center text-xs font-bold text-success">🎁 {arenaBonusMessage}</Text>
        </View>
      ) : null}

      {isBusy ? (
        <View className="items-center py-2">
          <ActivityIndicator color={theme.colors.primary} />
          <Text className="mt-2 text-xs font-bold text-primary">Preparando arena…</Text>
        </View>
      ) : null}

      <LearningHeroPanel
        variant="duel"
        eyebrow={DUEL_UI.arenaTitle}
        emoji={enemy.emoji}
        headline={enemy.name}
        subtitle={enemy.tagline}
        trailing={<DuelPatentBadge patent={patent} size="sm" />}>
        <Text className="text-xs text-foreground-secondary">
          {usesA1TravelPack(patent) ? DUEL_UI.touristPoolHint : DUEL_UI.rankedPoolHint}
        </Text>
        <Text className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">
          {DUEL_COMBAT_CONFIG.questionCountMin}–{DUEL_COMBAT_CONFIG.questionCountMax} perguntas por duelo
        </Text>
      </LearningHeroPanel>

      <LearningSectionHeader emoji="⚔️" title="Escolha sua batalha" hint="Cada modo gasta recursos diferentes" />

      <View className="gap-2">
        <LearningModeTile
          emoji="👹"
          title={DUEL_UI.weeklyBoss}
          description={bossDefeated ? DUEL_UI.weeklyBossDefeated : DUEL_UI.weeklyBossHint}
          badge={bossDefeated ? 'Vencido' : 'Boss'}
          variant="boss"
          disabled={bossDefeated || isBusy}
          onPress={() => void beginSession('weekly_boss')}
          accessibilityLabel={DUEL_UI.weeklyBoss}
        />
        <LearningModeTile
          emoji="🏟️"
          title={DUEL_UI.rankedBattle}
          description={canRanked ? 'Ganhe XP e moedas' : DUEL_UI.rankedDisabled}
          variant="ranked"
          disabled={!canRanked || isBusy}
          onPress={() => void beginSession('ranked')}
          accessibilityLabel={DUEL_UI.rankedBattle}
        />
        <LearningModeTile
          emoji="🥋"
          title={DUEL_UI.dojoBattle}
          description={DUEL_UI.dojoHint}
          variant="dojo"
          disabled={isBusy}
          onPress={() => void beginSession('dojo')}
          accessibilityLabel={DUEL_UI.dojoBattle}
        />
        {isFlashDeckEnabled() ? (
          <LearningModeTile
            emoji="🃏"
            title={DUEL_UI.cardDuelBattle}
            description={
              totalDueCount > 0 ? DUEL_UI.cardDuelHint : DUEL_UI.cardDuelUnavailable
            }
            badge={totalDueCount > 0 ? `${totalDueCount} due` : undefined}
            variant="deck"
            disabled={totalDueCount === 0 || isBusy}
            onPress={() => void beginSession('card_duel')}
            accessibilityLabel={DUEL_UI.cardDuelBattle}
          />
        ) : null}
        {canExam ? (
          <LearningModeTile
            emoji="📜"
            title={DUEL_UI.patentExam}
            description={DUEL_UI.patentExamHint}
            variant="exam"
            disabled={isBusy}
            onPress={() => router.push(routes.duelsPatentExam as Href)}
            accessibilityLabel={DUEL_UI.patentExam}
          />
        ) : null}
        <LearningModeTile
          emoji="📖"
          title={DUEL_UI.rematchReview}
          description={
            lastLostSessionId ? DUEL_UI.rematchHint : DUEL_UI.rematchUnavailable
          }
          variant="neutral"
          disabled={!lastLostSessionId || isBusy}
          onPress={() => void beginSession('rematch')}
          accessibilityLabel={DUEL_UI.rematchReview}
        />
      </View>
    </View>
  );
};
