import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FoodRecord } from '../types'

interface FoodCardProps {
  record: FoodRecord
}

export default function FoodCard({ record }: FoodCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageUrl = record.photo instanceof Blob 
    ? URL.createObjectURL(record.photo) 
    : record.photo

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/detail/${record.id}`}>
        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
          {!imageError ? (
            <img
              src={imageUrl}
              alt="食事の写真"
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-200">
              <span className="text-gray-400">画像を読み込めません</span>
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">読み込み中...</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {formatDate(record.timestamp)}
          </span>
          {record.favorite && (
            <span className="text-red-500">❤️</span>
          )}
        </div>
        
        {record.comment && (
          <p className="text-gray-700 text-sm mb-2 line-clamp-2">
            {record.comment}
          </p>
        )}
        
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}