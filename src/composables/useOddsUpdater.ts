import { ref, Ref, onUnmounted } from 'vue'
import { useOddsSimulation } from './useOddsSimulation'

// Global store for tracking which races are in countdown status
const countdownRaces = ref<Set<string>>(new Set())
const updateIntervals = new Map<string, number>()

// Composable for managing global odds updates
export function useOddsUpdater() {
  const { updateOdds, getSimulatedRunners } = useOddsSimulation()
  
  // Register a race as being in countdown status
  const registerCountdownRace = (raceId: string) => {
    console.log('Registering race for odds updates:', raceId)
    countdownRaces.value.add(raceId)
    startOddsUpdates(raceId)
  }
  
  // Unregister a race from countdown status
  const unregisterCountdownRace = (raceId: string) => {
    console.log('Unregistering race from odds updates:', raceId)
    countdownRaces.value.delete(raceId)
    stopOddsUpdates(raceId)
  }
  
  // Start updating odds for a specific race
  const startOddsUpdates = (raceId: string) => {
    // Stop any existing interval for this race
    stopOddsUpdates(raceId)
    
    // Start new interval for odds updates
    const intervalId = window.setInterval(() => {
      // Only update if race is still in countdown status
      if (countdownRaces.value.has(raceId)) {
        updateRaceOdds(raceId)
      } else {
        // Clean up if race is no longer in countdown status
        stopOddsUpdates(raceId)
      }
    }, 1000) // Update every 1 second for more responsive feel
    
    updateIntervals.set(raceId, intervalId)
    console.log('Started odds updates for race:', raceId)
  }
  
  // Stop updating odds for a specific race
  const stopOddsUpdates = (raceId: string) => {
    const intervalId = updateIntervals.get(raceId)
    if (intervalId) {
      clearInterval(intervalId)
      updateIntervals.delete(raceId)
      console.log('Stopped odds updates for race:', raceId)
    }
  }
  
  // Update odds for a specific race during countdown
  const updateRaceOdds = (raceId: string) => {
    try {
      console.log('Attempting to update odds for race:', raceId);
      const runners = getSimulatedRunners(raceId)
      console.log('Retrieved runners for race', raceId, ':', runners);
      if (runners.length > 0) {
        // For countdown races, we simulate realistic market movements
        const progressByRunner: Record<string, number> = {}
        const order: string[] = []
        
        // Create realistic progress simulation based on runner numbers and random market factors
        runners.forEach((runner, index) => {
          // Favorites (lower numbers) start with higher progress
          // But add random market fluctuations to simulate real betting activity
          const baseProgress = 1 - (runner.number / (runners.length + 2))
          // Add market volatility (±15% random movement)
          const marketFluctuation = (Math.random() - 0.5) * 0.3
          progressByRunner[runner.id] = Math.max(0, Math.min(1, baseProgress + marketFluctuation))
          order.push(runner.id)
        })
        
        // Sort order by progress (highest first) to determine market positions
        order.sort((a, b) => {
          return (progressByRunner[b] || 0) - (progressByRunner[a] || 0)
        })
        
        console.log('Updating odds for countdown race', raceId, 'progress:', progressByRunner, 'order:', order)
        // Update odds based on the simulated market movements
        updateOdds(raceId, progressByRunner, order)
      } else {
        console.log('No runners found for race', raceId);
      }
    } catch (error) {
      console.error('Error updating odds for race', raceId, error)
    }
  }
  
  // Clean up all intervals
  const cleanup = () => {
    updateIntervals.forEach((intervalId, raceId) => {
      clearInterval(intervalId)
      console.log('Cleaned up odds updates for race:', raceId)
    })
    updateIntervals.clear()
    countdownRaces.value.clear()
  }
  
  // Return cleanup function for unmounting
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    registerCountdownRace,
    unregisterCountdownRace,
    cleanup
  }
}