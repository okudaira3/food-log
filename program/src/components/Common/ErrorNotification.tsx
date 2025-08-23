import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline'
import Button from './Button'
import { AppError } from '../../hooks/useErrorHandler'

interface ErrorNotificationProps {
  error: AppError
  onDismiss: () => void
  autoHideDuration?: number // ms, 0で自動非表示無効
}

export default function ErrorNotification({ 
  error, 
  onDismiss, 
  autoHideDuration = 5000 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // 自動非表示
  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [autoHideDuration])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss()
    }, 300) // アニメーション時間
  }

  const getErrorIcon = () => {
    switch (error.type) {
      case 'database':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      case 'permission':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'network':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
      case 'compression':
      case 'validation':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'database':
        return 'border-red-200 bg-red-50'
      case 'permission':
        return 'border-yellow-200 bg-yellow-50'
      case 'network':
        return 'border-orange-200 bg-orange-50'
      case 'compression':
      case 'validation':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }

  const getTextColor = () => {
    switch (error.type) {
      case 'database':
        return 'text-red-800'
      case 'permission':
        return 'text-yellow-800'
      case 'network':
        return 'text-orange-800'
      case 'compression':
      case 'validation':
        return 'text-blue-800'
      default:
        return 'text-red-800'
    }
  }

  const getErrorTypeLabel = () => {
    switch (error.type) {
      case 'database':
        return 'データベースエラー'
      case 'permission':
        return '権限エラー'
      case 'network':
        return 'ネットワークエラー'
      case 'compression':
        return '圧縮エラー'
      case 'validation':
        return 'バリデーションエラー'
      default:
        return 'エラー'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)

    if (diffSeconds < 60) {
      return `${diffSeconds}秒前`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  if (!isVisible) return null

  return (
    <div className={`
      fixed top-4 right-4 max-w-md w-full z-50 
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        rounded-lg border shadow-lg p-4 space-y-3
        ${getErrorColor()}
      `}>
        {/* ヘッダー */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getErrorIcon()}
            <div>
              <p className={`text-sm font-medium ${getTextColor()}`}>
                {getErrorTypeLabel()}
              </p>
              <p className={`text-xs ${getTextColor()} opacity-75`}>
                {formatTimestamp(error.timestamp)}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={`
              rounded p-1 hover:bg-black hover:bg-opacity-10 transition-colors
              ${getTextColor()}
            `}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* メッセージ */}
        <div>
          <p className={`text-sm ${getTextColor()}`}>
            {error.message}
          </p>
          {error.details && (
            <p className={`text-xs mt-1 ${getTextColor()} opacity-75`}>
              {error.details}
            </p>
          )}
        </div>

        {/* アクション */}
        <div className="flex items-center justify-between">
          <div>
            {(error.stack || error.userAgent) && (
              <Button
                onClick={() => setShowDetails(!showDetails)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {showDetails ? '詳細を非表示' : '詳細を表示'}
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleDismiss}
            size="sm"
            className="text-xs"
          >
            閉じる
          </Button>
        </div>

        {/* 詳細情報 */}
        {showDetails && (
          <div className={`
            border-t pt-3 space-y-2
            border-opacity-20 border-current
          `}>
            <div className={`text-xs ${getTextColor()} opacity-75 space-y-1`}>
              <div>
                <span className="font-medium">ID:</span> {error.id}
              </div>
              <div>
                <span className="font-medium">URL:</span> {error.url}
              </div>
              {error.userAgent && (
                <div>
                  <span className="font-medium">User Agent:</span> 
                  <div className="ml-2 break-all">{error.userAgent}</div>
                </div>
              )}
              {error.stack && (
                <div>
                  <span className="font-medium">Stack Trace:</span>
                  <pre className="ml-2 text-xs bg-black bg-opacity-10 p-2 rounded mt-1 overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}