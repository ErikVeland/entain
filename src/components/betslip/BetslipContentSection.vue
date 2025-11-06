<template>
  <div class="p-4">
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
        <div class="flex justify-between mb-2">
          <span class="text-text-muted">Total Stake:</span>
          <span class="font-medium">{{ formatCurrency(totalStakeValue) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-text-muted">Estimated Return:</span>
          <span class="font-medium text-brand-primary">{{ formatCurrency(totalEstimatedReturnValue) }}</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="mt-6 flex space-x-3">
        <button
          @click="handleClear"
          class="flex-1 py-3 px-4 bg-surface text-text-base rounded-xl font-medium hover:bg-surface-hover transition-colors"
        >
          Clear
        </button>
        <button
          @click="handlePlaceBets"
          :disabled="!canPlaceBetsValue"
          class="flex-1 py-3 px-4 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Place Bets
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BetCard from '../BetCard.vue'
import type { BetSelection } from '../../types/betting'
import { formatCurrency } from '../../utils/formattingUtils'


const props = defineProps<{
  activeSelections: BetSelection[]
  placingBets: Record<string, boolean>
  totalStakeValue: number
  totalEstimatedReturnValue: number
  canPlaceBetsValue: boolean
}>()

const emit = defineEmits(['update-market', 'update-stake', 'remove', 'clear', 'place-bets'])

const handleUpdateMarket = (selectionId: string, market: 'win' | 'place' | 'each-way') => {
  // Emit the event to the parent component
  emit('update-market', selectionId, market)
}

const handleUpdateStake = (selectionId: string, stake: number) => {
  // Emit the event to the parent component
  emit('update-stake', selectionId, stake)
}

const handleRemoveSelection = (selectionId: string) => {
  // Emit the event to the parent component
  emit('remove', selectionId)
}

const handleClear = () => {
  // Emit the event to the parent component
  emit('clear')
}

const handlePlaceBets = () => {
  // Emit the event to the parent component
  emit('place-bets')
}
</script>

<style scoped>
/* Bet fly animation */
@keyframes betFly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(0, -100px) scale(0.8);
    opacity: 0;
  }
}

.bet-fly-animation {
  animation: betFly 0.5s ease-out forwards;
}
</style>