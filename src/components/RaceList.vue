<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRacesStore } from '../stores/races'
import { timerManager } from '../utils/timerManager'
import RaceColumn from './RaceColumn.vue'

const { t } = useI18n()

const store = useRacesStore()
const retryButton = ref<HTMLButtonElement | null>(null)
const expiringRaces = ref<Set<string>>(new Set())
const newRaces = ref<Set<string>>(new Set())

// Define emit
const emit = defineEmits<{
  (e: 'open-betslip', payload: { race: any; runner: any }): void
}>()

// Show all 5 races in a grid
const visibleRaces = computed(() => {
  const races = store.nextFive.slice(0, 5); // Show all 5 races
  return races;
})

const retryFetch = () => {
  // Retrying fetch...
  store.fetchRaces()
}

// Handle adding a runner to the betslip
const handleAddToBetslip = (payload: { race: any; runner: any }) => {
  // Emit event to parent to open the betslip drawer and add the selection
  emit('open-betslip', payload)
}

// Track expiring and new races
const previousRaces = ref<string[]>([])
// Store timer IDs for cleanup
const timerIds = ref<number[]>([])

watch(() => store.nextFive, (currentRaces, oldRaces) => {
  // Next five changed
  const currentRaceIds = currentRaces.map(r => r.id)
  
  // Find races that were removed
  const removedRaceIds = previousRaces.value.filter(id => !currentRaceIds.includes(id))
  
  // Find races that were added
  const addedRaceIds = currentRaceIds.filter(id => !previousRaces.value.includes(id))
  
  // Add removed races to expiring set
  removedRaceIds.forEach(id => expiringRaces.value.add(id))
  
  // Add new races to new set
  addedRaceIds.forEach(id => newRaces.value.add(id))
  
  // Clear expired races after animation
  if (removedRaceIds.length > 0) {
    const timerId1 = timerManager.setTimeout(() => {
      expiringRaces.value.clear()
    }, 500)
    timerIds.value.push(timerId1)
  }
  
  // Clear new races after animation
  if (addedRaceIds.length > 0) {
    const timerId2 = timerManager.setTimeout(() => {
      newRaces.value.clear()
    }, 1000)
    timerIds.value.push(timerId2)
  }
  
  // Update previous races
  previousRaces.value = currentRaceIds
}, { deep: true })

// Function to check if a race is expired
const isRaceExpired = (race: any) => {
  const now = Date.now()
  return now >= (race.advertised_start_ms + 60000)
}

// Clean up interval when component unmounts
onMounted(() => {
  // Initialize previous races
  previousRaces.value = store.nextFive.map(r => r.id)
  // RaceList mounted, initial nextFive:
  
  // Focus the retry button if it exists and there's an error
  if (store.loadState === 'error' && retryButton.value) {
    retryButton.value.focus()
  }
})

onUnmounted(() => {
  // No more auto-rotation
  expiringRaces.value.clear()
  newRaces.value.clear()
  
  // Clear all timers
  timerIds.value.forEach(timerId => {
    timerManager.clearTimer(timerId)
  })
  timerIds.value = []
})
</script>

<template>
  <div v-if="store.loadState === 'error'" class="flex flex-col items-center justify-center h-full">
    <p class="text-center text-lg font-bold mb-4">{{ t('raceList.error') }}</p>
    <button
      ref="retryButton"
      class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @click="retryFetch"
    >
      {{ t('raceList.retry') }}
    </button>
  </div>
  <!-- Race grid -->
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
    <TransitionGroup name="race-list" tag="div" class="contents">
      <div 
        v-for="race in visibleRaces"
        :key="`${race.id}-${race.advertised_start_ms}`"
        class="race-list-item"
      >
        <RaceColumn
          :race="race"
          :is-expired="isRaceExpired(race)"
          :class="{
            'opacity-50 scale-95': expiringRaces.has(race.id),
            'scale-105': newRaces.has(race.id)
          }"
          @add-to-betslip="handleAddToBetslip"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.race-list-move,
.race-list-enter-active,
.race-list-leave-active {
  transition: all 0.5s ease;
}

.race-list-enter-from,
.race-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.race-list-leave-active {
  position: absolute;
}

/* Add specific styling for race list items */
.race-list-item {
  transition: all 0.5s ease;
}
</style>
