<template>
  <div class="py-2 border-b border-surface last:border-b-0" :class="{ 'opacity-50 pointer-events-none': isExpired }">
    <div class="flex items-start">
      <!-- Silk color icon -->
      <div class="w-4 h-4 rounded-sm mr-3 mt-1 flex-shrink-0" :class="runner.silkColor"></div>
      
      <!-- Runner info and odds -->
      <div class="flex-grow min-w-0">
        <!-- Runner name full width -->
        <div class="font-medium text-text-base truncate">
          {{ runner.number }}. {{ runner.name }}
        </div>
        
        <!-- Meta info and odds in a row below -->
        <div class="flex items-center mt-1">
          <!-- Meta info -->
          <div class="text-sm text-text-muted truncate flex-grow min-w-0" v-if="runner.jockey || runner.weight || runner.bestTime">
            <span v-if="runner.jockey" :title="runner.jockey">{{ formatJockeyName(runner.jockey) }}</span>
            <span v-if="runner.jockey && runner.weight"> | </span>
            <span v-if="runner.weight">{{ runner.weight }}</span>
            <span v-if="(runner.jockey || runner.weight) && runner.bestTime"> | </span>
            <span v-if="runner.bestTime" :title="$t('game.bestTime')">BT: {{ runner.bestTime }}</span>
          </div>
          
          <!-- Odds button -->
          <div class="ml-2 flex-shrink-0">
            <button 
              @click="handleOddsClick"
              class="px-2 py-1 rounded-lg font-bold shadow-card transition-all duration-200 flex items-center text-sm bg-surface-sunken hover:bg-brand-primary hover:text-text-inverse border-2 border-surface"
              :class="[oddsButtonClass, oddsAnimation]"
              :disabled="isExpired"
              :aria-label="`${$t('game.addToBetslip')} ${runner.name} ${$t('game.at')} ${runner.odds}`"
            >
              {{ runner.odds }}
              <span v-if="runner.oddsTrend === 'up'" class="ml-1 text-success">▲</span>
              <span v-else-if="runner.oddsTrend === 'down'" class="ml-1 text-danger">▼</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

// Track previous odds for animation
const previousOdds = ref<string | number>(props.runner.odds)
const oddsAnimation = ref('')

// Watch for odds changes to trigger animations
watch(() => props.runner.odds, (newOdds: string | number, oldOdds: string | number) => {
  if (newOdds !== oldOdds) {
    // Determine if odds went up or down
    let newNum: number, oldNum: number
    
    // Convert to numbers for comparison
    if (newOdds === 'SP') newNum = 6.0
    else newNum = typeof newOdds === 'number' ? newOdds : parseFloat(String(newOdds))
    
    if (oldOdds === 'SP') oldNum = 6.0
    else oldNum = typeof oldOdds === 'number' ? oldOdds : parseFloat(String(oldOdds))
    
    // Trigger appropriate animation
    if (!isNaN(newNum) && !isNaN(oldNum)) {
      if (newNum < oldNum) {
        oddsAnimation.value = 'animate-odds-change-down'
      } else if (newNum > oldNum) {
        oddsAnimation.value = 'animate-odds-change-up'
      }
      
      // Reset animation after it completes
      setTimeout(() => {
        oddsAnimation.value = ''
      }, 500)
    }
  }
  
  previousOdds.value = newOdds
})

const formatJockeyName = (jockeyName: string) => {
  if (!jockeyName) return ''
  
  // Split the name into parts
  const parts = jockeyName.trim().split(' ')
  
  if (parts.length === 1) {
    return parts[0]
  }
  
  // Return first initial and last name
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

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
  
  // Emit event to open betslip drawer
  const event = new CustomEvent('open-betslip', { 
    detail: { 
      raceId: props.raceId,
      runner: {
        ...props.runner,
        raceName: props.raceName,
        raceNumber: props.raceNumber
      }
    }
  })
  window.dispatchEvent(event)
}
</script>