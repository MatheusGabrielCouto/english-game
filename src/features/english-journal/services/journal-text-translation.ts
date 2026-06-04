import { JOURNAL_UI } from '../constants/journal-ui';

export type JournalTranslationResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unavailable' | 'failed'; message: string }

type TranslatorLanguage = 'Portuguese' | 'English'

type TranslatorModule = {
  default: {
    prepare: (options: {
      source: TranslatorLanguage
      target: TranslatorLanguage
      downloadIfNeeded?: boolean
    }) => Promise<boolean>
    translate: (text: string) => Promise<string>
  }
}

let preparedPairKey: string | null = null

const loadTranslator = (): TranslatorModule['default'] | null => {
  try {
    return (require('fast-mlkit-translate-text') as TranslatorModule).default
  } catch {
    return null
  }
}

export const isJournalTranslationAvailable = (): boolean => loadTranslator() !== null

const ensureTranslatorReady = async (
  source: TranslatorLanguage,
  target: TranslatorLanguage,
): Promise<boolean> => {
  const translator = loadTranslator()
  if (!translator) return false

  const pairKey = `${source}->${target}`
  if (preparedPairKey === pairKey) return true

  try {
    await translator.prepare({
      source,
      target,
      downloadIfNeeded: true,
    })
    preparedPairKey = pairKey
    return true
  } catch {
    return false
  }
}

const translateWithPair = async (
  text: string,
  source: TranslatorLanguage,
  target: TranslatorLanguage,
  emptyMessage: string,
  failedMessage: string,
): Promise<JournalTranslationResult> => {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, reason: 'failed', message: emptyMessage }
  }

  const translator = loadTranslator()
  if (!translator) {
    return { ok: false, reason: 'unavailable', message: JOURNAL_UI.translationUnavailable }
  }

  const ready = await ensureTranslatorReady(source, target)
  if (!ready) {
    return { ok: false, reason: 'unavailable', message: JOURNAL_UI.translationUnavailable }
  }

  try {
    const translated = (await translator.translate(trimmed)).trim()
    if (!translated) {
      return { ok: false, reason: 'failed', message: failedMessage }
    }

    return { ok: true, text: translated }
  } catch (error) {
    return {
      ok: false,
      reason: 'failed',
      message: error instanceof Error ? error.message : failedMessage,
    }
  }
}

export const translatePortugueseToEnglish = (portugueseText: string) =>
  translateWithPair(
    portugueseText,
    'Portuguese',
    'English',
    JOURNAL_UI.translationEmpty,
    JOURNAL_UI.translationFailed,
  )

export const translateEnglishToPortuguese = (englishText: string) =>
  translateWithPair(
    englishText,
    'English',
    'Portuguese',
    JOURNAL_UI.translationEmpty,
    JOURNAL_UI.translationToPortugueseFailed,
  )
