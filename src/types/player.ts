export type Player = {
  name: string;
  level: number;
  xp: number;
  coins: number;
  title: string;
  createdAt: string;
  lastStudyDate: string | null;
};

export type Stats = {
  currentStreak: number;
  bestStreak: number;
  totalStudyDays: number;
  shields: number;
};
