import { useState, useEffect, useCallback } from 'react'

export type PermissionName = 'camera' | 'geolocation'
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown' | 'checking'

interface PermissionState {
  status: PermissionStatus
  error: string | null
  isSupported: boolean
}

interface PermissionHookReturn extends PermissionState {
  requestPermission: () => Promise<PermissionStatus>
  checkPermission: () => Promise<PermissionStatus>
  resetState: () => void
}

/**
 * ブラウザ権限を管理するカスタムフック
 */
export function usePermission(permission: PermissionName): PermissionHookReturn {
  const [state, setState] = useState<PermissionState>({
    status: 'unknown',
    error: null,
    isSupported: false
  })

  // Permissions API の対応状況を確認
  const isPermissionsAPISupported = 'permissions' in navigator
  const isGetUserMediaSupported = !!(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    (navigator as any).getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia
  )
  const isGeolocationSupported = 'geolocation' in navigator

  const getPermissionName = (perm: PermissionName): PermissionName => {
    switch (perm) {
      case 'camera':
        return 'camera'
      case 'geolocation':
        return 'geolocation'
      default:
        return perm
    }
  }

  const checkPermissionStatus = useCallback(async (): Promise<PermissionStatus> => {
    setState(prev => ({ ...prev, status: 'checking', error: null }))

    try {
      if (!isPermissionsAPISupported) {
        // Permissions API がサポートされていない場合
        setState(prev => ({
          ...prev,
          status: 'unknown',
          isSupported: false,
          error: 'Permissions API not supported'
        }))
        return 'unknown'
      }

      // 権限の種類に応じて適切なサポート状況を確認
      let supported = false
      switch (permission) {
        case 'camera':
          supported = isGetUserMediaSupported
          break
        case 'geolocation':
          supported = isGeolocationSupported
          break
      }

      if (!supported) {
        setState(prev => ({
          ...prev,
          status: 'denied',
          isSupported: false,
          error: `${permission} is not supported in this browser`
        }))
        return 'denied'
      }

      // Permissions API で権限状態を確認
      const permissionName = getPermissionName(permission)
      const result = await navigator.permissions.query({ name: permissionName as any })
      
      setState(prev => ({
        ...prev,
        status: result.state as PermissionStatus,
        isSupported: true,
        error: null
      }))

      // 権限状態の変更を監視
      result.addEventListener('change', () => {
        setState(prev => ({
          ...prev,
          status: result.state as PermissionStatus
        }))
      })

      return result.state as PermissionStatus

    } catch (error) {
      console.error(`Permission check failed for ${permission}:`, error)
      
      // Permissions API が失敗した場合、実際のAPI呼び出しで権限状態を推測
      let fallbackStatus: PermissionStatus = 'prompt'
      
      // フォールバック実装では実際のAPI呼び出しは行わず、promptステータスを返す
      // 実際の権限要求は requestPermission で行う

      setState(prev => ({
        ...prev,
        status: fallbackStatus,
        isSupported: permission === 'camera' ? isGetUserMediaSupported : isGeolocationSupported,
        error: null // エラーをクリア、フォールバック時は normal として扱う
      }))

      return fallbackStatus
    }
  }, [permission, isPermissionsAPISupported, isGetUserMediaSupported, isGeolocationSupported])

  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    setState(prev => ({ ...prev, status: 'checking', error: null }))

    try {
      let result: PermissionStatus = 'prompt'

      if (permission === 'camera') {
        if (!isGetUserMediaSupported) {
          throw new Error('Camera is not supported in this browser')
        }
        
        // カメラアクセスを要求
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: { ideal: 'environment' } // 背面カメラを優先
          }
        })
        
        // 権限が取得できたらストリームを停止
        stream.getTracks().forEach(track => track.stop())
        result = 'granted'

      } else if (permission === 'geolocation') {
        if (!isGeolocationSupported) {
          throw new Error('Geolocation is not supported in this browser')
        }
        
        // 位置情報アクセスを要求
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000
            }
          )
        })
        result = 'granted'
      }

      setState(prev => ({
        ...prev,
        status: result,
        isSupported: true,
        error: null
      }))

      return result

    } catch (error) {
      console.error(`Permission request failed for ${permission}:`, error)
      
      let status: PermissionStatus = 'denied'
      let errorMessage = 'Permission request failed'

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          status = 'denied'
          errorMessage = `${permission} access denied by user`
        } else if (error.name === 'NotFoundError') {
          status = 'denied'
          errorMessage = `${permission} device not found`
        } else if (error.name === 'NotSupportedError' || error.name === 'NotReadableError') {
          status = 'denied'
          errorMessage = `${permission} is not supported or accessible`
        } else if (error.name === 'TimeoutError') {
          status = 'prompt'
          errorMessage = `${permission} request timed out`
        } else {
          errorMessage = error.message
        }
      }

      setState(prev => ({
        ...prev,
        status,
        error: errorMessage,
        isSupported: permission === 'camera' ? isGetUserMediaSupported : isGeolocationSupported
      }))

      return status
    }
  }, [permission, isGetUserMediaSupported, isGeolocationSupported])

  const resetState = useCallback(() => {
    setState({
      status: 'unknown',
      error: null,
      isSupported: false
    })
  }, [])

  // 初期化時に権限状態をチェック
  useEffect(() => {
    checkPermissionStatus()
  }, [checkPermissionStatus])

  return {
    status: state.status,
    error: state.error,
    isSupported: state.isSupported,
    requestPermission,
    checkPermission: checkPermissionStatus,
    resetState
  }
}