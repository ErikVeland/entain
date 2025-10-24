// src/composables/useBettingLogic.ts
import { computed } from 'vue'
import { useBetsStore, type BetSelection } from '../stores/bets'
import { type Runner } from '../game/bettingSimulator'

export function useBettingLogic() {
  const betsStore = useBetsStore()
  
  // Active selections in betslip
  const activeSelections = computed(() => betsStore.activeSelections)
  
  // Total stake of all active selections
  const totalStake = computed(() => betsStore.totalStake)
  
  // Total estimated return of all active selections
  const totalEstimatedReturn = computed(() => betsStore.totalEstimatedReturn)
  
  // Add a selection to the betslip
  const addSelection = (selection: Omit<BetSelection, 'id' | 'estimatedReturn'>) => {
    betsStore.addSelection(selection)
  }
  
  // Update a selection's market type
  const updateSelectionMarket = (selectionId: string, market: 'win' | 'place' | 'each-way') => {
    betsStore.updateSelectionMarket(selectionId, market)
  }
  
  // Update a selection's stake
  const updateSelectionStake = (selectionId: string, stake: number) => {
    betsStore.updateSelectionStake(selectionId, stake)
  }
  
  // Remove a selection from the betslip
  const removeSelection = (selectionId: string) => {
    betsStore.removeSelection(selectionId)
  }
  
  // Clear all selections from the betslip
  const clearSelections = () => {
    betsStore.clearSelections()
  }
  
  // Place all selections as bets
  const placeSelections = () => {
    return betsStore.placeSelections()
  }
  
  // Calculate estimated return for a bet
  const calculateEstimatedReturn = (stake: number, odds: number | 'SP', market: 'win' | 'place' | 'each-way'): number => {
    return betsStore.calculateEstimatedReturn(stake, odds, market)
  }
  
  // Check if we can place bets
  const canPlaceBets = computed(() => {
    // Must have selections
    if (activeSelections.value.length === 0) return false
    
    // All selections must have stakes
    if (activeSelections.value.some(s => s.stake <= 0)) return false
    
    // Must have sufficient balance
    return totalStake.value <= betsStore.availableBalance
  })
  
  return {
    // Selections
    activeSelections,
    totalStake,
    totalEstimatedReturn,
    
    // Actions
    addSelection,
    updateSelectionMarket,
    updateSelectionStake,
    removeSelection,
    clearSelections,
    placeSelections,
    calculateEstimatedReturn,
    
    // Validation
    canPlaceBets
  }
}