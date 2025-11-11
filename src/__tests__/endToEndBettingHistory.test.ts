import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useBetsStore } from '../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

describe('End-to-End Betting History Workflow', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  afterEach(() => {
    // Clean up any timers or intervals
    vi.clearAllMocks()
  })

  it('should track real betting history through the entire workflow', async () => {
    const store = useBetsStore()
    
    // Initialize the store with simulation mode
    store.setShowGame(true)
    store.setUseSimulatedData(true)
    
    // Check initial bankroll
    const initialBankroll = store.bankroll
    expect(initialBankroll.balance).toBe(1000) // $10 default
    expect(initialBankroll.settledProfitLoss).toBe(0) // No settled profits yet
    
    // Add welcome credits to start with more money
    store.acceptWelcomeCredits()
    
    // Check bankroll after adding credits
    const bankrollAfterCredits = store.bankroll
    expect(bankrollAfterCredits.balance).toBe(11000) // $10 (default) + $100 (added) = $110
    expect(bankrollAfterCredits.settledProfitLoss).toBe(10000) // $100 from added credits
    
    // Place a real bet (stake must be <= 1000 which is $10.00)
    const betId = await store.placeBet(
      'race1',
      'runner1',
      500, // $5 stake
      3.5, // 3.50 odds
      Date.now() + 60000, // 1 minute in the future
      'Test Race',
      1,
      'Test Runner',
      '4a2788f8-e825-4d36-9894-efd4baf1cfae' // Horse racing category
    )
    
    // Verify the bet was placed
    expect(betId).toBeTruthy()
    
    // Check bankroll after placing bet
    const bankrollAfterBet1 = store.bankroll
    expect(bankrollAfterBet1.balance).toBe(10500) // $110 - $5 = $105
    expect(bankrollAfterBet1.settledProfitLoss).toBe(10000) // No change yet
    
    // Initially, bet history should be empty
    expect(store.getBetHistory()).toEqual([])
    
    // Simulate a race result where our runner wins
    const placings = ['runner1', 'runner2', 'runner3', 'runner4', 'runner5']
    
    // Settle the race with real results
    const settlements = await store.settleRace('race1', placings)
    
    // Verify settlements were returned
    expect(settlements).toHaveLength(1)
    expect(settlements[0].betId).toBe(betId)
    expect(settlements[0].result).toBe('WON')
    expect(settlements[0].stake).toBe(500)
    expect(settlements[0].payout).toBe(1750) // $5 * 3.5 = $17.50
    expect(settlements[0].profitLoss).toBe(1250) // $17.50 - $5 = $12.50
    
    // Check bankroll after winning bet
    const bankrollAfterWin1 = store.bankroll
    expect(bankrollAfterWin1.balance).toBe(12250) // $105 + $17.50 = $122.50
    expect(bankrollAfterWin1.settledProfitLoss).toBe(11750) // $100 (added credits) + $17.50 (payout)
    
    // Verify bet history was updated
    expect(store.getBetHistory()).toHaveLength(1)
    expect(store.getBetHistory()[0].betId).toBe(betId)
    expect(store.getBetHistory()[0].result).toBe('WON')
    expect(store.getBetHistory()[0].stake).toBe(500)
    expect(store.getBetHistory()[0].payout).toBe(1750)
    expect(store.getBetHistory()[0].profitLoss).toBe(1250)
    
    // Place another bet
    const betId2 = await store.placeBet(
      'race2',
      'runner3',
      300, // $3 stake
      5.0, // 5.00 odds
      Date.now() + 120000, // 2 minutes in the future
      'Test Race 2',
      1,
      'Test Runner 3',
      '4a2788f8-e825-4d36-9894-efd4baf1cfae' // Horse racing category
    )
    
    // Check bankroll after placing second bet
    const bankrollAfterBet2 = store.bankroll
    expect(bankrollAfterBet2.balance).toBe(11950) // $122.50 - $3 = $119.50
    expect(bankrollAfterBet2.settledProfitLoss).toBe(11750) // No change yet
    
    // Simulate a race result where our runner loses
    const placings2 = ['runner1', 'runner2', 'runner4', 'runner3', 'runner5']
    
    // Settle the second race
    const settlements2 = await store.settleRace('race2', placings2)
    
    // Verify the second settlement
    expect(settlements2).toHaveLength(1)
    expect(settlements2[0].betId).toBe(betId2)
    expect(settlements2[0].result).toBe('LOST')
    expect(settlements2[0].stake).toBe(300)
    expect(settlements2[0].payout).toBe(0)
    expect(settlements2[0].profitLoss).toBe(-300)
    
    // Verify bet history now contains both settlements
    expect(store.getBetHistory()).toHaveLength(2)
    expect(store.getBetHistory()[0].betId).toBe(betId)
    expect(store.getBetHistory()[0].result).toBe('WON')
    expect(store.getBetHistory()[1].betId).toBe(betId2)
    expect(store.getBetHistory()[1].result).toBe('LOST')
    
    // Verify bankroll was updated correctly
    const finalBankroll = store.bankroll
    expect(finalBankroll.balance).toBe(11950) // $122.50 - $3 = $119.50
    expect(finalBankroll.settledProfitLoss).toBe(11750) // $100 (added credits) + $17.50 (payout)
  })
})