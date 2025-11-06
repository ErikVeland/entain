<template>
  <!-- Simulation Controls (hidden by default, shown only in debug mode) -->
  <div class="px-3 pt-2" v-if="showDebugControls">
    <!-- Simulation controls have been removed as they're no longer needed -->
  </div>
</template>

<script setup lang="ts">
import type { RaceSummary } from '../stores/races'

const props = defineProps<{
  race: RaceSummary
  showGame: boolean
  useSimulatedData: boolean
  showDebugControls: boolean
}>()

const emit = defineEmits<{
  (e: 'start-race-simulation'): void
  (e: 'reset-race-simulation'): void
}>()

const startRaceSimulation = () => {
  emit('start-race-simulation')
}

const resetRaceSimulation = () => {
  emit('reset-race-simulation')
}
</script>