export type CityVitalityBand = 'low' | 'mid' | 'high';

export type CityRumorDefinition = {
  key: string;
  message: string;
  band: CityVitalityBand;
  npcHint?: string;
};

export const CITY_RUMORS: CityRumorDefinition[] = [
  {
    key: 'low_mercado',
    band: 'low',
    message: 'O mercadinho está quieto — a cidade sente falta do seu ritmo de estudos.',
    npcHint: 'Mia suspira: «Menos movimento no bairro ultimamente.»',
  },
  {
    key: 'low_parque',
    band: 'low',
    message: 'Ranger Sam notou menos passeios no parque esta semana.',
    npcHint: 'O parque parece mais silencioso que o normal.',
  },
  {
    key: 'mid_biblioteca',
    band: 'mid',
    message: 'Vizinhos comentam que a biblioteca voltou a ter movimento.',
    npcHint: 'Ana organiza novos livros na estante.',
  },
  {
    key: 'mid_cafe',
    band: 'mid',
    message: 'No café, Leo prepara drinks para quem estuda até tarde.',
    npcHint: 'O aroma de café paira na praça.',
  },
  {
    key: 'high_praca',
    band: 'high',
    message: 'A praça está animada — sua cidade respira energia!',
    npcHint: 'Mayor Chen sorri: «O centro nunca esteve tão vivo.»',
  },
  {
    key: 'high_parque',
    band: 'high',
    message: 'Pets e estudantes enchem o parque — vitalidade em alta!',
    npcHint: 'Sam: «Melhor dia para um passeio!»',
  },
];

export const getVitalityBand = (vitality: number): CityVitalityBand => {
  if (vitality >= 70) return 'high';
  if (vitality < 40) return 'low';
  return 'mid';
};
