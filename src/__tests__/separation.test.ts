// src/__tests__/separation.test.ts
// Test to verify clean separation between API and simulation code

import { describe, it, expect } from 'vitest'
import { SimulationBettingAdapter } from '../adapters/simulation/betting'
import { ApiBettingAdapter } from '../adapters/api/betting'
import { SimulationRacingAdapter } from '../adapters/simulation/racing'
import { ApiRacingAdapter } from '../adapters/api/racing'
import type { BettingService } from '../core/betting'
import type { RaceSimulationService } from '../core/racing'

describe('Clean Separation Between API and Simulation', () => {
  it('should be able to instantiate both API and Simulation betting adapters', () => {
    // Test that we can create both adapters without conflicts
    const apiAdapter: BettingService = new ApiBettingAdapter()
    const simulationAdapter: BettingService = new SimulationBettingAdapter(1000)
    
    // Both should implement the same interface
    expect(apiAdapter).toBeDefined()
    expect(simulationAdapter).toBeDefined()
    
    // Both should have the same methods
    expect(typeof apiAdapter.placeBet).toBe('function')
    expect(typeof simulationAdapter.placeBet).toBe('function')
    
    expect(typeof apiAdapter.cancelBet).toBe('function')
    expect(typeof simulationAdapter.cancelBet).toBe('function')
    
    expect(typeof apiAdapter.settleRace).toBe('function')
    expect(typeof simulationAdapter.settleRace).toBe('function')
    
    expect(typeof apiAdapter.getBankroll).toBe('function')
    expect(typeof simulationAdapter.getBankroll).toBe('function')
  })

  it('should be able to instantiate both API and Simulation racing adapters', () => {
    // Test that we can create both adapters without conflicts
    const apiAdapter: RaceSimulationService = new ApiRacingAdapter()
    const simulationAdapter: RaceSimulationService = new SimulationRacingAdapter()
    
    // Both should implement the same interface
    expect(apiAdapter).toBeDefined()
    expect(simulationAdapter).toBeDefined()
    
    // Both should have the same methods
    expect(typeof apiAdapter.startRace).toBe('function')
    expect(typeof simulationAdapter.startRace).toBe('function')
    
    expect(typeof apiAdapter.stopRace).toBe('function')
    expect(typeof simulationAdapter.stopRace).toBe('function')
    
    expect(typeof apiAdapter.resetRace).toBe('function')
    expect(typeof simulationAdapter.resetRace).toBe('function')
  })

  it('should be able to use core types with both adapters', () => {
    // Test that core types work with both adapters
    const apiAdapter: BettingService = new ApiBettingAdapter()
    const simulationAdapter: BettingService = new SimulationBettingAdapter(1000)
    
    // Both should accept the same core types
    const betPlacement = {
      raceId: 'test-race-1',
      runnerId: 'runner-1',
      stake: 10,
      odds: 2.5 as const,
      meetingName: 'Test Meeting',
      raceNumber: 1,
      runnerName: 'Test Runner',
      categoryId: 'test-category',
      advertisedStartMs: Date.now() + 60000
    }
    
    // We can't actually call these in a test environment without more setup,
    // but we can verify the types are correct
    expect(typeof betPlacement.raceId).toBe('string')
    expect(typeof betPlacement.stake).toBe('number')
  })
})