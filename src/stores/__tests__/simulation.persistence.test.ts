import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSimulationStore } from '../simulation'

describe('Simulation Store Persistence', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should persist and load speed multipliers', () => {
    const store = useSimulationStore()
    
    // Initially should have no speed multipliers
    expect(store.speedMultipliers.size).toBe(0)
    
    // Set some speed multipliers
    store.setSpeedMultiplier('race1', 2)
    store.setSpeedMultiplier('race2', 3)
    
    // Should persist the changes
    expect(store.speedMultipliers.size).toBe(2)
    expect(store.speedMultipliers.get('race1')).toBe(2)
    expect(store.speedMultipliers.get('race2')).toBe(3)
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useSimulationStore()
    newStore.initFromPersistence()
    
    // Should load the persisted speed multipliers
    expect(newStore.speedMultipliers.size).toBe(2)
    expect(newStore.speedMultipliers.get('race1')).toBe(2)
    expect(newStore.speedMultipliers.get('race2')).toBe(3)
  })

  it('should reset and persist reset state', () => {
    const store = useSimulationStore()
    
    // Set some speed multipliers
    store.setSpeedMultiplier('race1', 2)
    store.setSpeedMultiplier('race2', 3)
    
    // Reset all simulations
    store.resetAllSimulations()
    
    // Should have no speed multipliers
    expect(store.speedMultipliers.size).toBe(0)
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useSimulationStore()
    newStore.initFromPersistence()
    
    // Should load the reset state
    expect(newStore.speedMultipliers.size).toBe(0)
  })
})