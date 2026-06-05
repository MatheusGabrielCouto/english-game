import { router } from 'expo-router'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import {
  ERROR_BOUNDARY_UI,
  type ErrorBoundaryFeatureId,
} from '@/constants/error-boundary-features'
import { AppLogService } from '@/services/app-log-service'

type ErrorBoundaryProps = {
  children: ReactNode
  onReset?: () => void
  featureId?: ErrorBoundaryFeatureId
  emoji?: string
  title?: string
  hint?: string
  showGoBack?: boolean
}

type ErrorBoundaryState = {
  hasError: boolean
  message: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const scope = this.props.featureId ?? 'app'

    AppLogService.error(`ui.crash.${scope}`, error.message, {
      featureId: this.props.featureId,
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, message: null })
    this.props.onReset?.()
  }

  handleGoBack = () => {
    this.setState({ hasError: false, message: null })

    if (router.canGoBack()) {
      router.back()
      return
    }

    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const isFeatureScope = Boolean(this.props.featureId)
    const emoji = this.props.emoji ?? (isFeatureScope ? '⚠️' : '🛠️')
    const title = this.props.title ?? ERROR_BOUNDARY_UI.appTitle
    const hint = this.props.hint ?? ERROR_BOUNDARY_UI.appHint
    const showDevDetail = __DEV__ && Boolean(this.state.message)

    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-4xl">{emoji}</Text>
        <Text className="mt-4 text-center text-xl font-bold text-foreground">{title}</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-foreground-secondary">{hint}</Text>
        {showDevDetail ? (
          <Text className="mt-3 text-center text-xs text-muted">
            {ERROR_BOUNDARY_UI.devDetailPrefix} {this.state.message}
          </Text>
        ) : null}
        <View className="mt-6 w-full max-w-xs gap-3">
          <Button label={ERROR_BOUNDARY_UI.retryLabel} onPress={this.handleReset} />
          {this.props.showGoBack ? (
            <Button
              label={ERROR_BOUNDARY_UI.goBackLabel}
              variant="secondary"
              onPress={this.handleGoBack}
            />
          ) : null}
        </View>
      </View>
    )
  }
}
