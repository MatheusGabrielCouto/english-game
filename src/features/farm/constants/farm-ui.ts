import { DOMAIN_GLOSSARY } from '@/constants/domain-glossary'
import { FARM_MANUAL_ACTION_COOLDOWN_MS } from '@/features/game-design/catalogs/farm-catalog'

export const FARM_UI = {
  title: DOMAIN_GLOSSARY.studyFarm.title,
  subtitle: 'Estude além das missões diárias',
  emoji: DOMAIN_GLOSSARY.studyFarm.emoji,
  heroLabel: `${DOMAIN_GLOSSARY.studyFarm.emoji} ${DOMAIN_GLOSSARY.studyFarm.title}`,
  heroDescription:
    'Continue estudando após as missões e ganhe Study Points + moedas. Com as dailies completas, você ganha +35% no farm. Vocabulário e speaking também alimentam a cidade.',
  previewAccessibilityLabel: `Abrir ${DOMAIN_GLOSSARY.studyFarm.shortLabel}`,
  cooldownHint: (seconds: number) =>
    seconds === 1 ? 'Aguarde 1s para registrar de novo' : `Aguarde ${seconds}s para registrar de novo`,
  cooldownBanner: 'Intervalo entre registros manuais',
  cooldownDetail: `Cada toque no farm espera ${FARM_MANUAL_ACTION_COOLDOWN_MS / 1000}s — evita farm automático/spam.`,
} as const
