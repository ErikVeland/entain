<template>
  <div v-if="showConfetti || showWinCelebration" class="fixed inset-0 z-50 pointer-events-none">
    <!-- Confetti animation -->
    <div v-if="showConfetti" class="absolute inset-0 overflow-hidden">
      <div 
        v-for="i in 150" 
        :key="i"
        class="absolute w-2 h-2 rounded-full"
        :style="confettiStyles[i - 1]"
      ></div>
    </div>
    
    <!-- Win celebration -->
    <div 
      v-if="showWinCelebration"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="bg-surface-raised rounded-xl p-8 shadow-xl border border-brand-primary animate-pulse">
        <div class="text-center">
          <div class="text-5xl mb-4">🏆</div>
          <h2 class="text-2xl font-bold text-text-base mb-2">Congratulations!</h2>
          <p class="text-text-base mb-4">You won <span class="font-bold text-success">${{ (winAmount / 100).toFixed(2) }}</span></p>
          <div class="text-3xl">🎉</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAnimationEffects } from '../composables/useAnimationEffects'

const { showConfetti, showWinCelebration, winAmount } = useAnimationEffects()

// Generate confetti styles
const confettiStyles = ref<any[]>([])

onMounted(() => {
  // Generate random confetti pieces
  const pieces = []
  for (let i = 0; i < 150; i++) {
    pieces.push({
      left: `${Math.random() * 100}%`,
      top: `-10%`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 10 + 5}px`,
      animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
      animationDelay: `${Math.random() * 2}s`
    })
  }
  confettiStyles.value = pieces
})
</script>

<style scoped>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>