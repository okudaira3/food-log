import Dexie, { Table } from 'dexie'
import { FoodRecord } from '../types'

export class FoodLogDatabase extends Dexie {
  foodRecords!: Table<FoodRecord>

  constructor() {
    super('FoodLogDatabase')
    this.version(1).stores({
      foodRecords: '++id, timestamp, *tags, favorite'
    })
  }
}

export const db = new FoodLogDatabase()