import { useState, useEffect } from 'react'
import { MapPinIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { getCurrentLocation, GeolocationError, LocationData, formatAccuracy } from '../../utils/geolocation'
import { Button } from '../Common'

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
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    if (!navigator.permissions) return
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setPermissionStatus(result.state)
      
      result.addEventListener('change', () => {
        setPermissionStatus(result.state)
      })
    } catch (err) {
      console.error('権限チェックエラー:', err)
    }
  }

  const handleLocationCapture = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
      
      onLocationCapture(location)
    } catch (err) {
      setError(err as GeolocationError)
    } finally {
      setIsLoading(false)
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
      
      {permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-red-800 font-medium">位置情報のアクセスが拒否されています</p>
              <p className="text-xs text-red-600 mt-1">
                ブラウザの設定で位置情報の使用を許可してください。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {permissionStatus === 'prompt' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-blue-800">
                位置情報を取得すると、後で地図で確認できます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}