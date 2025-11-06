import { type RaceSummary } from '../types/race'
import { type BetSelection } from '../types/betting'
import { type SimulatedRunner } from '../types/simulation'

/**
 * Type guard to check if an object is a valid RaceSummary
 * @param obj The object to check
 * @returns True if the object is a valid RaceSummary
 */
export function isValidRace(obj: any): obj is RaceSummary {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.meeting_name === 'string' &&
    typeof obj.race_number === 'number' &&
    typeof obj.advertised_start_ms === 'number' &&
    typeof obj.category_id === 'string'
  )
}

/**
 * Type guard to check if an object is a valid BetSelection
 * @param obj The object to check
 * @returns True if the object is a valid BetSelection
 */
export function isValidBet(obj: any): obj is BetSelection {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.raceId === 'string' &&
    typeof obj.raceName === 'string' &&
    typeof obj.raceNumber === 'number' &&
    typeof obj.runnerId === 'string' &&
    typeof obj.runnerNumber === 'number' &&
    typeof obj.runnerName === 'string' &&
    (typeof obj.odds === 'number' || obj.odds === 'SP') &&
    (obj.market === 'win' || obj.market === 'place' || obj.market === 'each-way') &&
    typeof obj.stake === 'number' &&
    typeof obj.estimatedReturn === 'number'
  )
}

/**
 * Type guard to check if an object is a valid SimulatedRunner
 * @param obj The object to check
 * @returns True if the object is a valid SimulatedRunner
 */
export function isValidRunner(obj: any): obj is SimulatedRunner {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.number === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.weight === 'string' &&
    typeof obj.jockey === 'string' &&
    (typeof obj.odds === 'number' || obj.odds === 'SP') &&
    (obj.oddsTrend === 'up' || obj.oddsTrend === 'down' || obj.oddsTrend === 'none') &&
    typeof obj.silkColor === 'string'
  )
}