<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBettingLogic } from '../composables/useBettingLogic'
import { useBetsStore } from '../stores/bets'
import { useRacesStore } from '../stores/races'
import { useBettingFeedback } from '../composables/useBettingFeedback'
import BetCard from './BetCard.vue'
import PendingBetsList from './PendingBetsList.vue'

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
  return betsStore.engine.listBets().filter(bet => bet.status === 'PENDING')
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
  if (betslipSelections.value.length === 0 || !hasValidStakes.value) {
    playErrorSound()
    showToast('Please add at least one bet with a valid stake', 'error')
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
          // Show error in a more user-friendly way
          playErrorSound()
          showToast(`Error placing bet: ${errorMessage}`, 'error')
          // Remove the selection from the placing animation tracking
          delete placingBets.value[selection.id]
        }
      } else {
        // Remove the selection from the placing animation tracking
        delete placingBets.value[selection.id]
      }
    }, index * 200) // 200ms delay between each bet placement
  })
  
  // Add placed bets to history after a delay
  setTimeout(() => {
    betHistory.value = [...betHistory.value, ...placedBets]
  }, betslipSelections.value.length * 200 + 1000)
  
  // Show success message
  showToast(`Bets placed successfully! Total stake: $${(totalStake / 100).toFixed(2)}`, 'success')
  
  // Clear selections after placing (but keep the animation tracking)
  setTimeout(() => {
    clearSelections()
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

// Lifecycle
onMounted(() => {
  console.log('BetslipDrawer mounted, setting up event listeners');
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('keydown', trapFocus)
  window.addEventListener('open-betslip', handleOpenBetslip as EventListener)
  
  // Initialize audio for betting feedback
  initAudio()
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