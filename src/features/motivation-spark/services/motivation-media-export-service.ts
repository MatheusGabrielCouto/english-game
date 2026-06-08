import Constants from 'expo-constants'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'
import JSZip from 'jszip'

import { buildGameBackupFile } from '@/features/backup/services/backup-export-service'
import { MotivationSparkRepository } from '@/storage/repositories/motivation-spark-repository'

const fileNameFromUri = (uri: string): string => {
  const parts = uri.split('/')
  return parts[parts.length - 1] || `media-${Date.now()}`
}

export const MotivationMediaExportService = {
  async exportZip(): Promise<void> {
    const sparks = await MotivationSparkRepository.list({ includeArchived: true })
    const backup = await buildGameBackupFile({
      appVersion: Constants.expoConfig?.version ?? '1.0.0',
      platform: Platform.OS,
    })
    const zip = new JSZip()

    zip.file('backup.json', JSON.stringify(backup, null, 2))

    const mediaFolder = zip.folder('motivation-media')
    if (!mediaFolder) throw new Error('Não foi possível preparar o pacote.')

    for (const spark of sparks) {
      const sparkFolder = mediaFolder.folder(spark.id)
      if (!sparkFolder) continue

      for (const imageUri of spark.images) {
        const info = await FileSystem.getInfoAsync(imageUri)
        if (!info.exists) continue
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        })
        sparkFolder.file(`images/${fileNameFromUri(imageUri)}`, base64, { base64: true })
      }

      if (spark.audioUri) {
        const info = await FileSystem.getInfoAsync(spark.audioUri)
        if (info.exists) {
          const base64 = await FileSystem.readAsStringAsync(spark.audioUri, {
            encoding: FileSystem.EncodingType.Base64,
          })
          sparkFolder.file(`audio/${fileNameFromUri(spark.audioUri)}`, base64, { base64: true })
        }
      }
    }

    const zipBase64 = await zip.generateAsync({ type: 'base64' })
    const exportPath = `${FileSystem.cacheDirectory}chama-interior-${Date.now()}.zip`
    await FileSystem.writeAsStringAsync(exportPath, zipBase64, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const canShare = await Sharing.isAvailableAsync()
    if (!canShare) {
      throw new Error('Compartilhamento não disponível neste dispositivo.')
    }

    await Sharing.shareAsync(exportPath, {
      mimeType: 'application/zip',
      dialogTitle: 'Exportar Chama Interior',
    })
  },
}
