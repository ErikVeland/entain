<template>
  <div class="flex items-center">
    <div 
      class="text-2xl font-mono font-bold"
      :class="textClass"
      aria-live="polite"
      :aria-label="ariaLabel"
    >
      {{ displayTime }}
    </div>
    <div 
      v-if="isStartingSoon"
      class="ml-3 px-2 py-1 bg-warning bg-opacity-20 text-warning text-xs rounded-full"
      aria-label="Race starting soon"
    >
      Starting soon
    </div>
    <div 
      v-else-if="isInProgress"
      class="ml-3 px-2 py-1 bg-danger bg-opacity-20 text-danger text-xs rounded-full"
      aria-label="Race in progress"
    >
      In progress
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps<{
  startTime: number
}>()

const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.startTime)

const displayTime = computed(() => {
  if (isInProgress.value) {
    return 'In progress'
  }
  if (isStartingSoon.value) {
    return 'Starting soon'
  }
  return formattedTime.value
})

const textClass = computed(() => {
  if (isInProgress.value) {
    return 'text-danger'
  }
  if (isStartingSoon.value) {
    return 'text-warning'
  }
  return 'text-text-base'
})

const ariaLabel = computed(() => {
  if (isInProgress.value) {
    return 'Race is currently in progress'
  }
  if (isStartingSoon.value) {
    return 'Race is starting soon'
  }
  return `Race starts in ${formattedTime.value}`
})
</script>