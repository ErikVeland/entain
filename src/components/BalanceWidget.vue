<template>
  <div 
    class="relative"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <div class="flex items-center bg-surface-sunken rounded-full px-3 py-1 text-text-base font-medium">
      <span class="mr-1">Credits:</span>
      <span class="font-bold">${{ bankroll.balance.toFixed(2) }}</span>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip"
      class="absolute right-0 mt-2 w-48 bg-surface-raised rounded-lg shadow-card p-3 z-10"
    >
      <div class="text-text-base text-sm space-y-1">
        <div class="flex justify-between">
          <span>Available:</span>
          <span class="font-medium">${{ bankroll.balance.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Locked:</span>
          <span class="font-medium">${{ bankroll.locked.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between border-t border-surface pt-1 mt-1">
          <span>Total:</span>
          <span class="font-bold">${{ (bankroll.balance + bankroll.locked).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBetsStore } from '../stores/bets'

const betsStore = useBetsStore()
const showTooltip = ref(false)

const bankroll = computed(() => {
  return betsStore.bankroll
})
</script>