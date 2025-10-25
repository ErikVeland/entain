<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { CATEGORY_IDS } from '../stores/races'

const props = defineProps<{
  meetingName: string
  raceNumber: number
  categoryId: string
  startTime: number
  isExpired?: boolean
  isLive?: boolean
  isFinished?: boolean
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

// Calculate time remaining and progress
const timeRemaining = ref(0)
const totalTime = ref(0)
const isFlashing = ref(false)
const isFlashingRed = ref(false)
const flashInterval = ref<number | null>(null)
const intervalId = ref<number | null>(null)

const updateCountdown = () => {
  const now = Date.now()
  const diff = props.startTime - now
  
  console.log('Countdown update - now:', now, 'start time:', props.startTime, 'diff:', diff)
  
  if (diff <= 0) {
    timeRemaining.value = 0
    isFlashing.value = false
    isFlashingRed.value = false
    stopFlashing()
    return
  }
  
  timeRemaining.value = diff
  totalTime.value = diff // Use actual time until race start
  
  // Flash if less than 10 seconds remaining
  if (diff <= 10000 && diff > 0) {
    if (!isFlashing.value) {
      isFlashing.value = true
      startFlashing()
    }
  } else {
    isFlashing.value = false
    isFlashingRed.value = false
    stopFlashing()
  }
}

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
  if (props.isExpired || timeRemaining.value <= 0) {
    return 0
  }
  
  // Calculate percentage (inverted because we're counting down)
  const percentage = (timeRemaining.value / totalTime.value) * 100
  return Math.max(0, Math.min(100, percentage))
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

const isLive = computed(() => {
  const now = Date.now()
  const diff = props.startTime - now
  return diff <= 0 && diff > -60000
})

const countdownDisplay = computed(() => {
  if (props.isExpired) {
    return 'Race over'
  }
  
  const now = Date.now()
  const diff = props.startTime - now
  
  console.log('Countdown display - diff:', diff)
  
  if (diff <= 0) {
    return 'In progress'
  }
  
  // Convert milliseconds to minutes and seconds
  const totalSeconds = Math.ceil(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Start the countdown interval
onMounted(() => {
  console.log('RaceHeader mounted, starting countdown interval')
  updateCountdown() // Initial update
  intervalId.value = window.setInterval(() => {
    console.log('Countdown interval tick')
    updateCountdown()
  }, 100) as unknown as number
})

// Clean up intervals
onUnmounted(() => {
  console.log('RaceHeader unmounted, cleaning up intervals')
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  if (flashInterval.value) {
    clearInterval(flashInterval.value)
    flashInterval.value = null
  }
})
</script>

<template>
  <div class="bg-surface-sunken px-3 py-2 flex items-center justify-between relative rounded-t-xl2 overflow-hidden">
    <!-- Background category icon (full card) -->
    <div class="absolute bottom-0 right-0 opacity-10 w-full h-full z-0 overflow-hidden">
      <span v-if="categoryIcon === 'horse'" class="text-[120px] block absolute bottom-0 right-0">🏇</span>
      <span v-else-if="categoryIcon === 'greyhound'" class="text-[120px] block absolute bottom-0 right-0">🐕</span>
      <span v-else-if="categoryIcon === 'harness'" class="text-[120px] block absolute bottom-0 right-0">🛞</span>
    </div>
    
    <!-- Race number cap (square using height as guide) -->
    <div class="absolute top-0 left-0 bg-brand-primary text-text-inverse w-10 h-10 flex items-center justify-center font-bold text-sm z-10">
      {{ raceNumber }}
    </div>
    
    <!-- Background category icon (header only) -->
    <div class="absolute top-1 right-2 opacity-30 text-2xl z-0">
      <span v-if="categoryIcon === 'horse'">🏇</span>
      <span v-else-if="categoryIcon === 'greyhound'">🐕</span>
      <span v-else-if="categoryIcon === 'harness'">🛞</span>
    </div>
    
    <!-- Meeting name with ellipsis -->
    <div class="relative z-10 font-bold uppercase text-text-base flex-grow ml-8 min-w-0" :class="{ 'opacity-50': isExpired }">
      <div class="truncate">{{ meetingName }}</div>
    </div>
    
    <div class="relative z-10 flex items-center">
      <div 
        v-if="isLive && !isExpired" 
        class="px-2 py-1 rounded text-xs font-bold bg-danger text-text-inverse flex items-center"
      >
        <span class="mr-1">●</span>
        LIVE
      </div>
      <div 
        v-else-if="isExpired"
        class="px-2 py-1 rounded text-xs font-bold text-text-muted"
      >
        Race over
      </div>
      <div 
        v-else
        class="relative w-16 h-6 rounded-md overflow-hidden"
        :class="{ 'bg-danger': isFlashingRed }"
      >
        <!-- Progress bar background -->
        <div class="absolute inset-0 bg-surface-raised"></div>
        
        <!-- Progress fill -->
        <div 
          class="absolute inset-0 bg-brand-primary transition-all duration-1000 ease-linear"
          :style="{ width: progressPercentage + '%' }"
        ></div>
        
        <!-- Countdown text with letter-by-letter fade -->
        <div class="absolute inset-0 flex items-center justify-center text-xs font-bold">
          <span 
            v-for="(char, index) in countdownDisplay" 
            :key="index"
            class="transition-opacity duration-300"
            :style="getLetterStyle(index)"
          >
            {{ char }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
