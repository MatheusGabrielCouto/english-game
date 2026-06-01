import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';

export type DuelCombatState = {
  playerHp: number;
  enemyHp: number;
  comboStreak: number;
};

export const DuelCombatService = {
  createInitialState(playerMaxHp: number, enemyMaxHp: number): DuelCombatState {
    return {
      playerHp: playerMaxHp,
      enemyHp: enemyMaxHp,
      comboStreak: 0,
    };
  },

  isComboCritical(comboStreak: number): boolean {
    return comboStreak >= DUEL_COMBAT_CONFIG.comboCriticalAt;
  },

  computePlayerDamage(
    baseDamage: number,
    comboStreakAfterHit: number,
    weaknessScore = 0.5,
  ): number {
    const comboMultiplier = DuelCombatService.isComboCritical(comboStreakAfterHit)
      ? DUEL_COMBAT_CONFIG.comboMultiplier
      : 1;

    const weaknessBonus =
      1 +
      Math.min(
        DUEL_COMBAT_CONFIG.weaknessDamageBonusCap,
        Math.max(0, weaknessScore - 0.4) * 0.25,
      );

    return Math.round(baseDamage * comboMultiplier * weaknessBonus);
  },

  computeEnemyCounterDamage(baseCounter: number): number {
    return baseCounter;
  },

  applyCorrectHit(
    state: DuelCombatState,
    baseDamage: number,
    weaknessScore = 0.5,
  ): { state: DuelCombatState; damageDealt: number } {
    const comboStreakAfterHit = state.comboStreak + 1;
    const damageDealt = DuelCombatService.computePlayerDamage(
      baseDamage,
      comboStreakAfterHit,
      weaknessScore,
    );

    return {
      state: {
        playerHp: state.playerHp,
        enemyHp: Math.max(0, state.enemyHp - damageDealt),
        comboStreak: comboStreakAfterHit,
      },
      damageDealt,
    };
  },

  applyWrongAnswer(
    state: DuelCombatState,
    counterDamage: number,
  ): { state: DuelCombatState; damageTaken: number } {
    return {
      state: {
        playerHp: Math.max(0, state.playerHp - counterDamage),
        enemyHp: state.enemyHp,
        comboStreak: 0,
      },
      damageTaken: counterDamage,
    };
  },

  isVictory(state: DuelCombatState): boolean {
    return state.enemyHp <= 0;
  },

  isDefeat(state: DuelCombatState): boolean {
    return state.playerHp <= 0;
  },
};
