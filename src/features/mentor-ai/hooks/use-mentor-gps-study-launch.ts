import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'

import { MentorGpsStudyService } from '../services/mentor-gps-study-service'
import { useMentorGpsStudyStore } from '../store/mentor-gps-study-store'

export const useMentorGpsStudyLaunch = () => {
  const params = useLocalSearchParams<{
    gps?: string
    unitKey?: string
    blockId?: string
    skill?: string
    title?: string
    topic?: string
    description?: string
    tab?: string
  }>()

  const context = useMentorGpsStudyStore()

  useEffect(() => {
    MentorGpsStudyService.hydrateFromParams(params)
  }, [
    params.gps,
    params.unitKey,
    params.blockId,
    params.skill,
    params.title,
    params.topic,
    params.description,
    params.tab,
  ])

  return context
}
