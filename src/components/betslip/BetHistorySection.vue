<template>
  <div>
    <div v-if="betHistory.length === 0" class="text-center py-8">
      <div class="text-text-muted">No bet history yet</div>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="bet in betHistory" 
        :key="bet.id"
        class="bg-surface rounded-xl p-4 shadow-card"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center mb-1">
              <div class="w-4 h-4 rounded-sm mr-2 bg-brand-primary"></div>
              <h4 class="font-bold text-text-base truncate">
                {{ bet.runnerNumber }}. {{ bet.runnerName }}
              </h4>
            </div>
            <p class="text-text-muted text-sm truncate">{{ bet.raceName }} R{{ bet.raceNumber }}</p>
          </div>
          <div class="flex items-center space-x-2 ml-2">
            <span 
              class="px-3 py-1 bg-surface-sunken text-text-base text-sm font-medium rounded-full"
              :class="bet.result === 'WON' ? 'text-success' : bet.result === 'LOST' ? 'text-danger' : 'text-text-muted'"
            >
              {{ bet.odds }}
            </span>
          </div>
        </div>
        
        <div class="flex justify-between items-center text-sm">
          <div>
            <span class="text-text-muted">Stake: </span>
            <span class="font-medium">{{ formatCurrency(bet.stake) }}</span>
          </div>
          <div>
            <span class="text-text-muted">Return: </span>
            <span 
              class="font-medium"
              :class="bet.result === 'WON' ? 'text-success' : bet.result === 'LOST' ? 'text-danger' : 'text-text-muted'"
            >
              {{ formatCurrency(bet.payout || 0) }}
            </span>
          </div>
        </div>
        
        <div class="mt-2 flex justify-between items-center text-xs">
          <span class="text-text-muted">{{ new Date(bet.timestamp).toLocaleString() }}</span>
          <span 
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="bet.result === 'WON' ? 'bg-success bg-opacity-20 text-success' : bet.result === 'LOST' ? 'bg-danger bg-opacity-20 text-danger' : 'bg-surface-sunken text-text-muted'"
          >
            {{ bet.result }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '../../utils/formattingUtils'

interface BetHistoryItem {
  id: string
  raceId: string
  raceName: string
  raceNumber: number
  runnerId: string
  runnerNumber: number
  runnerName: string
  odds: number | 'SP'
  market: string
  stake: number
  timestamp: number
  result?: 'WON' | 'LOST'
  payout?: number
}

interface Props {
  betHistory: BetHistoryItem[]
}

defineProps<Props>()
</script>