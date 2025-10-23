<template>
  <div class="min-h-screen bg-surface text-text-base transition-colors duration-200">
    <!-- Skip Links for Accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      Skip to main content
    </a>
    <a href="#race-list" v-if="currentView === 'races'" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      Skip to race list
    </a>
    <a href="#meetings-view" v-else class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      Skip to meetings view
    </a>
    
    <header class="bg-surface-raised shadow-card py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-brand-primary">NEXT TO GO RACING</h1>
        </div>
        <div class="mt-4 md:mt-0 flex items-center space-x-2">
          <!-- View toggle -->
          <div class="flex bg-surface-raised rounded-lg p-1">
            <button 
              @click="currentView = 'races'"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentView === 'races' 
                ? 'bg-brand-primary text-text-inverse' 
                : 'text-text-muted hover:bg-surface-sunken'"
              aria-label="Show next 5 races view"
            >
              Next 5 Races
            </button>
            <button 
              @click="currentView = 'meetings'"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentView === 'meetings' 
                ? 'bg-brand-primary text-text-inverse' 
                : 'text-text-muted hover:bg-surface-sunken'"
              aria-label="Show meetings view"
            >
              Meetings
            </button>
          </div>
          
          <!-- Game toggle -->
          <button 
            @click="toggleGame"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="betsStore.showGame
              ? 'bg-brand-primary text-text-inverse' 
              : 'bg-surface-raised text-text-muted hover:bg-surface-sunken'"
            :aria-pressed="betsStore.showGame"
            :aria-label="betsStore.showGame ? 'Hide betting game' : 'Show betting game'"
          >
            Game {{ betsStore.showGame ? 'ON' : 'OFF' }}
          </button>
          
          <!-- Category filter icons -->
          <div class="flex space-x-1">
            <button 
              v-for="category in categoryFilters" 
              :key="category.id"
              @click="handleCategoryToggle(category.id)"
              class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
              :class="category.active 
                ? 'bg-brand-primary text-text-inverse' 
                : 'bg-surface-raised text-text-muted hover:bg-surface-sunken'"
              :aria-pressed="category.active"
              :aria-label="`${category.name} races filter, currently ${category.active ? 'enabled' : 'disabled'}`"
            >
              <span v-if="category.name === 'Horse'" class="text-lg">🏇</span>
              <span v-else-if="category.name === 'Greyhound'" class="text-lg">🐕</span>
              <span v-else-if="category.name === 'Harness'" class="text-lg">🛞</span>
            </button>
          </div>
          
          <button 
            @click="toggleTheme"
            class="p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <span v-if="isDarkMode" class="text-xl">☀️</span>
            <span v-else class="text-xl">🌙</span>
          </button>
        </div>
      </div>
    </header>

    <main id="main-content" class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <CategoryFilter 
        :categories="categoryFilters" 
        @toggle-category="handleCategoryToggle" 
      />
      
      <div class="mt-8">
        <RaceList v-if="currentView === 'races'" id="race-list" />
        <MeetingsView v-else id="meetings-view" />
      </div>
    </main>

    <footer class="py-6 px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
      <p>Racing data provided by Neds API</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRacesStore, CATEGORY_IDS } from './stores/races'
import { useBetsStore } from './stores/bets'
import RaceList from './components/RaceList.vue'
import CategoryFilter from './components/CategoryFilter.vue'
import MeetingsView from './components/MeetingsView.vue'

const store = useRacesStore()
const betsStore = useBetsStore()

// View handling
const currentView = ref<'races' | 'meetings'>('races')

// Theme handling
const isDarkMode = ref(true)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleGame = () => {
  betsStore.setShowGame(!betsStore.showGame)
}

// Initialize theme
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = systemPrefersDark
    document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light')
  }
})

// Category filters
const categoryFilters = computed(() => [
  {
    id: CATEGORY_IDS.HORSE,
    name: 'Horse',
    active: store.selectedCategories.has(CATEGORY_IDS.HORSE)
  },
  {
    id: CATEGORY_IDS.GREYHOUND,
    name: 'Greyhound',
    active: store.selectedCategories.has(CATEGORY_IDS.GREYHOUND)
  },
  {
    id: CATEGORY_IDS.HARNESS,
    name: 'Harness',
    active: store.selectedCategories.has(CATEGORY_IDS.HARNESS)
  }
])

const handleCategoryToggle = (categoryId: string) => {
  store.toggleCategory(categoryId)
}

// Start polling and ticking intervals
onMounted(() => {
  store.startLoops()
  // Initial fetch
  store.fetchRaces()
})

// Clean up intervals
onUnmounted(() => {
  store.stopLoops()
})
</script>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus,
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>