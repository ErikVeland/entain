import { CATEGORY_IDS } from '../stores/races'

/**
 * Race category identifiers
 */
export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS]

/**
 * Status of a race
 */
export type RaceStatus = 'countdown' | 'starting_soon' | 'live' | 'finished'

/**
 * Minimal shape of a race item coming from Neds API after normalization.
 */
export interface RaceSummary {
  id: string
  meeting_name: string
  race_number: number
  advertised_start_ms: number
  category_id: CategoryId | string
}

/**
 * Race result information
 */
export interface RaceResult {
  placings: string[]
}