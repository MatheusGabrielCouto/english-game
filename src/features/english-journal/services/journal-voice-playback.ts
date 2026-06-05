import type { AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { configureAudioMode, ensureAudioNative } from '@/services/audio/audio-playback';
import {
    JOURNAL_PLAYBACK_RATES,
    nextJournalPlaybackRate,
    type JournalPlaybackRate,
} from '../constants/journal-playback';

type JournalVoicePlaybackState = {
  entryId: string | null;
  uri: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoaded: boolean;
  playbackRate: JournalPlaybackRate;
  play: (entryId: string, uri: string, fallbackDurationMs?: number) => Promise<void>;
  toggle: (entryId: string, uri: string, fallbackDurationMs?: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seekToRatio: (ratio: number) => Promise<void>;
  cyclePlaybackRate: () => void;
  stop: () => void;
};

const applyPlaybackRate = (target: AudioPlayer, rate: JournalPlaybackRate) => {
  try {
    if (Platform.OS === 'android') {
      target.shouldCorrectPitch = true;
      if (typeof target.setPlaybackRate === 'function') {
        target.setPlaybackRate(rate);
        return;
      }
    } else if (typeof target.setPlaybackRate === 'function') {
      target.setPlaybackRate(rate, 'high');
      return;
    }
  } catch {
    // fall through to property assignment
  }
  target.playbackRate = rate;
};

let player: AudioPlayer | null = null;
let statusSubscription: { remove: () => void } | null = null;
let fallbackDurationSec = 0;

const releasePlayer = () => {
  statusSubscription?.remove();
  statusSubscription = null;
  try {
    player?.pause();
    player?.remove();
  } catch {
    // already released
  }
  player = null;
};

const syncFromPlayer = (set: (partial: Partial<JournalVoicePlaybackState>) => void) => {
  if (!player) return;
  const duration =
    player.duration > 0 ? player.duration : fallbackDurationSec > 0 ? fallbackDurationSec : 0;
  const currentTime = Math.min(player.currentTime, duration || player.currentTime);
  const isPlaying = Boolean(player.playing);
  set({
    currentTime,
    duration,
    isPlaying,
    isLoaded: player.isLoaded,
  });
};

const attachPlayer = (
  entryId: string,
  uri: string,
  estimatedDurationMs: number | undefined,
  playbackRate: JournalPlaybackRate,
  set: (partial: Partial<JournalVoicePlaybackState>) => void,
) => {
  releasePlayer();
  fallbackDurationSec = estimatedDurationMs ? estimatedDurationMs / 1000 : 0;

  try {
    const expoAudio = require('expo-audio') as typeof import('expo-audio');
    player = expoAudio.createAudioPlayer({ uri }, { updateInterval: 80 });
    statusSubscription = player.addListener('playbackStatusUpdate', (status) => {
      const duration =
        status.duration > 0
          ? status.duration
          : fallbackDurationSec > 0
            ? fallbackDurationSec
            : 0;
      set({
        currentTime: status.currentTime,
        duration,
        isPlaying: status.playing,
        isLoaded: status.isLoaded,
        entryId,
        uri,
      });
      if (status.didJustFinish) {
        releasePlayer();
        set({
          entryId: null,
          uri: null,
          currentTime: 0,
          duration: duration || fallbackDurationSec,
          isPlaying: false,
          isLoaded: false,
        });
      }
    });
    set({
      entryId,
      uri,
      currentTime: 0,
      duration: fallbackDurationSec,
      isPlaying: false,
      isLoaded: false,
    });
    syncFromPlayer(set);
    if (player) {
      applyPlaybackRate(player, playbackRate);
    }
  } catch {
    releasePlayer();
    set({ entryId: null, uri: null, isPlaying: false, isLoaded: false });
  }
};

export const useJournalVoicePlayback = create<JournalVoicePlaybackState>((set, get) => ({
  entryId: null,
  uri: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isLoaded: false,
  playbackRate: JOURNAL_PLAYBACK_RATES[0],

  play: async (entryId, uri, fallbackDurationMs) => {
    if (!(await ensureAudioNative())) return;
    await configureAudioMode();

    const state = get();
    if (state.entryId === entryId && player) {
      applyPlaybackRate(player, state.playbackRate);
      player.play();
      syncFromPlayer(set);
      set({ isPlaying: true });
      return;
    }

    attachPlayer(entryId, uri, fallbackDurationMs, state.playbackRate, set);
    player?.play();
    syncFromPlayer(set);
    set({ isPlaying: true });
  },

  toggle: async (entryId, uri, fallbackDurationMs) => {
    if (!(await ensureAudioNative())) return;
    await configureAudioMode();

    const state = get();
    if (state.entryId === entryId && player) {
      if (state.isPlaying) {
        player.pause();
        set({ isPlaying: false });
      } else {
        applyPlaybackRate(player, state.playbackRate);
        if (state.currentTime >= state.duration - 0.05 && state.duration > 0) {
          await player.seekTo(0);
        }
        player.play();
        set({ isPlaying: true });
      }
      return;
    }

    attachPlayer(entryId, uri, fallbackDurationMs, state.playbackRate, set);
    player?.play();
    syncFromPlayer(set);
    set({ isPlaying: true });
  },

  pause: () => {
    if (!player) return;
    player.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    if (!player) return;
    player.play();
    set({ isPlaying: true });
  },

  seekToRatio: async (ratio) => {
    if (!player) return;
    const state = get();
    const duration = state.duration > 0 ? state.duration : fallbackDurationSec;
    if (duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const seconds = clamped * duration;
    await player.seekTo(seconds);
    set({ currentTime: seconds });
  },

  cyclePlaybackRate: () => {
    const nextRate = nextJournalPlaybackRate(get().playbackRate);
    set({ playbackRate: nextRate });
    if (player) {
      applyPlaybackRate(player, nextRate);
    }
  },

  stop: () => {
    releasePlayer();
    set({
      entryId: null,
      uri: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isLoaded: false,
    });
  },
}));
