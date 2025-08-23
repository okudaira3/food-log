import { useState, useCallback, useEffect } from 'react'

export interface AppError {
  id: string
  type: 'database' | 'permission' | 'network' | 'compression' | 'validation' | 'unknown'
  message: string
  details?: string
  timestamp: Date
  stack?: string
  userAgent?: string
  url?: string
}

interface ErrorState {
  errors: AppError[]
  currentError: AppError | null
}

/**
 * アプリケーション全体のエラーハンドリングを管理するフック
 */
export function useErrorHandler() {
  const [state, setState] = useState<ErrorState>({
    errors: [],
    currentError: null
  })

  // エラー生成
  const createError = useCallback((
    type: AppError['type'],
    message: string,
    details?: string,
    error?: Error
  ): AppError => {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      details,
      timestamp: new Date(),
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }, [])

  // エラー記録
  const reportError = useCallback((
    type: AppError['type'],
    message: string,
    details?: string,
    error?: Error
  ) => {
    const appError = createError(type, message, details, error)
    
    setState(prev => ({
      ...prev,
      errors: [appError, ...prev.errors].slice(0, 50), // 最新50件まで保持
      currentError: appError
    }))

    // コンソールにもエラーを出力
    console.error(`[${type.toUpperCase()}] ${message}`, {
      details,
      error,
      appError
    })

    return appError
  }, [createError])

  // データベースエラー
  const reportDatabaseError = useCallback((message: string, error?: Error) => {
    let enhancedMessage = message
    let details = error?.message

    if (error) {
      // Dexie.jsの特定エラーを詳細化
      if (error.name === 'DatabaseClosedError') {
        enhancedMessage = 'データベース接続が切断されました'
        details = 'ページを再読み込みしてください'
      } else if (error.name === 'QuotaExceededError') {
        enhancedMessage = 'ストレージ容量が不足しています'
        details = '不要なデータを削除するか、ブラウザのストレージを確認してください'
      } else if (error.name === 'VersionError') {
        enhancedMessage = 'データベースのバージョンが古い形式です'
        details = 'アプリケーションをアップデートするか、データを移行してください'
      }
    }

    return reportError('database', enhancedMessage, details, error)
  }, [reportError])

  // 権限エラー
  const reportPermissionError = useCallback((permission: string, error?: Error) => {
    const message = `${permission}の権限が拒否されました`
    const details = `ブラウザの設定で${permission}の使用を許可してください`
    return reportError('permission', message, details, error)
  }, [reportError])

  // ネットワークエラー
  const reportNetworkError = useCallback((message: string, error?: Error) => {
    return reportError('network', message, error?.message, error)
  }, [reportError])

  // 圧縮エラー
  const reportCompressionError = useCallback((message: string, error?: Error) => {
    return reportError('compression', message, error?.message, error)
  }, [reportError])

  // バリデーションエラー
  const reportValidationError = useCallback((message: string, details?: string) => {
    return reportError('validation', message, details)
  }, [reportError])

  // 現在のエラーをクリア
  const clearCurrentError = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentError: null
    }))
  }, [])

  // 特定エラーを削除
  const removeError = useCallback((errorId: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(e => e.id !== errorId),
      currentError: prev.currentError?.id === errorId ? null : prev.currentError
    }))
  }, [])

  // 全エラーをクリア
  const clearAllErrors = useCallback(() => {
    setState({
      errors: [],
      currentError: null
    })
  }, [])

  // エラー統計
  const getErrorStats = useCallback(() => {
    const { errors } = state
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return {
      total: errors.length,
      lastHour: errors.filter(e => e.timestamp > oneHourAgo).length,
      lastDay: errors.filter(e => e.timestamp > oneDayAgo).length,
      byType: errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1
        return acc
      }, {} as Record<AppError['type'], number>)
    }
  }, [state.errors])

  // ローカルストレージへの永続化
  const persistErrors = useCallback(() => {
    try {
      const errorsToStore = state.errors.slice(0, 20).map(error => ({
        ...error,
        timestamp: error.timestamp.toISOString()
      }))
      localStorage.setItem('food-log-errors', JSON.stringify(errorsToStore))
    } catch (error) {
      console.warn('Failed to persist errors to localStorage:', error)
    }
  }, [state.errors])

  // ローカルストレージからの復元
  const loadPersistedErrors = useCallback(() => {
    try {
      const stored = localStorage.getItem('food-log-errors')
      if (stored) {
        const parsedErrors = JSON.parse(stored).map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }))
        setState(prev => ({
          ...prev,
          errors: parsedErrors
        }))
      }
    } catch (error) {
      console.warn('Failed to load persisted errors:', error)
    }
  }, [])

  // グローバルエラーハンドラーの設定
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      reportError(
        'unknown',
        'Unhandled JavaScript error',
        `${event.filename}:${event.lineno}:${event.colno}`,
        event.error
      )
    }

    const handleUnhandledPromiseRejection = (event: PromiseRejectionEvent) => {
      reportError(
        'unknown',
        'Unhandled Promise rejection',
        event.reason?.message || String(event.reason),
        event.reason instanceof Error ? event.reason : undefined
      )
    }

    // ブラウザのグローバルエラーイベントをリスン
    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleUnhandledPromiseRejection)

    // 初期化時に永続化されたエラーを読み込み
    loadPersistedErrors()

    return () => {
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleUnhandledPromiseRejection)
    }
  }, [reportError, loadPersistedErrors])

  // エラーが追加されたら永続化
  useEffect(() => {
    if (state.errors.length > 0) {
      persistErrors()
    }
  }, [state.errors, persistErrors])

  return {
    // 状態
    errors: state.errors,
    currentError: state.currentError,
    
    // エラー報告関数
    reportError,
    reportDatabaseError,
    reportPermissionError,
    reportNetworkError,
    reportCompressionError,
    reportValidationError,
    
    // 管理関数
    clearCurrentError,
    removeError,
    clearAllErrors,
    
    // 統計・ユーティリティ
    getErrorStats,
    persistErrors,
    loadPersistedErrors
  }
}