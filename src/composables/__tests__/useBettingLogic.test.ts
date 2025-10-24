import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBettingLogic } from '../useBettingLogic'
import { useBetsStore } from '../../stores/bets'
import { createPinia, setActivePinia } from 'pinia'

describe('useBettingLogic', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('returns correct selection information', () => {
    const store = useBetsStore()
    // Add a selection to the store
    store.addSelection({
      raceId: 'race1',
      raceName: 'Test Race',
      raceNumber: 1,
      runnerId: 'runner1',
      runnerNumber: 1,
      runnerName: 'Test Runner',
      odds: 2.5,
      market: 'win',
      stake: 0
    })
    
    const { activeSelections, totalStake, totalEstimatedReturn } = useBettingLogic()
    
    // Check that the selection information is correct
    expect(activeSelections.value).toHaveLength(1)
    expect(activeSelections.value[0].runnerName).toBe('Test Runner')
    
    // Check that the totals are correct
    expect(totalStake.value).toBe(0)
    expect(totalEstimatedReturn.value).toBe(0)
  })

  it('adds and removes selections correctly', () => {
    const store = useBetsStore()
    const { addSelection, removeSelection } = useBettingLogic()
    
    // Add a selection
    const newSelection = {
      raceId: 'race1',
      raceName: 'Test Race',
      raceNumber: 1,
      runnerId: 'runner1',
      runnerNumber: 1,
      runnerName: 'Test Runner',
      odds: 2.5,
      market: 'win' as const,
      stake: 0
    }
    
    addSelection(newSelection)
    
    // Check that the selection was added to the store
    expect(store.betSelections).toHaveLength(1)
    expect(store.betSelections[0].runnerName).toBe('Test Runner')
    
    // Remove a selection
    removeSelection(store.betSelections[0].id)
    
    // Check that the selection was removed from the store
    expect(store.betSelections).toHaveLength(0)
  })

  it('calculates estimated return correctly', () => {
    const { calculateEstimatedReturn } = useBettingLogic()
    
    // Test win market
    let result = calculateEstimatedReturn(1000, 2.5, 'win')
    expect(result).toBe(2500)
    
    // Test place market
    result = calculateEstimatedReturn(1000, 2.5, 'place')
    expect(result).toBe(1375) // 1000 * (1 + 0.25 * (2.5 - 1)) = 1000 * 1.375 = 1375
    
    // Test each-way market
    result = calculateEstimatedReturn(1000, 2.5, 'each-way')
    // Win part: 500 * 2.5 = 1250
    // Place part: 500 * (1 + 0.25 * (2.5 - 1)) = 500 * 1.375 = 687.5
    // Total: 1250 + 687.5 = 1937.5
    expect(result).toBe(1937.5)
    
    // Test SP odds
    result = calculateEstimatedReturn(1000, 'SP', 'win')
    expect(result).toBe(6000) // 1000 * 6.0
  })

  it('validates bet placement correctly', () => {
    const store = useBetsStore()
    // Add a selection with stake
    store.addSelection({
      raceId: 'race1',
      raceName: 'Test Race',
      raceNumber: 1,
      runnerId: 'runner1',
      runnerNumber: 1,
      runnerName: 'Test Runner',
      odds: 2.5,
      market: 'win',
      stake: 1000
    })
    
    const { canPlaceBets } = useBettingLogic()
    
    // Check that we can place bets with sufficient balance
    expect(canPlaceBets.value).toBe(true)
  })
})