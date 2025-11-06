<template>
  <div v-if="betHistory.length === 0" class="text-center py-8">
    <div class="text-text-muted">No bet history yet</div>
  </div>
  
  <div v-else class="space-y-4">
    <div 
      v-for="record in betHistory" 
      :key="record.betId"
      class="bg-surface rounded-xl p-4 shadow-card"
    >
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1">
            <div class="w-4 h-4 rounded-sm mr-2 bg-brand-primary"></div>
            <h4 class="font-bold text-text-base truncate">
              Bet #{{ record.betId.slice(-6) }}
            </h4>
          </div>
          <p class="text-text-muted text-sm truncate">{{ record.type }} bet</p>
        </div>
        <div class="text-right ml-2">
          <div class="font-medium">${{ (record.stake / 100).toFixed(2) }}</div>
          <div class="text-xs text-text-muted">{{ record.type }}</div>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <span class="text-text-muted text-sm mr-2">Return:</span>
          <span 
            class="font-medium" 
            :class="record.result === 'WON' ? 'text-success' : 'text-danger'"
          >
            ${{ (record.payout / 100).toFixed(2) }}
          </span>
        </div>
        <div class="flex items-center">
          <span class="text-text-muted text-sm mr-2">P/L:</span>
          <span 
            class="font-medium" 
            :class="record.profitLoss >= 0 ? 'text-success' : 'text-danger'"
          >
            ${{ (record.profitLoss / 100).toFixed(2) }}
          </span>
        </div>
      </div>
      
      <div class="mt-2 pt-2 border-t border-surface">
        <div class="flex justify-between items-center">
          <span 
            class="px-2 py-1 text-xs rounded-full" 
            :class="record.result === 'WON' ? 'bg-success bg-opacity-20 text-success' : 'bg-danger bg-opacity-20 text-danger'"
          >
            {{ record.result === 'WON' ? 'Won' : record.result === 'VOID' ? 'Void' : 'Lost' }}
          </span>
          <span class="text-text-muted text-xs">{{ formatDate(record.settledAtMs) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettlementRecord } from '../../game/bettingSimulator'

const props = defineProps<{
  betHistory: SettlementRecord[]
}>()

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>