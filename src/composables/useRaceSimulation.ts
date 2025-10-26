// src/composables/useRaceSimulation.ts
import { useBetsStore } from '../stores/bets'
import { createRaceSimulation, type RaceInput, type SimulationController } from '../game/simulatedRace'

// In-memory storage for race controllers since the store doesn't have this functionality
const raceControllers = new Map<string, SimulationController>()

export function useRaceSimulation() {
  const betsStore = useBetsStore()
  
  // Create a race simulation
  const createSimulation = (raceInput: RaceInput, seed?: number, tickMs?: number): SimulationController => {
    // Adjust tick interval based on number of active races for better performance
    const activeRaces = raceControllers.size;
    const adjustedTickMs = tickMs || (activeRaces > 3 ? 300 : activeRaces > 1 ? 200 : 100);
    
    const controller = createRaceSimulation(raceInput, seed, adjustedTickMs)
    
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