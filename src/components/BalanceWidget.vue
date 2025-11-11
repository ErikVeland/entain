<template>
  <div 
    class="relative" 
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
  >
    <!-- Balance display as rounded pill -->
    <div 
      class="flex items-center bg-surface-sunken rounded-full px-4 py-2 border-2 border-surface cursor-pointer"
      @click="openBetslip"
    >
      <span class="text-text-muted text-sm font-medium">Credits:</span>
      <span class="font-medium text-text-base ml-2">${{ (availableBalance / 100).toFixed(2) }}</span>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip"
      class="absolute right-0 mt-1 w-64 bg-surface-raised rounded-lg shadow-lg z-10 border border-surface p-4"
      role="tooltip"
      aria-label="Balance details"
      @mouseenter="handleTooltipMouseEnter"
      @mouseleave="handleTooltipMouseLeave"
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
        <!-- Add clickable item to open betslip -->
        <div class="pt-2 border-t border-surface">
          <button 
            @click="openBetslip"
            class="w-full text-left text-sm text-brand-primary hover:underline focus:outline-none"
          >
            Open Betslip
          </button>
        </div>
      </div>
    </div>
    
    <!-- Dropdown (click to open) -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 mt-1 w-64 bg-surface-raised rounded-lg shadow-lg z-10 border border-surface"
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
        <!-- Add clickable item to open betslip -->
        <div class="pt-2 border-t border-surface">
          <button 
            @click="openBetslip"
            class="w-full text-left text-sm text-brand-primary hover:underline focus:outline-none"
          >
            Open Betslip
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVirtualCurrency } from '../composables/useVirtualCurrency'

const { availableBalance, totalBalance, lockedBalance } = useVirtualCurrency()

const showDropdown = ref(false)
const showTooltip = ref(false)
const tooltipTimeout = ref<number | null>(null)

const handleMouseEnter = () => {
  // Clear any existing timeout
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
  }
  
  // Show tooltip immediately
  showTooltip.value = true
}

const handleMouseLeave = () => {
  // Set a small delay before hiding the tooltip
  // This gives users time to move their mouse to the tooltip
  tooltipTimeout.value = window.setTimeout(() => {
    showTooltip.value = false
  }, 300) // 300ms delay
}

const handleTooltipMouseEnter = () => {
  // Clear the timeout if user moves mouse over the tooltip
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
  }
  showTooltip.value = true
}

const handleTooltipMouseLeave = () => {
  // Hide tooltip when mouse leaves the tooltip
  showTooltip.value = false
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Open betslip when clicking on the balance
const openBetslip = () => {
  // Dispatch a custom event to open the betslip
  const event = new CustomEvent('open-betslip-without-selection')
  window.dispatchEvent(event)
  
  // Close dropdown/tooltip after opening betslip
  showDropdown.value = false
  showTooltip.value = false
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>