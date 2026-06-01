export type Mission = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  category?: string;
  difficulty?: string;
  templateKey?: string;
};
