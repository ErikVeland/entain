// src/adapters/api/racing.ts
// Adapter for API-based racing (placeholder for real API implementation)

import type { RaceSimulationService } from '../../core/racing'
import type { Race, RaceResult } from '../../core/types'

export class ApiRacingAdapter implements RaceSimulationService {
  startRace(race: Race): void {
    // In a real implementation, this would start watching for race results from an API
    console.log('API: Starting race watch', race.id)
  }

  stopRace(raceId: string): void {
    // In a real implementation, this would stop watching for race results from an API
    console.log('API: Stopping race watch', raceId)
  }

  resetRace(raceId: string): void {
    // In a real implementation, this would reset the race watch
    console.log('API: Resetting race watch', raceId)
  }

  async getRaceResult(raceId: string): Promise<RaceResult> {
    // In a real implementation, this would fetch race results from an API
    throw new Error('API: Race results would be received through event streams')
  }
}