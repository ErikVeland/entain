<template>
  <div class="min-h-screen bg-surface text-text-base transition-colors duration-200 flex flex-col">
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
    
    <!-- Game Mode Dialog -->
    <GameModeDialog 
      :is-open="showGameModeDialog"
      @close="showGameModeDialog = false"
      @confirm="showGameModeDialog = false"
    />
    
    <!-- Betslip Drawer -->
    <BetslipDrawer ref="betslipDrawer" />
    
    <header class="bg-surface-raised shadow-card py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-brand-primary">🏁 RACEHUB</h1>
        </div>
        <div class="mt-4 md:mt-0 flex items-center space-x-2">
          <!-- View toggle - only show in simulation mode -->
          <div v-if="isSimulationMode" class="flex bg-surface-raised rounded-lg p-1">
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
    </header>

    <main id="main-content" class="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
      <!-- Stunning Race Container -->
      <div class="bg-surface-raised rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header with decorative elements -->
        <div class="bg-gradient-to-r from-brand-primary to-harness p-5 rounded-t-3xl">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold text-text-inverse flex items-center">
                <span class="mr-2">🏇</span>
                <span v-if="currentView === 'races'">{{ $t('views.nextFive') }}</span>
                <span v-else>{{ $t('views.meetings') }}</span>
                <!-- Show live updates only in simulation mode -->
                <span v-if="isSimulationMode" class="ml-2 text-base font-normal opacity-90">/ Live Racing</span>
              </h2>
              <!-- Show live updates text only in simulation mode -->
              <p v-if="isSimulationMode" class="text-text-inverse opacity-80 text-sm mt-1">{{ $t('races.liveUpdates') }}</p>
            </div>
            <!-- Simulation toggle button in the Next 5 Races header -->
            <button 
              @click="toggleSimulation"
              class="mt-4 md:mt-0 px-4 py-2 bg-text-inverse text-brand-primary rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-text-inverse"
              :aria-pressed="isSimulationMode"
              :aria-label="isSimulationMode ? 'Switch to API mode' : 'Start simulation mode'"
            >
              <span v-if="isSimulationMode">API Mode</span>
              <span v-else>Start Simulation</span>
            </button>
          </div>
        </div>
        
        <!-- Control Bar -->
        <ControlBar />
        
        <!-- Race Content -->
        <div class="p-6">
          <RaceList 
            v-if="currentView === 'races'" 
            id="race-list" 
            @open-betslip="handleOpenBetslip"
          />
          <MeetingsView v-else id="meetings-view" />
        </div>
      </div>
    </main>

    <!-- Betslip Drawer -->
    <BetslipDrawer 
      :is-open="isBetslipOpen"
      @close="isBetslipOpen = false"
      @update:isOpen="isBetslipOpen = $event"
    />

    <footer class="py-6 px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm border-t border-surface-sunken bg-surface-raised">
      <p>Racehub by <a href="https://veland.au" class="text-brand-primary hover:underline">Erik Veland</a> &copy; {{ new Date().getFullYear() }}</p>
      <p class="mt-1">
        Racing data provided by Neds API
        <span v-if="isSimulationMode">. Non-race data simulated.</span>
      </p>
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
import ControlBar from './components/ControlBar.vue'
import GameModeDialog from './components/GameModeDialog.vue'

const { locale, t } = useI18n()
const store = useRacesStore()
const betsStore = useBetsStore()
const betslipDrawer = ref<InstanceType<typeof BetslipDrawer> | null>(null)
const showGameModeDialog = ref(false)
const currentView = ref<'races' | 'meetings'>('races')

// Event handlers
const handleGameModeDialog = () => {
  showGameModeDialog.value = true;
};

// Theme handling
const isDarkMode = ref(true)
const isHighContrast = ref(false)

// Language handling
const currentLocale = ref('en')

// Betslip handling
const isBetslipOpen = ref(false)

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

// Handle opening the betslip
const handleOpenBetslip = (payload: { race: any; runner: any }) => {
  // Open the betslip drawer
  isBetslipOpen.value = true
  
  // Add selection to betslip
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
  // Apply theme immediately to prevent flash
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
  
  // Listen for game mode dialog request
  window.addEventListener('show-game-mode-dialog', handleGameModeDialog);
  
  // Start polling and ticking intervals
  store.startLoops()
  // Initial fetch
  store.fetchRaces()
})

// Clean up
onUnmounted(() => {
  store.stopLoops()
})
</script>