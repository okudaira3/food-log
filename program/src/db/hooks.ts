import { useLiveQuery } from 'dexie-react-hooks'
import { useState, useCallback } from 'react'
import { foodRecordService } from './services'
import { FoodRecord, SearchFilters } from '../types'

export function useFoodRecords() {
  const records = useLiveQuery(() => foodRecordService.getAll())
  return records || []
}

export function useFoodRecord(id: number | undefined) {
  const record = useLiveQuery(
    () => (id ? foodRecordService.getById(id) : undefined),
    [id]
  )
  return record
}

export function useFoodRecordSearch(filters: SearchFilters) {
  const records = useLiveQuery(
    () => foodRecordService.search(filters),
    [filters.dateFrom, filters.dateTo, filters.tags, filters.searchText, filters.favoritesOnly]
  )
  return records || []
}

export function useFoodRecordActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createRecord = useCallback(async (record: Omit<FoodRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const id = await foodRecordService.create(record)
      return id
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRecord = useCallback(async (id: number, updates: Partial<Omit<FoodRecord, 'id' | 'createdAt'>>) => {
    setLoading(true)
    setError(null)
    try {
      await foodRecordService.update(id, updates)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRecord = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await foodRecordService.delete(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await foodRecordService.toggleFavorite(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createRecord,
    updateRecord,
    deleteRecord,
    toggleFavorite,
    loading,
    error
  }
}