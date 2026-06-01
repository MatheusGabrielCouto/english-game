import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { AppLogService } from '@/services/app-log-service'

type ErrorBoundaryProps = {
  children: ReactNode
  onReset?: () => void
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
    AppLogService.error('ui.crash', error.message, {
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, message: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-4xl">⚠️</Text>
        <Text className="mt-4 text-center text-xl font-bold text-foreground">Algo deu errado</Text>
        <Text className="mt-2 text-center text-sm text-foreground-secondary">
          {this.state.message ?? 'Erro inesperado na interface.'}
        </Text>
        <View className="mt-6 w-full max-w-xs">
          <Button label="Tentar novamente" onPress={this.handleReset} />
        </View>
      </View>
    )
  }
}
