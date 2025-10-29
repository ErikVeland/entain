<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBetsStore } from '../stores/bets'
import { useRaceCommentary } from '../composables/useRaceCommentary'

// State
const showTicker = ref(false)
const currentMessage = ref('')
const messages = ref<string[]>([])
const betsStore = useBetsStore()
const { generateRaceCommentary, generateWinnerAnnouncement } = useRaceCommentary()

// Only show ticker in simulation mode
const isSimulationMode = computed(() => {
  return betsStore.showGame && betsStore.useSimulatedData
})

// Add a message to the ticker
const addMessage = (message: string) => {
  messages.value.push(message)
  if (!showTicker.value) {
    showTicker.value = true
  }
  currentMessage.value = message
  
  // Log to console for debugging in development only
  // Only log critical errors in production
}

// Clear all messages and hide ticker
const clearMessages = () => {
  messages.value = []
  showTicker.value = false
  currentMessage.value = ''
}

// Handle race update events with enhanced commentary
const handleRaceUpdate = (event: CustomEvent) => {
  const { raceId, message, leaderboard, progress, order, gaps, etaMs, meetingName, raceNumber, categoryId, userBets } = event.detail
  
  // Generate dynamic commentary if we have all the needed data
  let enhancedMessage = message
  
  if (progress && order && gaps && meetingName && raceNumber && categoryId) {
    // Generate commentary using the race commentary composable
    const progressData = {
      progressByRunner: progress,
      order: order,
      gaps: gaps,
      etaMs: etaMs
    }
    
    enhancedMessage = generateRaceCommentary(raceId, progressData, meetingName, raceNumber, categoryId)
  } else if (leaderboard && leaderboard.length > 0) {
    // Fallback to leaderboard information if available
    const leaders = leaderboard.slice(0, 3).map((runner: any, index: number) => 
      `${index + 1}. ${runner.name}`
    ).join(', ')
    enhancedMessage += ` | Leading: ${leaders}`
  }
  
  // Add user bet information if available
  if (userBets && userBets.length > 0) {
    const betRunners = userBets.map((bet: any) => {
      if (bet.leg) {
        return bet.leg.selectionName;
      } else if (bet.legs && bet.legs.length > 0) {
        return bet.legs[0].selectionName;
      }
      return 'Unknown Runner';
    }).join(', ')
    enhancedMessage += ` | You have bets on: ${betRunners}`
  }
  
  addMessage(enhancedMessage)
  
  // Auto-clear after 5 seconds
  setTimeout(() => {
    clearMessages()
  }, 5000)
}

// Handle race finish events
const handleRaceFinish = (event: CustomEvent) => {
  const { raceId, message, winner, userBets, meetingName, raceNumber } = event.detail
  
  // Generate winner announcement
  let enhancedMessage = message
  
  if (winner && meetingName && raceNumber) {
    enhancedMessage = generateWinnerAnnouncement(raceId, winner.id, meetingName, raceNumber)
  }
  
  // Add user bet result information
  if (userBets && userBets.length > 0) {
    const winningBets = userBets.filter((bet: any) => bet.runnerId === winner.id)
    if (winningBets.length > 0) {
      enhancedMessage += ` | YOU WON! ${winningBets.length} of your bets were correct!`
    } else {
      enhancedMessage += ` | None of your bets won this race.`
    }
  }
  
  addMessage(enhancedMessage)
  
  // Keep winner message visible longer
  setTimeout(() => {
    clearMessages()
  }, 10000)
}

// Handle race start events
const handleRaceStart = (event: CustomEvent) => {
  const { raceName, raceNumber, userBets, categoryId } = event.detail
  
  // Generate category-specific start message
  const { generateCategoryCommentary } = useRaceCommentary()
  const categoryCommentary = categoryId ? generateCategoryCommentary(categoryId) : ''
  
  let message = `LIVE: ${raceName} R${raceNumber} has started!`
  if (categoryCommentary) {
    message += ` ${categoryCommentary}`
  }
  
  // Add user bet information
  if (userBets && userBets.length > 0) {
    const betRunners = userBets.map((bet: any) => bet.runnerName).join(', ')
    message += ` | You have bets on: ${betRunners}`
  }
  
  addMessage(message)
  
  // Auto-clear after 5 seconds
  setTimeout(() => {
    clearMessages()
  }, 5000)
}

// Lifecycle
onMounted(() => {
  // Listen for race events
  window.addEventListener('race-update', handleRaceUpdate as EventListener)
  window.addEventListener('race-finish', handleRaceFinish as EventListener)
  window.addEventListener('race-start', handleRaceStart as EventListener)
})

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('race-update', handleRaceUpdate as EventListener)
  window.removeEventListener('race-finish', handleRaceFinish as EventListener)
  window.removeEventListener('race-start', handleRaceStart as EventListener)
})
</script>