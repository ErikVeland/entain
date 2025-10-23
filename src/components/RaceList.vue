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
      <button 
        @click="retryFetch"
        class="px-4 py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="store.nextFive.length === 0" class="text-center py-12">
      <div class="text-text-muted text-lg">No races available</div>
      <div class="text-text-muted mt-2">Please check back later</div>
    </div>

    <div v-else class="overflow-hidden">
      <div 
        class="flex transition-transform duration-500 ease-in-out w-full"
        :style="{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }"
      >
        <div 
          v-for="race in visibleRaces" 
          :key="race.id"
          class="w-1/3 flex-shrink-0 px-2"
        >
          <RaceColumn :race="race" />
        </div>
      </div>
      
      <!-- Navigation dots -->
      <div class="flex justify-center mt-4 space-x-2">
        <button 
          v-for="(race, index) in visibleRaces" 
          :key="index"
          @click="goToRace(index)"
          class="w-3 h-3 rounded-full transition-colors"
          :class="index === currentIndex ? 'bg-brand-primary' : 'bg-surface-sunken'"
          :aria-label="`Go to race ${index + 1}`"
        ></button>
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

// Show only 3 races at a time
const visibleRaces = computed(() => {
  return store.nextFive.slice(0, Math.min(store.nextFive.length, 3))
})

const retryFetch = () => {
  store.fetchRaces()
}

// Reset index when races change
watch(() => store.nextFive, () => {
  currentIndex.value = 0
})

// Go to a specific race
const goToRace = (index: number) => {
  currentIndex.value = index
}

// Auto-advance carousel
let carouselInterval: number | null = null

// Start auto-advance
const startCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
  
  carouselInterval = window.setInterval(() => {
    if (visibleRaces.value.length > 1) {
      currentIndex.value = (currentIndex.value + 1) % visibleRaces.value.length
    }
  }, 10000) // Change every 10 seconds
}

// Stop auto-advance
const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

// Start carousel when component mounts
startCarousel()

// Clean up interval when component unmounts
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopCarousel()
})
</script>