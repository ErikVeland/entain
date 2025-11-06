<template>
  <!-- Success message when bets are placed -->
  <div 
    v-if="Object.keys(placingBets).length > 0" 
    class="mb-4 p-3 bg-success bg-opacity-20 text-success rounded-lg text-center success-message"
  >
    Bets placed successfully! Good luck!
  </div>
  
  <div v-if="pendingBets.length === 0" class="text-center py-8">
    <div class="text-text-muted">No pending bets</div>
  </div>
  
  <div v-else class="space-y-4">
    <PendingBetsList :bets="pendingBets" />
  </div>
</template>

<script setup lang="ts">
import PendingBetsList from '../PendingBetsList.vue'
import type { Bet } from '../../game/bettingSimulator'

defineProps<{
  placingBets: Record<string, boolean>
  pendingBets: Bet[]
}>()
</script>

<style scoped>
/* Success message animation */
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

.success-message {
  animation: fadeInOut 3s ease-in-out forwards;
}
</style>