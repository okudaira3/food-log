import { useEffect, useRef } from 'react'
import { LocationData } from '../../utils/geolocation'

interface SimpleMapProps {
  location: LocationData
  width?: number | string
  height?: number | string
  zoom?: number
  className?: string
  showMarker?: boolean
  interactive?: boolean
}

export default function SimpleMap({
  location,
  width = '100%',
  height = 300,
  zoom = 15,
  className = '',
  showMarker = true,
  interactive = true
}: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!location) return
    
    // OpenStreetMapの埋め込みマップを作成
    const mapUrl = createMapUrl(location, zoom, showMarker)
    
    if (iframeRef.current) {
      iframeRef.current.src = mapUrl
    }
  }, [location, zoom, showMarker])

  const createMapUrl = (loc: LocationData, zoomLevel: number, marker: boolean): string => {
    const { lat, lng } = loc
    
    // OpenStreetMapの埋め込みマップURLを作成
    const baseUrl = 'https://www.openstreetmap.org/export/embed.html'
    const bbox = calculateBbox(lat, lng, zoomLevel)
    const markerParam = marker ? `&marker=${lat}%2C${lng}` : ''
    
    return `${baseUrl}?bbox=${bbox}&layer=mapnik${markerParam}`
  }

  const calculateBbox = (lat: number, lng: number, zoomLevel: number): string => {
    // ズームレベルに応じた表示範囲を計算
    const offset = 0.01 / Math.pow(2, zoomLevel - 10)
    const minLng = lng - offset
    const minLat = lat - offset
    const maxLng = lng + offset
    const maxLat = lat + offset
    
    return `${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}`
  }

  const handleMapClick = () => {
    if (interactive) {
      // 外部マップで開く
      const url = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=${zoom}`
      window.open(url, '_blank')
    }
  }

  return (
    <div 
      ref={mapRef}
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="地図"
      />
      
      {interactive && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleMapClick}
          title="地図を大きく表示"
        />
      )}
      
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
        クリックで地図を開く
      </div>
    </div>
  )
}

// シンプルな静的地図コンポーネント
export function StaticMap({ location, size = 300, zoom = 15, className = '' }: {
  location: LocationData
  size?: number
  zoom?: number
  className?: string
}) {
  // シンプルな地図を表示
  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div 
        className="w-full h-full flex items-center justify-center cursor-pointer"
        style={{ width: size, height: size }}
        onClick={() => {
          const url = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}&zoom=${zoom}`
          window.open(url, '_blank')
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-sm text-gray-600">
            緯度: {location.lat.toFixed(4)}
          </div>
          <div className="text-sm text-gray-600">
            経度: {location.lng.toFixed(4)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            クリックで地図を開く
          </div>
        </div>
      </div>
    </div>
  )
}