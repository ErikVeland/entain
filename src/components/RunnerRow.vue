<template>
  <div class="flex items-center py-2 border-b border-surface last:border-b-0">
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
        Best Time: {{ runner.bestTime }}
      </div>
    </div>
    
    <!-- Odds button -->
    <div class="ml-2">
      <button 
        class="px-3 py-1 rounded-lg font-bold shadow-card transition-all duration-200 flex items-center"
        :class="oddsButtonClass"
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

interface Runner {
  number: number
  name: string
  weight: string
  jockey: string
  odds: string
  oddsTrend: 'up' | 'down' | 'none'
  silkColor: string
  bestTime?: string
}

const props = defineProps<{
  runner: Runner
}>()

const oddsButtonClass = computed(() => {
  const baseClasses = 'bg-surface text-text-base'
  
  if (props.runner.oddsTrend === 'up') {
    return `${baseClasses} bg-success bg-opacity-20`
  } else if (props.runner.oddsTrend === 'down') {
    return `${baseClasses} bg-danger bg-opacity-20`
  }
  
  return baseClasses
})
</script>