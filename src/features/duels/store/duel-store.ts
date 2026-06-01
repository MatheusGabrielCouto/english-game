import { create } from 'zustand';

import type { DuelPatent } from '@/types/duel';

import type { DuelArenaMode } from '../constants/duel-progression-config';
import type { DuelProfileView } from '../services/duel-profile-service';
import type { DuelCombatState } from '../services/duel-combat-service';
import type { DuelBattleQuestion, FinishDuelSessionResult } from '../services/duel-service';
import { DUEL_COMBAT_CONFIG } from '../constants/duel-combat-config';

export type DuelBattleSnapshot = {
  sessionId: string;
  enemyKey: string;
  enemyName: string;
  enemyEmoji: string;
  patent: DuelPatent;
  mode: DuelArenaMode;
  playerMaxHp: number;
  enemyMaxHp: number;
  questions: DuelBattleQuestion[];
  combat: DuelCombatState;
  questionIndex: number;
};

export type DuelFeedback = {
  isCorrect: boolean;
  hint: string | null;
  damageDealt: number | null;
  damageTaken: number | null;
};

type DuelState = {
  profilePatent: DuelPatent;
  profileView: DuelProfileView | null;
  battle: DuelBattleSnapshot | null;
  feedback: DuelFeedback | null;
  result: FinishDuelSessionResult | null;
  isSubmitting: boolean;
  setProfilePatent: (patent: DuelPatent) => void;
  setProfileView: (view: DuelProfileView | null) => void;
  setBattle: (battle: DuelBattleSnapshot) => void;
  setCombat: (combat: DuelCombatState) => void;
  setQuestionIndex: (index: number) => void;
  setFeedback: (feedback: DuelFeedback | null) => void;
  setResult: (result: FinishDuelSessionResult | null) => void;
  setSubmitting: (value: boolean) => void;
  resetBattle: () => void;
};

export const useDuelStore = create<DuelState>((set) => ({
  profilePatent: 'tourist',
  profileView: null,
  battle: null,
  feedback: null,
  result: null,
  isSubmitting: false,

  setProfilePatent: (patent) => set({ profilePatent: patent }),
  setProfileView: (profileView) =>
    set({
      profileView,
      profilePatent: profileView?.currentPatent ?? 'tourist',
    }),
  setBattle: (battle) => set({ battle, feedback: null, result: null }),
  setCombat: (combat) =>
    set((state) => (state.battle ? { battle: { ...state.battle, combat } } : {})),
  setQuestionIndex: (questionIndex) =>
    set((state) => (state.battle ? { battle: { ...state.battle, questionIndex } } : {})),
  setFeedback: (feedback) => set({ feedback }),
  setResult: (result) => set({ result }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  resetBattle: () =>
    set({
      battle: null,
      feedback: null,
      result: null,
      isSubmitting: false,
    }),
}));

export const getPlayerMaxHp = () => DUEL_COMBAT_CONFIG.playerMaxHp;
