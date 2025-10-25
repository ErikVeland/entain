<template>
  <div class="flex items-center">
    <div 
      class="text-2xl font-mono font-bold transition-all duration-300"
      :class="[textClass, { 'opacity-50 pointer-events-none': isExpired }]"
      aria-live="polite"
      :aria-label="ariaLabel"
      :aria-describedby="countdownDescriptionId"
    >
      {{ displayTime }}
    </div>
    <div 
      v-if="isStartingSoon && !isExpired"
      class="ml-3 px-2 py-1 bg-warning bg-opacity-20 text-warning text-xs rounded-full animate-pulse-slow"
      aria-label="Race starting soon"
    >
      Starting soon
    </div>
    <div 
      v-else-if="isInProgress || isExpired"
      class="ml-3 px-2 py-1 bg-danger bg-opacity-20 text-danger text-xs rounded-full transition-all duration-500"
      :class="{ 
        'opacity-50': isExpired,
        'animate-bounce-in': isInProgress && !isExpired
      }"
      :aria-label="isExpired ? 'Race finished' : 'Race in progress'"
    >
      {{ isExpired ? 'Race over' : 'In progress' }}
    </div>
    
    <!-- Hidden element for screen reader announcements -->
    <div 
      :id="countdownDescriptionId" 
      class="sr-only" 
      aria-live="polite"
      v-if="shouldAnnounce"
    >
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCountdown } from '../composables/useCountdown'

const props = defineProps<{
  startTime: number
  isExpired?: boolean
  raceId: string
}>()

const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.startTime)

// Create unique ID for aria-describedby
const countdownDescriptionId = computed(() => `countdown-desc-${props.raceId}`)

// State for announcements
const shouldAnnounce = ref(false)
const announcementText = ref('')

// Track previous states for announcements
const previousState = ref({
  isStartingSoon: false,
  isInProgress: false,
  isExpired: false
})

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
    return 'text-danger animate-pulse'
  }
  if (isStartingSoon.value) {
    return 'text-warning animate-pulse-slow'
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

// Watch for state changes to trigger announcements
watch([isStartingSoon, isInProgress, () => props.isExpired], ([newStartingSoon, newInProgress, newIsExpired], [oldStartingSoon, oldInProgress, oldIsExpired]) => {
  // Check if any state has changed
  if (newStartingSoon !== oldStartingSoon || newInProgress !== oldInProgress || newIsExpired !== oldIsExpired) {
    // Create announcement text based on state changes
    let text = ''
    
    if (newIsExpired && !oldIsExpired) {
      text = 'Race has finished'
    } else if (newInProgress && !oldInProgress) {
      text = 'Race has started'
    } else if (newStartingSoon && !oldStartingSoon) {
      text = 'Race is starting soon'
    }
    
    if (text) {
      announcementText.value = text
      shouldAnnounce.value = true
      
      // Reset announcement after a short delay
      setTimeout(() => {
        shouldAnnounce.value = false
      }, 1000)
    }
    
    // Update previous states
    previousState.value = {
      isStartingSoon: newStartingSoon,
      isInProgress: newInProgress,
      isExpired: newIsExpired
    }
  }
}, { immediate: true })
</script>