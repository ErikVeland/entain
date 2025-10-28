// src/composables/useOddsSimulation.ts
import { ref, Ref, watch } from 'vue'
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
  odds: number | 'SP' // Changed back to number | 'SP' to match expected interface
  oddsTrend: OddsTrend
  silkColor: string
  bestTime?: string
}

// Define odds simulation state
interface OddsSimulationState {
  runners: Record<string, SimulatedRunner>
  lastUpdate: number
}

// Create a singleton instance of the simulation state
const simulations = ref<Record<string, OddsSimulationState>>({})

// Horse jockey names
const horseJockeyNames = [
  'J: R Vaibhav', 'J: Sarah Johnson', 'J: Michael Chen', 'J: Emma Wilson',
  'J: David Thompson', 'J: Lisa Anderson', 'J: James Parker', 'J: Olivia Smith',
  'J: Robert King', 'J: Jennifer Lee', 'J: William Wright', 'J: Amanda Clark',
  'J: Thomas Brown', 'J: Margaret Davis', 'J: Christopher Wilson', 'J: Patricia Miller',
  'J: Daniel Taylor', 'J: Linda Martinez', 'J: Matthew Anderson', 'J: Barbara Thomas',
  'J: Anthony Garcia', 'J: Susan Rodriguez', 'J: Mark Wilson', 'J: Betty Lopez',
  'J: Paul Martinez', 'J: Dorothy Hernandez', 'J: Steven Gonzalez', 'J: Helen Perez',
  'J: Andrew Taylor', 'J: Carol Jackson', 'J: Kenneth Moore', 'J: Ruth Martin',
  'J: Joshua Lee', 'J: Sharon Thompson', 'J: Kevin White', 'J: Catherine Harris'
]

// Horse names
const horseNames = [
  'Thunder Bay', 'Midnight Express', 'Desert Storm', 'Got Immunity', 'Rocket Man',
  'Silver Bullet', 'Golden Arrow', 'Blue Thunder', 'Red Lightning', 'Green Machine',
  'Purple Haze', 'Orange Crush', 'Yellow Submarine', 'Black Pearl', 'White Knight',
  'Pink Panther', 'Brown Bear', 'Grey Wolf', 'Turquoise Twist', 'Magenta Magic',
  'Crimson Tide', 'Azure Sky', 'Emerald City', 'Ruby Red', 'Sapphire Blue',
  'Amber Waves', 'Jade Empire', 'Onyx Black', 'Pearl Harbor', 'Diamond Dust',
  'Platinum Blonde', 'Bronze Medal', 'Copper Penny', 'Steel Magnolia', 'Iron Man'
]

// Silk colors for visual distinction
const silkColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  'bg-lime-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500',
  'bg-sky-500', 'bg-amber-500', 'bg-slate-500', 'bg-gray-500', 'bg-zinc-500'
]

// Best times for horses
const bestTimes = [
  '56.2s', '57.8s', '58.1s', '59.3s', '1:01.2', '1:02.7', '1:03.4', '1:04.1',
  '1:05.6', '1:06.3', '1:07.8', '1:08.2', '1:09.7', '1:10.4', '1:11.9',
  '1:12.6', '1:13.1', '1:14.8', '1:15.3', '1:16.7', '1:17.2', '1:18.9',
  '1:19.4', '1:20.1', '1:21.6', '1:22.3', '1:23.8', '1:24.5', '1:25.2',
  '1:26.7', '1:27.4', '1:28.9', '1:29.6', '1:30.3', '1:31.8', '1:32.5'
]

// Generate randomized runners for a race
export function generateRandomizedRunners(raceId: string, categoryId: string): SimulatedRunner[] {
  const runners: SimulatedRunner[] = []
  const numRunners = 8 + Math.floor(Math.random() * 4) // 8-11 runners
  
  // Shuffle arrays to ensure variety
  const shuffledNames = [...horseNames].sort(() => Math.random() - 0.5)
  const shuffledJockeys = [...horseJockeyNames].sort(() => Math.random() - 0.5)
  const shuffledSilkColors = [...silkColors].sort(() => Math.random() - 0.5)
  const shuffledTimes = [...bestTimes].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < numRunners; i++) {
    const name = shuffledNames[i % shuffledNames.length]
    const jockey = shuffledJockeys[i % shuffledJockeys.length]
    const weight = `${50 + Math.floor(Math.random() * 15)}kg` // 50-64kg
    const bestTime = shuffledTimes[i % shuffledTimes.length]
    
    // Generate base odds with favorites having shorter odds
    let baseOdds: number
    if (i < 2) {
      // Positions 1-2: 1.5-2.5 (favorites)
      baseOdds = 1.5 + (Math.random() * 1.0);
    } else if (i < 5) {
      // Positions 3-5: 2.5-5.0 (contenders)
      baseOdds = 2.5 + (Math.random() * 2.5);
    } else {
      // Positions 6+: 5.0-20.0 (outsiders)
      baseOdds = 5.0 + (Math.random() * 15.0);
    }
    
    // Add some category-specific adjustments
    if (categoryId === '9daef0d7-bf3c-4f50-921d-8e818c60fe61') { // Greyhound
      // Greyhounds typically have shorter odds
      baseOdds *= 0.8;
    } else if (categoryId === '161d9be2-e909-4326-8c2c-35ed71fb460b') { // Harness
      // Harness typically has longer odds
      baseOdds *= 1.2;
    }
    
    // Ensure minimum odds of 1.10
    const odds = Math.max(1.10, baseOdds);
    
    runners.push({
      id: `runner-${raceId}-${i + 1}`,
      number: i + 1,
      name,
      weight,
      jockey,
      odds: parseFloat(odds.toFixed(2)), // Round to 2 decimal places
      oddsTrend: 'none',
      silkColor: shuffledSilkColors[i % shuffledSilkColors.length],
      bestTime
    })
  }
  
  return runners
}

// Initialize odds simulation for a race
export function initializeOddsSimulation(raceId: string, runners: SimulatedRunner[]) {
  // Only initialize if not already initialized
  if (!simulations.value[raceId]) {
    simulations.value[raceId] = {
      runners: {},
      lastUpdate: 0
    }
    
    // Add runners to simulation
    for (const runner of runners) {
      simulations.value[raceId].runners[runner.id] = { ...runner }
    }
  }
  
  return simulations.value[raceId]
}

// Update odds for a race based on simulation progress
export function updateOdds(
  raceId: string,
  progressByRunner: Record<string, number>,
  order: string[]
) {
  const now = Date.now()
  const simulation = simulations.value[raceId]
  
  // If no simulation exists for this race, return
  if (!simulation) {
    return
  }
  
  // Throttle updates to 1000ms intervals to prevent excessive updates (increased from 200ms)
  if (now - simulation.lastUpdate < 1000) {
    return
  }
  
  // Update last update time
  simulation.lastUpdate = now
  
  // Update odds for each runner
  for (const runnerId of Object.keys(progressByRunner)) {
    const runner = simulation.runners[runnerId]
    if (!runner) continue
    
    const progress = progressByRunner[runnerId]
    const currentPosition = order.indexOf(runnerId) + 1
    const totalRunners = order.length
    
    // Calculate new odds based on position and progress
    // Leaders get shorter odds, trailers get longer odds
    const positionFactor = currentPosition / totalRunners
    
    // Progress factor (0-1, where 1 is finished)
    const progressFactor = progress
    
    // Base odds calculation
    let newOdds = typeof runner.odds === 'number' ? runner.odds : 2.0 // Default to 2.0 if SP
    
    // Adjust odds based on position and progress with smaller changes for realism
    // If runner is leading and making good progress, shorten odds
    if (positionFactor < 0.3 && progressFactor > 0.5) {
      newOdds = Math.max(1.1, newOdds * 0.99) // Very slight shortening for realism
    }
    // If runner is trailing and not making good progress, lengthen odds
    else if (positionFactor > 0.7 && progressFactor < 0.3) {
      newOdds = newOdds * 1.01 // Very slight lengthening for realism
    }
    // Otherwise make very small random adjustments
    else {
      const randomFactor = 0.999 + (Math.random() * 0.002) // 0.999-1.001 for subtle changes
      newOdds = newOdds * randomFactor
    }
    
    // Ensure reasonable odds range
    newOdds = Math.min(100, Math.max(1.1, newOdds))
    
    // Determine odds trend
    let trend: OddsTrend = 'none'
    const originalOdds = typeof runner.odds === 'number' ? runner.odds : 2.0 // Default to 2.0 if SP
    const change = Math.abs(newOdds - originalOdds)
    
    // Only show trend if change is significant (> 0.05)
    if (change > 0.05) {
      trend = newOdds < originalOdds ? 'up' : 'down'
    }
    
    // Update runner with new odds
    const displayOdds = parseFloat(newOdds.toFixed(2))
    simulation.runners[runnerId] = {
      ...runner,
      odds: displayOdds,
      oddsTrend: trend
    }
  }
  
  // No need to trigger reactive update here as Vue will react to individual property changes
  // The individual runner updates above will trigger reactivity automatically
}


// Get simulated runners for a race
export function getSimulatedRunners(raceId: string): SimulatedRunner[] {
  const simulation = simulations.value[raceId]
  if (!simulation) {
    return []
  }
  
  return Object.values(simulation.runners)
}

// Reset simulation for a race
export function resetSimulation(raceId: string) {
  if (simulations.value[raceId]) {
    delete simulations.value[raceId]
  }
}