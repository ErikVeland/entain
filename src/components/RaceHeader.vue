<template>
  <div class="bg-surface-sunken px-3 py-2 flex items-center justify-between border-b border-surface">
    <div class="flex items-center">
      <div class="mr-2">
        <span v-if="categoryIcon === 'horse'" class="text-lg">🏇</span>
        <span v-else-if="categoryIcon === 'greyhound'" class="text-lg">🐕</span>
        <span v-else-if="categoryIcon === 'harness'" class="text-lg">🛞</span>
      </div>
      <div class="font-bold uppercase text-text-base">
        {{ meetingName }} R{{ raceNumber }}
      </div>
    </div>
    
    <div class="flex items-center">
      <div 
        v-if="isLive" 
        class="px-2 py-1 rounded text-xs font-bold bg-danger text-text-inverse flex items-center"
      >
        <span class="mr-1">●</span>
        LIVE
      </div>
      <div 
        v-else-if="isStartingSoon"
        class="px-2 py-1 rounded text-xs font-bold bg-warning text-text-inverse"
      >
        {{ countdownDisplay }}
      </div>
      <div 
        v-else
        class="px-2 py-1 rounded text-xs font-bold text-danger"
      >
        {{ countdownDisplay }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_IDS } from '../stores/races'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps<{
  meetingName: string
  raceNumber: number
  categoryId: string
  startTime: number
}>()

const categoryIcon = computed(() => {
  switch (props.categoryId) {
    case CATEGORY_IDS.HORSE:
      return 'horse'
    case CATEGORY_IDS.GREYHOUND:
      return 'greyhound'
    case CATEGORY_IDS.HARNESS:
      return 'harness'
    default:
      return 'horse'
  }
})

const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.startTime)

const isLive = computed(() => isInProgress.value)

const countdownDisplay = computed(() => {
  if (isInProgress.value) {
    return 'In progress'
  }
  
  // Convert seconds to minutes and seconds format
  const [minutes, seconds] = formattedTime.value.split(':')
  const mins = parseInt(minutes)
  const secs = parseInt(seconds)
  
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
})
</script>