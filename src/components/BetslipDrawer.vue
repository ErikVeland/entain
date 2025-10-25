<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 overflow-hidden"
    aria-labelledby="betslip-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="closeDrawer"
    ></div>
    
    <!-- Drawer panel -->
    <div 
      ref="drawerPanel"
      class="absolute inset-y-0 right-0 max-w-full flex"
      :class="isMobile ? 'w-full' : 'w-[360px]'"
    >
      <div 
        class="w-full h-full bg-surface-raised shadow-card flex flex-col focus:outline-none"
        :class="isMobile ? 'rounded-t-xl2' : ''"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-brand-primary text-text-inverse">
          <h2 id="betslip-title" class="text-lg font-bold">Betslip</h2>
          <div class="flex items-center space-x-2">
            <button 
              v-if="!isMobile"
              @click="toggleCollapse"
              class="p-1 rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white"
              :aria-label="isCollapsed ? 'Expand betslip' : 'Collapse betslip'"
            >
              <span v-if="isCollapsed">▼</span>
              <span v-else>▲</span>
            </button>
            <button 
              @click="closeDrawer"
              class="p-1 rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close betslip"
            >
              ✕
            </button>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="flex border-b border-surface">
          <button
            @click="activeTab = 'betslip'"
            class="flex-1 px-4 py-3 text-center font-medium relative"
            :class="activeTab === 'betslip' ? 'text-brand-primary font-bold' : 'text-text-muted'"
            :aria-selected="activeTab === 'betslip'"
            role="tab"
          >
            Betslip
            <span 
              v-if="betslipSelections.length > 0"
              class="ml-1 bg-brand-primary text-text-inverse text-xs rounded-full px-2 py-0.5"
            >
              {{ betslipSelections.length }}
            </span>
            <div 
              v-if="activeTab === 'betslip'" 
              class="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary"
            ></div>
          </button>
          <button
            @click="activeTab = 'pending'"
            class="flex-1 px-4 py-3 text-center font-medium relative"
            :class="activeTab === 'pending' ? 'text-brand-primary font-bold' : 'text-text-muted'"
            :aria-selected="activeTab === 'pending'"
            role="tab"
          >
            Pending Bets
            <span 
              v-if="pendingBets.length > 0"
              class="ml-1 bg-brand-primary text-text-inverse text-xs rounded-full px-2 py-0.5"
            >
              {{ pendingBets.length }}
            </span>
            <div 
              v-if="activeTab === 'pending'" 
              class="absolute bottom-0 left-1/2 right-0 h-1 bg-brand-primary"
            ></div>
          </button>
        </div>
        
        <!-- Body -->
        <div class="flex-1 overflow-y-auto">
          <!-- Betslip Tab -->
          <div v-if="activeTab === 'betslip'" class="p-4">
            <div class="mb-4">
              <h3 class="font-bold text-text-base">Singles ({{ betslipSelections.length }})</h3>
            </div>
            
            <!-- Empty state -->
            <div 
              v-if="betslipSelections.length === 0" 
              class="text-center py-8 text-text-muted"
            >
              <p>No selections yet. Click any odds to add a bet.</p>
            </div>
            
            <!-- Selection cards -->
            <div v-else class="space-y-3">
              <div 
                v-for="selection in betslipSelections" 
                :key="selection.id"
                class="bg-surface rounded-xl2 p-4 shadow-card"
              >
                <!-- Selection identity -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-start">
                    <div 
                      class="w-6 h-6 rounded-sm mr-2 flex-shrink-0" 
                      :class="selection.silkColor"
                    ></div>
                    <div>
                      <div class="font-bold text-text-base">{{ selection.runner.number }}. {{ selection.runner.name }}</div>
                      <div class="text-sm text-text-muted">{{ selection.meetingName }} R{{ selection.raceNumber }}</div>
                    </div>
                  </div>
                  <div 
                    class="px-3 py-1 rounded-full bg-surface-sunken text-text-base font-medium"
                    :class="{
                      'animate-flash-green': selection.oddsTrend === 'up',
                      'animate-flash-red': selection.oddsTrend === 'down'
                    }"
                  >
                    {{ formatOdds(selection.odds) }}
                    <span v-if="selection.oddsTrend === 'up'" class="text-success">▲</span>
                    <span v-else-if="selection.oddsTrend === 'down'" class="text-danger">▼</span>
                  </div>
                </div>
                
                <!-- Market toggle -->
                <div class="mb-3">
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      @click="updateSelection(selection.id, { market: 'WIN' })"
                      class="py-2 text-sm rounded-lg transition-colors"
                      :class="selection.market === 'WIN' 
                        ? 'bg-brand-primary text-text-inverse font-bold' 
                        : 'bg-surface-sunken text-text-base border border-surface'"
                      aria-label="Win bet - Bet to finish 1st"
                    >
                      Win
                    </button>
                    <button
                      @click="updateSelection(selection.id, { market: 'PLACE' })"
                      class="py-2 text-sm rounded-lg transition-colors"
                      :class="selection.market === 'PLACE' 
                        ? 'bg-brand-primary text-text-inverse font-bold' 
                        : 'bg-surface-sunken text-text-base border border-surface'"
                      aria-label="Place bet - Bet to finish in top X (varies by field size/code)"
                    >
                      Place
                    </button>
                    <button
                      @click="updateSelection(selection.id, { market: 'EACH_WAY' })"
                      class="py-2 text-sm rounded-lg transition-colors"
                      :class="selection.market === 'EACH_WAY' 
                        ? 'bg-brand-primary text-text-inverse font-bold' 
                        : 'bg-surface-sunken text-text-base border border-surface'"
                      aria-label="Each Way bet - Half stake Win + half stake Place"
                    >
                      Each Way
                    </button>
                  </div>
                </div>
                
                <!-- Stake input -->
                <div class="mb-2">
                  <label :for="`stake-${selection.id}`" class="block text-sm text-text-base mb-1">
                    Stake
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-base">$</span>
                    <input
                      :id="`stake-${selection.id}`"
                      type="number"
                      v-model.number="selection.stake"
                      min="0.10"
                      step="0.10"
                      placeholder="0.00"
                      class="w-full pl-8 pr-4 py-2 bg-surface-sunken text-text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      :class="{
                        'border border-danger': hasInsufficientFunds(selection) || isMarketClosed(selection)
                      }"
                      :disabled="isMarketClosed(selection)"
                      @input="updateEstimatedReturn(selection)"
                    >
                  </div>
                  <div 
                    v-if="hasInsufficientFunds(selection)" 
                    class="text-danger text-xs mt-1"
                  >
                    Insufficient credits
                  </div>
                  <div 
                    v-else-if="isMarketClosed(selection)" 
                    class="text-danger text-xs mt-1"
                  >
                    Market closed
                  </div>
                </div>
                
                <!-- Estimated return -->
                <div class="flex justify-between items-center">
                  <span class="text-text-base">Est. Return:</span>
                  <span class="text-success font-medium">${{ selection.estimatedReturn.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pending Bets Tab -->
          <div v-else class="p-4">
            <!-- Empty state -->
            <div 
              v-if="pendingBets.length === 0" 
              class="text-center py-8 text-text-muted"
            >
              <p>No pending bets.</p>
            </div>
            
            <!-- Pending bet cards -->
            <div v-else class="space-y-3">
              <div 
                v-for="bet in pendingBets" 
                :key="bet.id"
                class="bg-surface rounded-xl2 p-4 shadow-card"
              >
                <!-- Selection identity -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-start">
                    <div 
                      class="w-6 h-6 rounded-sm mr-2 flex-shrink-0" 
                      :class="getSilkColor(bet)"
                    ></div>
                    <div>
                      <div class="font-bold text-text-base">{{ bet.runnerNumber }}. {{ bet.runnerName }}</div>
                      <div class="text-sm text-text-muted">{{ bet.meetingName }} R{{ bet.raceNumber }}</div>
                    </div>
                  </div>
                  <div 
                    class="px-3 py-1 rounded-full text-text-inverse text-sm font-medium"
                    :class="getBetStatusClass(bet)"
                  >
                    {{ bet.status }}
                  </div>
                </div>
                
                <!-- Bet details -->
                <div class="mb-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-text-muted">Stake:</span>
                    <span class="text-text-base">${{ bet.stake.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">Odds:</span>
                    <span class="text-text-base">{{ formatOdds(bet.odds) }}</span>
                  </div>
                  <div v-if="bet.payout !== undefined" class="flex justify-between">
                    <span class="text-text-muted">Payout:</span>
                    <span class="text-text-base">${{ bet.payout.toFixed(2) }}</span>
                  </div>
                  <div v-if="bet.profit !== undefined" class="flex justify-between">
                    <span class="text-text-muted">Profit:</span>
                    <span 
                      class="font-medium"
                      :class="bet.profit >= 0 ? 'text-success' : 'text-danger'"
                    >
                      ${{ bet.profit.toFixed(2) }}
                    </span>
                  </div>
                </div>
                
                <!-- Cancel button -->
                <div class="flex justify-end">
                  <button
                    v-if="canCancelBet(bet)"
                    @click="cancelBet(bet.id)"
                    class="text-danger text-sm hover:underline focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div 
          v-if="activeTab === 'betslip' && betslipSelections.length > 0"
          class="border-t border-surface p-4"
          :class="isMobile ? 'pb-8' : ''"
        >
          <!-- Totals -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-1">
              <span class="text-text-muted">Total Stake:</span>
              <span class="font-bold text-text-base">${{ totalStake.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-text-muted">Est. Return:</span>
              <span class="font-bold text-success">${{ totalEstimatedReturn.toFixed(2) }}</span>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div 
            class="flex"
            :class="isMobile ? 'flex-col space-y-2' : 'space-x-2'"
          >
            <button
              @click="clearSelections"
              class="flex-1 py-3 px-4 bg-surface-sunken text-text-base rounded-lg font-medium hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              Clear
            </button>
            <button
              @click="placeBets"
              :disabled="!canPlaceBets"
              class="flex-1 py-3 px-4 bg-brand-primary text-text-inverse rounded-lg font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isMobile ? '' : 'min-w-[120px]'"
            >
              Place Bets
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBetsStore } from '../stores/bets'
import { useRacesStore } from '../stores/races'
import { CATEGORY_IDS } from '../stores/races'

interface BetslipSelection {
  id: string
  raceId: string
  raceNumber: number
  meetingName: string
  runner: {
    id: string
    number: number
    name: string
    odds: number | 'SP'
  }
  silkColor: string
  odds: number | 'SP'
  oddsTrend: 'up' | 'down' | 'none'
  market: 'WIN' | 'PLACE' | 'EACH_WAY'
  stake: number
  estimatedReturn: number
  advertisedStartMs: number
}

interface PendingBet {
  id: string
  raceId: string
  raceNumber: number
  meetingName: string
  runnerName: string
  runnerNumber: number
  odds: number | 'SP'
  stake: number
  status: 'PENDING' | 'WON' | 'LOST' | 'SETTLED_PARTIAL'
  payout?: number
  profit?: number
  advertisedStartMs: number
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:isOpen', value: boolean): void
}>()

const betsStore = useBetsStore()
const racesStore = useRacesStore()

// State
const activeTab = ref<'betslip' | 'pending'>('betslip')
const isCollapsed = ref(false)
const drawerPanel = ref<HTMLElement | null>(null)
const isMobile = ref(false)

// Betslip selections
const betslipSelections = ref<BetslipSelection[]>([])

// Handle adding a selection to the betslip
const addToBetslip = (payload: { race: any; runner: any }) => {
  const { race, runner } = payload
  
  // Check if this selection already exists
  const existingIndex = betslipSelections.value.findIndex(
    s => s.raceId === race.id && s.runner.id === runner.id
  )
  
  if (existingIndex !== -1) {
    // Selection already exists, focus on it or update it
    console.log('Selection already exists')
    return
  }
  
  // Parse odds - convert string to number or 'SP'
  let odds: number | 'SP' = 'SP'
  if (runner.odds !== 'SP') {
    const parsedOdds = parseFloat(runner.odds)
    if (!isNaN(parsedOdds)) {
      odds = parsedOdds
    }
  }
  
  // Create new selection
  const newSelection: BetslipSelection = {
    id: `${race.id}-${runner.id}`,
    raceId: race.id,
    raceNumber: race.race_number,
    meetingName: race.meeting_name,
    runner: {
      id: runner.id,
      number: runner.number,
      name: runner.name,
      odds: odds
    },
    silkColor: runner.silkColor || 'bg-blue-500',
    odds: odds,
    oddsTrend: runner.oddsTrend || 'none',
    market: 'WIN',
    stake: 0,
    estimatedReturn: 0,
    advertisedStartMs: race.advertised_start_ms
  }
  
  // Add to selections
  betslipSelections.value.push(newSelection)
  
  // Open the drawer if it's not already open
  if (!props.isOpen) {
    emit('update:isOpen', true)
  }
  
  // Switch to betslip tab
  activeTab.value = 'betslip'
}

// Check if market is closed (race at or past jump time)
const isMarketClosed = (selection: BetslipSelection) => {
  return Date.now() >= selection.advertisedStartMs
}

// Check if user has insufficient funds for this selection
const hasInsufficientFunds = (selection: BetslipSelection) => {
  return selection.stake > betsStore.bankroll.balance
}

// Format odds for display
const formatOdds = (odds: number | 'SP') => {
  return odds === 'SP' ? 'SP' : odds.toFixed(2)
}

// Calculate estimated return for a selection
const calculateEstimatedReturn = (selection: BetslipSelection) => {
  if (selection.stake <= 0) return 0
  
  const odds = selection.odds === 'SP' ? 6.0 : selection.odds
  
  // Determine place odds factor based on category
  let placeFactor = 0.25 // Default for horse and harness
  if (getRaceCategory(selection.raceId) === CATEGORY_IDS.GREYHOUND) {
    placeFactor = 0.33 // Greyhound factor
  }
  
  switch (selection.market) {
    case 'WIN':
      return selection.stake * odds
    case 'PLACE':
      // Place odds calculation
      const placeOdds = 1 + placeFactor * (odds - 1)
      return selection.stake * placeOdds
    case 'EACH_WAY':
      // Each way: half stake on win, half on place
      const winPart = (selection.stake / 2) * odds
      const placeOddsEW = 1 + placeFactor * (odds - 1)
      const placePart = (selection.stake / 2) * placeOddsEW
      return winPart + placePart
    default:
      return 0
  }
}

// Get race category by race ID
const getRaceCategory = (raceId: string) => {
  const race = racesStore.races.find(r => r.id === raceId)
  return race ? race.category_id : CATEGORY_IDS.HORSE // Default to horse
}

// Update estimated return for a selection
const updateEstimatedReturn = (selection: BetslipSelection) => {
  selection.estimatedReturn = calculateEstimatedReturn(selection)
}

// Total stake for all selections
const totalStake = computed(() => {
  return betslipSelections.value.reduce((sum, selection) => sum + selection.stake, 0)
})

// Total estimated return for all selections
const totalEstimatedReturn = computed(() => {
  return betslipSelections.value.reduce((sum, selection) => sum + selection.estimatedReturn, 0)
})

// Check if we can place bets
const canPlaceBets = computed(() => {
  if (betslipSelections.value.length === 0) return false
  
  return betslipSelections.value.every(selection => {
    return (
      selection.stake >= 0.10 &&
      selection.stake <= betsStore.bankroll.balance &&
      !isMarketClosed(selection)
    )
  })
})

// Get pending bets from store
const pendingBets = computed<PendingBet[]>(() => {
  return betsStore.pendingBets.map(bet => {
    // Map single bet
    if (bet.type === 'WIN' || bet.type === 'PLACE' || bet.type === 'EACH_WAY') {
      return {
        id: bet.betId,
        raceId: bet.leg.raceId,
        raceNumber: bet.leg.raceId.includes('R') ? parseInt(bet.leg.raceId.split('R')[1]) || 1 : 1,
        meetingName: 'Meeting', // Would come from race data
        runnerName: bet.leg.selectionName,
        runnerNumber: 1, // Would come from runner data
        odds: bet.leg.oddsDecimalAtPlacement,
        stake: bet.stake,
        status: bet.status === 'VOID' ? 'LOST' : bet.status,
        advertisedStartMs: Date.now() + 300000 // Would come from race data
      }
    }
    
    // Default fallback
    return {
      id: bet.betId,
      raceId: 'race-id',
      raceNumber: 1,
      meetingName: 'Meeting',
      runnerName: 'Runner',
      runnerNumber: 1,
      odds: typeof bet.type === 'string' && bet.type.includes('WIN') ? 2.0 : 1.0,
      stake: bet.stake,
      status: bet.status === 'VOID' ? 'LOST' : bet.status,
      advertisedStartMs: Date.now() + 300000
    }
  })
})

// Get silk color for pending bet
const getSilkColor = (bet: PendingBet) => {
  // Would be based on actual runner data
  return 'bg-blue-500'
}

// Get status class for pending bet
const getBetStatusClass = (bet: PendingBet) => {
  switch (bet.status) {
    case 'WON':
      return 'bg-success'
    case 'LOST':
      return 'bg-danger'
    case 'SETTLED_PARTIAL':
      return 'bg-warning'
    default:
      return 'bg-brand-primary'
  }
}

// Check if we can cancel a bet
const canCancelBet = (bet: PendingBet) => {
  // Can only cancel if market is still open (before advertised start time)
  return Date.now() < bet.advertisedStartMs && bet.status === 'PENDING'
}

// Update a selection
const updateSelection = (id: string, updates: Partial<BetslipSelection>) => {
  const selection = betslipSelections.value.find(s => s.id === id)
  if (selection) {
    Object.assign(selection, updates)
    updateEstimatedReturn(selection)
  }
}

// Clear all selections
const clearSelections = () => {
  betslipSelections.value = []
}

// Place all bets
const placeBets = () => {
  if (!canPlaceBets.value) return
  
  // Place each bet using the betting engine
  betslipSelections.value.forEach(selection => {
    try {
      // Place the bet with the betting engine
      betsStore.placeBet(
        selection.raceId,
        selection.runner.id,
        selection.stake,
        selection.odds
      )
    } catch (error) {
      console.error('Error placing bet:', error)
    }
  })
  
  // Clear selections after placing
  clearSelections()
  
  // Show success toast (would be implemented with a toast library)
  console.log(`Placed ${betslipSelections.value.length} bet(s) · Total Stake $${totalStake.value.toFixed(2)}`)
}

// Cancel a bet
const cancelBet = (betId: string) => {
  // In a real implementation, you would:
  // 1. Cancel the bet in the betting engine
  // 2. Return the stake to available balance
  // 3. Remove the bet from pending bets
  betsStore.cancelBet(betId)
}

// Close the drawer
const closeDrawer = () => {
  emit('update:isOpen', false)
  emit('close')
}

// Toggle collapse
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDrawer()
  }
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

// Focus trap
const trapFocus = (e: KeyboardEvent) => {
  if (e.key === 'Tab' && drawerPanel.value) {
    const focusableElements = drawerPanel.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

// Handle global add-to-betslip event
const handleAddToBetslipEvent = (event: Event) => {
  const customEvent = event as CustomEvent
  if (customEvent.detail) {
    addToBetslip(customEvent.detail)
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('keydown', trapFocus)
  window.addEventListener('resize', handleResize)
  window.addEventListener('add-to-betslip', handleAddToBetslipEvent)
  handleResize()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('keydown', trapFocus)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('add-to-betslip', handleAddToBetslipEvent)
})

// Watch for changes in pending bets
watch(() => betsStore.pendingBets, () => {
  // In a real implementation, you would update the UI when bets are settled
}, { deep: true })
</script>

<style scoped>
.animate-flash-green {
  animation: flash-green 1s;
}

.animate-flash-red {
  animation: flash-red 1s;
}

@keyframes flash-green {
  0% { background-color: rgba(22, 163, 74, 0.2); }
  50% { background-color: rgba(22, 163, 74, 0.5); }
  100% { background-color: transparent; }
}

@keyframes flash-red {
  0% { background-color: rgba(220, 38, 38, 0.2); }
  50% { background-color: rgba(220, 38, 38, 0.5); }
  100% { background-color: transparent; }
}
</style>