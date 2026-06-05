export const PET_TIMELINE_UI = {
  title: 'Timeline',
  openTimeline: 'Ver timeline',
  empty: 'No memories yet — milestones will appear here.',
  count: (n: number) => `${n} ${n === 1 ? 'memory' : 'memories'}`,
  groups: {
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    older: 'Older',
  },
} as const;
