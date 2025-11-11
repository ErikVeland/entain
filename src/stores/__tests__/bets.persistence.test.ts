import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBetsStore } from '../bets'

describe('Bets Store Persistence', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should persist and load game mode settings', () => {
    const store = useBetsStore()
    
    // Initialize from persistence (this should be called on app startup)
    store.initFromPersistence()
    
    // Initially should have default values
    expect(store.showGame).toBe(false)
    expect(store.useSimulatedData).toBe(false)
    
    // Change settings
    store.setShowGame(true)
    store.setUseSimulatedData(true)
    
    // Should persist the changes
    expect(store.showGame).toBe(true)
    expect(store.useSimulatedData).toBe(true)
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useBetsStore()
    newStore.initFromPersistence()
    
    // Should load the persisted settings
    expect(newStore.showGame).toBe(true)
    expect(newStore.useSimulatedData).toBe(true)
  })

  it('should reset and persist reset state', () => {
    const store = useBetsStore()
    
    // Initialize from persistence (this should be called on app startup)
    store.initFromPersistence()
    
    // Change settings
    store.setShowGame(true)
    store.setUseSimulatedData(true)
    
    // Reset the store
    store.reset()
    
    // Should have default values
    expect(store.showGame).toBe(false)
    expect(store.useSimulatedData).toBe(false)
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useBetsStore()
    newStore.initFromPersistence()
    
    // Should load the reset state
    expect(newStore.showGame).toBe(false)
    expect(newStore.useSimulatedData).toBe(false)
  })
})