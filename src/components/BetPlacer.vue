<template>
  <div v-if="betsStore.showGame" class="mt-6 bg-surface-sunken rounded-lg p-4">
    <h3 class="text-lg font-semibold text-text-base mb-3">Place a Bet</h3>
    
    <div class="mb-4">
      <label class="block text-text-base text-sm mb-1">Your Balance: ${{ bankroll.balance.toFixed(2) }}</label>
      <div class="text-text-muted text-xs">Locked: ${{ bankroll.locked.toFixed(2) }} | P/L: ${{ bankroll.settledProfitLoss.toFixed(2) }}</div>
    </div>
    
    <div class="mb-4">
      <label class="block text-text-base text-sm mb-1">Select Runner</label>
      <select 
        v-model="selectedRunnerId" 
        class="w-full bg-surface-raised text-text-base rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        <option value="">Choose a runner</option>
        <option 
          v-for="runner in runners" 
          :key="runner.id" 
          :value="runner.id"
        >
          {{ runner.number }}. {{ runner.name }} (Odds: {{ formatOdds(runner.odds) }})
        </option>
      </select>
    </div>
    
    <div class="mb-4">
      <label class="block text-text-base text-sm mb-1">Bet Amount (${{ config.minBet }}-{{ config.maxBet }})</label>
      <input 
        v-model.number="betAmount" 
        type="number" 
        :min="config.minBet" 
        :max="config.maxBet" 
        :step="1"
        class="w-full bg-surface-raised text-text-base rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        placeholder="Enter bet amount"
      >
    </div>
    
    <button 
      @click="placeBet"
      :disabled="!canPlaceBet"
      class="w-full py-2 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      Place Bet
    </button>
    
    <div v-if="pendingBets.length > 0" class="mt-4">
      <h4 class="text-text-base text-sm mb-2">Your Bets on This Race</h4>
      <div 
        v-for="bet in pendingBets" 
        :key="bet.id" 
        class="flex justify-between items-center bg-surface-raised rounded p-2 mb-2"
      >
        <div>
          <div class="text-text-base text-sm">{{ getRunnerName(bet.runnerId) }}</div>
          <div class="text-text-muted text-xs">${{ bet.amount }} @ {{ formatOdds(bet.odds) }}</div>
        </div>
        <button 
          @click="cancelBet(bet.id)"
          class="text-danger text-xs hover:underline focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBetsStore } from '../stores/bets'
import { DEFAULT_CONFIG } from '../game/bettingSimulator'

const props = defineProps<{
  raceId: string,
  runners: Array<{
    id: string,
    number: number,
    name: string,
    odds: number | 'SP'
  }>
}>()

const betsStore = useBetsStore()
const selectedRunnerId = ref('')
const betAmount = ref(10)

const config = DEFAULT_CONFIG

const bankroll = computed(() => betsStore.bankroll)
const pendingBets = computed(() => betsStore.engine.getPendingBetsForRace(props.raceId))

const canPlaceBet = computed(() => {
  return (
    selectedRunnerId.value !== '' && 
    betAmount.value >= config.minBet && 
    betAmount.value <= config.maxBet && 
    betAmount.value <= bankroll.value.balance
  )
})

const formatOdds = (odds: number | 'SP') => {
  return odds === 'SP' ? 'SP' : odds.toFixed(2)
}

const getRunnerName = (runnerId: string) => {
  const runner = props.runners.find(r => r.id === runnerId)
  return runner ? runner.name : 'Unknown Runner'
}

const placeBet = () => {
  if (!canPlaceBet.value) return
  
  const runner = props.runners.find(r => r.id === selectedRunnerId.value)
  if (!runner) return
  
  const betId = betsStore.placeBet(
    props.raceId,
    selectedRunnerId.value,
    betAmount.value,
    runner.odds
  )
  
  if (betId) {
    // Reset form
    selectedRunnerId.value = ''
    betAmount.value = 10
  }
}

const cancelBet = (betId: string) => {
  betsStore.cancelBet(betId)
}
</script>