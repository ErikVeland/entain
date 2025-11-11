import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBetsStore } from '../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

describe('BetslipDrawer Bet History', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('should manage bet history correctly in the store', () => {
    const store = useBetsStore()
    
    // Initially, bet history should be empty
    expect(store.getBetHistory()).toEqual([])
    
    // Add some mock settlements to the history
    const mockSettlements = [
      {
        betId: 'bet1',
        type: 'WIN' as const,
        stake: 1000,
        result: 'WON' as const,
        payout: 2500,
        profitLoss: 1500,
        breakdown: 'WIN @ 2.50',
        settledAtMs: Date.now()
      },
      {
        betId: 'bet2',
        type: 'PLACE' as const,
        stake: 500,
        result: 'LOST' as const,
        payout: 0,
        profitLoss: -500,
        breakdown: 'PLACE lost',
        settledAtMs: Date.now()
      }
    ]
    
    // Simulate settling a race by directly adding to bet history
    store.betHistory = [...store.betHistory, ...mockSettlements]
    
    // Check that bet history now contains the settlements
    expect(store.getBetHistory()).toHaveLength(2)
    expect(store.getBetHistory()[0]).toEqual(mockSettlements[0])
    expect(store.getBetHistory()[1]).toEqual(mockSettlements[1])
    
    // Clear bet history
    store.clearBetHistory()
    
    // Check that bet history is now empty
    expect(store.getBetHistory()).toEqual([])
  })
})