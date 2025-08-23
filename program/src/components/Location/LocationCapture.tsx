import { useState } from 'react'
import { MapPinIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { getCurrentLocation, GeolocationError, LocationData, formatAccuracy } from '../../utils/geolocation'
import { Button } from '../Common'
import { usePermission } from '../../hooks/usePermissions'

interface LocationCaptureProps {
  onLocationCapture: (location: LocationData) => void
  onLocationClear: () => void
  currentLocation?: LocationData | null
  disabled?: boolean
}

export default function LocationCapture({
  onLocationCapture,
  onLocationClear,
  currentLocation,
  disabled = false
}: LocationCaptureProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<GeolocationError | null>(null)
  
  // 新しい権限管理フックを使用
  const {
    status: permissionStatus,
    error: permissionError,
    isSupported,
    requestPermission,
    checkPermission
  } = usePermission('geolocation')

  const handleLocationCapture = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 常に権限要求を試行し、成功した場合に位置情報を取得
      let status = permissionStatus
      
      // 権限が不明または prompt の場合は権限要求
      if (status === 'unknown' || status === 'prompt' || status === 'checking') {
        status = await requestPermission()
      }
      
      // 権限が拒否されている場合はエラーを表示
      if (status === 'denied') {
        throw new Error('位置情報のアクセスが拒否されています。ブラウザの設定で許可してください。')
      }

      // 権限が許可された場合、位置情報を取得
      if (status === 'granted') {
        const location = await getCurrentLocation({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5分間のキャッシュを許可
        })
        onLocationCapture(location)
      } else {
        throw new Error('位置情報の取得権限が必要です')
      }
    } catch (err) {
      console.error('位置情報取得エラー:', err)
      setError(err as GeolocationError)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionRequest = async () => {
    try {
      const status = await requestPermission()
      if (status === 'granted') {
        setError(null) // エラーをクリア
      }
    } catch (err) {
      console.error('Permission request failed:', err)
    }
  }

  const handlePermissionRecheck = async () => {
    try {
      const status = await checkPermission()
      if (status === 'granted') {
        setError(null) // 権限が許可されていればエラーをクリア
      }
    } catch (err) {
      console.error('Permission check failed:', err)
    }
  }

  const handleLocationClear = () => {
    setError(null)
    onLocationClear()
  }

  const getStatusIcon = () => {
    if (error) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
    if (currentLocation) {
      return <MapPinIcon className="h-5 w-5 text-green-500" />
    }
    return <MapPinIcon className="h-5 w-5 text-gray-400" />
  }

  const getStatusText = () => {
    if (error) {
      return error.message
    }
    if (currentLocation) {
      return `位置情報を取得しました（精度: ${formatAccuracy(currentLocation.accuracy)}）`
    }
    return '位置情報が未取得です'
  }

  const getStatusColor = () => {
    if (error) return 'text-red-600'
    if (currentLocation) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">位置情報</span>
        {getStatusIcon()}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            
            {currentLocation && (
              <div className="mt-2 text-xs text-gray-500">
                <p>緯度: {currentLocation.lat.toFixed(6)}</p>
                <p>経度: {currentLocation.lng.toFixed(6)}</p>
                <p>精度: ±{Math.round(currentLocation.accuracy)}m</p>
              </div>
            )}
            
            {error && error.details && (
              <p className="mt-1 text-xs text-red-500">
                {error.details}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2 ml-4">
            {currentLocation ? (
              <Button
                onClick={handleLocationClear}
                size="sm"
                variant="outline"
                disabled={disabled}
              >
                クリア
              </Button>
            ) : (
              <Button
                onClick={handleLocationCapture}
                size="sm"
                disabled={disabled || isLoading || permissionStatus === 'denied'}
              >
                {isLoading ? '取得中...' : '取得'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* サポートされていない場合 */}
      {!isSupported && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-red-800 font-medium">位置情報がサポートされていません</p>
              <p className="text-xs text-red-600 mt-1">
                お使いのブラウザまたはデバイスでは位置情報機能が利用できません。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 権限が拒否された場合 */}
      {isSupported && permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">位置情報のアクセスが拒否されています</p>
              <div className="text-xs text-red-600 mt-1 space-y-1">
                <p>位置情報を使用するには、以下の手順で許可してください：</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>アドレスバーの左にある錠前アイコンをクリック</li>
                  <li>「位置情報」を「許可」に変更</li>
                  <li>ページを再読み込み</li>
                </ul>
              </div>
              <div className="mt-2">
                <Button 
                  onClick={handlePermissionRecheck} 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                >
                  権限状態を再確認
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 権限要求が可能な場合 */}
      {isSupported && permissionStatus === 'prompt' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">位置情報の使用について</p>
              <p className="text-xs text-blue-600 mt-1">
                位置情報を取得すると、後で地図で記録を確認できて便利です。
                ブラウザが許可を求めた際は「許可」を選択してください。
              </p>
              <div className="mt-2">
                <Button 
                  onClick={handlePermissionRequest} 
                  size="sm"
                  className="text-xs"
                >
                  位置情報の許可を要求
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 権限確認中 */}
      {permissionStatus === 'checking' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <p className="text-sm text-gray-700">権限状態を確認中...</p>
          </div>
        </div>
      )}

      {/* 権限エラー */}
      {permissionError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-yellow-800">権限確認に問題が発生しました</p>
              <p className="text-xs text-yellow-600 mt-1">{permissionError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}