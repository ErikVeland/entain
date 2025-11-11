import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRacesStoreRefs, useBetsStoreRefs, useSimulationStoreRefs } from '../useStoreRefs'

describe('useStoreRefs', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
  })

  it('should provide reactive refs for races store', () => {
    const storeRefs = useRacesStoreRefs()
    
    // Check that state properties are refs
    expect(storeRefs.races).toBeDefined()
    expect(storeRefs.selectedCategories).toBeDefined()
    expect(storeRefs.loadState).toBeDefined()
    expect(storeRefs.errorMessage).toBeDefined()
    expect(storeRefs.searchQuery).toBeDefined()
    expect(storeRefs.timeFilter).toBeDefined()
    expect(storeRefs.sortOrder).toBeDefined()
    
    // Check that getters are accessible
    expect(typeof storeRefs.activeRaces).toBe('object')
    expect(typeof storeRefs.nextFive).toBe('object')
    expect(typeof storeRefs.racesByMeeting).toBe('object')
    
    // Check that actions are functions
    expect(typeof storeRefs.fetchRaces).toBe('function')
    expect(typeof storeRefs.toggleCategory).toBe('function')
    expect(typeof storeRefs.setSearchQuery).toBe('function')
  })

  it('should provide reactive refs for bets store', () => {
    const storeRefs = useBetsStoreRefs()
    
    // Check that state properties are refs
    expect(storeRefs.showGame).toBeDefined()
    expect(storeRefs.useSimulatedData).toBeDefined()
    expect(storeRefs.showGameOver).toBeDefined()
    expect(storeRefs.lastWonBetId).toBeDefined()
    
    // Check that getters are accessible
    expect(typeof storeRefs.bankroll).toBe('object')
    
    // Check that actions are functions
    expect(typeof storeRefs.initializeService).toBe('function')
    expect(typeof storeRefs.setShowGame).toBe('function')
    expect(typeof storeRefs.setUseSimulatedData).toBe('function')
    expect(typeof storeRefs.placeBet).toBe('function')
  })

  it('should provide reactive refs for simulation store', () => {
    const storeRefs = useSimulationStoreRefs()
    
    // Check that state properties are refs
    expect(storeRefs.controllers).toBeDefined()
    expect(storeRefs.raceStatus).toBeDefined()
    expect(storeRefs.speedMultipliers).toBeDefined()
    expect(storeRefs.raceProgress).toBeDefined()
    expect(storeRefs.commentaryState).toBeDefined()
    expect(storeRefs.displayState).toBeDefined()
    expect(storeRefs.cleanupTimers).toBeDefined()
    
    // Check that getters are accessible
    expect(typeof storeRefs.activeRaces).toBe('object')
    expect(typeof storeRefs.getSimulationController).toBe('function')
    expect(typeof storeRefs.isRaceActive).toBe('function')
    
    // Check that actions are functions
    expect(typeof storeRefs.addSimulationController).toBe('function')
    expect(typeof storeRefs.removeSimulationController).toBe('function')
    expect(typeof storeRefs.startSimulation).toBe('function')
  })
})