import { useState } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ImagePreviewProps {
  src: string
  alt: string
  onClose?: () => void
  showCloseButton?: boolean
  className?: string
}

export default function ImagePreview({ 
  src, 
  alt, 
  onClose, 
  showCloseButton = false,
  className = '' 
}: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
            <div className="text-gray-400 text-sm">読み込み中...</div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-gray-400 text-sm">画像が読み込めません</div>
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover rounded-md transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={openModal}
          style={{ cursor: 'pointer' }}
        />
        
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-opacity"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        
        <button
          onClick={openModal}
          className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-opacity"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white hover:text-gray-300 p-2 z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
              <p className="text-sm">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}