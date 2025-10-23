<template>
  <div>
    <div v-if="store.loadState === 'loading' && store.races.length === 0" class="space-y-4">
      <!-- Skeleton loaders -->
      <div 
        v-for="i in 3" 
        :key="i"
        class="w-1/3 flex-shrink-0 px-2"
      >
        <div class="bg-surface-raised rounded-xl2 p-6 animate-pulse">
          <div class="h-4 bg-surface-sunken rounded w-3/4 mb-4"></div>
          <div class="h-6 bg-surface-sunken rounded w-1/2 mb-4"></div>
          <div class="h-8 bg-surface-sunken rounded w-full"></div>
        </div>
      </div>
    </div>

    <div v-else-if="store.loadState === 'error'" class="text-center py-12">
      <div class="text-danger text-lg font-medium mb-2">Error loading races</div>
      <div class="text-text-muted mb-4">{{ store.errorMessage }}</div>
      <div class="text-text-muted text-sm mb-4">Please check your connection and try again</div>
      <button 
        @click="retryFetch"
        class="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-primary"
        ref="retryButton"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="store.nextFive.length === 0" class="text-center py-12">
      <div class="text-text-muted text-lg">No races available</div>
      <div class="text-text-muted mt-2">Please check back later</div>
    </div>

    <div v-else class="overflow-hidden" @keydown="handleCarouselKeyDown" tabindex="0" ref="carouselContainer">
      <div 
        class="flex transition-transform duration-500 ease-in-out w-full"
        :style="{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }"
        role="region"
        aria-label="Upcoming races carousel"
        aria-live="polite"
        aria-atomic="true"
      >
        <div 
          v-for="(race, index) in visibleRacesWithTransition" 
          :key="race.id"
          class="w-1/3 flex-shrink-0 px-2 transition-all duration-1000 ease-in-out"
          :class="{
            'opacity-0 transform translate-x-4': expiringRaces.has(race.id),
            'opacity-100': !expiringRaces.has(race.id)
          }"
          :aria-hidden="index !== currentIndex"
        >
          <RaceColumn 
            :race="race" 
            :is-active="index === currentIndex" 
            :is-expired="expiringRaces.has(race.id)"
          />
        </div>
      </div>
      
      <!-- Navigation dots -->
      <div class="flex justify-center mt-4 space-x-2">
        <button 
          v-for="(race, index) in visibleRaces" 
          :key="index"
          @click="goToRace(index)"
          class="w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          :class="index === currentIndex ? 'bg-brand-primary' : 'bg-surface-sunken'"
          :aria-label="`Go to race ${index + 1}`"
          :aria-current="index === currentIndex ? 'true' : 'false'"
        ></button>
      </div>
      
      <!-- Previous/Next controls for keyboard navigation -->
      <div class="flex justify-between mt-4">
        <button 
          @click="prevRace"
          class="px-4 py-2 bg-surface-raised text-text-base rounded-lg hover:bg-surface-sunken transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Previous race"
        >
          Previous
        </button>
        <button 
          @click="nextRace"
          class="px-4 py-2 bg-surface-raised text-text-base rounded-lg hover:bg-surface-sunken transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Next race"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRacesStore } from '../stores/races'
import RaceColumn from './RaceColumn.vue'

const store = useRacesStore()
const currentIndex = ref(0)
const carouselContainer = ref<HTMLElement | null>(null)
const retryButton = ref<HTMLButtonElement | null>(null)
const expiringRaces = ref<Set<string>>(new Set())

// Show only 3 races at a time
const visibleRaces = computed(() => {
  return store.nextFive.slice(0, Math.min(store.nextFive.length, 3))
})

// Add transition state to races
const visibleRacesWithTransition = computed(() => {
  return visibleRaces.value
})

const retryFetch = () => {
  store.fetchRaces()
}

// Track expiring races
const previousRaces = ref<string[]>([])
watch(() => store.nextFive, (newRaces, oldRaces) => {
  const currentRaceIds = newRaces.map(r => r.id)
  
  // Find races that were removed
  const removedRaceIds = previousRaces.value.filter(id => !currentRaceIds.includes(id))
  
  // Add removed races to expiring set
  removedRaceIds.forEach(id => expiringRaces.value.add(id))
  
  // Clear expired races after animation
  if (removedRaceIds.length > 0) {
    setTimeout(() => {
      expiringRaces.value.clear()
    }, 1000)
    
    // Reset currentIndex if needed
    currentIndex.value = 0
  }
  
  // Update previous races
  previousRaces.value = currentRaceIds
}, { deep: true })

// Go to a specific race
const goToRace = (index: number) => {
  currentIndex.value = index
}

const nextRace = () => {
  if (visibleRaces.value.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % visibleRaces.value.length
  }
}

const prevRace = () => {
  if (visibleRaces.value.length > 1) {
    currentIndex.value = (currentIndex.value - 1 + visibleRaces.value.length) % visibleRaces.value.length
  }
}

const handleCarouselKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      nextRace()
      break
    case 'ArrowLeft':
      event.preventDefault()
      prevRace()
      break
    case 'Home':
      event.preventDefault()
      currentIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      currentIndex.value = visibleRaces.value.length - 1
      break
  }
}

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