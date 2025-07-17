import { useState } from 'react'
import { SearchFilters } from '../../types'
import { MagnifyingGlassIcon, StarIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common'

interface SearchFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
}

export default function SearchFilter({ filters, onFiltersChange, onReset }: SearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleSearchTextChange = (value: string) => {
    onFiltersChange({ ...filters, searchText: value })
  }

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value ? new Date(value) : undefined })
  }

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value ? new Date(value) : undefined })
  }

  const handleFavoriteToggle = () => {
    onFiltersChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
  }

  const handleTagAdd = () => {
    if (tagInput.trim()) {
      const newTags = [...(filters.tags || []), tagInput.trim()]
      onFiltersChange({ ...filters, tags: newTags })
      setTagInput('')
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = filters.tags?.filter(tag => tag !== tagToRemove) || []
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTagAdd()
    }
  }

  const hasActiveFilters = filters.searchText || filters.dateFrom || filters.dateTo || filters.favoritesOnly || (filters.tags && filters.tags.length > 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="コメントで検索..."
            value={filters.searchText || ''}
            onChange={(e) => handleSearchTextChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          詳細フィルター
          <span className={`ml-1 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}>▼</span>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 mr-1" />
                開始日
              </label>
              <input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 mr-1" />
                終了日
              </label>
              <input
                type="date"
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="h-4 w-4 mr-1" />
              タグフィルター
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="タグを入力..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button onClick={handleTagAdd} size="sm" disabled={!tagInput.trim()}>
                追加
              </Button>
            </div>
            
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-green-700 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                filters.favoritesOnly
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <StarIcon className="h-4 w-4 mr-1" />
              お気に入りのみ
            </button>
            
            {hasActiveFilters && (
              <Button onClick={onReset} variant="outline" size="sm">
                フィルターをリセット
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}