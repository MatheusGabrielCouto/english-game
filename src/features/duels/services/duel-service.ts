import { DEFAULT_DUEL_ENEMY_KEY, getDuelEnemy } from '@/data/loaders/duel-enemies';
import { validateMcqAnswer } from '@/features/learning';
import { LemmaCompetenceService } from '@/features/learning/services/lemma-competence-service';
import { FlashDeckService } from '@/features/flash-deck/services/flash-deck-service';
import { LearningAnalyticsService } from '@/features/learning/services/learning-analytics-service';
import { GameEvents } from '@/services/game-events';
import type { DuelPatent, DuelSessionQuestionRecord, DuelSessionRecord } from '@/types/duel';

import { DuelRepository } from '@/storage/repositories/duel-repository';

import {
  DUEL_ARENA_KEYS,
  DUEL_CARD_DUEL_QUESTION_COUNT,
  DUEL_PROGRESSION_CONFIG,
  type DuelArenaMode,
} from '../constants/duel-progression-config';
import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';
import { resolveQuestionCount } from '../utils/duel-session-utils';
import {
  buildCardDuelQuestions,
  buildDuelQuestionsForSession,
  cloneRematchQuestions,
} from '../utils/duel-question-plan';
import { DuelCombatService, type DuelCombatState } from './duel-combat-service';
import { DuelPatentService } from './duel-patent-service';
import { DuelWeeklyBossService, WEEKLY_BOSS_ENEMY_KEY } from './duel-weekly-boss-service';
import { DuelProfileService } from './duel-profile-service';
import { DuelRewardService, type DuelRewardResult } from './duel-reward-service';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export { resolveQuestionCount } from '../utils/duel-session-utils';

export type DuelBattleQuestion = DuelSessionQuestionRecord;

export type StartDuelSessionOptions = {
  mode?: DuelArenaMode;
  enemyKey?: string;
  sourceSessionId?: string;
};

export type StartDuelSessionResult = {
  session: DuelSessionRecord;
  questions: DuelBattleQuestion[];
  enemyName: string;
  enemyEmoji: string;
  mode: DuelArenaMode;
};

export type AnswerDuelQuestionResult = {
  isCorrect: boolean;
  damageDealt: number | null;
  damageTaken: number | null;
  combat: DuelCombatState;
  status: 'active' | 'won' | 'lost';
  hint: string | null;
  isCritical: boolean;
};

export type FinishDuelSessionResult = {
  session: DuelSessionRecord;
  rewards: DuelRewardResult;
  mode: DuelArenaMode;
};

export const resolveArenaMode = (arenaKey: string): DuelArenaMode => {
  if (arenaKey === DUEL_ARENA_KEYS.dojo) return 'dojo';
  if (arenaKey === DUEL_ARENA_KEYS.patent_exam) return 'patent_exam';
  if (arenaKey === DUEL_ARENA_KEYS.rematch_review) return 'rematch_review';
  if (arenaKey === DUEL_ARENA_KEYS.card_duel) return 'card_duel';
  if (arenaKey === DUEL_ARENA_KEYS.weekly_boss) return 'weekly_boss';
  return 'ranked';
};

export const DuelService = {
  async getProfile() {
    return DuelProfileService.reconcileProfile();
  },

  async startSession(options: StartDuelSessionOptions = {}): Promise<StartDuelSessionResult> {
    const mode = options.mode ?? 'ranked';
    const enemyKey =
      options.enemyKey ??
      (mode === 'weekly_boss' ? WEEKLY_BOSS_ENEMY_KEY : DEFAULT_DUEL_ENEMY_KEY);
    const enemy = getDuelEnemy(enemyKey);

    if (!enemy) {
      throw new Error(`Inimigo não encontrado: ${enemyKey}`);
    }

    const profile = await DuelProfileService.reconcileProfile();
    const patent = profile.currentPatent;

    if (mode === 'ranked') {
      await DuelProfileService.consumeRankedStamina();
    }

    const sessionId = createId('duel_session');
    let questions: DuelBattleQuestion[] = [];

    if (mode === 'rematch_review') {
      if (!options.sourceSessionId) {
        throw new Error('Sessão de origem obrigatória para revisão');
      }

      const sourceQuestions = await DuelRepository.listSessionQuestions(options.sourceSessionId);
      const wrong = sourceQuestions
        .filter((item) => item.isCorrect === false)
        .slice(0, DUEL_PROGRESSION_CONFIG.rematchReviewMaxQuestions);

      if (wrong.length === 0) {
        throw new Error('Nenhum erro para revisar');
      }

      questions = cloneRematchQuestions(wrong, sessionId);
    } else if (mode === 'patent_exam') {
      const targetPatent = DuelPatentService.getExamTargetPatent(patent);
      if (!targetPatent) {
        throw new Error('Nenhuma prova de patente disponível');
      }
      questions = await buildDuelQuestionsForSession(
        sessionId,
        DUEL_PROGRESSION_CONFIG.patentExamQuestionCount,
        targetPatent,
      );
    } else if (mode === 'weekly_boss') {
      const bossStatus = await DuelWeeklyBossService.getStatus();
      if (bossStatus.defeatedThisWeek) {
        throw new Error('Boss semanal já derrotado esta semana');
      }
      questions = await buildDuelQuestionsForSession(
        sessionId,
        Math.max(
          DUEL_PROGRESSION_CONFIG.weeklyBossQuestionCount,
          Math.ceil(enemy.hp / enemy.playerDamage),
        ),
        patent,
      );
    } else if (mode === 'card_duel') {
      const dueCards = await FlashDeckService.listDueCardsForCardDuel(DUEL_CARD_DUEL_QUESTION_COUNT);
      if (dueCards.length === 0) {
        throw new Error('Nenhuma carta na mesa para o duelo de cartas');
      }
      questions = buildCardDuelQuestions(sessionId, dueCards, patent);
    } else {
      const questionCount = resolveQuestionCount(sessionId, {
        enemyHp: enemy.hp,
        playerDamage: enemy.playerDamage,
      });
      questions = await buildDuelQuestionsForSession(sessionId, questionCount, patent);
    }

    const session: DuelSessionRecord = {
      id: sessionId,
      enemyKey: enemy.key,
      arenaKey: DUEL_ARENA_KEYS[mode],
      patentAtStart: patent,
      playerHp: DUEL_COMBAT_CONFIG.playerMaxHp,
      enemyHp: mode === 'rematch_review' ? 1 : enemy.hp,
      comboStreak: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
    };

    await DuelRepository.insertSession(session);
    for (const question of questions) {
      await DuelRepository.insertSessionQuestion(question);
    }

    return {
      session,
      questions,
      enemyName:
        mode === 'rematch_review'
          ? 'Revisão'
          : mode === 'card_duel'
            ? 'Cartas na mesa'
            : enemy.name,
      enemyEmoji: mode === 'rematch_review' ? '📖' : mode === 'card_duel' ? '🃏' : enemy.emoji,
      mode,
    };
  },

  async startCardDuelSession(): Promise<StartDuelSessionResult> {
    return DuelService.startSession({ mode: 'card_duel', enemyKey: DEFAULT_DUEL_ENEMY_KEY });
  },

  async startWeeklyBossSession(): Promise<StartDuelSessionResult> {
    return DuelService.startSession({ mode: 'weekly_boss' });
  },

  async answerQuestion(input: {
    sessionId: string;
    questionId: string;
    selectedIndex: number;
    responseMs: number;
    combat: DuelCombatState;
  }): Promise<AnswerDuelQuestionResult> {
    const session = await DuelRepository.getSession(input.sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Sessão de duelo inválida');
    }

    const mode = resolveArenaMode(session.arenaKey);
    const questions = await DuelRepository.listSessionQuestions(input.sessionId);
    const question = questions.find((item) => item.id === input.questionId);
    if (!question) {
      throw new Error('Pergunta não encontrada');
    }

    const enemy = getDuelEnemy(session.enemyKey);
    if (!enemy) {
      throw new Error('Inimigo não encontrado');
    }

    const isCorrect = validateMcqAnswer(question.prompt, input.selectedIndex);
    let combat = input.combat;
    let damageDealt: number | null = null;
    let damageTaken: number | null = null;
    let isCritical = false;

    if (mode === 'rematch_review' || mode === 'patent_exam') {
      await DuelRepository.updateSessionQuestion(question.id, {
        answeredIndex: input.selectedIndex,
        isCorrect,
        responseMs: input.responseMs,
        damageDealt: null,
      });

      if (mode === 'patent_exam') {
        return {
          isCorrect,
          damageDealt: null,
          damageTaken: null,
          combat,
          status: 'active',
          hint: isCorrect ? null : question.prompt.hint ?? 'Revise no Baralho Vivo.',
          isCritical: false,
        };
      }

      const refreshed = await DuelRepository.listSessionQuestions(input.sessionId);
      const allDone = refreshed.every((item) => item.answeredIndex !== null);

      return {
        isCorrect,
        damageDealt: null,
        damageTaken: null,
        combat,
        status: allDone ? 'won' : 'active',
        hint: isCorrect ? null : question.prompt.hint ?? 'Revise no Baralho Vivo.',
        isCritical: false,
      };
    }

    const weakness =
      question.lemma != null
        ? ((await LemmaCompetenceService.get(question.lemma))?.weaknessScore ?? 0.5)
        : 0.5;

    if (isCorrect) {
      const hit = DuelCombatService.applyCorrectHit(combat, enemy.playerDamage, weakness);
      combat = hit.state;
      damageDealt = hit.damageDealt;
      isCritical = DuelCombatService.isComboCritical(combat.comboStreak);
      if (question.lemma) {
        await LemmaCompetenceService.recordDuelAnswer(question.lemma, true);
      }
    } else {
      const counter = DuelCombatService.applyWrongAnswer(
        combat,
        DuelCombatService.computeEnemyCounterDamage(enemy.counterDamage),
      );
      combat = counter.state;
      damageTaken = counter.damageTaken;
      if (question.lemma) {
        await LemmaCompetenceService.recordDuelAnswer(question.lemma, false);
      }
    }

    await DuelRepository.updateSessionQuestion(question.id, {
      answeredIndex: input.selectedIndex,
      isCorrect,
      responseMs: input.responseMs,
      damageDealt,
    });

    await DuelRepository.updateSession(input.sessionId, {
      playerHp: combat.playerHp,
      enemyHp: combat.enemyHp,
      comboStreak: combat.comboStreak,
    });

    let status: AnswerDuelQuestionResult['status'] = 'active';
    if (DuelCombatService.isVictory(combat)) {
      status = 'won';
    } else if (DuelCombatService.isDefeat(combat)) {
      status = 'lost';
    }

    return {
      isCorrect,
      damageDealt,
      damageTaken,
      combat,
      status,
      hint: isCorrect ? null : question.prompt.hint ?? 'Revise o lemma no Baralho Vivo.',
      isCritical,
    };
  },

  async finishSession(
    sessionId: string,
    status: 'won' | 'lost' | 'abandoned',
    combat: DuelCombatState,
  ): Promise<FinishDuelSessionResult> {
    const session = await DuelRepository.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const mode = resolveArenaMode(session.arenaKey);
    const questions = await DuelRepository.listSessionQuestions(sessionId);
    const answered = questions.filter((item) => item.isCorrect !== null);
    const correctCount = answered.filter((item) => item.isCorrect).length;

    let finalStatus = status;

    if (mode === 'patent_exam') {
      const passed = DuelPatentService.isExamPassed(
        correctCount,
        DUEL_PROGRESSION_CONFIG.patentExamQuestionCount,
      );
      finalStatus = passed ? 'won' : 'lost';
      if (passed) {
        const previousPatent = session.patentAtStart;
        const targetPatent = DuelPatentService.getExamTargetPatent(previousPatent);
        if (targetPatent) {
          await DuelProfileService.promotePatent(targetPatent);
          GameEvents.emit({
            type: 'PATENT_PROMOTED',
            previousPatent,
            newPatent: targetPatent,
          });
        }
      } else {
        await DuelProfileService.onDuelDefeat();
      }
    } else if (finalStatus === 'lost') {
      await DuelProfileService.onDuelDefeat();
    }

    const endedAt = new Date().toISOString();
    await DuelRepository.updateSession(sessionId, {
      playerHp: combat.playerHp,
      enemyHp: combat.enemyHp,
      comboStreak: combat.comboStreak,
      status: finalStatus,
      endedAt,
    });

    let rewards = DuelRewardService.computeRewards(
      finalStatus === 'won',
      answered.length,
      mode,
    );

    if (mode === 'weekly_boss' && finalStatus === 'won') {
      rewards = {
        ...rewards,
        coins: rewards.coins + (await DuelWeeklyBossService.getStatus()).coinBonus,
      };
      await DuelWeeklyBossService.markDefeated();
      await LearningAnalyticsService.recordWeeklyBossWin();
    }

    if (rewards.xp > 0 || rewards.coins > 0) {
      await DuelRewardService.grantRewards(rewards, mode);
    }

    const updated = await DuelRepository.getSession(sessionId);
    if (!updated) {
      throw new Error('Falha ao finalizar sessão');
    }

    const flawless =
      finalStatus === 'won' &&
      answered.length > 0 &&
      answered.every((item) => item.isCorrect === true);

    let newLemmaCount = 0;
    if (finalStatus === 'won') {
      for (const item of answered) {
        if (!item.lemma || item.isCorrect !== true) continue;
        const competence = await LemmaCompetenceService.get(item.lemma);
        if ((competence?.timesSeen ?? 0) <= 2) {
          newLemmaCount += 1;
        }
      }
    }

    if (finalStatus === 'won') {
      GameEvents.emit({
        type: 'DUEL_WON',
        sessionId,
        mode,
        flawless,
        questionCount: answered.length,
        correctCount,
        newLemmaCount,
      });
    } else if (finalStatus === 'lost') {
      GameEvents.emit({
        type: 'DUEL_LOST',
        sessionId,
        mode,
        questionCount: answered.length,
        correctCount,
      });
    }

    return { session: updated, rewards, mode };
  },

  async getLastLostSessionId(): Promise<string | null> {
    const session = await DuelRepository.getLastLostSession();
    return session?.id ?? null;
  },
};
