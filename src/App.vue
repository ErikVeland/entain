<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch
} from 'vue'
import {
  useI18n
} from 'vue-i18n'
import {
  useRacesStore,
  CATEGORY_IDS
} from './stores/races'
import {
  useBetsStore
} from './stores/bets'
import {
  useSimulationStore
} from './stores/simulation'
import { useRacesStoreRefs, useBetsStoreRefs, useSimulationStoreRefs } from './composables/useStoreRefs'
import { persistenceManager } from './utils/persistenceManager'
import {
  getSimulatedRunners
} from './composables/useOddsSimulation'
import { useRaceCommentary } from './composables/useRaceCommentary'
import { eventManager } from './utils/eventManager'
import { timerManager } from './utils/timerManager'
import RaceList from './components/RaceList.vue'
import MeetingsView from './components/MeetingsView.vue'
// Removed NewsTicker import as component doesn't exist
import DebugPanel from './components/DebugPanel.vue'
import BalanceWidget from './components/BalanceWidget.vue'
import BetslipDrawer from './components/BetslipDrawer.vue'
import ControlBar from './components/ControlBar.vue'
import GameModeDialog from './components/GameModeDialog.vue'
import GameOverDialog from './components/GameOverDialog.vue'
import TestRaces from './components/TestRaces.vue'
import CelebrationAnimation from './components/CelebrationAnimation.vue'

const {
  locale,
  t
} = useI18n()

// Get raw stores for initialization
const store = useRacesStore()
const betsStore = useBetsStore()
const simulationStore = useSimulationStore()

// Refs
const betslipDrawer = ref<InstanceType<typeof BetslipDrawer> | null>(null)
const showDebug = ref(false)
const currentView = ref<'races' | 'meetings'>('races')
const isDarkMode = ref(false)
const isHighContrast = ref(false)
const currentLocale = ref('en')
const isBetslipOpen = ref(false)

// Initialize stores with persisted state
onMounted(() => {
  store.initFromPersistence()
  betsStore.initFromPersistence()
  simulationStore.initFromPersistence()
  
  // Initialize theme
  initializeTheme()
  
  // Initialize language
  initializeLanguage()
  
  // Listen for open betslip without selection event
  window.addEventListener('open-betslip-without-selection', handleOpenBetslipWithoutSelection)
})

// Use store refs for optimized reactivity
const {
  races,
  selectedCategories,
  loadState,
  errorMessage,
  searchQuery,
  timeFilter,
  sortOrder,
  activeRaces,
  nextFive,
  racesByMeeting,
  // Actions
  fetchRaces,
  toggleCategory,
  setSearchQuery,
  setTimeFilter,
  setSortOrder,
  startLoops,
  stopLoops,
  clearCache,
  reset,
  pruneExpired
} = useRacesStoreRefs()

const {
  showGame,
  useSimulatedData,
  showGameOver,
  lastWonBetId,
  bankroll,
  // Actions
  initializeService,
  setShowGame,
  setUseSimulatedData,
  acceptWelcomeCredits,
  checkGameOver,
  placeBet,
  cancelBet,
  settleRace,
  reset: resetBets,
  cashoutBet
} = useBetsStoreRefs()

// Use simulation store refs but access only what we need
const simulationStoreRefs = useSimulationStoreRefs()

// Theme functions
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const toggleHighContrast = () => {
  isHighContrast.value = !isHighContrast.value
  applyTheme()
  localStorage.setItem('theme', isHighContrast.value ? 'high-contrast' : (isDarkMode.value ? 'dark' : 'light'))
}

const applyTheme = () => {
  if (isHighContrast.value) {
    document.documentElement.setAttribute('data-theme', 'high-contrast')
  } else {
    const theme = isDarkMode.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }
}

const initializeTheme = () => {
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
}

// Language functions
const changeLanguage = () => {
  locale.value = currentLocale.value
  localStorage.setItem('locale', currentLocale.value)
}

const initializeLanguage = () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['en', 'es', 'fr'].includes(savedLocale)) {
    currentLocale.value = savedLocale
    locale.value = savedLocale
  }
}

// View functions
const handleViewChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  currentView.value = target.value === '0' ? 'races' : 'meetings'
}

const toggleSimulation = () => {
  setUseSimulatedData(!useSimulatedData.value)
}

// Game mode functions
const handleGameModeConfirm = () => {
  setShowGame(true)
  setUseSimulatedData(true)
  acceptWelcomeCredits()
}

const handleGameModeClose = () => {
  setShowGame(true)
}

const handleRestart = () => {
  resetBets()
  acceptWelcomeCredits()
}

// Debug functions
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

// Betslip functions
const handleOpenBetslip = (payload: { race: any; runner: any }) => {
  // Add the selection to the betslip
  console.log('Adding to betslip:', payload)
  
  // Dispatch a custom event that the betslip drawer can listen to
  setTimeout(() => {
    const event = new CustomEvent('add-to-betslip', {
      detail: { 
        race: payload.race, 
        runner: payload.runner 
      } 
    })
    window.dispatchEvent(event)
  }, 100)
  
  // Open the betslip drawer using the exposed method
  if (betslipDrawer.value) {
    betslipDrawer.value.openBetslip()
  }
}

// Handle opening betslip without adding a selection (e.g., when clicking balance)
const handleOpenBetslipWithoutSelection = () => {
  // Open the betslip drawer using the exposed method
  if (betslipDrawer.value) {
    betslipDrawer.value.openBetslip()
  }
}

// Start polling and ticking intervals
onMounted(() => {
  startLoops()
  // Initial fetch
  fetchRaces()
})

// Clean up intervals and event listeners
onUnmounted(() => {
  stopLoops()
  window.removeEventListener('open-betslip-without-selection', handleOpenBetslipWithoutSelection)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface text-text-base transition-colors duration-200">
    <!-- News Ticker -->
    <!-- Removed NewsTicker component as it doesn't exist -->
    
    <!-- Debug Panel -->
    <DebugPanel :show-debug="showDebug" @close="showDebug = false" />
    
    <!-- Celebration Animation -->
    <CelebrationAnimation :bet-id="lastWonBetId" />
    
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
    
    <!-- Game Mode Dialog -->
    <GameModeDialog 
      :is-open="!showGame" 
      @confirm="handleGameModeConfirm"
      @close="handleGameModeClose"
    />
    
    <!-- Game Over Dialog -->
    <GameOverDialog 
      :is-open="showGameOver" 
      :bankroll="bankroll"
      @restart="handleRestart"
    />
    
    <!-- Betslip Drawer -->
    <BetslipDrawer ref="betslipDrawer" />
    
    <header class="bg-surface-raised shadow-card py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-brand-primary">🏁 RACEHUB</h1>
          <!-- Live race updates in header with commentary -->
          <!-- TODO: Implement live race updates -->
        </div>
        <div class="mt-4 md:mt-0 flex items-center space-x-2">
          <!-- Debug toggle with bug icon -->
          <button 
            @click="toggleDebug" 
            class="p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors"
            :class="showDebug ? 'text-brand-primary' : 'text-text-muted'"
            :aria-pressed="showDebug"
            :aria-label="showDebug ? 'Hide debug panel' : 'Show debug panel'"
          >
            <span class="text-xl">🐛</span>
          </button>
          
          <!-- Balance widget -->
          <BalanceWidget v-if="showGame && useSimulatedData" />
          
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
            
            <!-- Language toggle with flags -->
            <div class="relative ml-2">
              <select 
                v-model="currentLocale" 
                @change="changeLanguage" 
                class="appearance-none p-2 rounded-full bg-surface-raised hover:bg-surface-sunken transition-colors text-text-base pr-8 border-0"
                :aria-label="'Change language'"
              >
                <option value="en">🇦🇺</option>
                <option value="es">🇪🇸</option>
                <option value="fr">🇫🇷</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div class="bg-surface-raised rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header with decorative elements -->
        <div class="bg-gradient-to-r from-brand-primary to-harness p-6 rounded-t-3xl shadow-lg">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-2xl font-bold text-text-inverse flex items-center whitespace-nowrap">
                <span class="mr-3 text-2xl" v-if="currentView === 'races'">🏇</span>
                <span class="mr-3 text-2xl" v-else>🏟️</span>
                <span v-if="currentView === 'races'">{{ $t('views.nextFive') }}</span>
                <span v-else>{{ $t('views.meetings') }}</span>
              </h2>
              
              <!-- View toggle moved below headline -->
              <div class="mt-4 w-full">
                <div class="relative inline-block w-48 h-10 rounded-full bg-black bg-opacity-30 shadow-inner">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    :value="currentView === 'races' ? 0 : 1" 
                    @input="handleViewChange" 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    :aria-label="$t('views.toggle')"
                  >
                  <div class="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white">
                    <span 
                      class="w-1/2 flex items-center justify-center" 
                      :class="currentView === 'races' ? 'text-brand-primary' : 'text-white text-opacity-80'"
                    >
                      {{ $t('views.nextFiveShort') }}
                    </span>
                    <span 
                      class="w-1/2 flex items-center justify-center" 
                      :class="currentView === 'meetings' ? 'text-brand-primary' : 'text-white text-opacity-80'"
                    >
                      {{ $t('views.meetingsShort') }}
                    </span>
                  </div>
                  <div 
                    class="absolute top-1 h-8 rounded-full transition-all duration-300 shadow-md flex items-center justify-center text-xs font-medium whitespace-nowrap"
                    :class="currentView === 'races' ? 'left-1 w-[calc(50%-4px)] bg-white text-brand-primary' : 'left-[calc(50%+3px)] w-[calc(50%-4px)] bg-white text-brand-primary'"
                  >
                    {{ currentView === 'races' ? $t('views.nextFiveShort') : $t('views.meetingsShort') }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Simulation toggle button -->
            <div class="mt-6 md:mt-0 w-full md:w-auto">
              <button 
                @click="toggleSimulation" 
                class="w-full px-5 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary backdrop-blur-md bg-opacity-20 border border-brand-primary border-opacity-30 flex items-center justify-center hover:bg-opacity-30 hover:border-opacity-40 text-lg"
                :aria-pressed="useSimulatedData"
                :aria-label="useSimulatedData ? 'Switch to API mode' : 'Start simulation mode'"
              >
                <span v-if="!useSimulatedData" class="mr-2 text-xl">▶️</span>
                <span v-if="useSimulatedData">API Mode</span>
                <span v-else>Start Simulation</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Control Bar -->
        <ControlBar 
          :search-query="searchQuery"
          :time-filter="timeFilter"
          :sort-order="sortOrder"
          @update:search="setSearchQuery"
          @update:time-filter="setTimeFilter"
          @update:sort-order="setSortOrder"
          @refresh="fetchRaces"
        />
        
        <!-- Race Content -->
        <div class="p-6">
          <!-- Debug info - only show API Data Debugger -->
          <div v-if="showDebug" class="mb-4">
            <TestRaces />
          </div>
          
          <RaceList 
            v-if="currentView === 'races'" 
            id="race-list" 
            @open-betslip="handleOpenBetslip" 
          />
          <MeetingsView 
            v-else 
            id="meetings-view" 
            :races-by-meeting="racesByMeeting"
            :selected-categories="selectedCategories"
            @toggle-category="toggleCategory"
          />
        </div>
      </div>
    </main>
    
    <footer class="py-6 px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm border-t border-surface-sunken bg-surface-raised">
      <p>Racehub by <a href="https://veland.au" class="text-brand-primary hover:underline">Erik Veland</a> &copy; {{ new Date().getFullYear() }}</p>
      <p class="mt-1">
        Racing data provided by Neds API.
        <span v-if="useSimulatedData">Non-race data simulated.</span>
      </p>
    </footer>
  </div>
</template>

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