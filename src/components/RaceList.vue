<template>
  <div>
    <div v-if="store.loadState === 'loading' && store.races.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Skeleton loaders -->
      <div 
        v-for="i in 5" 
        :key="i"
        class="bg-surface-raised rounded-xl p-6 animate-pulse"
      >
        <div class="h-4 bg-surface-sunken rounded w-3/4 mb-4"></div>
        <div class="h-6 bg-surface-sunken rounded w-1/2 mb-4"></div>
        <div class="h-8 bg-surface-sunken rounded w-full"></div>
      </div>
    </div>

    <div v-else-if="store.loadState === 'error'" class="text-center py-12">
      <div class="text-danger text-lg font-medium mb-2">{{ $t('races.error') }}</div>
      <div class="text-text-muted mb-4">{{ store.errorMessage }}</div>
      <div class="text-text-muted text-sm mb-4">{{ $t('races.checkBack') }}</div>
      <button 
        @click="retryFetch"
        class="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-primary"
        ref="retryButton"
      >
        {{ $t('races.tryAgain') }}
      </button>
    </div>

    <div v-else-if="store.nextFive.length === 0" class="text-center py-12">
      <div class="text-text-muted text-lg">{{ $t('races.noRaces') }}</div>
      <div class="text-text-muted mt-2">{{ $t('races.checkBack') }}</div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div 
        v-for="race in visibleRaces"
        :key="race.id"
        class="transition-all duration-500 ease-in-out flex"
        :class="{
          'opacity-0 transform translate-y-4 scale-95': expiringRaces.has(race.id),
          'opacity-100 transform translate-y-0 scale-100': !expiringRaces.has(race.id)
        }"
      >
        <RaceColumn 
          :race="race" 
          :is-active="true"
          :is-expired="expiringRaces.has(race.id)"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRacesStore } from '../stores/races'
import RaceColumn from './RaceColumn.vue'

const { t } = useI18n()

const store = useRacesStore()
const retryButton = ref<HTMLButtonElement | null>(null)
const expiringRaces = ref<Set<string>>(new Set())
const newRaces = ref<Set<string>>(new Set())

// Show all 5 races in a grid
const visibleRaces = computed(() => {
  const races = store.nextFive.slice(0, 5); // Show all 5 races
  console.log('Visible races computed:', races);
  console.log('Store state in RaceList:', store);
  console.log('Store races in RaceList:', store.races);
  console.log('Store loadState in RaceList:', store.loadState);
  console.log('Next five in RaceList:', store.nextFive);
  return races;
})

const retryFetch = () => {
  store.fetchRaces()
}

// Handle adding a runner to the betslip
const handleAddToBetslip = (payload: { race: any; runner: any }) => {
  // Emit event to parent to open the betslip drawer and add the selection
  emit('open-betslip', payload)
}

// Track expiring and new races
const previousRaces = ref<string[]>([])
watch(() => store.nextFive, (currentRaces, oldRaces) => {
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
    setTimeout(() => {
      expiringRaces.value.clear()
    }, 500)
  }
  
  // Clear new races after animation
  if (addedRaceIds.length > 0) {
    setTimeout(() => {
      newRaces.value.clear()
    }, 1000)
  }
  
  // Update previous races
  previousRaces.value = currentRaceIds
}, { deep: true })

// Clean up interval when component unmounts
import { onUnmounted, onMounted } from 'vue'
onUnmounted(() => {
  // No more auto-rotation
})

onMounted(() => {
  // Initialize previous races
  previousRaces.value = store.nextFive.map(r => r.id)
  
  // Focus the retry button if it exists and there's an error
  if (store.loadState === 'error' && retryButton.value) {
    retryButton.value.focus()
  }
})
</script>