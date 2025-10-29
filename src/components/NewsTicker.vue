<template>
  <div v-if="showTicker && isSimulationMode" class="fixed top-16 left-0 right-0 bg-brand-primary text-white py-2 z-50">
    <div class="container mx-auto px-4 overflow-hidden flex items-center justify-between">
      <div class="animate-marquee whitespace-nowrap flex-grow">
        {{ currentMessage }}
      </div>
      <div v-if="showResultsLink" class="ml-4 flex-shrink-0">
        <button 
          @click="scrollToResults"
          @mouseenter="showResultsPopover = true"
          @mouseleave="showResultsPopover = false"
          class="text-white underline hover:no-underline focus:outline-none"
        >
          Show results
        </button>
        <!-- Results popover -->
        <div 
          v-if="showResultsPopover && raceResults"
          class="absolute right-4 top-12 bg-surface-raised text-text-base rounded-lg shadow-xl p-4 w-80 z-50 border border-surface"
        >
          <div class="font-bold mb-2">Race Results</div>
          <div v-for="(runner, index) in raceResults" :key="runner.id" class="flex justify-between py-1">
            <span :class="{ 'font-bold': index === 0 }">{{ index + 1 }}. {{ runner.name }}</span>
            <span>{{ runner.odds }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBetsStore } from '../stores/bets'
import { useRaceCommentary } from '../composables/useRaceCommentary'
import { getSimulatedRunners } from '../composables/useOddsSimulation'

// State
const showTicker = ref(false)
const currentMessage = ref('')
const messages = ref<string[]>([])
const betsStore = useBetsStore()
const { generateRaceCommentary, generateWinnerAnnouncement } = useRaceCommentary()
const showResultsLink = ref(false)
const showResultsPopover = ref(false)
const raceResults = ref<any[]>([])
const currentRaceId = ref<string | null>(null)

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
  showResultsLink.value = false
  currentRaceId.value = null
}

// Scroll to race results
const scrollToResults = () => {
  if (currentRaceId.value) {
    const raceElement = document.querySelector(`[data-race-id="${currentRaceId.value}"]`)
    if (raceElement) {
      raceElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add a temporary highlight effect
      raceElement.classList.add('ring-4', 'ring-brand-primary')
      setTimeout(() => {
        raceElement.classList.remove('ring-4', 'ring-brand-primary')
      }, 2000)
    }
  }
}

// Handle race update events with enhanced commentary
const handleRaceUpdate = (event: CustomEvent) => {
  const { raceId, message, leaderboard, progress, order, gaps, etaMs, meetingName, raceNumber, categoryId, userBets } = event.detail
  
  // Store current race ID
  currentRaceId.value = raceId
  
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
  
  // Store current race ID
  currentRaceId.value = raceId
  
  // Generate winner announcement
  let enhancedMessage = message
  
  if (winner && meetingName && raceNumber) {
    // Get the winner name from simulated runners
    const runners = getSimulatedRunners(raceId)
    const winnerRunner = runners.find((r: any) => r.id === winner.id)
    const winnerName = winnerRunner ? winnerRunner.name : 'Unknown'
    
    enhancedMessage = generateWinnerAnnouncement(raceId, winner.id, meetingName, raceNumber)
    
    // Add winner name to the message
    enhancedMessage = `${meetingName} R${raceNumber}: ${winnerName} wins the race!`
    
    // Show results link for finished races
    showResultsLink.value = true
    
    // Store race results for popover
    const runnersData = getSimulatedRunners(raceId)
    raceResults.value = runnersData.map((runner: any) => ({
      id: runner.id,
      name: runner.name,
      odds: runner.odds
    }))
    
    // Play winner sound
    try {
      const winSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFfHd5eXl8f4GDhYeJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/');
      winSound.volume = 0.5;
      winSound.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) {
      console.log('Sound play failed:', e);
    }
  }
  
  // Add user bet result information
  if (userBets && userBets.length > 0) {
    const winningBets = userBets.filter((bet: any) => {
      // For single bets
      if (bet.leg) {
        return bet.leg.selectionRunnerId === winner.id;
      }
      // For multi bets, check if the winner is in any leg
      if (bet.legs) {
        return bet.legs.some((leg: any) => leg.selectionRunnerId === winner.id);
      }
      return false;
    });
    
    if (winningBets.length > 0) {
      const totalWinnings = winningBets.reduce((sum: number, bet: any) => sum + (bet.payout || 0), 0);
      enhancedMessage += ` | YOU WON $${(totalWinnings / 100).toFixed(2)}! ${winningBets.length} of your bets were correct!`
      
      // Trigger win celebration animation
      const celebrationEvent = new CustomEvent('win-celebration', { 
        detail: { 
          winAmount: totalWinnings 
        } 
      });
      window.dispatchEvent(celebrationEvent);
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
    const betRunners = userBets.map((bet: any) => {
      if (bet.leg) {
        return bet.leg.selectionName;
      } else if (bet.legs && bet.legs.length > 0) {
        return bet.legs[0].selectionName;
      }
      return 'Unknown Runner';
    }).join(', ')
    message += ` | You have bets on: ${betRunners}`
  }
  
  // Play race start sound
  try {
    const startSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFfHd5eXl8f4GDhYeJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/');
    startSound.volume = 0.3;
    startSound.play().catch(e => console.log('Sound play failed:', e));
  } catch (e) {
    console.log('Sound play failed:', e);
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

<style scoped>
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-marquee {
  display: inline-block;
  animation: marquee 15s linear infinite;
}
</style>