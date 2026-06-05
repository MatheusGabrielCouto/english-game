import { type ReactNode } from 'react'

import {
  type ErrorBoundaryFeatureId,
  getErrorBoundaryFeature,
} from '@/constants/error-boundary-features'

import { ErrorBoundary } from './ErrorBoundary'

type FeatureErrorBoundaryProps = {
  feature: ErrorBoundaryFeatureId
  children: ReactNode
  showGoBack?: boolean
}

export const FeatureErrorBoundary = ({
  feature,
  children,
  showGoBack = true,
}: FeatureErrorBoundaryProps) => {
  const copy = getErrorBoundaryFeature(feature)

  return (
    <ErrorBoundary
      featureId={feature}
      emoji={copy.emoji}
      title={copy.title}
      hint={copy.hint}
      showGoBack={showGoBack}>
      {children}
    </ErrorBoundary>
  )
}
