<template>
  <div class="flex items-center py-2 border-b border-surface last:border-b-0" :class="{ 'opacity-50 pointer-events-none': isExpired }">
    <!-- Silk color icon -->
    <div class="w-4 h-4 rounded-sm mr-3 flex-shrink-0" :class="runner.silkColor"></div>
    
    <!-- Runner info -->
    <div class="flex-grow min-w-0">
      <div class="font-medium text-text-base truncate">
        {{ runner.number }}. {{ runner.name }}
      </div>
      <div class="text-sm text-text-muted">
        {{ runner.jockey }} {{ runner.weight }}
      </div>
      <div class="text-sm text-text-muted" v-if="runner.bestTime">
        {{ $t('game.bestTime') }}: {{ runner.bestTime }}
      </div>
    </div>
    
    <!-- Odds button -->
    <div class="ml-2">
      <button 
        @click="handleOddsClick"
        class="px-3 py-1 rounded-lg font-bold shadow-card transition-all duration-200 flex items-center bg-surface-sunken hover:bg-brand-primary hover:text-text-inverse border-2 border-surface"
        :class="oddsButtonClass"
        :disabled="isExpired"
        :aria-label="`${$t('game.addToBetslip')} ${runner.name} ${$t('game.at')} ${runner.odds}`"
      >
        {{ runner.odds }}
        <span v-if="runner.oddsTrend === 'up'" class="ml-1 text-success">▲</span>
        <span v-else-if="runner.oddsTrend === 'down'" class="ml-1 text-danger">▼</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBettingLogic } from '../composables/useBettingLogic'
import { useBetsStore } from '../stores/bets'

const { t } = useI18n()

interface Runner {
  id: string
  number: number
  name: string
  weight: string
  jockey: string
  odds: string | number
  oddsTrend: 'up' | 'down' | 'none'
  silkColor: string
  bestTime?: string
}

const props = defineProps<{
  runner: Runner
  raceId: string
  raceName: string
  raceNumber: number
  isExpired?: boolean
}>()

const { addSelection } = useBettingLogic()
const betsStore = useBetsStore()

const oddsButtonClass = computed(() => {
  const baseClasses = 'bg-surface text-text-base hover:bg-brand-primary hover:text-text-inverse cursor-pointer'
  
  if (props.isExpired) {
    return `${baseClasses} opacity-50 cursor-not-allowed`
  }
  
  if (props.runner.oddsTrend === 'up') {
    return `${baseClasses} bg-success bg-opacity-20`
  } else if (props.runner.oddsTrend === 'down') {
    return `${baseClasses} bg-danger bg-opacity-20`
  }
  
  return baseClasses
})

const handleOddsClick = () => {
  if (props.isExpired) return
  
  // Check if game mode is enabled
  if (!betsStore.showGame) {
    // Emit event to show game mode dialog
    const event = new CustomEvent('show-game-mode-dialog')
    window.dispatchEvent(event)
    return
  }
  
  // Convert odds to number or 'SP'
  let odds: number | 'SP' = 'SP'
  if (props.runner.odds !== 'SP') {
    const oddsNum = typeof props.runner.odds === 'number' ? props.runner.odds : parseFloat(props.runner.odds)
    if (!isNaN(oddsNum)) {
      odds = oddsNum
    }
  }
  
  // Add to betslip
  addSelection({
    raceId: props.raceId,
    raceName: props.raceName,
    raceNumber: props.raceNumber,
    runnerId: props.runner.id,
    runnerNumber: props.runner.number,
    runnerName: props.runner.name,
    odds,
    market: 'win',
    stake: 0
  })
  
  // Emit event to open betslip drawer
  const event = new CustomEvent('open-betslip', { 
    detail: { 
      raceId: props.raceId,
      runner: props.runner
    }
  })
  window.dispatchEvent(event)
}
</script>