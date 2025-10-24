<template>
  <div class="space-y-4">
    <div 
      v-for="bet in bets" 
      :key="bet.id"
      class="bg-surface rounded-xl p-4 shadow-card"
      role="region"
      :aria-labelledby="`bet-title-${bet.id}`"
    >
      <!-- Selection identity -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1">
            <!-- Category icon or silks -->
            <div class="w-4 h-4 rounded-sm mr-2 bg-brand-primary"></div>
            <h4 
  :id="`bet-title-${bet.id}`"
  class="font-bold text-text-base truncate"
>
  Runner Name
</h4>
          </div>
          <p class="text-text-muted text-sm truncate">Meeting Name R1</p>
        </div>
        <div class="flex items-center space-x-2 ml-2">
          <!-- Status badge -->
          <span class="px-2 py-1 bg-warning bg-opacity-20 text-warning text-xs font-medium rounded-full">
            Pending
          </span>
        </div>
      </div>
      
      <!-- Bet details -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p class="text-text-muted text-xs">Stake</p>
          <p class="text-text-base font-medium">${{ (bet.amount / 100).toFixed(2) }}</p>
        </div>
        <div>
          <p class="text-text-muted text-xs">Odds</p>
          <p class="text-text-base font-medium">{{ formatOdds(bet.odds) }}</p>
        </div>
      </div>
      
      <!-- Cancel button -->
      <button
        @click="cancelBet(bet.id)"
        class="w-full py-2 text-center text-text-muted text-sm hover:text-danger hover:underline focus:outline-none"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBetsStore } from '../stores/bets'
import { type Bet } from '../game/bettingSimulator'

const props = defineProps<{
  bets: Bet[]
}>()

const betsStore = useBetsStore()

// Methods
const formatOdds = (odds: number | 'SP') => {
  return odds === 'SP' ? 'SP' : odds.toFixed(2)
}

const cancelBet = (betId: string) => {
  betsStore.cancelBet(betId)
}
</script>