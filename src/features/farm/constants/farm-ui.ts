import { FARM_MANUAL_ACTION_COOLDOWN_MS } from '@/features/game-design/catalogs/farm-catalog';

export const FARM_UI = {
  cooldownHint: (seconds: number) =>
    seconds === 1 ? 'Aguarde 1s para registrar de novo' : `Aguarde ${seconds}s para registrar de novo`,
  cooldownBanner: 'Intervalo entre registros manuais',
  cooldownDetail: `Cada toque no farm espera ${FARM_MANUAL_ACTION_COOLDOWN_MS / 1000}s — evita farm automático/spam.`,
} as const;
