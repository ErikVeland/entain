<template>
  <div class="mt-6 pt-4 border-t border-surface">
    <div class="flex justify-between text-sm mb-1">
      <span class="text-text-muted">Total Stake:</span>
      <span class="font-medium">{{ formatCurrency(totalStake) }}</span>
    </div>
    <div class="flex justify-between text-sm">
      <span class="text-text-muted">Est. Return:</span>
      <span class="font-medium text-success">{{ formatCurrency(totalEstimatedReturn) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '../../utils/formattingUtils'

interface Props {
  totalStake: number
  totalEstimatedReturn: number
}

defineProps<Props>()
</script>