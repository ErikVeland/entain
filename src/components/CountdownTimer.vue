<template>
  <div class="flex items-center">
    <div 
      class="text-2xl font-mono font-bold"
      :class="[textClass, { 'opacity-50 pointer-events-none': isExpired }]"
      aria-live="polite"
      :aria-label="ariaLabel"
    >
      {{ displayTime }}
    </div>
    <div 
      v-if="isStartingSoon && !isExpired"
      class="ml-3 px-2 py-1 bg-warning bg-opacity-20 text-warning text-xs rounded-full"
      aria-label="Race starting soon"
    >
      Starting soon
    </div>
    <div 
      v-else-if="isInProgress || isExpired"
      class="ml-3 px-2 py-1 bg-danger bg-opacity-20 text-danger text-xs rounded-full"
      :class="{ 'opacity-50': isExpired }"
      :aria-label="isExpired ? 'Race finished' : 'Race in progress'"
    >
      {{ isExpired ? 'Race over' : 'In progress' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps<{
  startTime: number
  isExpired?: boolean
}>()

const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.startTime)

const displayTime = computed(() => {
  // If race is expired, show "Race over"
  if (props.isExpired) {
    return 'Race over'
  }
  
  if (isInProgress.value) {
    return 'In progress'
  }
  if (isStartingSoon.value) {
    return 'Starting soon'
  }
  return formattedTime.value || '00:00'
})

const textClass = computed(() => {
  if (props.isExpired) {
    return 'text-text-muted'
  }
  if (isInProgress.value) {
    return 'text-danger'
  }
  if (isStartingSoon.value) {
    return 'text-warning'
  }
  return 'text-text-base'
})

const ariaLabel = computed(() => {
  if (props.isExpired) {
    return 'Race has finished'
  }
  if (isInProgress.value) {
    return 'Race is currently in progress'
  }
  if (isStartingSoon.value) {
    return 'Race is starting soon'
  }
  return `Race starts in ${formattedTime.value || '00:00'}`
})
</script>