import { ref, Ref, onUnmounted } from 'vue'

interface UseCountdownReturn {
  formattedTime: Ref<string>
  isStartingSoon: Ref<boolean>
  isInProgress: Ref<boolean>
  stop: () => void
}

/**
 * Composable for managing a countdown timer
 * Calculates time remaining and formats it as MM:SS
 */
export function useCountdown(startTimeMs: number): UseCountdownReturn {
  const formattedTime = ref('00:00')
  const isStartingSoon = ref(false)
  const isInProgress = ref(false)
  
  // Validate input
  if (typeof startTimeMs !== 'number' || isNaN(startTimeMs)) {
    startTimeMs = Date.now()
  }
  
  // Calculate initial values
  const now = Date.now()
  const timeDiff = startTimeMs - now
  
  // If race has already started or is about to start
  if (timeDiff <= 0) {
    if (timeDiff <= -60000) {
      // Race started more than 1 minute ago, should be removed
      isInProgress.value = true
      formattedTime.value = 'In progress'
    } else {
      // Race is about to start or just started
      isStartingSoon.value = true
      formattedTime.value = 'Starting soon'
    }
  } else {
    // Format the time as MM:SS
    const minutes = Math.floor(timeDiff / 60000)
    const seconds = Math.floor((timeDiff % 60000) / 1000)
    formattedTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Set up interval to update the countdown
  const intervalId = setInterval(() => {
    const now = Date.now()
    const timeDiff = startTimeMs - now
    
    // Validate timeDiff
    if (typeof timeDiff !== 'number' || isNaN(timeDiff)) {
      formattedTime.value = '00:00'
      return
    }
    
    // If race has already started or is about to start
    if (timeDiff <= 0) {
      if (timeDiff <= -60000) {
        // Race started more than 1 minute ago
        isInProgress.value = true
        formattedTime.value = 'In progress'
        stop() // Stop the interval as the race should be removed
      } else {
        // Race is about to start or just started
        isStartingSoon.value = true
        formattedTime.value = 'Starting soon'
      }
    } else {
      // Format the time as MM:SS
      const minutes = Math.floor(timeDiff / 60000)
      const seconds = Math.floor((timeDiff % 60000) / 1000)
      formattedTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      
      // If time is less than 1 minute, show "Starting soon"
      if (minutes === 0 && seconds < 60) {
        isStartingSoon.value = true
      }
    }
  }, 1000)

  // Function to stop the interval
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  }

  // Clean up interval when component is unmounted
  onUnmounted(() => {
    stop()
  })

  return {
    formattedTime,
    isStartingSoon,
    isInProgress,
    stop
  }
}