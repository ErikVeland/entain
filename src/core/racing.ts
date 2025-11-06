// src/core/racing.ts
// Core racing abstractions that work with both API and simulation

import type { Race, RaceResult } from './types'

export interface RaceSimulationService {
  startRace(race: Race): void
  stopRace(raceId: string): void
  resetRace(raceId: string): void
  getRaceResult(raceId: string): Promise<RaceResult>
}