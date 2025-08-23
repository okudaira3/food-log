import React, { createContext, useContext, ReactNode } from 'react'
import { useErrorHandler, AppError } from '../hooks/useErrorHandler'
import { ErrorNotification } from './Common'

interface ErrorContextType {
  reportError: (type: AppError['type'], message: string, details?: string, error?: Error) => AppError
  reportDatabaseError: (message: string, error?: Error) => AppError
  reportPermissionError: (permission: string, error?: Error) => AppError
  reportNetworkError: (message: string, error?: Error) => AppError
  reportCompressionError: (message: string, error?: Error) => AppError
  reportValidationError: (message: string, details?: string) => AppError
  clearCurrentError: () => void
  errors: AppError[]
  currentError: AppError | null
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

interface ErrorProviderProps {
  children: ReactNode
}

/**
 * アプリケーション全体のエラー管理を提供するProvider
 */
export function ErrorProvider({ children }: ErrorProviderProps) {
  const errorHandler = useErrorHandler()

  const contextValue: ErrorContextType = {
    reportError: errorHandler.reportError,
    reportDatabaseError: errorHandler.reportDatabaseError,
    reportPermissionError: errorHandler.reportPermissionError,
    reportNetworkError: errorHandler.reportNetworkError,
    reportCompressionError: errorHandler.reportCompressionError,
    reportValidationError: errorHandler.reportValidationError,
    clearCurrentError: errorHandler.clearCurrentError,
    errors: errorHandler.errors,
    currentError: errorHandler.currentError
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* エラー通知の表示 */}
      {errorHandler.currentError && (
        <ErrorNotification
          error={errorHandler.currentError}
          onDismiss={errorHandler.clearCurrentError}
          autoHideDuration={errorHandler.currentError.type === 'validation' ? 3000 : 5000}
        />
      )}
    </ErrorContext.Provider>
  )
}

/**
 * ErrorContextを使用するためのフック
 */
export function useError(): ErrorContextType {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

/**
 * React Error Boundaryでキャッチされたエラーを報告するためのヘルパー
 */
export function createErrorBoundaryHandler(errorContext: ErrorContextType) {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    errorContext.reportError(
      'unknown',
      'Component crashed',
      `Component: ${errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown'}`,
      error
    )
  }
}

export default ErrorProvider