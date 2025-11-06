<template>
  <div class="flex border-b border-surface">
    <button
      @click="() => $emit('update:activeTab', 'betslip')"
      class="px-4 py-3 text-sm font-medium relative"
      :class="activeTab === 'betslip' ? 'text-brand-primary' : 'text-text-muted'"
      :aria-selected="activeTab === 'betslip'"
      role="tab"
    >
      Betslip
      <span 
        v-if="selectionCount > 0"
        class="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-primary bg-opacity-20 text-white"
      >
        {{ selectionCount }}
      </span>
      <div 
        v-if="activeTab === 'betslip'" 
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
      ></div>
    </button>
    <button
      @click="() => $emit('update:activeTab', 'pending')"
      class="px-4 py-3 text-sm font-medium relative"
      :class="activeTab === 'pending' ? 'text-brand-primary' : 'text-text-muted'"
      :aria-selected="activeTab === 'pending'"
      role="tab"
    >
      Pending Bets
      <span 
        v-if="pendingBetsCount > 0"
        class="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-primary bg-opacity-20 text-white"
      >
        {{ pendingBetsCount }}
      </span>
      <div 
        v-if="activeTab === 'pending'" 
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
      ></div>
    </button>
    <button
      @click="() => $emit('update:activeTab', 'history')"
      class="px-4 py-3 text-sm font-medium relative"
      :class="activeTab === 'history' ? 'text-brand-primary' : 'text-text-muted'"
      :aria-selected="activeTab === 'history'"
      role="tab"
    >
      History
      <span 
        v-if="historyCount > 0"
        class="ml-1 px-2 py-0.5 text-xs rounded-full bg-brand-primary bg-opacity-20 text-white"
      >
        {{ historyCount }}
      </span>
      <div 
        v-if="activeTab === 'history'" 
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
      ></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'

defineProps({
  activeTab: {
    type: String as PropType<'betslip' | 'pending' | 'history'>,
    required: true
  },
  selectionCount: {
    type: Number,
    default: 0
  },
  pendingBetsCount: {
    type: Number,
    default: 0
  },
  historyCount: {
    type: Number,
    default: 0
  }
})

defineEmits<{
  (e: 'update:activeTab', tab: 'betslip' | 'pending' | 'history'): void
}>()
</script>