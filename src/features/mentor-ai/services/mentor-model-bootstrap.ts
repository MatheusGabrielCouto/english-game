import * as FileSystem from 'expo-file-system/legacy'
import { copyBundledModelIfNeeded, hasBundledModel } from 'expo-mentor-model'
import { Platform } from 'react-native'

import { AppLogService } from '@/services/app-log-service'

import { MENTOR_MODEL_FILENAME } from '../constants/mentor-model'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { MentorLLMService } from './mentor-llm-service'

const toNativeFilePath = (uri: string): string => {
  const trimmed = uri.trim()
  if (trimmed.startsWith('file://')) {
    return trimmed.slice('file://'.length)
  }
  return trimmed
}

const buildModelDir = (): string | null => {
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory
  if (!baseDir) return null
  return toNativeFilePath(`${baseDir}mentor-models/`)
}

let bootstrapPromise: Promise<void> | null = null

export const MentorModelBootstrap = {
  getStatus() {
    return useMentorLlmStore.getState()
  },

  async initialize(): Promise<void> {
    if (bootstrapPromise) return bootstrapPromise

    bootstrapPromise = MentorModelBootstrap.run()
    try {
      await bootstrapPromise
    } finally {
      bootstrapPromise = null
    }
  },

  async run(): Promise<void> {
    if (Platform.OS !== 'android') {
      useMentorLlmStore.setState({
        status: 'unsupported',
        error: 'LLM nativo disponível apenas no Android (APK release).',
        modelPath: null,
      })
      return
    }

    const modelDir = buildModelDir()
    if (!modelDir) {
      useMentorLlmStore.setState({
        status: 'error',
        error: 'Armazenamento interno indisponível para copiar o modelo.',
        modelPath: null,
      })
      return
    }

    if (!hasBundledModel(MENTOR_MODEL_FILENAME)) {
      useMentorLlmStore.setState({
        status: 'missing',
        error:
          'Modelo não embutido no APK. Rode pnpm run mentor:download-model e gere o APK novamente.',
        modelPath: null,
      })
      return
    }

    useMentorLlmStore.setState({ status: 'copying', error: null, modelPath: null })

    try {
      const copiedPath = await copyBundledModelIfNeeded(modelDir, MENTOR_MODEL_FILENAME)
      if (!copiedPath) {
        throw new Error('Falha ao copiar modelo do APK')
      }

      useMentorLlmStore.setState({ status: 'loading', modelPath: copiedPath })

      await MentorLLMService.load(copiedPath)

      useMentorLlmStore.setState({
        status: 'ready',
        modelPath: copiedPath,
        error: null,
      })

      AppLogService.info('mentor_llm.ready', 'Professor Atlas LLM carregado', {
        path: copiedPath,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      useMentorLlmStore.setState({
        status: 'error',
        error: message,
        modelPath: null,
      })
      AppLogService.warn('mentor_llm.bootstrap_failed', 'Falha ao preparar LLM', { message })
    }
  },
}
