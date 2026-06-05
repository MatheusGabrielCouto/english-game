export type ChangelogEntry = {
  version: string
  emoji: string
  title: string
  highlights: string[]
}

/** Novidades por versão — a entrada mais recente deve refletir o release atual. */
export const CHANGELOG_CATALOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    emoji: '✨',
    title: 'Polish de experiência',
    highlights: [
      'Banner offline e estados de rede mais claros no Vault',
      'Haptics e sons padronizados em cards e botões',
      'Modais e formulários com animação e validação acessível',
      'Contraste, alvos de toque e notificações rich em conquistas/loot',
    ],
  },
]

export const getChangelogEntryForVersion = (version: string): ChangelogEntry | null =>
  CHANGELOG_CATALOG.find((entry) => entry.version === version) ?? null
