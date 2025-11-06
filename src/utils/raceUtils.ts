import { type RaceSummary } from '../types/race'

/**
 * Current epoch ms
 */
export const now = (): number => Date.now()

/**
 * Check if a race is expired (60 seconds after advertised start time)
 * @param race The race to check
 * @param currentTime The current time reference (defaults to now)
 * @returns True if the race is expired
 */
export function isExpired(race: RaceSummary, currentTime: number = now()): boolean {
  return currentTime >= race.advertised_start_ms + 60000
}

/**
 * Normalize raw API race to internal model
 * @param raw The raw API race data
 * @returns Normalized race summary
 */
export function normalizeRace(raw: any): RaceSummary {
  const secs = typeof raw.advertised_start?.seconds === 'string'
    ? parseInt(raw.advertised_start.seconds, 10)
    : Number(raw.advertised_start?.seconds ?? 0)

  return {
    id: raw.race_id,
    meeting_name: raw.meeting_name,
    race_number: typeof raw.race_number === 'string' ? parseInt(raw.race_number, 10) : Number(raw.race_number),
    advertised_start_ms: secs * 1000,
    category_id: raw.category_id
  }
}