// src/adapters/simulation/racing.ts
// Adapter for simulation racing engine

import { createRaceSimulation } from '../../simulation'
import type { RaceSimulationService } from '../../core/racing'
import type { Race, RaceResult } from '../../core/types'

export class SimulationRacingAdapter implements RaceSimulationService {
  private simulations: Map<string, any> = new Map()
  private eventListeners: Map<string, Array<(result: RaceResult) => void>> = new Map()

  startRace(race: Race): void {
    const raceInput = {
      id: race.id,
      meetingName: race.meetingName,
      raceNumber: race.raceNumber,
      categoryId: race.categoryId,
      advertisedStartMs: race.advertisedStartMs,
      runners: race.runners.map(runner => ({
        id: runner.id,
        number: runner.number,
        name: runner.name,
        decimalOdds: runner.odds === 'SP' ? null : runner.odds
      }))
    }

    const simulation = createRaceSimulation(raceInput)
    this.simulations.set(race.id, simulation)
    
    // Set up finish handler to notify listeners
    simulation.onFinish((result: any) => {
      const raceResult: RaceResult = {
        raceId: result.raceId,
        placings: result.placings
      }
      
      // Notify any listeners
      const listeners = this.eventListeners.get(race.id) || []
      listeners.forEach(listener => listener(raceResult))
      
      // Clean up
      this.simulations.delete(race.id)
      this.eventListeners.delete(race.id)
    })
    
    simulation.start()
  }

  stopRace(raceId: string): void {
    const simulation = this.simulations.get(raceId)
    if (simulation) {
      simulation.stop()
      this.simulations.delete(raceId)
      this.eventListeners.delete(raceId)
    }
  }

  resetRace(raceId: string): void {
    const simulation = this.simulations.get(raceId)
    if (simulation) {
      simulation.stop()
    }
    this.simulations.delete(raceId)
    this.eventListeners.delete(raceId)
  }

  // Method to add event listeners for race results
  onRaceFinish(raceId: string, callback: (result: RaceResult) => void): void {
    if (!this.eventListeners.has(raceId)) {
      this.eventListeners.set(raceId, [])
    }
    this.eventListeners.get(raceId)!.push(callback)
  }

  // This method is not applicable for simulation as results come through event listeners
  async getRaceResult(raceId: string): Promise<RaceResult> {
    throw new Error('getRaceResult should be handled through event listeners in simulation mode')
  }
}