// src/api/types.ts
// Types for API-only functionality

export interface ApiRunner {
  id: string
  number: number
  name: string
  odds: number | 'SP'
}

export interface ApiRace {
  id: string
  meeting_name: string
  race_number: number
  category_id: string
  advertised_start_ms: number
  runners: ApiRunner[]
}

export interface ApiRaceResult {
  race_id: string
  placings: string[] // runner IDs in finishing order
}