import Dexie, { Table } from 'dexie'
import { FoodRecord } from '../types'

export class FoodLogDatabase extends Dexie {
  foodRecords!: Table<FoodRecord, number>

  constructor() {
    super('FoodLogDatabase')

    // Version 1: Initial schema
    this.version(1).stores({
      // ++id: Auto-incrementing primary key
      // timestamp: For date range searches and sorting
      // *tags: Multi-entry index (for array searches)
      // favorite: For favorite filtering
      // [favorite+timestamp]: Compound index (sort favorites by date)
      foodRecords: '++id, timestamp, *tags, favorite, [favorite+timestamp]'
    })

    // Future expansion example (Version 2)
    // this.version(2).stores({
    //   foodRecords: '++id, timestamp, *tags, favorite, [favorite+timestamp], category'
    // }).upgrade(trans => {
    //   // Migration process for existing data
    //   return trans.foodRecords.toCollection().modify(record => {
    //     record.category = 'default'
    //   })
    // })
  }
}

export const db = new FoodLogDatabase()

// Simple initialization without event handlers for now
console.log('FoodLogDatabase initialized')