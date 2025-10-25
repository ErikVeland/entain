// src/composables/useRaceSimulation.ts
import { useBetsStore } from '../stores/bets'
import { createRaceSimulation, type RaceInput, type SimulationController } from '../game/simulatedRace'

// In-memory storage for race controllers since the store doesn't have this functionality
const raceControllers = new Map<string, SimulationController>()

export function useRaceSimulation() {
  const betsStore = useBetsStore()
  
  // Create a race simulation
  const createSimulation = (raceInput: RaceInput, seed?: number): SimulationController => {
    const controller = createRaceSimulation(raceInput, seed)
    
    // Store the controller in memory
    raceControllers.set(raceInput.id, controller)
    
    return controller
  }
  
  // Get a race simulation controller
  const getSimulation = (raceId: string): SimulationController | undefined => {
    return raceControllers.get(raceId)
  }
  
  // Remove a race simulation controller
  const removeSimulation = (raceId: string): void => {
    raceControllers.delete(raceId)
  }
  
  return {
    createSimulation,
    getSimulation,
    removeSimulation
  }
}