import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBetsStore } from '../bets'
import { createPinia, setActivePinia } from 'pinia'

describe('useBetsStore', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('initializes with correct default state', () => {
    const store = useBetsStore()
    
    // Check default state
    expect(store.showGame).toBe(false)
    expect(store.balance).toBe(10000) // $100.00
    expect(store.locked).toBe(0)
    expect(store.transactions).toEqual([])
    expect(store.betSelections).toEqual([])
    expect(store.pendingBets).toEqual([])
    expect(store.showWelcome).toBe(true)
    expect(store.lastWonBetId).toBeNull()
  })

  it('accepts welcome credits correctly', () => {
    const store = useBetsStore()
    
    // Accept welcome credits
    store.acceptWelcomeCredits()
    
    // Check that the state was updated
    expect(store.showWelcome).toBe(false)
    expect(store.transactions).toHaveLength(1)
    expect(store.transactions[0].type).toBe('initial_credit')
    expect(store.transactions[0].amount).toBe(10000)
  })

  it('manages bet selections correctly', () => {
    const store = useBetsStore()
    
    // Add a selection
    const selection = {
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
    
    store.addSelection(selection)
    
    // Check that the selection was added
    expect(store.betSelections).toHaveLength(1)
    expect(store.betSelections[0].runnerName).toBe('Test Runner')
    
    // Update selection market
    store.updateSelectionMarket(store.betSelections[0].id, 'place')
    
    // Check that the market was updated
    expect(store.betSelections[0].market).toBe('place')
    
    // Update selection stake
    store.updateSelectionStake(store.betSelections[0].id, 1000) // $10.00
    
    // Check that the stake was updated
    expect(store.betSelections[0].stake).toBe(1000)
    
    // Check that the estimated return was calculated
    expect(store.betSelections[0].estimatedReturn).toBeGreaterThan(0)
    
    // Remove selection
    store.removeSelection(store.betSelections[0].id)
    
    // Check that the selection was removed
    expect(store.betSelections).toHaveLength(0)
  })

  it('calculates estimated returns correctly', () => {
    const store = useBetsStore()
    
    // Test win market
    let result = store.calculateEstimatedReturn(1000, 2.5, 'win')
    expect(result).toBe(2500)
    
    // Test place market
    result = store.calculateEstimatedReturn(1000, 2.5, 'place')
    expect(result).toBe(1375) // 1000 * (1 + 0.25 * (2.5 - 1)) = 1000 * 1.375 = 1375
    
    // Test each-way market
    result = store.calculateEstimatedReturn(1000, 2.5, 'each-way')
    // Win part: 500 * 2.5 = 1250
    // Place part: 500 * (1 + 0.25 * (2.5 - 1)) = 500 * 1.375 = 687.5
    // Total: 1250 + 687.5 = 1937.5
    expect(result).toBe(1937.5)
    
    // Test SP odds
    result = store.calculateEstimatedReturn(1000, 'SP', 'win')
    expect(result).toBe(6000) // 1000 * 6.0
  })

  it('places selections as bets correctly', () => {
    const store = useBetsStore()
    // Mock the engine's placeBet method
    const mockPlaceBet = vi.fn().mockReturnValue('bet1')
    store.engine.placeBet = mockPlaceBet
    
    // Add selections
    store.addSelection({
      raceId: 'race1',
      raceName: 'Test Race',
      raceNumber: 1,
      runnerId: 'runner1',
      runnerNumber: 1,
      runnerName: 'Test Runner',
      odds: 2.5,
      market: 'win',
      stake: 1000 // $10.00
    })
    
    // Place selections
    const result = store.placeSelections()
    
    // Check that the bet was placed
    expect(result).toBe(true)
    expect(mockPlaceBet).toHaveBeenCalled()
    
    // Check that the balance was updated
    expect(store.balance).toBe(9000) // 10000 - 1000
    expect(store.locked).toBe(1000) // 0 + 1000
    
    // Check that the selection was removed
    expect(store.betSelections).toHaveLength(0)
  })

  it('manages race controllers correctly', () => {
    const store = useBetsStore()
    
    // Create a mock controller
    const controller = { id: 'controller1' }
    
    // Add controller
    store.addRaceController('race1', controller)
    
    // Check that the controller was added
    expect(store.raceControllers['race1']).toEqual(controller)
    
    // Get controller
    const retrievedController = store.getRaceController('race1')
    expect(retrievedController).toEqual(controller)
    
    // Remove controller
    store.removeRaceController('race1')
    
    // Check that the controller was removed
    expect(store.raceControllers['race1']).toBeUndefined()
  })
})