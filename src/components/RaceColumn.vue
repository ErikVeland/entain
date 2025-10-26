<template>
  <div 
    v-if="!error"
    class="bg-surface-raised rounded-xl2 shadow-card overflow-hidden transition-all duration-500 animate-bounce-in flex flex-col h-full relative border-2 border-surface"
    :class="{ 
      'ring-2 ring-brand-primary': isActive, 
      'opacity-50 pointer-events-none': isExpired,
      'animate-pulse-slow': raceStatus === 'starting_soon',
      'border-warning': raceStatus === 'starting_soon',
      'border-danger': raceStatus === 'live',
      'border-success': raceStatus === 'finished'
    }"
    :data-race-id="race.id"
    :data-race-status="raceStatus"
    :tabindex="isActive ? 0 : -1"
    @keydown="handleKeyDown"
    :aria-label="`Race ${race.race_number} at ${race.meeting_name}`"
    role="region"
  >
    <!-- Full card background with subtle race-type color overlay (10% opacity) -->
    <div 
      class="absolute inset-0 rounded-xl2 pointer-events-none select-none opacity-10"
      :class="{
        'bg-horse': race.category_id === CATEGORY_IDS.HORSE,
        'bg-greyhound': race.category_id === CATEGORY_IDS.GREYHOUND,
        'bg-harness': race.category_id === CATEGORY_IDS.HARNESS
      }"
    ></div>
    
    <!-- Full card background category icon -->
    <div class="absolute bottom-0 right-0 opacity-10 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
      <span v-if="race.category_id === CATEGORY_IDS.HORSE" class="text-[120px] block absolute bottom-[-25%] right-[-15%]">🏇</span>
      <span v-else-if="race.category_id === CATEGORY_IDS.GREYHOUND" class="text-[120px] block absolute bottom-[-25%] right-[-15%]">🐕</span>
      <span v-else-if="race.category_id === CATEGORY_IDS.HARNESS" class="text-[120px] block absolute bottom-[-25%] right-[-15%]">🛞</span>
    </div>
    
    <RaceHeader 
      :meeting-name="race.meeting_name"
      :race-number="race.race_number"
      :category-id="race.category_id"
      :start-time="race.advertised_start_ms"
      :is-expired="isExpired"
      :race-id="race.id"
    />
    
    <!-- Simulation Controls (hidden by default, shown only in debug mode) -->
    <div class="px-3 pt-2" v-if="showDebugControls">
      <SimulationControls 
        :race="race"
        @start="startRaceSimulation"
        @reset="resetRaceSimulation"
      />
    </div>
    
    <div class="p-3 flex-grow relative z-10">
      <div class="space-y-2">
        <!-- We need to convert the odds to string for RunnerRow -->
        <RunnerRow 
          v-for="(runner, index) in runnersForDisplay"
          :key="runner.id"
          :runner="runner"
          :race-id="race.id"
          :race-name="race.meeting_name"
          :race-number="race.race_number"
          :is-expired="isExpired"
          :tabindex="0"
        />
        <!-- Show a message when no runners are available (not in simulation mode) -->
        <div 
          v-if="(!betsStore.showGame || !betsStore.useSimulatedData) && runnersForDisplay.length === 0" 
          class="text-center py-4 text-text-muted"
        >
          Runner information not available in API mode
        </div>
        <!-- Show a message when runners are missing in simulation mode -->
        <div 
          v-else-if="betsStore.showGame && betsStore.useSimulatedData && runnersForDisplay.length === 0" 
          class="text-center py-4 text-text-muted"
        >
          No runners available for this race
        </div>
      </div>
    </div>
    
    <!-- Odds Trend Chart - Always visible for active races in simulation mode -->
    <div class="px-3 pb-3 relative z-10" v-if="betsStore.showGame && !isExpired && raceStatus === 'live'">
      <div class="border-t border-surface pt-3">
        <div class="flex items-center justify-between w-full py-2 text-text-base font-medium mb-2">
          <span>Odds Movements</span>
          <!-- Visual indicators for significant odds changes -->
          <div class="flex space-x-1">
            <div 
              v-for="runner in runnersWithSignificantChanges" 
              :key="runner.id"
              class="w-3 h-3 rounded-full"
              :class="{
                'bg-success animate-pulse': runner.oddsTrend === 'down',
                'bg-danger animate-pulse': runner.oddsTrend === 'up',
                'bg-warning': runner.oddsTrend === 'none'
              }"
              :title="`${runner.number}. ${runner.name}: ${runner.odds}`"
            ></div>
          </div>
        </div>
        <div class="mt-2">
          <OddsTrendChart :race-id="race.id" />
        </div>
      </div>
    </div>

    <!-- Odds Trend Chart with dropdown curtain for non-live races -->
    <div class="px-3 pb-3 relative z-10" v-else-if="betsStore.showGame && !isExpired">
      <div class="border-t border-surface pt-3">
        <button 
          @click="toggleOddsChart"
          class="flex items-center justify-between w-full py-2 text-text-base font-medium"
        >
          <span>Odds Movements</span>
          <span :class="{'rotate-180': showOddsChart}" class="transition-transform">▼</span>
        </button>
        <div v-show="showOddsChart" class="mt-2">
          <OddsTrendChart :race-id="race.id" />
        </div>
      </div>
    </div>
    
    <RaceResults 
      v-if="raceResult && !isExpired && betsStore.showGame && raceFinished"
      :race-id="race.id"
      :runners="runnersForBetPlacer"
      :race-result="raceResult"
    />
  </div>
  
  <!-- Error boundary -->
  <div v-else class="bg-surface-raised rounded-xl2 shadow-card overflow-hidden flex flex-col h-full relative border border-danger p-4">
    <div class="text-danger font-bold mb-2">Error Loading Race</div>
    <div class="text-text-muted text-sm mb-4">{{ error }}</div>
    <button 
      @click="retryLoad"
      class="px-3 py-1 bg-brand-primary text-text-inverse rounded text-sm hover:bg-opacity-90"
    >
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { type RaceSummary, CATEGORY_IDS } from '../stores/races'
import { useBetsStore } from '../stores/bets'
import { useOddsSimulation, type SimulatedRunner } from '../composables/useOddsSimulation'
import { useRaceSimulation } from '../composables/useRaceSimulation'
import { useCountdown } from '../composables/useCountdown'
import { type Tick, type Result } from '../game/simulatedRace'
import RaceHeader from './RaceHeader.vue'
import RunnerRow from './RunnerRow.vue'
import RaceResults from './RaceResults.vue'
import OddsTrendChart from './OddsTrendChart.vue'
import SimulationControls from './SimulationControls.vue'

const props = defineProps<{
  race: RaceSummary
  isActive?: boolean
  isExpired?: boolean
}>()

const emit = defineEmits<{
  (e: 'navigate-next'): void
  (e: 'navigate-prev'): void
  (e: 'select'): void
  (e: 'add-to-betslip', payload: { race: RaceSummary; runner: any }): void
  (e: 'race-started'): void
  (e: 'race-finished'): void
}>()

const betsStore = useBetsStore()
const { initializeOddsSimulation, updateOdds, getSimulatedRunners, resetSimulation, generateRandomizedRunners } = useOddsSimulation()
const { createSimulation, getSimulation, removeSimulation, startSimulation, stopSimulation, resetSimulation: resetRaceSimulationStore } = useRaceSimulation()
const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.race.advertised_start_ms)

// State for odds chart dropdown
const showOddsChart = ref(false)
const toggleOddsChart = () => {
  showOddsChart.value = !showOddsChart.value
}

// Show debug controls only when debug mode is enabled
const showDebugControls = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData && window.location.search.includes('debug')
})

// Race simulation controller
let simulationController: any = null

// Race result - only shown after simulation completes
const raceResult = ref<{ placings: string[] } | null>(null)

// Track if race has finished
const raceFinished = ref(false)

// Track if race is live (simulation started)
const raceLive = ref(false)

// Error handling
const error = ref<string | null>(null)

// Cache for runners display to prevent unnecessary re-renders
const runnersForDisplayCache = new Map<string, { runners: any[]; timestamp: number }>()

// Computed race status
const raceStatus = computed(() => {
  if (props.isExpired) return 'finished'
  // Only show 'live' status when race has actually started (countdown finished)
  if (isInProgress.value) return 'live'
  if (isStartingSoon.value) return 'starting_soon'
  return 'countdown'
})

// Compute runners with significant odds changes for visual indicators
const runnersWithSignificantChanges = computed(() => {
  if (!betsStore.showGame || !betsStore.useSimulatedData) return []
  
  const runners = getSimulatedRunners(props.race.id)
  // Filter to only show runners with significant odds changes (trend is not 'none')
  return runners.filter(runner => runner.oddsTrend !== 'none')
})

// Retry loading the race simulation
const retryLoad = () => {
  error.value = null
  initializeRaceSimulation()
}

// Initialize race simulation
const initializeRaceSimulation = () => {
  // Only initialize in simulation mode
  if (!betsStore.showGame || !betsStore.useSimulatedData) {
    return
  }
  
  try {
    console.log('Initializing race simulation for race', props.race.id)
    // Clean up any existing simulation
    cleanupSimulation()
    
    // Generate randomized runners based on race category with initial odds
    const runners = generateRandomizedRunners(props.race.id, props.race.category_id)
    console.log('Generated runners for race', props.race.id, runners)
    
    // Initialize odds simulation
    initializeOddsSimulation(props.race.id, runners)
    
    // Create race simulation
    const raceInput = {
      id: props.race.id,
      meetingName: props.race.meeting_name,
      raceNumber: props.race.race_number,
      categoryId: props.race.category_id,
      advertisedStartMs: props.race.advertised_start_ms,
      runners: runners.map(runner => ({
        id: runner.id,
        number: runner.number,
        name: runner.name,
        decimalOdds: typeof runner.odds === 'number' ? runner.odds : 6.0
      }))
    }
    
    console.log('Creating race simulation with input:', raceInput)
    
    // Calculate tick interval based on number of active races for better performance
    // Increased tick interval for more realistic simulation
    const activeRaces = document.querySelectorAll('[data-race-id]').length;
    const tickMs = activeRaces > 3 ? 1000 : activeRaces > 1 ? 500 : 250;
    
    simulationController = createSimulation(raceInput, undefined, tickMs)
    console.log('Created simulation controller for race', props.race.id, 'with tickMs:', tickMs)
    
    // Set up tick handler for odds updates
    simulationController.onTick((tick: Tick) => {
      try {
        console.log('Race tick for race', props.race.id, 'with progress:', tick.progressByRunner, 'and order:', tick.order)
        
        // Check if race is actually live/running
        const raceElement = document.querySelector(`[data-race-id="${props.race.id}"]`);
        let isRaceRunning = false;
        if (raceElement) {
          const raceStatus = raceElement.getAttribute('data-race-status');
          isRaceRunning = raceStatus === 'live';
        }
        
        // Only update odds if race is NOT running (i.e., it's upcoming)
        // Once a race starts, odds should be locked
        if (!isRaceRunning) {
          updateOdds(props.race.id, tick.progressByRunner, tick.order)
        } else {
          console.log('Skipping odds update for running race', props.race.id)
        }
        
        // Update the raceLive status based on the tick
        if (!raceLive.value && tick.tElapsedMs > 0) {
          raceLive.value = true;
          emit('race-started');
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
        console.error('Error updating odds:', err)
      }
    })
    
    // Set up finish handler for results
    simulationController.onFinish((result: Result) => {
      try {
        console.log('Race finished for race', props.race.id, 'with result:', result)
        // Set race result to show after simulation completes
        raceResult.value = {
          placings: result.placings
        }
        
        // Mark race as finished
        raceFinished.value = true
        raceLive.value = false
        
        // Emit race finished event
        emit('race-finished')
        
        // Settle any bets for this race
        const settlements = betsStore.settleRace(props.race.id, { placings: result.placings })
        
        // Check if user won any bets and trigger celebration animation
        if (settlements && settlements.length > 0) {
          const winningSettlements = settlements.filter(s => s.result === 'WON')
          if (winningSettlements.length > 0) {
            // Trigger win celebration
            const event = new CustomEvent('win-celebration', { 
              detail: { 
                winAmount: winningSettlements.reduce((sum, s) => sum + s.payout, 0) 
              } 
            })
            window.dispatchEvent(event)
          }
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err)
        console.error('Error finishing race:', err)
      }
    })
    
    // Start the simulation immediately so odds can update for upcoming races
    // But don't mark race as live until the actual start time
    if (simulationController && betsStore.showGame && betsStore.useSimulatedData) {
      try {
        startSimulation(props.race.id)
        console.log('Started simulation for upcoming race', props.race.id)
      } catch (err) {
        console.error('Error starting simulation for upcoming race:', err)
      }
    }
  } catch (err) {
    // Enhanced error handling with user-friendly error messages
    const errorMessage = err instanceof Error ? err.message : String(err)
    error.value = `Failed to initialize race simulation: ${errorMessage}`
    console.error('Error initializing race simulation:', err)
  }
}

// Initialize simulation on mount
onMounted(() => {
  try {
    console.log('RaceColumn mounted for race', props.race.id)
    console.log('betsStore.showGame:', betsStore.showGame)
    console.log('betsStore.useSimulatedData:', betsStore.useSimulatedData)
    initializeRaceSimulation()
  } catch (err) {
    // Enhanced error handling with user-friendly error messages
    const errorMessage = err instanceof Error ? err.message : String(err)
    error.value = `Failed to mount race component: ${errorMessage}`
    console.error('Error mounting race component:', err)
  }
})

// Start race simulation when countdown ends
watch(isInProgress, (inProgress) => {
  console.log('isInProgress changed for race', props.race.id, 'to', inProgress)
  console.log('betsStore.showGame:', betsStore.showGame)
  console.log('betsStore.useSimulatedData:', betsStore.useSimulatedData)
  console.log('raceFinished.value:', raceFinished.value)
  console.log('raceLive.value:', raceLive.value)
  
  if (inProgress && betsStore.showGame && betsStore.useSimulatedData && !raceFinished.value) {
    console.log('Marking race as live for race', props.race.id)
    // Mark race as live when countdown finishes
    raceLive.value = true
    // Emit race started event
    emit('race-started')
    console.log('Race is now live for race', props.race.id)
  }
}, { immediate: true })

// Also start race simulation when manually triggered (for testing)
const startRaceSimulation = () => {
  console.log('Manual start race simulation requested for race', props.race.id)
  console.log('betsStore.showGame:', betsStore.showGame)
  console.log('betsStore.useSimulatedData:', betsStore.useSimulatedData)
  console.log('raceFinished.value:', raceFinished.value)
  console.log('raceLive.value:', raceLive.value)
  console.log('simulationController:', !!simulationController)
  
  if (betsStore.showGame && betsStore.useSimulatedData && !raceFinished.value && !raceLive.value) {
    // Mark race as live
    raceLive.value = true
    // Emit race started event
    emit('race-started')
    console.log('Started race simulation for race', props.race.id)
  } else {
    console.log('Conditions not met for starting race simulation')
  }
}

// Reset race simulation
const resetRaceSimulation = () => {
  try {
    cleanupSimulation()
    initializeRaceSimulation()
  } catch (err) {
    // Enhanced error handling with user-friendly error messages
    const errorMessage = err instanceof Error ? err.message : String(err)
    error.value = `Failed to reset race simulation: ${errorMessage}`
    console.error('Error resetting race simulation:', err)
  }
}

// Clean up simulation
const cleanupSimulation = () => {
  try {
    if (simulationController) {
      stopSimulation(props.race.id)
      simulationController = null
    }
    resetSimulation(props.race.id)
    removeSimulation(props.race.id)
    raceResult.value = null
    raceFinished.value = false
    raceLive.value = false
  } catch (err) {
    // Enhanced error handling with user-friendly error messages
    const errorMessage = err instanceof Error ? err.message : String(err)
    error.value = `Failed to clean up race simulation: ${errorMessage}`
    console.error('Error cleaning up simulation:', err)
  }
}

// Watch for changes in simulation mode
watch(() => betsStore.showGame && betsStore.useSimulatedData, (newVal, oldVal) => {
  console.log('Simulation mode changed for race', props.race.id, 'from', oldVal, 'to', newVal)
  console.log('betsStore.showGame:', betsStore.showGame)
  console.log('betsStore.useSimulatedData:', betsStore.useSimulatedData)
  
  if (newVal && !oldVal) {
    // Switching to simulation mode
    try {
      console.log('Initializing race simulation for race', props.race.id)
      initializeRaceSimulation()
      // Make sure the chart knows the simulation is available
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('simulation-initialized', { detail: { raceId: props.race.id } }));
      }, 100);
    } catch (err) {
      // Enhanced error handling with user-friendly error messages
      const errorMessage = err instanceof Error ? err.message : String(err)
      error.value = `Failed to switch to simulation mode: ${errorMessage}`
      console.error('Error switching to simulation mode:', err)
    }
  } else if (!newVal && oldVal) {
    // Switching to non-simulation mode - clean up simulation
    try {
      console.log('Cleaning up simulation for race', props.race.id)
      cleanupSimulation()
    } catch (err) {
      // Enhanced error handling with user-friendly error messages
      const errorMessage = err instanceof Error ? err.message : String(err)
      error.value = `Failed to switch to API mode: ${errorMessage}`
      console.error('Error switching to API mode:', err)
    }
  }
}, { immediate: true })

// Clean up on unmount
onUnmounted(() => {
  try {
    cleanupSimulation()
    // Clean up cache
    runnersForDisplayCache.delete(props.race.id)
  } catch (err) {
    // Log error but don't display it since component is unmounting
    console.error('Error during component unmount:', err)
  }
})

// Get runners based on simulation mode
// We need to convert the odds to the correct type for BetPlacer
const runnersForBetPlacer = computed(() => {
  if (betsStore.showGame && betsStore.useSimulatedData) {
    // Return simulated runners with dynamic odds
    return getSimulatedRunners(props.race.id)
  } else {
    // When not in simulation mode, we should not show any runners
    // as they should come from the API
    return []
  }
})

// We need to convert the odds to string for RunnerRow
const runnersForDisplay = computed(() => {
  // In API mode, we don't show any runners
  if (!betsStore.showGame || !betsStore.useSimulatedData) {
    return []
  }
  
  // In simulation mode, show simulated runners
  // Remove caching to ensure real-time updates
  const runners = getSimulatedRunners(props.race.id)
  console.log('Got simulated runners for race', props.race.id, runners);
  
  const formattedRunners = runners.map(runner => ({
    ...runner,
    odds: runner.odds === 'SP' ? 'SP' : runner.odds.toString(),
    // For non-simulation mode, we always show 'none' trend
    oddsTrend: (!betsStore.showGame || !betsStore.useSimulatedData) ? 'none' : runner.oddsTrend
  }));
  
  console.log('Updating runners for display for race', props.race.id, formattedRunners);
  
  return formattedRunners;
})

const handleAddToBetslip = (runner: any) => {
  if (!props.isExpired && betsStore.showGame) {
    // Emit event to parent to handle adding to betslip
    emit('add-to-betslip', { race: props.race, runner })
  }
}

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.isActive) return
  
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      emit('navigate-next')
      break
    case 'ArrowLeft':
      event.preventDefault()
      emit('navigate-prev')
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      emit('select')
      break
    case 'b':
      // Quick bet placement shortcut
      if (betsStore.showGame && !props.isExpired && runnersForBetPlacer.value.length > 0) {
        event.preventDefault()
        handleAddToBetslip(runnersForBetPlacer.value[0])
      }
      break
  }
}
</script>