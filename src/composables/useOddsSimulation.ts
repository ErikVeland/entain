// src/composables/useOddsSimulation.ts
import { ref, Ref } from 'vue'
import { type RunnerInput } from '../game/simulatedRace'

// Define the odds trend types
export type OddsTrend = 'up' | 'down' | 'none'

// Define a runner with simulated odds
export interface SimulatedRunner {
  id: string
  number: number
  name: string
  weight: string
  jockey: string
  odds: string | number
  oddsTrend: OddsTrend
  silkColor: string
  bestTime?: string
}

// Define odds simulation state
interface OddsSimulationState {
  runners: Record<string, SimulatedRunner>
  lastUpdate: number
}

export function useOddsSimulation() {
  // Store simulation states for each race
  const simulations = ref<Record<string, OddsSimulationState>>({})
  
  // Initialize odds simulation for a race
  const initializeOddsSimulation = (
    raceId: string, 
    runners: SimulatedRunner[]
  ) => {
    const initialState: OddsSimulationState = {
      runners: {},
      lastUpdate: Date.now()
    }
    
    // Initialize each runner with their starting odds
    runners.forEach(runner => {
      initialState.runners[runner.id] = { ...runner }
    })
    
    simulations.value[raceId] = initialState
  }
  
  // Update odds based on race progress
  const updateOdds = (
    raceId: string,
    progressByRunner: Record<string, number>,
    order: string[]
  ) => {
    const simulation = simulations.value[raceId]
    if (!simulation) {
      console.warn('No simulation found for race:', raceId)
      return
    }
    
    console.log('Updating odds for race:', raceId, 'progress:', progressByRunner, 'order:', order)
    
    // Update timestamp
    simulation.lastUpdate = Date.now()
    
    // Get current leader
    const leaderId = order[0]
    
    // Update odds for each runner based on their position and progress
    Object.keys(simulation.runners).forEach(runnerId => {
      const runner = simulation.runners[runnerId]
      const progress = progressByRunner[runnerId] || 0
      const currentPosition = order.indexOf(runnerId)
      
      console.log(`Runner ${runnerId} - progress: ${progress}, position: ${currentPosition}`)
      
      // Convert current odds to number for calculation
      let currentOdds: number
      if (runner.odds === 'SP') {
        currentOdds = 6.0 // Default SP value
      } else if (typeof runner.odds === 'string') {
        currentOdds = parseFloat(runner.odds) || 6.0
      } else {
        currentOdds = runner.odds
      }
      
      // Calculate new odds based on position and progress
      let newOdds = currentOdds
      let trend: OddsTrend = 'none'
      
      // If this is the leader, odds should generally decrease (favorite)
      if (runnerId === leaderId) {
        // Leader gets favored odds, but not too extreme
        const leaderFactor = 0.95 + (0.1 * (1 - progress)) // Gets better as race progresses
        newOdds = Math.max(1.1, currentOdds * leaderFactor)
        trend = newOdds < currentOdds ? 'down' : newOdds > currentOdds ? 'up' : 'none'
      } 
      // If runner is in top 3 and making progress, odds may decrease
      else if (currentPosition < 3 && progress > 0.5) {
        const top3Factor = 0.97 + (0.06 * (1 - (currentPosition / 3))) // Better position = better odds
        newOdds = Math.max(1.2, currentOdds * top3Factor)
        trend = newOdds < currentOdds ? 'down' : newOdds > currentOdds ? 'up' : 'none'
      }
      // If runner is falling behind, odds may increase
      else if (currentPosition > 2 && progress < 0.7) {
        const trailingFactor = 1.02 + (0.05 * (currentPosition / order.length)) // Further back = higher odds
        newOdds = currentOdds * trailingFactor
        trend = newOdds > currentOdds ? 'up' : newOdds < currentOdds ? 'down' : 'none'
      }
      // For middle runners, small fluctuations
      else {
        // Small random fluctuation (±2%)
        const fluctuation = 0.98 + (Math.random() * 0.04)
        newOdds = currentOdds * fluctuation
        trend = newOdds > currentOdds ? 'up' : newOdds < currentOdds ? 'down' : 'none'
      }
      
      // Ensure odds stay within reasonable bounds
      newOdds = Math.max(1.1, Math.min(100, newOdds))
      
      // Update runner odds and trend
      runner.odds = parseFloat(newOdds.toFixed(2))
      runner.oddsTrend = trend
      
      console.log(`Runner ${runnerId} - new odds: ${runner.odds}, trend: ${trend}`)
    })
  }
  
  // Get current simulated runners for a race
  const getSimulatedRunners = (raceId: string): SimulatedRunner[] => {
    const simulation = simulations.value[raceId]
    if (!simulation) {
      console.warn('No simulation found for race:', raceId)
      return []
    }
    
    return Object.values(simulation.runners)
  }
  
  // Reset simulation for a race
  const resetSimulation = (raceId: string) => {
    delete simulations.value[raceId]
  }
  
  return {
    initializeOddsSimulation,
    updateOdds,
    getSimulatedRunners,
    resetSimulation
  }
}