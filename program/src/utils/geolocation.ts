// 位置情報の型定義
export interface LocationData {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

// 位置情報取得オプション
export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

// エラーの型定義
export interface GeolocationError {
  code: number
  message: string
  details?: string
}

// デフォルトオプション
const DEFAULT_OPTIONS: Required<GeolocationOptions> = {
  enableHighAccuracy: true,
  timeout: 10000, // 10秒
  maximumAge: 300000 // 5分
}

/**
 * 現在の位置情報を取得
 */
export function getCurrentLocation(options: GeolocationOptions = {}): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'このブラウザは位置情報をサポートしていません',
        details: 'Geolocation API is not supported'
      })
      return
    }

    const opts = { ...DEFAULT_OPTIONS, ...options }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        reject(parseGeolocationError(error))
      },
      opts
    )
  })
}

/**
 * 位置情報の監視を開始
 */
export function watchLocation(
  onSuccess: (location: LocationData) => void,
  onError: (error: GeolocationError) => void,
  options: GeolocationOptions = {}
): number {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'このブラウザは位置情報をサポートしていません',
      details: 'Geolocation API is not supported'
    })
    return -1
  }

  const opts = { ...DEFAULT_OPTIONS, ...options }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    },
    (error) => {
      onError(parseGeolocationError(error))
    },
    opts
  )
}

/**
 * 位置情報の監視を停止
 */
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Geolocation APIのエラーを解析
 */
function parseGeolocationError(error: GeolocationPositionError): GeolocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: error.code,
        message: '位置情報へのアクセスが拒否されました',
        details: 'ブラウザの設定で位置情報の使用を許可してください'
      }
    case error.POSITION_UNAVAILABLE:
      return {
        code: error.code,
        message: '位置情報が取得できません',
        details: 'GPSやネットワークの接続を確認してください'
      }
    case error.TIMEOUT:
      return {
        code: error.code,
        message: '位置情報の取得がタイムアウトしました',
        details: '時間内に位置情報を取得できませんでした'
      }
    default:
      return {
        code: error.code,
        message: '位置情報の取得に失敗しました',
        details: error.message
      }
  }
}

/**
 * 位置情報の精度を文字列で表現
 */
export function formatAccuracy(accuracy: number): string {
  if (accuracy < 10) {
    return '高精度'
  } else if (accuracy < 50) {
    return '中精度'
  } else if (accuracy < 100) {
    return '低精度'
  } else {
    return '非常に低い精度'
  }
}

/**
 * 2つの位置間の距離を計算（km）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 地球の半径（km）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 位置情報が利用可能かチェック
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator
}

/**
 * 位置情報の許可状態をチェック
 */
export async function checkGeolocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt'
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state
  } catch (error) {
    return 'prompt'
  }
}