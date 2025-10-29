import { ref, Ref } from 'vue'
import { updateOdds, getSimulatedRunners } from './useOddsSimulation'

// Global store for tracking which races are in countdown status
const countdownRaces = ref<Set<string>>(new Set())
const updateIntervals = new Map<string, number>()

// Create the odds updater functions
const registerCountdownRace = (raceId: string) => {
  // console.log('Registering race for odds updates:', raceId);
  // console.log('Current countdown races before:', Array.from(countdownRaces.value));
  countdownRaces.value.add(raceId);
  // console.log('Current countdown races after:', Array.from(countdownRaces.value));
  startOddsUpdates(raceId);
}

const unregisterCountdownRace = (raceId: string) => {
  // console.log('Unregistering race from odds updates:', raceId);
  // console.log('Current countdown races before:', Array.from(countdownRaces.value));
  countdownRaces.value.delete(raceId);
  // console.log('Current countdown races after:', Array.from(countdownRaces.value));
  stopOddsUpdates(raceId);
}

const startOddsUpdates = (raceId: string) => {
  // Stop any existing interval for this race
  stopOddsUpdates(raceId)
  
  // Start new interval for odds updates
  const intervalId = window.setInterval(() => {
    // Only update if race is still in countdown status
    if (countdownRaces.value.has(raceId)) {
      // console.log('Updating odds for race:', raceId);
      updateRaceOdds(raceId)
    } else {
      // Clean up if race is no longer in countdown status
      stopOddsUpdates(raceId)
    }
  }, 3000) // Update every 3 seconds
  
  updateIntervals.set(raceId, intervalId)
  // console.log('Started odds updates for race:', raceId, 'with interval ID:', intervalId);
}

const stopOddsUpdates = (raceId: string) => {
  const intervalId = updateIntervals.get(raceId)
  if (intervalId) {
    // console.log('Clearing interval for race:', raceId, 'with interval ID:', intervalId);
    clearInterval(intervalId)
    updateIntervals.delete(raceId)
    // console.log('Stopped odds updates for race:', raceId);
  }
}

const updateRaceOdds = (raceId: string) => {
  try {
    const runners = getSimulatedRunners(raceId)
    if (runners.length > 0) {
      // For countdown races, we simulate realistic market movements
      const progressByRunner: Record<string, number> = {}
      const order: string[] = []
      
      // Create realistic progress simulation based on runner numbers and random market factors
      runners.forEach((runner: any, index: number) => {
        // Favorites (lower numbers) start with higher progress
        // But add random market fluctuations to simulate real betting activity
        const baseProgress = 1 - (runner.number / (runners.length + 2))
        // Reduce market volatility from ±10% to ±8% for more stable odds
        const marketFluctuation = (Math.random() - 0.5) * 0.16
        progressByRunner[runner.id] = Math.max(0, Math.min(1, baseProgress + marketFluctuation))
        order.push(runner.id)
      })
      
      // Sort order by progress (highest first) to determine market positions
      order.sort((a, b) => {
        return (progressByRunner[b] || 0) - (progressByRunner[a] || 0)
      })
      
      // Update odds based on the simulated market movements
      updateOdds(raceId, progressByRunner, order)
    }
  } catch (error) {
    console.error('Error updating odds for race:', raceId, error)
  }
}

// Clean up all intervals
export const cleanupOddsUpdater = () => {
  updateIntervals.forEach((intervalId, raceId) => {
    clearInterval(intervalId)
  })
  updateIntervals.clear()
  countdownRaces.value.clear()
}

// Export the functions
export function useOddsUpdater() {
  return {
    registerCountdownRace,
    unregisterCountdownRace,
    cleanup: cleanupOddsUpdater
  };
}