<template>
  <div class="mt-4 flex space-x-2">
    <button
      @click="$emit('clear')"
      class="flex-1 py-2 px-4 border border-surface text-text-base rounded-lg hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      Clear
    </button>
    <button
      @click="$emit('place-bets')"
      :disabled="!canPlaceBets"
      class="flex-1 py-2 px-4 bg-brand-primary text-text-inverse rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      Place Bets
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  canPlaceBets: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'clear'): void
  (e: 'place-bets'): void
}>()
</script>