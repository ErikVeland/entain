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
        <div class="flex border-b border-surface">
          <button
            @click="activeTab = 'betslip'"
            class="px-4 py-3 text-sm font-medium relative"
            :class="activeTab === 'betslip' ? 'text-brand-primary' : 'text-text-muted'"
            :aria-selected="activeTab === 'betslip'"
            role="tab"
          >
            Betslip
            <span 
              v-if="activeSelections.length > 0"
              class="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-primary bg-opacity-20 text-brand-primary"
            >
              {{ activeSelections.length }}
            </span>
            <div 
              v-if="activeTab === 'betslip'" 
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
            ></div>
          </button>
          <button
            @click="activeTab = 'pending'"
            class="px-4 py-3 text-sm font-medium relative"
            :class="activeTab === 'pending' ? 'text-brand-primary' : 'text-text-muted'"
            :aria-selected="activeTab === 'pending'"
            role="tab"
          >
            Pending Bets
            <span 
              v-if="pendingBets.length > 0"
              class="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-primary bg-opacity-20 text-brand-primary"
            >
              {{ pendingBets.length }}
            </span>
            <div 
              v-if="activeTab === 'pending'" 
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
            ></div>
          </button>
        </div>
        
        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Betslip tab -->
          <div v-if="activeTab === 'betslip'" class="p-4">
            <div v-if="activeSelections.length === 0" class="text-center py-8">
              <div class="text-text-muted mb-2">No selections yet. Click any odds to add a bet.</div>
              <p class="text-text-muted text-sm"></p>
            </div>
            
            <div v-else>
              <h3 class="font-medium text-text-base mb-4">Singles ({{ activeSelections.length }})</h3>
              
              <div class="space-y-4">
                <BetCard 
                  v-for="selection in activeSelections"
                  :key="selection.id"
                  :selection="selection"
                  :class="{ 'bet-fly-animation': placingBets[selection.id] }"
                  @update-market="handleUpdateMarket"
                  @update-stake="handleUpdateStake"
                  @remove="handleRemoveSelection"
                />
              </div>
              
              <!-- Totals -->
              <div class="mt-6 pt-4 border-t border-surface">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-text-muted">Total Stake:</span>
                  <span class="font-medium">${{ (totalStakeValue / 100).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Est. Return:</span>
                  <span class="font-medium text-success">${{ (totalEstimatedReturnValue / 100).toFixed(2) }}</span>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="mt-4 flex space-x-2">
                <button
                  @click="clearSelections"
                  class="flex-1 py-2 px-4 border border-surface text-text-base rounded-lg hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  Clear
                </button>
                <button
                  @click="placeBets"
                  :disabled="!canPlaceBetsValue"
                  class="flex-1 py-2 px-4 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  Place Bets
                </button>
              </div>
            </div>
          </div>
          
          <!-- Pending bets tab -->
          <div v-if="activeTab === 'pending'" class="p-4">
            <!-- Success message when bets are placed -->
            <div 
              v-if="Object.keys(placingBets).length > 0" 
              class="mb-4 p-3 bg-success bg-opacity-20 text-success rounded-lg text-center success-message"
            >
              Bets placed successfully! Good luck!
            </div>
            
            <div v-if="pendingBets.length === 0" class="text-center py-8">
              <div class="text-text-muted">No pending bets</div>
            </div>
            
            <div v-else class="space-y-4">
              <PendingBetsList :bets="pendingBets" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBettingLogic } from '../composables/useBettingLogic'
import { useBetsStore } from '../stores/bets'
import { useRacesStore } from '../stores/races'
import type { BetSelection } from '../stores/bets'
import BetCard from './BetCard.vue'
import PendingBetsList from './PendingBetsList.vue'

const betsStore = useBetsStore()
const racesStore = useRacesStore()
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
const activeTab = ref<'betslip' | 'pending'>('betslip')
const isMobile = ref(false)

// Track which bets are being placed with animation
const placingBets = ref<Record<string, boolean>>({})

// Computed
const pendingBets = computed(() => betsStore.pendingBets)
const activeSelections = computed(() => betslipSelections.value)
const totalStakeValue = computed(() => {
  return betslipSelections.value.reduce((sum, selection) => {
    const stake = isNaN(selection.stake) ? 0 : selection.stake
    return sum + stake
  }, 0)
})

const totalEstimatedReturnValue = computed(() => {
  return betslipSelections.value.reduce((sum, selection) => {
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
  const result = betslipSelections.value.length > 0 && betslipSelections.value.some(s => {
    const stake = isNaN(s.stake) ? 0 : s.stake
    return stake > 0
  })
  console.log('canPlaceBetsValue computed:', result, 'Selections length:', betslipSelections.value.length, 'Selections:', betslipSelections.value)
  return result
})

// Add a new computed property to track if any selections have invalid stakes
const hasValidStakes = computed(() => {
  return betslipSelections.value.every(s => {
    const stake = isNaN(s.stake) ? 0 : s.stake
    return stake >= 0 // Allow 0 stake, but must be a valid number
  })
})

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
  console.log('Place Bets button clicked!')
  console.log('Betslip selections:', betslipSelections.value)
  console.log('Has valid stakes:', hasValidStakes.value)
  
  if (betslipSelections.value.length === 0 || !hasValidStakes.value) {
    console.log('Cannot place bets - no selections or invalid stakes')
    return
  }
  
  // Mark all selections as being placed for animation
  betslipSelections.value.forEach(selection => {
    placingBets.value[selection.id] = true
  })
  
  // Switch to pending bets tab to show the animation
  activeTab.value = 'pending'
  
  // Place each selection as a bet with a slight delay for animation
  betslipSelections.value.forEach((selection, index) => {
    // Add a small delay for each bet to create a sequential animation effect
    setTimeout(() => {
      // Ensure stake is a valid number
      const stake = isNaN(selection.stake) ? 0 : selection.stake
      console.log('Processing selection:', selection, 'Stake:', stake)
      
      if (stake > 0) {
        // Find the race to get the advertised start time
        const race = racesStore.races.find(r => r.id === selection.raceId)
        const advertisedStartMs = race ? race.advertised_start_ms : undefined
        
        console.log('Race found:', race, 'Advertised start time:', advertisedStartMs)
        
        try {
          console.log('Attempting to place bet with parameters:', {
            raceId: selection.raceId,
            runnerId: selection.runnerId,
            stake: stake,
            odds: selection.odds,
            advertisedStartMs: advertisedStartMs
          })
          
          const result = betsStore.placeBet(
            selection.raceId,
            selection.runnerId,
            stake,
            selection.odds,
            advertisedStartMs
          )
          
          console.log('Bet placed successfully:', result)
          
          // Remove the selection from the placing animation tracking
          delete placingBets.value[selection.id]
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Error placing bet:', error)
          // Show error in a more user-friendly way
          alert(`Error placing bet: ${errorMessage}`)
          // Remove the selection from the placing animation tracking
          delete placingBets.value[selection.id]
        }
      } else {
        console.log('Skipping selection with zero or invalid stake')
        // Remove the selection from the placing animation tracking
        delete placingBets.value[selection.id]
      }
    }, index * 200) // 200ms delay between each bet placement
  })
  
  // Clear selections after placing (but keep the animation tracking)
  setTimeout(() => {
    clearSelections()
    console.log('Bets placed and selections cleared')
  }, betslipSelections.value.length * 200 + 500)
}

// Methods for drawer
const toggleDrawer = () => {
  isOpen.value = !isOpen.value
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
  const { raceId, runner } = event.detail
  
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
    
    // Add to betslip
    addSelection({
      raceId: raceId,
      raceName: runner.raceName || 'Unknown Race',
      raceNumber: runner.raceNumber || 1,
      runnerId: runner.id,
      runnerNumber: runner.number,
      runnerName: runner.name,
      odds,
      market: 'win'
    })
  }
  
  // Open the drawer
  toggleDrawer()
}

// Lifecycle
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('keydown', trapFocus)
  window.addEventListener('open-betslip', handleOpenBetslip as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('keydown', trapFocus)
  window.removeEventListener('open-betslip', handleOpenBetslip as EventListener)
})

// Expose methods for parent components
defineExpose({
  toggleDrawer,
  closeDrawer
})
</script>

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

/* Add any additional styles if needed */
</style>