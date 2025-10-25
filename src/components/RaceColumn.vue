<template>
  <div 
    class="bg-surface-raised rounded-xl2 shadow-card overflow-hidden transition-all duration-500 animate-bounce-in flex flex-col h-full"
    :class="{ 
      'ring-2 ring-brand-primary': isActive, 
      'opacity-50 pointer-events-none': isExpired,
      'animate-pulse-slow': isStartingSoon && !isExpired
    }"
    :tabindex="isActive ? 0 : -1"
    @keydown="handleKeyDown"
    :aria-label="`Race ${race.race_number} at ${race.meeting_name}`"
    role="region"
  >
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
    
    <div class="p-3 flex-grow">
      <div class="space-y-2">
        <!-- We need to convert the odds to string for RunnerRow -->
        <RunnerRow 
          v-for="(runner, index) in runnersForDisplay"
          :key="index"
          :runner="runner"
          :race-id="race.id"
          :race-name="race.meeting_name"
          :race-number="race.race_number"
          :is-expired="isExpired"
          :tabindex="0"
        />
        <!-- Show a message when no runners are available (not in simulation mode) -->
        <div 
          v-if="!betsStore.showGame || !betsStore.useSimulatedData" 
          class="text-center py-4 text-text-muted"
        >
          Runner information not available in API mode
        </div>
      </div>
    </div>
    
    <!-- Odds Trend Chart with dropdown curtain -->
    <div class="px-3 pb-3" v-if="betsStore.showGame && !isExpired">
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
}>()

const betsStore = useBetsStore()
const { initializeOddsSimulation, updateOdds, getSimulatedRunners, resetSimulation, generateRandomizedRunners } = useOddsSimulation()
const { createSimulation, getSimulation, removeSimulation } = useRaceSimulation()
const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.race.advertised_start_ms)

// State for odds chart dropdown
const showOddsChart = ref(false)
const toggleOddsChart = () => {
  showOddsChart.value = !showOddsChart.value
}

// Race simulation controller
let simulationController: any = null

// Race result - only shown after simulation completes
const raceResult = ref<{ placings: string[] } | null>(null)

// Track if race has finished
const raceFinished = ref(false)

// Track if race is live (simulation started)
const raceLive = ref(false)

// Initialize race simulation
const initializeRaceSimulation = () => {
  // Only initialize in simulation mode
  if (!betsStore.showGame || !betsStore.useSimulatedData) {
    return
  }
  
  // Clean up any existing simulation
  cleanupSimulation()
  
  // Generate randomized runners based on race category with initial odds
  const runners = generateRandomizedRunners(props.race.id, props.race.category_id)
  
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
  
  simulationController = createSimulation(raceInput)
  
  // Set up tick handler for odds updates
  simulationController.onTick((tick: Tick) => {
    // Update odds based on race progress
    updateOdds(props.race.id, tick.progressByRunner, tick.order)
  })
  
  // Set up finish handler for results
  simulationController.onFinish((result: Result) => {
    // Set race result to show after simulation completes
    raceResult.value = {
      placings: result.placings
    }
    
    // Mark race as finished
    raceFinished.value = true
    raceLive.value = false
    
    // Settle any bets for this race
    // This would typically be done in a store action
    console.log('Race finished:', result)
  })
}

// Start race simulation when countdown ends
watch(isInProgress, (inProgress) => {
  if (inProgress && betsStore.showGame && betsStore.useSimulatedData && !raceFinished.value && !raceLive.value) {
    // Start the simulation when countdown finishes
    if (simulationController) {
      simulationController.start()
      raceLive.value = true
    }
  }
})

// Clean up simulation
const cleanupSimulation = () => {
  if (simulationController) {
    simulationController.stop()
    simulationController = null
  }
  resetSimulation(props.race.id)
  removeSimulation(props.race.id)
  raceResult.value = null
  raceFinished.value = false
  raceLive.value = false
}

// Initialize simulation on mount
onMounted(() => {
  initializeRaceSimulation()
})

// Watch for changes in simulation mode
watch(() => betsStore.showGame && betsStore.useSimulatedData, (newVal) => {
  if (newVal) {
    // Switching to simulation mode
    initializeRaceSimulation()
  } else {
    // Switching to non-simulation mode - clean up simulation
    cleanupSimulation()
  }
})

// Clean up on unmount
onUnmounted(() => {
  cleanupSimulation()
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
  return runnersForBetPlacer.value.map(runner => ({
    ...runner,
    odds: runner.odds === 'SP' ? 'SP' : runner.odds.toString(),
    // For non-simulation mode, we always show 'none' trend
    oddsTrend: (!betsStore.showGame || !betsStore.useSimulatedData) ? 'none' : runner.oddsTrend
  }))
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