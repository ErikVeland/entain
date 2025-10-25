<template>
  <div class="min-h-screen bg-surface text-text-base transition-colors duration-200">
    <!-- News Ticker -->
    <NewsTicker />
    
    <!-- Debug Panel -->
    <DebugPanel :show-debug="showDebug" @close="showDebug = false" />
    
    <!-- Skip Links for Accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      {{ $t('accessibility.skipToMain') }}
    </a>
    <a href="#race-list" v-if="currentView === 'races'" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      {{ $t('accessibility.skipToRaces') }}
    </a>
    <a href="#meetings-view" v-else class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-brand-primary focus:text-white">
      {{ $t('accessibility.skipToMeetings') }}
    </a>
    
    <header class="bg-surface-raised shadow-card py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-brand-primary">🏁 RACEHUB</h1>
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
              :aria-label="$t('views.nextFive')"
            >
              {{ $t('views.nextFive') }}
            </button>
            <button 
              @click="currentView = 'meetings'"
              class="px-3 py-1 text-sm rounded-md transition-colors"
              :class="currentView === 'meetings' 
                ? 'bg-brand-primary text-text-inverse' 
                : 'text-text-muted hover:bg-surface-sunken'"
              :aria-label="$t('views.meetings')"
            >
              {{ $t('views.meetings') }}
            </button>
          </div>
          
          <!-- Combined Simulation toggle -->
          <button 
            @click="toggleSimulation"
            class="px-3 py-1 text-sm rounded-md transition-colors flex items-center"
            :class="isSimulationMode
              ? 'bg-brand-primary text-text-inverse' 
              : 'bg-surface-raised text-text-muted hover:bg-surface-sunken'"
            :aria-pressed="isSimulationMode"
            :aria-label="isSimulationMode ? 'Simulation mode on' : 'Simulation mode off'"
          >
            <span>Simulation</span>
            <span class="ml-1 font-bold">{{ isSimulationMode ? 'ON' : 'OFF' }}</span>
          </button>
          
          <!-- Debug toggle -->
          <button 
            @click="toggleDebug"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="showDebug
              ? 'bg-brand-primary text-text-inverse' 
              : 'bg-surface-raised text-text-muted hover:bg-surface-sunken'"
            :aria-pressed="showDebug"
            :aria-label="showDebug ? 'Hide debug panel' : 'Show debug panel'"
          >
            Debug {{ showDebug ? 'ON' : 'OFF' }}
          </button>
          
          <!-- Balance widget -->
          <BalanceWidget v-if="isSimulationMode" />
          
          <!-- Theme and language toggle -->
          <div class="flex">
            <button 
              @click="toggleTheme"
              class="p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors"
              :aria-label="isDarkMode ? $t('theme.switchToLight') : $t('theme.switchToDark')"
            >
              <span v-if="isDarkMode" class="text-xl">☀️</span>
              <span v-else class="text-xl">🌙</span>
            </button>
            
            <!-- High contrast toggle -->
            <button 
              @click="toggleHighContrast"
              class="p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors ml-1"
              :aria-label="$t('theme.highContrast')"
            >
              <span class="text-xl">🎨</span>
            </button>
            
            <!-- Language toggle -->
            <select
              v-model="currentLocale"
              @change="changeLanguage"
              class="p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors ml-1 text-text-base"
              :aria-label="'Change language'"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Search and Advanced Filters -->
      <div class="mt-4 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div class="relative flex-1">
          <input
            v-model="localSearchQuery"
            @input="updateSearchQuery"
            type="text"
            :placeholder="$t('races.searchPlaceholder')"
            class="w-full px-4 py-2 bg-surface-sunken text-text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            :aria-label="$t('races.searchPlaceholder')"
          />
          <span class="absolute right-3 top-2.5 text-text-muted">🔍</span>
        </div>
        
        <div class="flex space-x-2">
          <select
            v-model="localTimeFilter"
            @change="updateTimeFilter"
            class="px-3 py-2 bg-surface-sunken text-text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            :aria-label="$t('races.sortBy')"
          >
            <option value="all">{{ $t('races.allTimes') }}</option>
            <option value="next-hour">{{ $t('races.nextHour') }}</option>
            <option value="next-2-hours">{{ $t('races.next2Hours') }}</option>
            <option value="next-4-hours">{{ $t('races.next4Hours') }}</option>
          </select>
          
          <select
            v-model="localSortOrder"
            @change="updateSortOrder"
            class="px-3 py-2 bg-surface-sunken text-text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            :aria-label="$t('races.sortBy')"
          >
            <option value="time-asc">{{ $t('races.timeSoonest') }}</option>
            <option value="time-desc">{{ $t('races.timeLatest') }}</option>
            <option value="name-asc">{{ $t('races.nameAZ') }}</option>
            <option value="name-desc">{{ $t('races.nameZA') }}</option>
          </select>
        </div>
      </div>
    </header>

    <main id="main-content" class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Category filter with icons -->
      <div class="flex flex-wrap gap-3 mb-8" role="group" :aria-label="$t('categories.selectAll')">
        <button
          v-for="category in categoryFilters"
          :key="category.id"
          @click="handleCategoryToggle(category.id)"
          class="px-6 py-3 rounded-xl2 font-medium transition-all duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-brand-primary transform hover:scale-105 min-w-[120px] justify-between"
          :class="[
            category.active 
              ? 'bg-brand-primary text-text-inverse shadow-card' 
              : 'bg-surface-raised text-text-base hover:bg-surface-sunken'
          ]"
          :aria-pressed="category.active"
          :title="`${category.active ? $t('categories.selectAll') : $t('categories.selectAll')} ${$t(`categories.${category.name.toLowerCase()}`)} ${$t('categories.races')}`"
        >
          <div class="flex items-center">
            <!-- Category icon -->
            <span v-if="category.name === 'Horse'" class="text-lg mr-2">🏇</span>
            <span v-else-if="category.name === 'Greyhound'" class="text-lg mr-2">🐕</span>
            <span v-else-if="category.name === 'Harness'" class="text-lg mr-2">🛞</span>
            
            <span>{{ $t(`categories.${category.name.toLowerCase()}`) }}</span>
          </div>
          
          <!-- Emoji tickbox -->
          <span 
            class="text-lg ml-2"
            :class="{ 'animate-bounce-in': category.active }"
          >
            {{ category.active ? '✅' : '⭕' }}
          </span>
        </button>
      </div>
      
      <div class="mt-8">
        <RaceList 
          v-if="currentView === 'races'" 
          id="race-list" 
          @open-betslip="handleOpenBetslip"
        />
        <MeetingsView v-else id="meetings-view" />
      </div>
    </main>

    <!-- Betslip Drawer -->
    <BetslipDrawer 
      :is-open="isBetslipOpen"
      @close="isBetslipOpen = false"
      @update:isOpen="isBetslipOpen = $event"
    />

    <footer class="py-6 px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
      <p>{{ $t('app.footer') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRacesStore, CATEGORY_IDS } from './stores/races'
import { useBetsStore } from './stores/bets'
import RaceList from './components/RaceList.vue'
import MeetingsView from './components/MeetingsView.vue'
import NewsTicker from './components/NewsTicker.vue'
import DebugPanel from './components/DebugPanel.vue'
import BalanceWidget from './components/BalanceWidget.vue'
import BetslipDrawer from './components/BetslipDrawer.vue'

const { locale, t } = useI18n()
const store = useRacesStore()
const betsStore = useBetsStore()

// View handling
const currentView = ref<'races' | 'meetings'>('races')

// Theme handling
const isDarkMode = ref(true)
const isHighContrast = ref(false)

// Language handling
const currentLocale = ref('en')

// Betslip handling
const isBetslipOpen = ref(false)

// Local state for form controls (to enable debouncing)
const localSearchQuery = ref(store.searchQuery)
const localTimeFilter = ref(store.timeFilter)
const localSortOrder = ref(store.sortOrder)

// Debug state
const showDebug = ref(false)
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// Combined simulation mode (combines game mode and simulated data)
const isSimulationMode = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData
})

const toggleSimulation = () => {
  const newMode = !isSimulationMode.value
  betsStore.setShowGame(newMode)
  betsStore.setUseSimulatedData(newMode)
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  updateThemeAttribute()
}

const toggleHighContrast = () => {
  isHighContrast.value = !isHighContrast.value
  updateThemeAttribute()
}

const updateThemeAttribute = () => {
  if (isHighContrast.value) {
    document.documentElement.setAttribute('data-theme', 'high-contrast')
    localStorage.setItem('theme', 'high-contrast')
  } else {
    const theme = isDarkMode.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
}

const changeLanguage = () => {
  // In Composition API mode, we can directly set the locale ref value
  locale.value = currentLocale.value
  localStorage.setItem('locale', currentLocale.value)
}

// Update store when local search query changes (with debounce)
let searchDebounce: number | null = null
const updateSearchQuery = () => {
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
  searchDebounce = window.setTimeout(() => {
    store.setSearchQuery(localSearchQuery.value)
  }, 300)
}

// Update store when time filter changes
const updateTimeFilter = () => {
  store.setTimeFilter(localTimeFilter.value as any)
}

// Update store when sort order changes
const updateSortOrder = () => {
  store.setSortOrder(localSortOrder.value as any)
}

// Initialize theme and language
onMounted(() => {
  // Theme initialization
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    if (savedTheme === 'high-contrast') {
      isHighContrast.value = true
      document.documentElement.setAttribute('data-theme', 'high-contrast')
    } else {
      isDarkMode.value = savedTheme === 'dark'
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  } else {
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = systemPrefersDark
    document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light')
  }
  
  // Language initialization
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['en', 'es', 'fr'].includes(savedLocale)) {
    currentLocale.value = savedLocale
    locale.value = savedLocale
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

// Handle opening the betslip
const handleOpenBetslip = (payload: { race: any; runner: any }) => {
  // Add the selection to the betslip
  // We need to access the betslip drawer ref to add the selection
  console.log('Adding to betslip:', payload)
  
  // Open the betslip drawer
  isBetslipOpen.value = true
  
  // Add selection to betslip (we'll need to access the drawer component methods)
  // For now, we'll emit a global event or use a store
  // This would typically be handled by accessing the drawer component ref
  setTimeout(() => {
    // Dispatch a custom event that the betslip drawer can listen to
    const event = new CustomEvent('add-to-betslip', { 
      detail: { 
        race: payload.race, 
        runner: payload.runner 
      } 
    })
    window.dispatchEvent(event)
  }, 100)
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
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
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