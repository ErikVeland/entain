<template>
  <div v-if="activeTab === 'betslip'" class="p-4">
    <div v-if="activeSelections.length === 0" class="text-center py-8">
      <div class="text-text-muted mb-2">No selections yet. Click any odds to add a bet.</div>
      <p class="text-text-muted text-sm"></p>
    </div>
    
    <div v-else>
      <h3 class="font-medium text-text-base mb-4">Singles ({{ activeSelections.length }})</h3>
      <div class="space-y-4">
        <slot name="selections"></slot>
      </div>
      
      <slot name="totals"></slot>
      
      <slot name="actions"></slot>
    </div>
  </div>
  
  <div v-else-if="activeTab === 'pending'" class="p-4">
    <slot name="pending"></slot>
  </div>
  
  <div v-else-if="activeTab === 'history'" class="p-4">
    <slot name="history"></slot>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import { type BetSelection } from '../../types/betting'

defineProps({
  activeTab: {
    type: String as PropType<'betslip' | 'pending' | 'history'>,
    required: true
  },
  activeSelections: {
    type: Array as PropType<BetSelection[]>,
    default: () => []
  }
})
</script>