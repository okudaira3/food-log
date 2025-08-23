import { useState, useCallback } from 'react'
import { SearchFilters } from '../types'
import { Button, Input } from './Common'

interface SearchFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onReset: () => void
}

export default function SearchFilter({ filters, onFiltersChange, onReset }: SearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters)

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(tempFilters)
    setIsExpanded(false)
  }, [tempFilters, onFiltersChange])

  const handleReset = useCallback(() => {
    setTempFilters({})
    onReset()
    setIsExpanded(false)
  }, [onReset])

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value ? new Date(value + 'T00:00:00') : undefined
    }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setTempFilters(prev => ({
      ...prev,
      tags: tags.length > 0 ? tags : undefined
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <Input
            type="text"
            placeholder="コメントを検索..."
            value={tempFilters.searchText || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempFilters(prev => ({
              ...prev,
              searchText: e.target.value || undefined
            }))}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            詳細検索
          </Button>
          <Button
            size="sm"
            onClick={handleApplyFilters}
          >
            検索
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <Input
                type="date"
                value={formatDateForInput(tempFilters.dateFrom)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <Input
                type="date"
                value={formatDateForInput(tempFilters.dateTo)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タグ（カンマ区切り）
            </label>
            <Input
              type="text"
              placeholder="例: ランチ, 和食, 美味しい"
              value={tempFilters.tags ? tempFilters.tags.join(', ') : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTagsChange(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="favoritesOnly"
              checked={tempFilters.favoritesOnly || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempFilters(prev => ({
                ...prev,
                favoritesOnly: e.target.checked || undefined
              }))}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="favoritesOnly" className="ml-2 block text-sm text-gray-900">
              お気に入りのみ表示
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              リセット
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              検索実行
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}