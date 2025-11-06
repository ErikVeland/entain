// src/services/racing.ts
// Service layer for racing functionality that abstracts API vs simulation

import { SimulationRacingAdapter } from '../adapters/simulation/racing'
import { ApiRacingAdapter } from '../adapters/api/racing'
import type { Race, RaceResult } from '../core/types'

class RacingService {
  private simulationAdapter: SimulationRacingAdapter
  private apiAdapter: ApiRacingAdapter
  private useSimulation: boolean = false

  constructor() {
    this.simulationAdapter = new SimulationRacingAdapter()
    this.apiAdapter = new ApiRacingAdapter()
  }

  setUseSimulation(useSimulation: boolean): void {
    this.useSimulation = useSimulation
  }

  startRace(race: Race): void {
    if (this.useSimulation) {
      this.simulationAdapter.startRace(race)
    } else {
      this.apiAdapter.startRace(race)
    }
  }

  stopRace(raceId: string): void {
    if (this.useSimulation) {
      this.simulationAdapter.stopRace(raceId)
    } else {
      this.apiAdapter.stopRace(raceId)
    }
  }

  resetRace(raceId: string): void {
    if (this.useSimulation) {
      this.simulationAdapter.resetRace(raceId)
    } else {
      this.apiAdapter.resetRace(raceId)
    }
  }

  // Method to add event listeners for race results
  onRaceFinish(raceId: string, callback: (result: RaceResult) => void): void {
    if (this.useSimulation) {
      this.simulationAdapter.onRaceFinish(raceId, callback)
    } else {
      // For API mode, this would need to be implemented differently
      console.log('API mode: Race results would be received through event streams')
    }
  }
}

// Export a singleton instance
export const racingService = new RacingService()