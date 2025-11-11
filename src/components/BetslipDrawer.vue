<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBettingLogic } from '../composables/useBettingLogic'
import { useBetsStore } from '../stores/bets'
import { useRacesStore } from '../stores/races'
import { useBettingFeedback } from '../composables/useBettingFeedback'
import { eventManager } from '../utils/eventManager'
import BetslipTabsSection from './betslip/BetslipTabsSection.vue'
import BetslipContentSection from './betslip/BetslipContentSection.vue'
import PendingBetsContentSection from './betslip/PendingBetsContentSection.vue'
import BetHistoryContentSection from './betslip/BetHistoryContentSection.vue'

// Define the BetSelection type
interface BetSelection {
  id: string
  raceId: string
  raceName: string
  raceNumber: number
  runnerId: string
  runnerNumber: number
  runnerName: string
  odds: number | 'SP'
  market: 'win' | 'place' | 'each-way'
  stake: number
  estimatedReturn: number
}

const betsStore = useBetsStore()
const racesStore = useRacesStore()
const { initAudio, playSuccessSound, playErrorSound, showToast } = useBettingFeedback()
const {
  activeBets,
  totalStake,
  bankroll,
  placeBet,
  cancelBet,
  settleRace,
  calculateEstimatedReturn,
  canPlaceBets
} = useBettingLogic()

// State for betslip selections (stored in memory, not in the store)
const betslipSelections = ref<BetSelection[]>([])

// Track stake inputs separately to enable real-time validation
const stakeInputs = ref<Record<string, number>>({})

// State
const isOpen = ref(false)
const activeTab = ref<'betslip' | 'pending' | 'history'>('betslip')
const isMobile = ref(false)

// Track which bets are being placed with animation
const placingBets = ref<Record<string, boolean>>({})

// Bet history state
const betHistory = ref<any[]>([])

// Computed
const pendingBets = computed(() => {
  // This should return the pending bets from the store
  // Since we can't directly access the engine, we'll return an empty array for now
  // This would need to be implemented properly in the store
  return []
})

const activeSelections = computed(() => betslipSelections.value)

const totalStakeValue = computed(() => {
  return betslipSelections.value.reduce((sum: number, selection: BetSelection) => {
    const stake = isNaN(selection.stake) ? 0 : selection.stake
    return sum + stake
  }, 0)
})

const totalEstimatedReturnValue = computed(() => {
  return betslipSelections.value.reduce((sum: number, selection: BetSelection) => {
    // Ensure stake is a valid number
    const stake = isNaN(selection.stake) ? 0 : selection.stake
    
    // Handle odds conversion
    let numericOdds
    if (selection.odds === 'SP') {
      numericOdds = 6.0
    } else if (typeof selection.odds === 'number') {
      numericOdds = selection.odds
    } else {
      const parsedOdds = parseFloat(String(selection.odds))
      numericOdds = isNaN(parsedOdds) ? 6.0 : parsedOdds
    }
    
    // Handle invalid odds
    if (isNaN(numericOdds) || numericOdds <= 0) {
      numericOdds = 6.0 // Default to SP odds
    }
    
    return sum + (stake * numericOdds)
  }, 0)
})

const canPlaceBetsValue = computed(() => {
  const result = betslipSelections.value.length > 0 && betslipSelections.value.some((s: BetSelection) => {
    const stake = isNaN(s.stake) ? 0 : s.stake
    return stake > 0
  })
  return result
})

// Add a new computed property to track if any selections have invalid stakes
const hasValidStakes = computed(() => {
  return betslipSelections.value.every((s: BetSelection) => {
    const stake = isNaN(s.stake) ? 0 : s.stake
    return stake >= 0 // Allow 0 stake, but must be a valid number
  })
})

// Handle Enter key press in the betslip drawer
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // If we're in the betslip tab and there are valid bets, place them
    if (activeTab.value === 'betslip' && canPlaceBetsValue.value) {
      placeBets()
    }
  }
}

// Methods for betslip management
const addSelection = (selection: Omit<BetSelection, 'id' | 'estimatedReturn' | 'stake'>) => {
  const newSelection: BetSelection = {
    ...selection,
    id: `${selection.raceId}-${selection.runnerId}`,
    stake: 0,
    estimatedReturn: 0
  }
  
  // Check if selection already exists
  const existingIndex = betslipSelections.value.findIndex(
    s => s.raceId === selection.raceId && s.runnerId === selection.runnerId
  )
  
  if (existingIndex >= 0) {
    // Update existing selection
    betslipSelections.value[existingIndex] = newSelection
  } else {
    // Add new selection
    betslipSelections.value.push(newSelection)
  }
}

const handleUpdateMarket = (selectionId: string, market: 'win' | 'place' | 'each-way') => {
  const selection = betslipSelections.value.find(s => s.id === selectionId)
  if (selection) {
    selection.market = market
    selection.estimatedReturn = calculateEstimatedReturn(selection.stake, selection.odds, market)
  }
}

const handleUpdateStake = (selectionId: string, stake: number) => {
  // Update the stake input tracking
  stakeInputs.value[selectionId] = stake
  
  const selection = betslipSelections.value.find(s => s.id === selectionId)
  if (selection) {
    selection.stake = stake
    selection.estimatedReturn = calculateEstimatedReturn(stake, selection.odds, selection.market)
  }
}

const handleRemoveSelection = (selectionId: string) => {
  betslipSelections.value = betslipSelections.value.filter(s => s.id === selectionId)
}

const clearSelections = () => {
  betslipSelections.value = []
}

const placeBets = () => {
  console.log('BetslipDrawer: placeBets called with selections', betslipSelections.value);
  
  if (betslipSelections.value.length === 0 || !hasValidStakes.value) {
    playErrorSound()
    showToast('Please add at least one bet with a valid stake', 'error')
    console.log('BetslipDrawer: No valid selections to place');
    return
  }
  
  // Mark all selections as being placed for animation
  betslipSelections.value.forEach((selection: BetSelection) => {
    placingBets.value[selection.id] = true
  })
  
  // Switch to pending bets tab to show the animation
  activeTab.value = 'pending'
  
  // Play success sound when placing bets
  playSuccessSound()
  
  // Place each selection as a bet with a slight delay for animation
  let totalStake = 0
  const placedBets: any[] = []
  
  betslipSelections.value.forEach((selection: BetSelection, index: number) => {
    // Add a small delay for each bet to create a sequential animation effect
    setTimeout(() => {
      // Ensure stake is a valid number
      const stake = isNaN(selection.stake) ? 0 : selection.stake
      
      if (stake > 0) {
        totalStake += stake
        // Find the race to get the advertised start time
        const race = racesStore.races.find(r => r.id === selection.raceId)
        const advertisedStartMs = race ? race.advertised_start_ms : undefined
        
        try {
          // Get the categoryId from the race
          const race = racesStore.races.find(r => r.id === selection.raceId)
          const categoryId = race ? race.category_id : undefined
          
          console.log('BetslipDrawer: Placing bet with data', {
            raceId: selection.raceId,
            runnerId: selection.runnerId,
            stake,
            odds: selection.odds,
            advertisedStartMs,
            raceName: selection.raceName,
            raceNumber: selection.raceNumber,
            runnerName: selection.runnerName,
            categoryId
          });
          
          const betId = betsStore.placeBet(
            selection.raceId,
            selection.runnerId,
            stake,
            selection.odds,
            advertisedStartMs,
            selection.raceName,
            selection.raceNumber,
            selection.runnerName,
            categoryId
          )
          
          console.log('BetslipDrawer: Bet placed successfully with ID', betId);
          
          // Add to placed bets for history tracking
          placedBets.push({
            id: betId,
            raceId: selection.raceId,
            raceName: selection.raceName,
            raceNumber: selection.raceNumber,
            runnerId: selection.runnerId,
            runnerNumber: selection.runnerNumber,
            runnerName: selection.runnerName,
            odds: selection.odds,
            market: selection.market,
            stake: stake,
            timestamp: Date.now()
          })
          
          // Remove the selection from the placing animation tracking
          delete placingBets.value[selection.id]
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('BetslipDrawer: Error placing bet', errorMessage);
          // Show error in a more user-friendly way
          playErrorSound()
          showToast(`Error placing bet: ${errorMessage}`, 'error')
          // Remove the selection from the placing animation tracking
          delete placingBets.value[selection.id]
        }
      } else {
        console.log('BetslipDrawer: Skipping bet with zero stake');
        // Remove the selection from the placing animation tracking
        delete placingBets.value[selection.id]
      }
    }, index * 200) // 200ms delay between each bet placement
  })
  
  // Add placed bets to history after a delay
  setTimeout(() => {
    betHistory.value = [...betHistory.value, ...placedBets]
    console.log('BetslipDrawer: Updated bet history with', placedBets.length, 'new bets');
  }, betslipSelections.value.length * 200 + 1000)
  
  // Show success message
  showToast(`Bets placed successfully! Total stake: $${(totalStake / 100).toFixed(2)}`, 'success')
  console.log('BetslipDrawer: Bets placed successfully, total stake:', totalStake);
  
  // Clear selections after placing (but keep the animation tracking)
  setTimeout(() => {
    clearSelections()
    console.log('BetslipDrawer: Cleared selections after placing bets');
  }, betslipSelections.value.length * 200 + 500)
}

// Methods for drawer
const toggleDrawer = () => {
  isOpen.value = !isOpen.value
  console.log('Betslip drawer toggled, new state:', isOpen.value);
  if (isOpen.value) {
    // Focus the first focusable element when opening
    setTimeout(() => {
      const firstFocusable = document.querySelector('.fixed inset-0 z-40 button') as HTMLElement
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }, 100)
  }
}

const closeDrawer = () => {
  console.log('Betslip drawer closing');
  isOpen.value = false
  // Return focus to the element that opened the drawer
  const openButton = document.querySelector('[aria-label="Open betslip"]') as HTMLElement
  if (openButton) {
    openButton.focus()
  }
}

// Check screen size
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeDrawer()
  }
}

// Focus trap
const trapFocus = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

// Handle opening betslip with runner data
const handleOpenBetslip = (event: CustomEvent) => {
  console.log('BetslipDrawer received open-betslip event:', event.detail);
  const { race, runner } = event.detail
  const raceId = race?.id
  
  console.log('BetslipDrawer: Processing bet selection for race', race?.meeting_name, 'runner', runner?.name);
  
  // If runner data is provided, add it to the betslip
  if (runner) {
    // Convert odds to number or 'SP'
    let odds: number | 'SP' = 'SP'
    if (runner.odds !== 'SP') {
      const oddsNum = typeof runner.odds === 'number' ? runner.odds : parseFloat(runner.odds)
      if (!isNaN(oddsNum)) {
        odds = oddsNum
      }
    }
    
    console.log('BetslipDrawer: Adding selection with odds', odds);
    
    // Add to betslip
    addSelection({
      raceId: raceId,
      raceName: race?.meeting_name || runner.raceName || 'Unknown Race',
      raceNumber: race?.race_number || runner.raceNumber || 1,
      runnerId: runner.id,
      runnerNumber: runner.number,
      runnerName: runner.name,
      odds,
      market: 'win'
    })
  }
  
  // Open the drawer
  console.log('Opening betslip drawer');
  toggleDrawer()
}

// Store event listener IDs for cleanup
const eventListenerIds = ref<number[]>([])

// Lifecycle
onMounted(() => {
  console.log('BetslipDrawer mounted, setting up event listeners');
  checkScreenSize()
  eventListenerIds.value.push(
    eventManager.addEventListener(window, 'resize', checkScreenSize),
    eventManager.addEventListener(window, 'keydown', handleEscape),
    eventManager.addEventListener(window, 'keydown', trapFocus),
    eventManager.addEventListener(window, 'open-betslip', handleOpenBetslip as EventListener)
  )
  
  // Initialize audio for betting feedback
  initAudio()
})

onUnmounted(() => {
  // Remove all event listeners
  eventListenerIds.value.forEach(id => {
    eventManager.removeEventListener(id)
  })
  eventListenerIds.value = []
})

// Expose methods for parent components
defineExpose({
  toggleDrawer,
  closeDrawer
})
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-40 overflow-hidden"
    aria-labelledby="betslip-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="closeDrawer"
      aria-hidden="true"
    ></div>
    
    <!-- Drawer panel -->
    <div 
      class="absolute inset-y-0 right-0 max-w-full flex"
      :class="isMobile ? 'w-full' : 'w-96'"
    >
      <div 
        class="relative w-full h-full bg-surface-raised shadow-xl flex flex-col"
        :class="isMobile ? 'rounded-t-xl' : 'rounded-l-xl'"
        @keypress="handleKeyPress"
        tabindex="0"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-brand-primary rounded-t-xl">
          <h2 id="betslip-title" class="text-lg font-bold text-text-inverse">Betslip</h2>
          <div class="flex space-x-2">
            <button 
              @click="closeDrawer"
              class="p-1 text-text-inverse hover:text-opacity-75 focus:outline-none"
              aria-label="Close betslip"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <BetslipTabsSection
          :active-tab="activeTab"
          :selection-count="activeSelections.length"
          :pending-bets-count="pendingBets.length"
          :history-count="betHistory.length"
          @update:active-tab="activeTab = $event"
        />
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Betslip tab -->
          <div v-if="activeTab === 'betslip'">
            <BetslipContentSection
              :active-selections="activeSelections"
              :placing-bets="placingBets"
              :total-stake-value="totalStakeValue"
              :total-estimated-return-value="totalEstimatedReturnValue"
              :can-place-bets-value="canPlaceBetsValue"
              @update-market="handleUpdateMarket"
              @update-stake="handleUpdateStake"
              @remove="handleRemoveSelection"
              @clear="clearSelections"
              @place-bets="placeBets"
            />
          </div>
          
          <!-- Pending bets tab -->
          <div v-if="activeTab === 'pending'">
            <PendingBetsContentSection
              :placing-bets="placingBets"
              :pending-bets="pendingBets"
            />
          </div>
          
          <!-- Bet history tab -->
          <div v-if="activeTab === 'history'">
            <BetHistoryContentSection
              :bet-history="betHistory"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add animation for bet placement */
@keyframes betFly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-100px, -100px) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-200px, -200px) scale(0.5);
    opacity: 0;
  }
}

.bet-fly-animation {
  animation: betFly 0.8s ease-out forwards;
  position: relative;
  z-index: 10;
}

/* Success message animation */
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

.success-message {
  animation: fadeInOut 3s ease-in-out forwards;
}

/* Flash animations for betting feedback */
.flash {
  animation: flash-animation 1s;
}

.flash-green {
  background-color: rgba(76, 175, 80, 0.3) !important;
}

.flash-red {
  background-color: rgba(244, 67, 54, 0.3) !important;
}

.flash-blue {
  background-color: rgba(33, 150, 243, 0.3) !important;
}

.flash-yellow {
  background-color: rgba(255, 193, 7, 0.3) !important;
}

@keyframes flash-animation {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Add any additional styles if needed */
</style>