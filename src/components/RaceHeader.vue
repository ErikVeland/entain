<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useCountdown } from '../composables/useCountdown'
import { CATEGORY_IDS } from '../stores/races'

const props = defineProps<{
  meetingName: string
  raceNumber: number
  categoryId: string
  startTime: number
  isExpired?: boolean
  raceId: string
  raceFinished?: boolean
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

// Use the composable for countdown
const { formattedTime, isStartingSoon, isInProgress } = useCountdown(props.startTime)

// Flashing state for countdown
const isFlashing = ref(false)
const isFlashingRed = ref(false)
const flashInterval = ref<number | null>(null)

// Start flashing when countdown is low
watch(isStartingSoon, (startingSoon) => {
  if (startingSoon && !isFlashing.value) {
    isFlashing.value = true
    startFlashing()
  } else if (!startingSoon) {
    isFlashing.value = false
    stopFlashing()
  }
})

const startFlashing = () => {
  if (flashInterval.value) return
  
  // Alternate between red and original color every 500ms
  flashInterval.value = window.setInterval(() => {
    isFlashingRed.value = !isFlashingRed.value
  }, 500) as unknown as number
}

const stopFlashing = () => {
  if (flashInterval.value) {
    clearInterval(flashInterval.value)
    flashInterval.value = null
  }
  isFlashingRed.value = false
}

const progressPercentage = computed(() => {
  if (props.isExpired || isInProgress.value) {
    return 0
  }
  
  // Parse the formatted time to get minutes and seconds
  const timeStr = formattedTime.value
  if (!timeStr || timeStr === 'NaN:NaN' || timeStr === 'Starting soon') {
    return 0
  }
  
  // Parse MM:SS format
  const parts = timeStr.split(':')
  if (parts.length !== 2) {
    return 0
  }
  
  const minutes = parseInt(parts[0], 10)
  const seconds = parseInt(parts[1], 10)
  
  if (isNaN(minutes) || isNaN(seconds)) {
    return 0
  }
  
  // Calculate total seconds remaining
  const totalSeconds = minutes * 60 + seconds
  
  // For progress bar, we want it to count down from 60 seconds (1 minute) to 0
  // If more than 60 seconds remain, show full progress bar
  const displaySeconds = Math.min(totalSeconds, 60) // Cap at 60 seconds for display
  const percentage = (displaySeconds / 60) * 100 // Calculate percentage of 60 seconds
  
  return Math.max(0, Math.min(100, percentage))
})

// Enhanced race status computation
const raceStatus = computed(() => {
  if (props.isExpired || props.raceFinished) return 'finished'
  if (isInProgress.value) return 'live'
  if (isStartingSoon.value) return 'starting_soon'
  return 'countdown'
})

// Get letter style based on progress
const getLetterStyle = (index: number) => {
  // If flashing red, all letters should be white
  if (isFlashingRed.value) {
    return { opacity: 1, color: 'white', transition: 'color 0.3s ease' }
  }
  
  // Calculate the position of this letter in the progress bar
  const totalWidth = 64 // Approximate width of the progress bar in pixels (w-16 = 4rem = 64px)
  const letterPosition = (index / countdownDisplay.value.length) * totalWidth
  const progressWidth = (progressPercentage.value / 100) * totalWidth
  
  // If the progress bar has passed this letter, make it black
  // Otherwise, keep the text white (inverted logic as requested)
  if (letterPosition < progressWidth) {
    return { opacity: 1, color: 'black', transition: 'color 0.3s ease' }
  }
  
  // Otherwise, keep the text white
  return { opacity: 1, color: 'white', transition: 'color 0.3s ease' }
}

const countdownDisplay = computed(() => {
  if (props.isExpired || props.raceFinished) {
    return 'Over'
  }
  
  if (isInProgress.value) {
    return 'LIVE'
  }
  
  // Handle case where formattedTime might be undefined or invalid
  if (!formattedTime.value || formattedTime.value === 'NaN:NaN') {
    return '00:00'
  }
  
  return formattedTime.value
})

// Clean up intervals
onUnmounted(() => {
  if (flashInterval.value) {
    clearInterval(flashInterval.value)
    flashInterval.value = null
  }
})
</script>