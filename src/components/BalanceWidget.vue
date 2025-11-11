<template>
  <div class="relative" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <!-- Balance display as rounded pill -->
    <div class="flex items-center bg-surface-sunken rounded-full px-4 py-2 border-2 border-surface">
      <span class="text-text-muted text-sm font-medium">Credits:</span>
      <span class="font-medium text-text-base ml-2">${{ (availableBalance / 100).toFixed(2) }}</span>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip"
      class="absolute right-0 mt-2 w-64 bg-surface-raised rounded-lg shadow-lg z-10 border border-surface p-4"
      role="tooltip"
      aria-label="Balance details"
    >
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">Available</span>
          <span class="text-text-base">${{ (availableBalance / 100).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">Locked</span>
          <span class="text-text-base">${{ (lockedBalance / 100).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm font-medium pt-2 border-t border-surface">
          <span class="text-text-muted">Total</span>
          <span class="text-text-base">${{ (totalBalance / 100).toFixed(2) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Dropdown (click to open) -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-64 bg-surface-raised rounded-lg shadow-lg z-10 border border-surface"
      role="dialog"
      aria-label="Transaction history"
      aria-modal="true"
    >
      <div class="p-4 border-b border-surface">
        <h3 class="font-medium text-text-base">Holdings</h3>
      </div>
      
      <div class="p-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">Available</span>
          <span class="text-text-base">${{ (availableBalance / 100).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">Locked</span>
          <span class="text-text-base">${{ (lockedBalance / 100).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm font-medium pt-2 border-t border-surface">
          <span class="text-text-muted">Total</span>
          <span class="text-text-base">${{ (totalBalance / 100).toFixed(2) }}</span>
        </div>
      </div>
      
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useVirtualCurrency } from '../composables/useVirtualCurrency'
import { eventManager } from '../utils/eventManager'

const { availableBalance, totalBalance, lockedBalance } = useVirtualCurrency()

const showDropdown = ref(false)
const showTooltip = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
// Store event listener ID for cleanup
const eventListenerId = ref<number | null>(null)

// Close dropdown when clicking outside
onMounted(() => {
  eventListenerId.value = eventManager.addEventListener(document, 'click', (event) => {
    const dropdown = document.querySelector('.relative')
    if (dropdown && !dropdown.contains(event.target as Node)) {
      showDropdown.value = false
    }
  })
})

// Clean up event listener
onUnmounted(() => {
  if (eventListenerId.value) {
    eventManager.removeEventListener(eventListenerId.value)
  }
})
</script>

<style scoped>
/* Add any additional styles if needed */
</style>