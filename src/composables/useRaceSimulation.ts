// src/composables/useRaceSimulation.ts
import { useBetsStore } from '../stores/bets'
import { createRaceSimulation, type RaceInput, type SimulationController } from '../game/simulatedRace'

export function useRaceSimulation() {
  const betsStore = useBetsStore()
  
  // Create a race simulation
  const createSimulation = (raceInput: RaceInput, seed?: number): SimulationController => {
    const controller = createRaceSimulation(raceInput, seed)
    
    // Store the controller
    betsStore.addRaceController(raceInput.id, controller)
    
    return controller
  }
  
  // Get a race simulation controller
  const getSimulation = (raceId: string): SimulationController | undefined => {
    return betsStore.getRaceController(raceId)
  }
  
  // Remove a race simulation controller
  const removeSimulation = (raceId: string): void => {
    betsStore.removeRaceController(raceId)
  }
  
  return {
    createSimulation,
    getSimulation,
    removeSimulation
  }
}