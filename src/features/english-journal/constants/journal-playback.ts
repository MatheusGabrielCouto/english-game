export const JOURNAL_PLAYBACK_RATES = [1, 1.5, 2] as const;

export type JournalPlaybackRate = (typeof JOURNAL_PLAYBACK_RATES)[number];

export const formatJournalPlaybackRate = (rate: number): string =>
  rate === 1 ? '1.0x' : `${rate}x`;

export const nextJournalPlaybackRate = (current: number): JournalPlaybackRate => {
  const index = JOURNAL_PLAYBACK_RATES.findIndex((rate) => rate === current);
  const nextIndex = index === -1 ? 0 : (index + 1) % JOURNAL_PLAYBACK_RATES.length;
  return JOURNAL_PLAYBACK_RATES[nextIndex];
};
