import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRacesStore } from '../races'
import { CATEGORY_IDS } from '../races'

describe('Races Store Persistence', () => {
  beforeEach(() => {
    // Create a new pinia instance and make it active
    setActivePinia(createPinia())
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should persist and load selected categories', () => {
    const store = useRacesStore()
    
    // Initialize from persistence (this should be called on app startup)
    store.initFromPersistence()
    
    // Initially should have all categories selected
    expect(store.selectedCategories.size).toBe(3)
    expect(store.selectedCategories.has(CATEGORY_IDS.HORSE)).toBe(true)
    expect(store.selectedCategories.has(CATEGORY_IDS.GREYHOUND)).toBe(true)
    expect(store.selectedCategories.has(CATEGORY_IDS.HARNESS)).toBe(true)
    
    // Toggle one category
    store.toggleCategory(CATEGORY_IDS.HORSE)
    
    // Should persist the change
    expect(store.selectedCategories.size).toBe(2)
    expect(store.selectedCategories.has(CATEGORY_IDS.HORSE)).toBe(false)
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useRacesStore()
    newStore.initFromPersistence()
    
    // Should load the persisted state
    expect(newStore.selectedCategories.size).toBe(2)
    expect(newStore.selectedCategories.has(CATEGORY_IDS.HORSE)).toBe(false)
    expect(newStore.selectedCategories.has(CATEGORY_IDS.GREYHOUND)).toBe(true)
    expect(newStore.selectedCategories.has(CATEGORY_IDS.HARNESS)).toBe(true)
  })

  it('should persist and load search and filter settings', () => {
    const store = useRacesStore()
    
    // Initialize from persistence (this should be called on app startup)
    store.initFromPersistence()
    
    // Set some search and filter settings
    store.setSearchQuery('test')
    store.setTimeFilter('next-hour')
    store.setSortOrder('name-desc')
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useRacesStore()
    newStore.initFromPersistence()
    
    // Should load the persisted settings
    expect(newStore.searchQuery).toBe('test')
    expect(newStore.timeFilter).toBe('next-hour')
    expect(newStore.sortOrder).toBe('name-desc')
  })

  it('should handle migration from v1 to v2 for selected categories', () => {
    // Simulate v1 data (array instead of Set)
    localStorage.setItem('races:selectedCategories', JSON.stringify({
      version: 1,
      data: [CATEGORY_IDS.HORSE, CATEGORY_IDS.GREYHOUND],
      timestamp: Date.now()
    }))
    
    const store = useRacesStore()
    store.initFromPersistence()
    
    // Should migrate to v2 (Set)
    expect(store.selectedCategories.size).toBe(2)
    expect(store.selectedCategories.has(CATEGORY_IDS.HORSE)).toBe(true)
    expect(store.selectedCategories.has(CATEGORY_IDS.GREYHOUND)).toBe(true)
  })

  it('should reset and persist reset state', () => {
    const store = useRacesStore()
    
    // Initialize from persistence (this should be called on app startup)
    store.initFromPersistence()
    
    // Change some settings
    store.toggleCategory(CATEGORY_IDS.HORSE)
    store.setSearchQuery('test')
    store.setTimeFilter('next-hour')
    store.setSortOrder('name-desc')
    
    // Reset the store
    store.reset()
    
    // Should have default values
    expect(store.selectedCategories.size).toBe(3)
    expect(store.searchQuery).toBe('')
    expect(store.timeFilter).toBe('all')
    expect(store.sortOrder).toBe('time-asc')
    
    // Create a new store instance to simulate app restart
    setActivePinia(createPinia())
    const newStore = useRacesStore()
    newStore.initFromPersistence()
    
    // Should load the reset state
    expect(newStore.selectedCategories.size).toBe(3)
    expect(newStore.searchQuery).toBe('')
    expect(newStore.timeFilter).toBe('all')
    expect(newStore.sortOrder).toBe('time-asc')
  })
})