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
                  @update-market="updateSelectionMarket"
                  @update-stake="updateSelectionStake"
                  @remove="removeSelection"
                />
              </div>
              
              <!-- Totals -->
              <div class="mt-6 pt-4 border-t border-surface">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-text-muted">Total Stake:</span>
                  <span class="font-medium">${{ (totalStake / 100).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-text-muted">Est. Return:</span>
                  <span class="font-medium text-success">${{ (totalEstimatedReturn / 100).toFixed(2) }}</span>
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
                  :disabled="!canPlaceBets"
                  class="flex-1 py-2 px-4 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  Place Bets
                </button>
              </div>
            </div>
          </div>
          
          <!-- Pending bets tab -->
          <div v-if="activeTab === 'pending'" class="p-4">
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
import BetCard from './BetCard.vue'
import PendingBetsList from './PendingBetsList.vue'

const betsStore = useBetsStore()
const {
  activeSelections,
  totalStake,
  totalEstimatedReturn,
  canPlaceBets,
  updateSelectionMarket,
  updateSelectionStake,
  removeSelection,
  clearSelections,
  placeSelections
} = useBettingLogic()

// State
const isOpen = ref(false)
const activeTab = ref<'betslip' | 'pending'>('betslip')
const isMobile = ref(false)

// Computed
const pendingBets = computed(() => betsStore.pendingBets)

// Methods
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

const placeBets = () => {
  // Capture the values before placing bets since placeSelections() will clear them
  const selectionCount = activeSelections.value.length
  const stakeAmount = totalStake.value
  
  if (placeSelections()) {
    // Show success message with captured values
    alert(`Bets placed. Good luck!`)
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
    useBettingLogic().addSelection({
      raceId: raceId,
      raceName: runner.raceName || 'Unknown Race',
      raceNumber: runner.raceNumber || 1,
      runnerId: runner.id,
      runnerNumber: runner.number,
      runnerName: runner.name,
      odds,
      market: 'win',
      stake: 0
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
/* Add any additional styles if needed */
</style>