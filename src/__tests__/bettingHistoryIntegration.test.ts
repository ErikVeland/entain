import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBetsStore } from '../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

// Mock the SimulationBettingAdapter
vi.mock('../adapters/simulation/betting', () => {
  return {
    SimulationBettingAdapter: vi.fn().mockImplementation(() => {
      return {
        settleRace: vi.fn().mockResolvedValue([
          {
            betId: 'bet1',
            type: 'WIN',
            stake: 1000,
            result: 'WON',
            payout: 2500,
            profitLoss: 1500,
            breakdown: 'WIN @ 2.50',
            settledAtMs: Date.now()
          }
        ]),
        getBankroll: vi.fn().mockReturnValue({
          balance: 2500,
          locked: 0,
          settledProfitLoss: 1500,
          turnover: 1000
        })
      }
    })
  }
})

describe('Betting History Integration', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('should update bet history when settling a race', async () => {
    const store = useBetsStore()
    
    // Initialize the store with simulation mode
    store.setShowGame(true)
    store.setUseSimulatedData(true)
    
    // Initially, bet history should be empty
    expect(store.getBetHistory()).toEqual([])
    
    // Settle a race
    const settlements = await store.settleRace('race1', ['runner1', 'runner2', 'runner3'])
    
    // Check that settlements were returned
    expect(settlements).toHaveLength(1)
    expect(settlements[0].betId).toBe('bet1')
    expect(settlements[0].result).toBe('WON')
    
    // Check that bet history now contains the settlements
    expect(store.getBetHistory()).toHaveLength(1)
    expect(store.getBetHistory()[0].betId).toBe('bet1')
    expect(store.getBetHistory()[0].result).toBe('WON')
    
    // Settle another race
    const moreSettlements = await store.settleRace('race2', ['runner2', 'runner1', 'runner3'])
    
    // Check that bet history now contains both settlements
    expect(store.getBetHistory()).toHaveLength(2)
    expect(store.getBetHistory()[1].betId).toBe('bet1')
    expect(store.getBetHistory()[1].result).toBe('WON')
  })
})