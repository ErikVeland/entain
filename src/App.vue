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
import TestRaces from './components/TestRaces.vue'

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
  console.log('Simulation mode toggled:', newMode)
  console.log('Show game:', betsStore.showGame)
  console.log('Use simulated data:', betsStore.useSimulatedData)
  
  // Force a refresh of the races to ensure simulation is properly initialized
  if (newMode) {
    store.fetchRaces()
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  // If we're in high contrast mode, toggle that first
  if (isHighContrast.value) {
    isHighContrast.value = false
  }
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
  // App should start in API mode by default
  // Only enable simulation mode if explicitly requested via URL parameter
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.DEV) {
      // Check if simulation mode is requested via URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('simulation')) {
        betsStore.setShowGame(true)
        betsStore.setUseSimulatedData(true)
        console.log('Enabled simulation mode via URL parameter')
      }
    }
  } catch (e) {
    console.log('Could not check for simulation mode parameter')
  }
  
  console.log('App mounted')
  console.log('betsStore.showGame:', betsStore.showGame)
  console.log('betsStore.useSimulatedData:', betsStore.useSimulatedData)
  console.log('isSimulationMode:', isSimulationMode.value)
  
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

  // Listen for game mode dialog request
  window.addEventListener('show-game-mode-dialog', handleGameModeDialog);

  // Listen for win celebration events
  const handleWinCelebration = (event: Event) => {
    const customEvent = event as CustomEvent<{ winAmount: number }>;
    const detail = customEvent.detail;
    // Trigger win celebration with the win amount
    const celebrationEvent = new CustomEvent('trigger-win-celebration', {
      detail: { amount: detail.winAmount }
    });
    window.dispatchEvent(celebrationEvent);
  };
  
  window.addEventListener('win-celebration', handleWinCelebration);

  // Start polling and ticking intervals
  store.startLoops()
  // Initial fetch
  console.log('Fetching initial races...')
  store.fetchRaces().then(() => {
    console.log('Initial fetch completed')
    console.log('Store state after fetch:', store)
    console.log('Store races count:', store.races.length)
    console.log('Next five races count:', store.nextFive.length)
  }).catch(error => {
    console.error('Error during initial fetch:', error)
  })

  // Log store state for debugging
  console.log('Initial store state:', store)

  // Watch for changes in the store
  watch(() => store.races, (newRaces) => {
    console.log('Races updated in store:', newRaces.length)
  })

  watch(() => store.nextFive, (newNextFive) => {
    console.log('Next five updated:', newNextFive.length)
  })
})

// Clean up
onUnmounted(() => {
  store.stopLoops()
})
</script>

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

    <main id="main-content" class="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
      <!-- Stunning Race Container -->
      <div class="bg-surface-raised rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header with decorative elements -->
        <div class="bg-gradient-to-r from-brand-primary to-harness p-6 rounded-t-3xl">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <!-- Increased icon and headline size -->
              <h2 class="text-2xl font-bold text-text-inverse flex items-center">
                <span class="mr-3 text-4xl" v-if="currentView === 'races'">🏇</span>
                <span class="mr-3 text-4xl" v-else>🏟️</span>
                <span v-if="currentView === 'races'">{{ $t('views.nextFive') }}</span>
                <span v-else>{{ $t('views.meetings') }}</span>
                <!-- Show live updates only in simulation mode -->
                <span v-if="isSimulationMode" class="ml-2 text-lg font-normal opacity-90">/ Live Racing</span>
              </h2>
              <!-- Show live updates text only in simulation mode -->
              <p v-if="isSimulationMode" class="text-text-inverse opacity-80 text-base mt-2">{{ $t('races.liveUpdates') }}</p>
              
              <!-- View toggle moved below headline -->
              <div class="flex bg-black bg-opacity-20 rounded-lg p-1 mt-4">
                <button
                  @click="currentView = 'races'"
                  class="px-4 py-2 text-base rounded-md transition-colors"
                  :class="currentView === 'races'
                    ? 'bg-white text-brand-primary font-medium'
                    : 'text-white text-opacity-80 hover:bg-black hover:bg-opacity-20'"
                  :aria-label="$t('views.nextFive')"
                >
                  {{ $t('views.nextFive') }}
                </button>
                <button
                  @click="currentView = 'meetings'"
                  class="px-4 py-2 text-base rounded-md transition-colors"
                  :class="currentView === 'meetings'
                    ? 'bg-white text-brand-primary font-medium'
                    : 'text-white text-opacity-80 hover:bg-black hover:bg-opacity-20'"
                  :aria-label="$t('views.meetings')"
                >
                  {{ $t('views.meetings') }}
                </button>
              </div>
            </div>
            <!-- Simulation toggle button with enhanced glass effect -->
            <button
              @click="toggleSimulation"
              class="mt-6 md:mt-0 px-5 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary backdrop-blur-md bg-brand-primary bg-opacity-20 border border-brand-primary border-opacity-30 flex items-center justify-center hover:bg-opacity-30 hover:border-opacity-40 text-lg"
              :aria-pressed="isSimulationMode"
              :aria-label="isSimulationMode ? 'Switch to API mode' : 'Start simulation mode'"
            >
              <span v-if="!isSimulationMode" class="mr-2 text-xl">▶️</span>
              <span v-if="isSimulationMode">API Mode</span>
              <span v-else>Start Simulation</span>
            </button>
          </div>
        </div>

        <!-- Control Bar -->
        <ControlBar />

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
        Racing data provided by Neds API.
        <span v-if="isSimulationMode">Non-race data simulated.</span>
      </p>
    </footer>
  </div>
</template>